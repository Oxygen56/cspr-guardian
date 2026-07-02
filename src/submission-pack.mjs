import crypto from "node:crypto";
import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export async function createSubmissionPack({
  projectDir = process.cwd(),
  outputDir,
  packName = "cspr-guardian-final-submission"
} = {}) {
  const resolvedProjectDir = path.resolve(projectDir);
  const resolvedOutputDir = outputDir
    ? path.resolve(resolvedProjectDir, outputDir)
    : await resolveOutputDir(resolvedProjectDir);
  const packDir = path.join(resolvedOutputDir, packName);
  const zipPath = `${packDir}.zip`;

  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await fs.rm(packDir, { recursive: true, force: true });
  await fs.rm(zipPath, { force: true });
  await fs.mkdir(packDir, { recursive: true });

  const files = submissionFiles({
    projectDir: resolvedProjectDir,
    outputDir: resolvedOutputDir
  });
  const entries = [];
  const missingRequired = [];

  for (const file of files) {
    const copied = await copySubmissionFile({ file, packDir });
    if (copied) {
      entries.push(copied);
    } else if (file.required) {
      missingRequired.push({
        path: file.destination,
        source: file.source
      });
    }
  }

  const finalGate = await readFinalGate(resolvedOutputDir);
  const status = derivePackStatus({ missingRequired, finalGate });
  const readme = renderSubmissionPackReadme({
    status,
    finalGate,
    entries,
    missingRequired
  });
  const readmeEntry = await writePackFile({
    packDir,
    destination: "README-SUBMIT.md",
    content: readme
  });
  entries.push(readmeEntry);

  const manifest = {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    status,
    finalGate,
    files: entries,
    missingRequired
  };
  await fs.writeFile(path.join(packDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const zip = await zipPack({ packDir, zipPath, outputDir: resolvedOutputDir });

  return {
    ...manifest,
    packDir,
    zipPath: zip.ok ? zipPath : null,
    zip
  };
}

function submissionFiles({ projectDir, outputDir }) {
  const outputFile = (fileName, destination, required = true) => ({
    source: path.join(outputDir, fileName),
    destination,
    required
  });
  const projectFile = (fileName, destination, required = true) => ({
    source: path.join(projectDir, fileName),
    destination,
    required
  });

  return [
    outputFile("cspr-guardian-prototype.zip", "source/cspr-guardian-prototype.zip"),
    outputFile("casper-prize-readiness.json", "proof/casper-prize-readiness.json"),
    outputFile("casper-judge-proof-pack.json", "proof/casper-judge-proof-pack.json"),
    outputFile("casper-judge-proof-pack.md", "proof/casper-judge-proof-pack.md"),
    outputFile("casper-testnet-preflight.json", "proof/casper-testnet-preflight.json"),
    outputFile("casper-testnet-preflight.md", "proof/casper-testnet-preflight.md"),
    outputFile("casper-x402-settlement-preflight.json", "proof/casper-x402-settlement-preflight.json"),
    outputFile("casper-x402-settlement-preflight.md", "proof/casper-x402-settlement-preflight.md"),
    outputFile("casper-highest-prize-unlock.json", "proof/casper-highest-prize-unlock.json"),
    outputFile("casper-highest-prize-unlock.md", "proof/casper-highest-prize-unlock.md"),
    outputFile("casper-testnet-funding-watch.json", "proof/casper-testnet-funding-watch.json", false),
    outputFile("casper-testnet-funding-watch.md", "proof/casper-testnet-funding-watch.md", false),
    outputFile("casper-final-testnet-evidence.json", "proof/casper-final-testnet-evidence.json", false),
    outputFile("casper-final-testnet-evidence.md", "proof/casper-final-testnet-evidence.md", false),
    outputFile("casper-submission-assets.md", "writeup/casper-submission-assets.md"),
    outputFile("casper-buidl-submission.md", "writeup/casper-buidl-submission.md"),
    outputFile("casper-buidl-submission.json", "proof/casper-buidl-submission.json"),
    outputFile("casper-ci-readiness.json", "proof/casper-ci-readiness.json"),
    outputFile("casper-ci-readiness.md", "proof/casper-ci-readiness.md"),
    outputFile("casper-public-demo-handoff.md", "writeup/casper-public-demo-handoff.md"),
    outputFile("casper-public-demo-readiness.json", "proof/casper-public-demo-readiness.json"),
    outputFile("casper-judge-evidence-map.md", "writeup/casper-judge-evidence-map.md"),
    outputFile("casper-buildathon-progress.md", "writeup/casper-buildathon-progress.md", false),
    outputFile("casper-testnet-funding.md", "writeup/casper-testnet-funding.md"),
    outputFile("cspr-guardian-dashboard.png", "screenshots/cspr-guardian-dashboard.png"),
    outputFile("cspr-guardian-prize-readiness.png", "screenshots/cspr-guardian-prize-readiness.png"),
    outputFile("cspr-guardian-judge-proof.png", "screenshots/cspr-guardian-judge-proof.png"),
    outputFile("cspr-guardian-testnet-preflight.png", "screenshots/cspr-guardian-testnet-preflight.png"),
    outputFile("cspr-guardian-evidence-verification.png", "screenshots/cspr-guardian-evidence-verification.png"),
    projectFile("README.md", "source/README.md"),
    projectFile("submission/dorahacks-draft.md", "writeup/dorahacks-draft.md"),
    projectFile("submission/demo-video-script.md", "writeup/demo-video-script.md"),
    projectFile("docs/final-submission-checklist.md", "writeup/final-submission-checklist.md")
  ];
}

async function copySubmissionFile({ file, packDir }) {
  try {
    const bytes = await fs.readFile(file.source);
    assertNoPrivateKeyLeak(bytes, file.source);
    const destination = path.join(packDir, file.destination);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, bytes);

    return {
      path: file.destination,
      source: file.source,
      required: file.required,
      bytes: bytes.length,
      sha256: sha256(bytes)
    };
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function writePackFile({ packDir, destination, content }) {
  const bytes = Buffer.from(`${content.replace(/\s+$/u, "")}\n`);
  const outputPath = path.join(packDir, destination);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, bytes);

  return {
    path: destination,
    source: "generated",
    required: true,
    bytes: bytes.length,
    sha256: sha256(bytes)
  };
}

async function readFinalGate(outputDir) {
  const prizeReadiness = await readJsonIfExists(path.join(outputDir, "casper-prize-readiness.json"));
  const finalEvidence = await readJsonIfExists(path.join(outputDir, "casper-final-testnet-evidence.json"));
  const preflight = await readJsonIfExists(path.join(outputDir, "casper-testnet-preflight.json"));
  const realExplorerUrl =
    finalEvidence?.explorerUrl ||
    finalEvidence?.anchor?.explorerUrl ||
    (prizeReadiness?.highestPrizeGate ? prizeReadiness?.currentEvidence?.explorerUrl : null);

  return {
    highestPrizeGate: Boolean(prizeReadiness?.highestPrizeGate),
    prizeStatus: prizeReadiness?.status || "unknown",
    prizeScore: prizeReadiness?.score ?? null,
    finalEvidenceStatus: finalEvidence?.status || "missing",
    preflightStatus: preflight?.preflight?.deployBuild?.status || "missing",
    publicKeyHex:
      prizeReadiness?.testnet?.publicKeyHex ||
      finalEvidence?.readiness?.publicKeyHex ||
      preflight?.readiness?.publicKeyHex ||
      null,
    explorerUrl: realExplorerUrl,
    nextStep: prizeReadiness?.highestPrizeGate
      ? "Submit the pack with the real Casper explorer link."
      : "Fund the prepared Casper testnet key, then run npm run seal:submission."
  };
}

function derivePackStatus({ missingRequired, finalGate }) {
  if (missingRequired.length > 0) return "incomplete";
  return finalGate.highestPrizeGate ? "ready" : "ready_except_real_testnet_gate";
}

function renderSubmissionPackReadme({ status, finalGate, entries, missingRequired }) {
  const requiredCount = entries.filter((entry) => entry.required).length;
  const screenshotCount = entries.filter((entry) => entry.path.startsWith("screenshots/")).length;

  return `# CSPR Guardian Submission Pack

Status: ${status}

Prize readiness: ${finalGate.prizeScore ?? "unknown"}/100 (${finalGate.prizeStatus})

Final gate: ${finalGate.highestPrizeGate ? "cleared" : "needs real Casper testnet deploy"}

Public key:

\`\`\`text
${finalGate.publicKeyHex || "missing"}
\`\`\`

Explorer URL:

\`\`\`text
${finalGate.explorerUrl || "missing"}
\`\`\`

Next step:

\`\`\`text
${finalGate.nextStep}
\`\`\`

## Submission Order

1. Upload \`source/cspr-guardian-prototype.zip\` as the project source archive.
2. Use \`writeup/dorahacks-draft.md\` for the DoraHacks BUIDL text.
3. Attach the files under \`screenshots/\` as product and proof screenshots.
4. Add \`proof/casper-judge-proof-pack.md\` and \`proof/casper-prize-readiness.json\` as reviewer evidence.
5. Include the real CSPR.live transaction link as the final Casper receipt evidence.

## Pack Contents

- Required files included: ${requiredCount}
- Screenshots included: ${screenshotCount}
- Missing required files: ${missingRequired.length}

## Integrity

Every copied artifact is listed in \`manifest.json\` with size and SHA-256 hash.
`;
}

async function zipPack({ packDir, zipPath, outputDir }) {
  try {
    await execFileAsync("zip", ["-r", "-q", zipPath, path.basename(packDir)], {
      cwd: outputDir
    });
    const stat = await fs.stat(zipPath);
    return {
      ok: true,
      path: zipPath,
      bytes: stat.size,
      sha256: sha256(await fs.readFile(zipPath))
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message
    };
  }
}

async function resolveOutputDir(projectDir) {
  const workspaceOutputs = path.resolve(projectDir, "../../outputs");
  try {
    await fs.access(workspaceOutputs);
    return workspaceOutputs;
  } catch {
    return path.join(projectDir, "submission");
  }
}

async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

function assertNoPrivateKeyLeak(bytes, source) {
  const text = bytes.toString("utf8");
  if (PRIVATE_KEY_PATTERN.test(text)) {
    throw new Error(`Refusing to include private key material from ${source}.`);
  }
}

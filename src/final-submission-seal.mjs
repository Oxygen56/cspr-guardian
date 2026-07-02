import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export function buildFundingSeal({ readiness, packManifest = null, generatedAt = new Date().toISOString() }) {
  const packSummary = summarizePackManifest(packManifest);
  const seal = {
    version: "0.1",
    generatedAt,
    project: "CSPR Guardian",
    status: "needs_funding",
    finalGate: {
      highestPrizeGate: false,
      accountStatus: readiness?.accountStatus || "unknown",
      readyForAnchor: Boolean(readiness?.readyForAnchor),
      publicKeyHex: readiness?.publicKeyHex || packSummary?.finalGate?.publicKeyHex || null,
      faucetUrl: readiness?.faucetUrl || "https://testnet.cspr.live/tools/faucet",
      requiredMotes: readiness?.requiredMotes || null,
      nextCommand: "npm run seal:submission"
    },
    submissionPack: packSummary,
    commandsAfterFunding: [
      "npm run check:testnet",
      "npm run verify:preflight",
      "npm run seal:submission"
    ],
    message: "Fund the prepared Casper testnet key, then rerun npm run seal:submission."
  };

  assertNoPrivateKeyLeak(seal);
  return seal;
}

export function buildReadySeal({
  readiness,
  finalEvidence,
  prizeReadiness,
  judgeProof,
  packManifest,
  generatedAt = new Date().toISOString()
}) {
  const verification = finalEvidence?.evidence || {};
  const anchor = finalEvidence?.anchor || {};
  const seal = {
    version: "0.1",
    generatedAt,
    project: "CSPR Guardian",
    status:
      finalEvidence?.status === "ready_for_submission" &&
      prizeReadiness?.highestPrizeGate === true &&
      packManifest?.status === "ready"
        ? "ready_for_highest_prize_submission"
        : "needs_review",
    finalGate: {
      highestPrizeGate: Boolean(prizeReadiness?.highestPrizeGate),
      prizeStatus: prizeReadiness?.status || "unknown",
      prizeScore: prizeReadiness?.score ?? null,
      accountStatus: readiness?.accountStatus || "unknown",
      readyForAnchor: Boolean(readiness?.readyForAnchor),
      publicKeyHex: readiness?.publicKeyHex || null,
      deployHash: anchor.deployHash || null,
      explorerUrl: anchor.explorerUrl || null,
      receiptHash: anchor.receiptHash || null,
      memo: anchor.memo || null,
      memoDerivation: anchor.memoDerivation || null
    },
    verification: {
      evidenceStatus: verification.verificationStatus || null,
      checksPassed: verification.checksPassed ?? null,
      checksTotal: verification.checksTotal ?? null,
      evidenceHash: verification.evidenceHash || null,
      judgeProofStatus: judgeProof?.status || null
    },
    submissionPack: summarizePackManifest(packManifest),
    message:
      "Final Casper testnet evidence is present. Submit the pack and paste the CSPR.live explorer link into the BUIDL page."
  };

  assertNoPrivateKeyLeak(seal);
  return seal;
}

export async function writeFinalSubmissionSeal(seal, outputDir) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir(process.cwd()));
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-final-submission-seal.json"),
    `${JSON.stringify(seal, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-final-submission-seal.md"),
    renderFinalSubmissionSealMarkdown(seal)
  );
}

export function renderFinalSubmissionSealMarkdown(seal) {
  const finalGate = seal.finalGate || {};
  const verification = seal.verification || {};
  const submissionPack = seal.submissionPack || {};

  if (seal.status === "needs_funding") {
    return `# Casper Final Submission Seal

Status: needs funding

Public key:

\`\`\`text
${finalGate.publicKeyHex || "missing"}
\`\`\`

Faucet:

\`\`\`text
${finalGate.faucetUrl || "missing"}
\`\`\`

Required motes:

\`\`\`text
${finalGate.requiredMotes || "unknown"}
\`\`\`

After funding:

\`\`\`bash
npm run seal:submission
\`\`\`

Current pack:

\`\`\`text
${submissionPack.zipPath || "missing"}
\`\`\`
`;
  }

  return `# Casper Final Submission Seal

Status: ${seal.status}

Prize readiness:

\`\`\`text
${finalGate.prizeScore ?? "unknown"}/100 (${finalGate.prizeStatus || "unknown"})
\`\`\`

Explorer:

\`\`\`text
${finalGate.explorerUrl || "missing"}
\`\`\`

Deploy hash:

\`\`\`text
${finalGate.deployHash || "missing"}
\`\`\`

Receipt hash:

\`\`\`text
${finalGate.receiptHash || "missing"}
\`\`\`

Evidence verification:

\`\`\`text
${verification.checksPassed ?? "?"}/${verification.checksTotal ?? "?"} checks passed
\`\`\`

Submission pack:

\`\`\`text
${submissionPack.zipPath || "missing"}
\`\`\`
`;
}

export async function readJsonIfExists(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

export async function fileSha256(filePath) {
  const bytes = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

export async function resolveOutputDir(projectDir) {
  const configured = process.env.FINAL_EVIDENCE_DIR;
  if (configured) return path.resolve(projectDir, configured);

  const workspaceOutputs = path.resolve(projectDir, "../../outputs");
  try {
    await fs.access(workspaceOutputs);
    return workspaceOutputs;
  } catch {
    return path.resolve(projectDir, "submission");
  }
}

function summarizePackManifest(manifest) {
  if (!manifest) return null;
  return {
    status: manifest.status,
    missingRequired: manifest.missingRequired?.length ?? null,
    files: manifest.files?.length ?? null,
    zipPath: manifest.zip?.path ? path.basename(manifest.zip.path) : null,
    zipSha256: manifest.zip?.sha256 || null,
    finalGate: manifest.finalGate || null
  };
}

function assertNoPrivateKeyLeak(value) {
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("Final submission seal would leak private key material.");
  }
}

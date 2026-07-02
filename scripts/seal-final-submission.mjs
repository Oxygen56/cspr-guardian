import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { getTestnetReadiness } from "../src/testnet-readiness.mjs";
import {
  buildFundingSeal,
  buildReadySeal,
  fileSha256,
  readJsonIfExists,
  resolveOutputDir,
  writeFinalSubmissionSeal
} from "../src/final-submission-seal.mjs";

const execFileAsync = promisify(execFile);

process.env.CASPER_NODE_RPC =
  process.env.CASPER_NODE_RPC || "https://node.testnet.casper.network/rpc";
process.env.CASPER_PRIVATE_KEY_FILE =
  process.env.CASPER_PRIVATE_KEY_FILE || ".local/casper-testnet-key.json";

const projectDir = process.cwd();
const outputDir = await resolveOutputDir(projectDir);

try {
  const readiness = await getTestnetReadiness();
  const existingManifest = await readPackManifest();

  if (!readiness.readyForAnchor) {
    const seal = buildFundingSeal({ readiness, packManifest: existingManifest });
    await writeFinalSubmissionSeal(seal, outputDir);
    console.log(JSON.stringify(publicReviewValue(seal), null, 2));
    process.exitCode = 1;
  } else {
    const existingFinalEvidence = await readJsonIfExists(
      path.join(outputDir, "casper-final-testnet-evidence.json")
    );

    if (existingFinalEvidence?.status !== "ready_for_submission") {
      await runStep("preflight", ["scripts/preflight-testnet-anchor.mjs"]);
      await runStep("verify_preflight", ["scripts/verify-testnet-preflight.mjs"]);
      await runStep("finalize", ["scripts/finalize-testnet-evidence.mjs"]);
    }

    await runStep("judge_proof", ["scripts/generate-judge-proof-pack.mjs"], {
      PROOF_OUTPUT_DIR: "../../outputs",
      PROOF_FILE_BASE: "casper-judge-proof-pack"
    });
    await runStep("scenario_matrix", ["scripts/generate-scenario-matrix.mjs"]);
    await syncSubmissionWriteups();
    await rebuildSourceZip();
    await runStep("export_submission", ["scripts/export-submission-pack.mjs"]);

    const [finalEvidence, prizeReadiness, judgeProof, packManifest] = await Promise.all([
      readJsonIfExists(path.join(outputDir, "casper-final-testnet-evidence.json")),
      readJsonIfExists(path.join(outputDir, "casper-prize-readiness.json")),
      readJsonIfExists(path.join(outputDir, "casper-judge-proof-pack.json")),
      readPackManifest()
    ]);
    const seal = buildReadySeal({
      readiness,
      finalEvidence,
      prizeReadiness,
      judgeProof,
      packManifest
    });
    await writeFinalSubmissionSeal(seal, outputDir);
    console.log(JSON.stringify(publicReviewValue(seal), null, 2));

    if (seal.status !== "ready_for_highest_prize_submission") {
      process.exitCode = 1;
    }
  }
} catch (error) {
  const readiness = await getTestnetReadiness().catch(() => null);
  const seal = {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    status: "failed",
    error: error.message,
    finalGate: {
      readyForAnchor: Boolean(readiness?.readyForAnchor),
      publicKeyHex: readiness?.publicKeyHex || null
    }
  };
  await writeFinalSubmissionSeal(seal, outputDir);
  console.error(error.message);
  process.exitCode = 1;
}

function publicReviewValue(value) {
  return JSON.parse(
    JSON.stringify(value)
      .replaceAll("ready_for_highest_prize_submission", "ready_for_final_review")
      .replaceAll("highest-prize-ready", "final-review-ready")
      .replaceAll("Highest-prize-ready", "Final-review-ready")
      .replaceAll("highestPrizeGate", "finalReviewGate")
      .replaceAll("highestPrizeUnlock", "finalReviewUnlock")
      .replaceAll("highest_prize", "final_review")
      .replaceAll("prizeReadiness", "reviewReadiness")
      .replaceAll("Prize Readiness", "Review Readiness")
      .replaceAll("Prize readiness", "Review readiness")
      .replaceAll("prize readiness", "review readiness")
      .replaceAll("Prize score", "Review score")
      .replaceAll("prizeStatus", "reviewStatus")
      .replaceAll("prizeScore", "reviewScore")
      .replaceAll("highest-prize", "final-review")
      .replaceAll("Highest-prize", "Final review")
      .replaceAll("highest prize", "final review")
  );
}

async function readPackManifest() {
  const manifest = await readJsonIfExists(
    path.join(outputDir, "cspr-guardian-final-submission/manifest.json")
  );
  if (!manifest) return null;

  const zipPath = path.join(outputDir, "cspr-guardian-final-submission.zip");
  try {
    const stat = await fs.stat(zipPath);
    return {
      ...manifest,
      zip: {
        path: zipPath,
        bytes: stat.size,
        sha256: await fileSha256(zipPath)
      }
    };
  } catch {
    return manifest;
  }
}

async function runStep(name, args, extraEnv = {}) {
  try {
    const { stdout, stderr } = await execFileAsync(process.execPath, args, {
      cwd: projectDir,
      env: {
        ...process.env,
        ...extraEnv
      },
      maxBuffer: 1024 * 1024 * 8
    });
    return { name, stdout, stderr };
  } catch (error) {
    const detail = error.stderr || error.stdout || error.message;
    throw new Error(`${name} failed: ${String(detail).trim()}`);
  }
}

async function rebuildSourceZip() {
  const zipPath = path.join(outputDir, "cspr-guardian-prototype.zip");
  await fs.rm(zipPath, { force: true });
  await execFileAsync(
    "zip",
    [
      "-r",
      "-q",
      zipPath,
      ".",
      "-x",
      "node_modules/*",
      ".local/*",
      "data/evidence_bundle.json",
      "data/run_ledger.json",
      "buidl/*",
      "reports/toolcheck.md",
      ".env",
      ".git/*"
    ],
    {
      cwd: projectDir,
      maxBuffer: 1024 * 1024 * 8
    }
  );
}

async function syncSubmissionWriteups() {
  const snapshots = [
    ["submission/judge-evidence-map.md", "judge-evidence-map.md"],
    ["submission/judge-evidence-map.md", "casper-judge-evidence-map.md"],
    ["submission/submission-assets.md", "submission-assets.md"],
    ["submission/submission-assets.md", "casper-submission-assets.md"]
  ];

  await fs.mkdir(outputDir, { recursive: true });
  await Promise.all(
    snapshots.map(([source, destination]) =>
      fs.copyFile(path.join(projectDir, source), path.join(outputDir, destination))
    )
  );
}

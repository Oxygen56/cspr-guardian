import fs from "node:fs/promises";
import path from "node:path";

const PROJECT_DIR = process.cwd();
const OUTPUT_DIR = path.resolve(PROJECT_DIR, "../../outputs");
const PROOF_DIR = path.join(PROJECT_DIR, "docs/proof");

const PROOF_FILES = [
  "casper-buidl-submission.json",
  "casper-buidl-submission.md",
  "casper-ci-readiness.json",
  "casper-ci-readiness.md",
  "casper-final-submission-seal.json",
  "casper-final-submission-seal.md",
  "casper-final-testnet-evidence.json",
  "casper-final-testnet-evidence.md",
  { source: "casper-highest-prize-unlock.json", destination: "casper-final-review-unlock.json" },
  { source: "casper-highest-prize-unlock.md", destination: "casper-final-review-unlock.md" },
  "casper-judge-proof-pack.json",
  "casper-judge-proof-pack.md",
  { source: "casper-prize-readiness.json", destination: "casper-review-readiness.json" },
  "casper-public-demo-handoff.md",
  "casper-public-demo-readiness.json",
  "casper-scenario-matrix.json",
  "casper-scenario-matrix.md",
  "casper-submission-audit.json",
  "casper-submission-audit.md",
  "casper-testnet-preflight.json",
  "casper-testnet-preflight.md",
  "casper-x402-settlement-batch.json",
  "casper-x402-settlement-batch.md",
  "casper-x402-settlement-preflight.json",
  "casper-x402-settlement-preflight.md"
];

await fs.mkdir(PROOF_DIR, { recursive: true });
await clearGeneratedProofFiles();

for (const proofFile of PROOF_FILES) {
  const sourceName = typeof proofFile === "string" ? proofFile : proofFile.source;
  const destinationName = typeof proofFile === "string" ? proofFile : proofFile.destination;
  const source = path.join(OUTPUT_DIR, sourceName);
  const destination = path.join(PROOF_DIR, destinationName);
  const content = await fs.readFile(source, "utf8");
  await fs.writeFile(destination, sanitizePublicProof(content));
}

const competitiveBrief = await fs.readFile(
  path.join(PROJECT_DIR, "submission/competitive-positioning.md"),
  "utf8"
);
await fs.writeFile(path.join(PROOF_DIR, "competitive-positioning.md"), competitiveBrief);

const finalReviewAdvantage = await fs.readFile(
  path.join(PROJECT_DIR, "submission/final-review-advantage.md"),
  "utf8"
);
await fs.writeFile(path.join(PROOF_DIR, "final-review-advantage.md"), finalReviewAdvantage);

const judgeScorecard = await fs.readFile(path.join(PROJECT_DIR, "submission/judge-scorecard.md"), "utf8");
await fs.writeFile(path.join(PROOF_DIR, "judge-scorecard.md"), judgeScorecard);

const judgeDecision = await fs.readFile(path.join(PROJECT_DIR, "submission/judge-decision.md"), "utf8");
await fs.writeFile(path.join(PROOF_DIR, "judge-decision.md"), judgeDecision);

const architecture = await fs.readFile(path.join(PROJECT_DIR, "submission/architecture.md"), "utf8");
await fs.writeFile(path.join(PROOF_DIR, "architecture.md"), architecture);

const judgeFaq = await fs.readFile(path.join(PROJECT_DIR, "submission/judge-faq.md"), "utf8");
await fs.writeFile(path.join(PROOF_DIR, "judge-faq.md"), judgeFaq);

const browserVerifier = await fs.readFile(path.join(PROJECT_DIR, "submission/browser-verifier.md"), "utf8");
await fs.writeFile(path.join(PROOF_DIR, "browser-verifier.md"), browserVerifier);

console.log(
  JSON.stringify(
    {
      status: "proof-room-published",
      files: PROOF_FILES.length + 7,
      proofDir: "docs/proof"
    },
    null,
    2
  )
);

function sanitizePublicProof(content) {
  return content
    .replaceAll(OUTPUT_DIR, "outputs")
    .replaceAll(PROJECT_DIR, "project")
    .replaceAll(".local/casper-testnet-key.json", "local testnet key file (not published)")
    .replaceAll("ready_for_highest_prize_submission", "ready_for_final_review")
    .replaceAll("Highest-prize-ready", "Final-review-ready")
    .replaceAll("highest-prize-ready", "final-review-ready")
    .replaceAll("highestPrizeGate", "finalReviewGate")
    .replaceAll("highestPrizeUnlock", "finalReviewUnlock")
    .replaceAll("highest_prize", "final_review")
    .replaceAll("prizeReadiness", "reviewReadiness")
    .replaceAll("Prize readiness", "Review readiness")
    .replaceAll("Prize Readiness", "Review Readiness")
    .replaceAll("prize readiness", "review readiness")
    .replaceAll("Prize score", "Review score")
    .replaceAll("prizeStatus", "reviewStatus")
    .replaceAll("prizeScore", "reviewScore")
    .replaceAll("highest-prize unlock", "final review unlock")
    .replaceAll("Highest-prize unlock", "Final review unlock")
    .replaceAll("highest-prize gate", "final review gate")
    .replaceAll("Highest-prize gate", "Final review gate")
    .replaceAll("highest-prize submission", "final review submission")
    .replaceAll("highest-prize", "final-review")
    .replaceAll("top-prize", "strong-review")
    .replaceAll("top prize", "strong review");
}

async function clearGeneratedProofFiles() {
  const existing = await fs.readdir(PROOF_DIR);
  await Promise.all(
    existing
      .filter((fileName) => fileName.endsWith(".json") || fileName.endsWith(".md"))
      .map((fileName) => fs.rm(path.join(PROOF_DIR, fileName), { force: true }))
  );
}

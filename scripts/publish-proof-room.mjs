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
  "casper-highest-prize-unlock.json",
  "casper-highest-prize-unlock.md",
  "casper-judge-proof-pack.json",
  "casper-judge-proof-pack.md",
  "casper-prize-readiness.json",
  "casper-public-demo-readiness.json",
  "casper-submission-audit.json",
  "casper-submission-audit.md",
  "casper-testnet-preflight.json",
  "casper-testnet-preflight.md",
  "casper-x402-settlement-preflight.json",
  "casper-x402-settlement-preflight.md"
];

await fs.mkdir(PROOF_DIR, { recursive: true });

for (const fileName of PROOF_FILES) {
  const source = path.join(OUTPUT_DIR, fileName);
  const destination = path.join(PROOF_DIR, fileName);
  const content = await fs.readFile(source, "utf8");
  await fs.writeFile(destination, sanitizePublicProof(content));
}

const competitiveBrief = await fs.readFile(
  path.join(PROJECT_DIR, "submission/competitive-positioning.md"),
  "utf8"
);
await fs.writeFile(path.join(PROOF_DIR, "competitive-positioning.md"), competitiveBrief);

console.log(
  JSON.stringify(
    {
      status: "proof-room-published",
      files: PROOF_FILES.length + 1,
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
    .replaceAll(".local/casper-testnet-key.json", "local testnet key file (not published)");
}

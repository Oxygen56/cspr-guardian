import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const projectDir = process.cwd();
const proofDir = path.join(projectDir, "docs", "proof");
const outputJson = path.join(proofDir, "proof-manifest.json");
const outputMarkdown = path.join(proofDir, "proof-manifest.md");
const excluded = new Set(["proof-manifest.json", "proof-manifest.md"]);
const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:|CASPER_PRIVATE_KEY_/i;

const files = (await fs.readdir(proofDir))
  .filter((name) => !excluded.has(name))
  .filter((name) => name.endsWith(".json") || name.endsWith(".md"))
  .sort();

const entries = [];
for (const fileName of files) {
  const filePath = path.join(proofDir, fileName);
  const bytes = await fs.readFile(filePath);
  const text = bytes.toString("utf8");
  if (PRIVATE_KEY_PATTERN.test(text)) {
    throw new Error(`Refusing to publish proof manifest: sensitive key pattern in ${fileName}`);
  }

  entries.push({
    file: `proof/${fileName}`,
    type: fileName.endsWith(".json") ? "json" : "markdown",
    bytes: bytes.length,
    sha256: sha256(bytes),
    role: roleFor(fileName),
    url: `https://oxygen56.github.io/cspr-guardian/proof/${fileName}`
  });
}

const manifest = {
  version: "0.1",
  generatedAt: new Date().toISOString(),
  project: "CSPR Guardian",
  status: "public-proof-room-ready",
  summary: {
    files: entries.length,
    json: entries.filter((entry) => entry.type === "json").length,
    markdown: entries.filter((entry) => entry.type === "markdown").length
  },
  publicLinks: {
    proofRoom: "https://oxygen56.github.io/cspr-guardian/proof-room.html",
    demo: "https://oxygen56.github.io/cspr-guardian/",
    walkthrough: "https://oxygen56.github.io/cspr-guardian/walkthrough.html",
    casperReceipt:
      "https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a"
  },
  entries
};

await fs.writeFile(outputJson, `${JSON.stringify(manifest, null, 2)}\n`);
await fs.writeFile(outputMarkdown, renderMarkdown(manifest));
console.log(
  JSON.stringify(
    {
      status: manifest.status,
      files: manifest.summary.files,
      json: manifest.summary.json,
      markdown: manifest.summary.markdown,
      outputs: ["docs/proof/proof-manifest.json", "docs/proof/proof-manifest.md"]
    },
    null,
    2
  )
);

function renderMarkdown(manifest) {
  const rows = manifest.entries
    .map(
      (entry) =>
        `| \`${entry.file}\` | ${entry.role} | ${entry.type} | ${entry.bytes} | \`${entry.sha256}\` |`
    )
    .join("\n");

  return `# CSPR Guardian Public Proof Manifest

Generated: ${manifest.generatedAt}

Status: ${manifest.status}

Files: ${manifest.summary.files}

Proof room: ${manifest.publicLinks.proofRoom}

Casper receipt: ${manifest.publicLinks.casperReceipt}

## Integrity Table

| File | Role | Type | Bytes | SHA-256 |
| --- | --- | --- | ---: | --- |
${rows}
`;
}

function roleFor(fileName) {
  if (fileName.includes("submission-audit")) return "final submission audit";
  if (fileName.includes("scenario-matrix")) return "repeatable RWA scenario matrix";
  if (fileName.includes("judge-proof-pack")) return "judge proof pack";
  if (fileName.includes("final-submission-seal")) return "final highest-prize seal";
  if (fileName.includes("final-testnet-evidence")) return "real Casper testnet receipt evidence";
  if (fileName.includes("buidl-submission")) return "copy-ready BUIDL fields";
  if (fileName.includes("prize-readiness")) return "100/100 prize readiness scorecard";
  if (fileName.includes("testnet-preflight")) return "signed Casper deploy preflight";
  if (fileName.includes("x402-settlement-batch")) return "real x402 settlement transactions";
  if (fileName.includes("x402-settlement-preflight")) return "signed x402 settlement preflight";
  if (fileName.includes("ci-readiness")) return "CI readiness";
  if (fileName.includes("public-demo")) return "public demo readiness";
  if (fileName.includes("architecture")) return "architecture and threat model";
  if (fileName.includes("judge-faq")) return "reality boundary and judge FAQ";
  if (fileName.includes("judge-scorecard")) return "judge scorecard";
  if (fileName.includes("competitive-positioning")) return "competitive positioning brief";
  if (fileName.includes("highest-prize-unlock")) return "highest-prize unlock report";
  return "public proof artifact";
}

function sha256(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

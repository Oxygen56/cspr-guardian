import fs from "node:fs/promises";
import path from "node:path";
import { readJsonIfExists, resolveOutputDir } from "./final-submission-seal.mjs";
import {
  buildSubmissionFields,
  isPublicUrl,
  summarizePublicSubmissionFields
} from "./submission-profile.mjs";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export async function generateBuidlSubmissionPage({ outputDir } = {}) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir(process.cwd()));
  const [prizeReadiness, judgeProof, preflight, finalSeal, finalEvidence, existingBuidl] =
    await Promise.all([
      readJsonIfExists(path.join(resolvedOutputDir, "casper-prize-readiness.json")),
      readJsonIfExists(path.join(resolvedOutputDir, "casper-judge-proof-pack.json")),
      readJsonIfExists(path.join(resolvedOutputDir, "casper-testnet-preflight.json")),
      readJsonIfExists(path.join(resolvedOutputDir, "casper-final-submission-seal.json")),
      readJsonIfExists(path.join(resolvedOutputDir, "casper-final-testnet-evidence.json")),
      readJsonIfExists(path.join(resolvedOutputDir, "casper-buidl-submission.json"))
    ]);

  const submissionFields = buildSubmissionFields({
    env: stableSubmissionEnv(existingBuidl?.submissionFields),
    casperExplorerUrl: finalSeal?.finalGate?.explorerUrl || finalEvidence?.anchor?.explorerUrl
  });
  const publicSubmissionFields = summarizePublicSubmissionFields(submissionFields);

  const page = {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: {
      name: "CSPR Guardian",
      tagline: "Casper payment and audit receipts for autonomous RWA treasury agents.",
      oneLiner:
        "CSPR Guardian lets an agent discover paid RWA intelligence tools, pay through x402-style Casper proofs, make a constrained allocation decision, and export a verifiable receipt.",
      categories: ["Casper", "AI agents", "x402", "MCP", "RWA", "DeFi", "auditability"]
    },
    submissionFields,
    publicSubmissionFields,
    readiness: {
      status: prizeReadiness?.status || "unknown",
      score: prizeReadiness?.score ?? null,
      maxScore: prizeReadiness?.maxScore ?? 100,
      highestPrizeGate: Boolean(prizeReadiness?.highestPrizeGate),
      blockers: prizeReadiness?.blockers || []
    },
    proof: {
      assertions: judgeProof?.assertions || [],
      evidenceChecks: judgeProof?.evidenceVerification?.summary || null,
      preflightVerification: judgeProof?.testnet?.preflightVerification || null,
      paidTools: judgeProof?.mcp?.paidTools || []
    },
    testnet: {
      publicKeyHex:
        finalSeal?.finalGate?.publicKeyHex ||
        prizeReadiness?.testnet?.publicKeyHex ||
        preflight?.readiness?.publicKeyHex ||
        null,
      accountStatus:
        finalSeal?.finalGate?.accountStatus ||
        prizeReadiness?.testnet?.accountStatus ||
        preflight?.readiness?.accountStatus ||
        "unknown",
      preflightStatus: preflight?.preflight?.deployBuild?.status || "missing",
      readyForAnchor:
        finalSeal?.finalGate?.readyForAnchor ??
        prizeReadiness?.testnet?.readyForAnchor ??
        preflight?.readiness?.readyForAnchor ??
        false,
      nextCommand: finalSeal?.finalGate?.nextCommand || "npm run seal:submission"
    },
    artifacts: {
      submissionPack: finalSeal?.submissionPack?.zipPath || "cspr-guardian-final-submission.zip",
      submissionPackSha256Source: "casper-final-submission-seal.json",
      sourceZip: "cspr-guardian-prototype.zip",
      judgeProof: "casper-judge-proof-pack.md",
      finalSeal: "casper-final-submission-seal.md",
      preflight: "casper-testnet-preflight.md",
      screenshots: [
        "cspr-guardian-dashboard.png",
        "cspr-guardian-prize-readiness.png",
        "cspr-guardian-judge-proof.png",
        "cspr-guardian-testnet-preflight.png",
        "cspr-guardian-evidence-verification.png"
      ]
    }
  };

  assertNoPrivateKeyLeak(page);
  return page;
}

export async function writeBuidlSubmissionPage(page, outputDir) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir(process.cwd()));
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-buidl-submission.json"),
    `${JSON.stringify(page, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-buidl-submission.md"),
    renderBuidlSubmissionMarkdown(page)
  );
}

export function renderBuidlSubmissionMarkdown(page) {
  const assertions = page.proof.assertions
    .map((item) => `| ${item.id} | ${item.status} | ${item.evidence} |`)
    .join("\n");
  const paidTools = page.proof.paidTools
    .map((tool) => `| ${tool.name} | ${tool.price} | ${tool.payment} |`)
    .join("\n");
  const blockers = page.readiness.blockers.length
    ? page.readiness.blockers.map((blocker) => `- ${blocker}`).join("\n")
    : "- None";
  const screenshots = page.artifacts.screenshots.map((item) => `- \`${item}\``).join("\n");

  return `# ${page.project.name} BUIDL Submission

Generated: ${page.generatedAt}

## Copy-Paste Fields

Project name:

\`\`\`text
${page.project.name}
\`\`\`

Tagline:

\`\`\`text
${page.project.tagline}
\`\`\`

Short description:

\`\`\`text
${page.submissionFields.shortDescription}
\`\`\`

Categories:

\`\`\`text
${page.project.categories.join(", ")}
\`\`\`

Repository URL:

\`\`\`text
${page.submissionFields.repoUrl}
\`\`\`

Demo URL:

\`\`\`text
${page.submissionFields.demoUrl}
\`\`\`

Video URL:

\`\`\`text
${page.submissionFields.videoUrl}
\`\`\`

Casper explorer URL:

\`\`\`text
${page.submissionFields.casperExplorerUrl}
\`\`\`

## Long Description

${page.project.oneLiner}

CSPR Guardian demonstrates a Casper-native agent economy. An autonomous RWA
treasury agent discovers paid MCP-style tools, receives x402-style payment
requirements, signs Ed25519 payment authorizations with nonce replay protection,
buys risk/KYB/liquidity/covenant intelligence, makes a constrained allocation
decision, records provider revenue, and exports tamper-evident evidence.

The key Casper angle is provenance: each run produces payment hashes, report
hashes, a decision hash, a receipt hash, and a Casper receipt anchor path. The
final seal publishes real CSPR.live deploy evidence and regenerates this pack
with the highest-prize gate cleared.

## Readiness

- Score: ${page.readiness.score ?? "unknown"}/${page.readiness.maxScore}
- Status: ${page.readiness.status}
- Highest-prize gate cleared: ${page.readiness.highestPrizeGate}
- Public links ready: ${page.publicSubmissionFields?.complete ?? false}
- Missing public links: ${page.publicSubmissionFields?.missing?.join(", ") || "none"}
- Testnet account: ${page.testnet.accountStatus}
- Public key: ${page.testnet.publicKeyHex || "missing"}
- Preflight build: ${page.testnet.preflightStatus}
- Next command: ${page.testnet.nextCommand}

## Remaining Gate

${blockers}

## Judge Proof

Evidence checks: ${
    page.proof.evidenceChecks
      ? `${page.proof.evidenceChecks.passed}/${page.proof.evidenceChecks.total}`
      : "missing"
  }

Preflight checks: ${
    page.proof.preflightVerification
      ? `${page.proof.preflightVerification.summary.passed}/${page.proof.preflightVerification.summary.total}`
      : "missing"
  }

| Assertion | Status | Evidence |
| --- | --- | --- |
${assertions}

## Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
${paidTools}

## Demo Flow

1. Open the dashboard and show Prize Readiness at ${page.readiness.score ?? "unknown"}/${page.readiness.maxScore}.
2. Run the agent on the RWA opportunity.
3. Show MCP discovery, x402 payment requirements, signed payment proofs, and replay rejection.
4. Show paid RWA risk, KYB, liquidity, and covenant reports.
5. Show the decision, provider revenue, run history, and receipt hash.
6. Show Evidence Verification with all checks passing.
7. Show Final Seal and the submission pack hash.
8. Open the real CSPR.live explorer URL for the final receipt.

## Artifacts

- Submission pack: \`${page.artifacts.submissionPack}\`
- Submission pack SHA-256: see \`${page.artifacts.submissionPackSha256Source}\`
- Source zip: \`${page.artifacts.sourceZip}\`
- Judge proof: \`${page.artifacts.judgeProof}\`
- Final seal: \`${page.artifacts.finalSeal}\`
- Preflight proof: \`${page.artifacts.preflight}\`

Screenshots:

${screenshots}
`;
}

function assertNoPrivateKeyLeak(value) {
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("BUIDL submission page would leak private key material.");
  }
}

function stableSubmissionEnv(existingFields = {}) {
  return {
    ...process.env,
    SUBMISSION_REPO_URL: process.env.SUBMISSION_REPO_URL || publicUrl(existingFields.repoUrl),
    SUBMISSION_DEMO_URL: process.env.SUBMISSION_DEMO_URL || publicUrl(existingFields.demoUrl),
    SUBMISSION_VIDEO_URL: process.env.SUBMISSION_VIDEO_URL || publicUrl(existingFields.videoUrl),
    SUBMISSION_CASPER_EXPLORER_URL:
      process.env.SUBMISSION_CASPER_EXPLORER_URL || publicUrl(existingFields.casperExplorerUrl)
  };
}

function publicUrl(value) {
  return isPublicUrl(value) ? value : "";
}

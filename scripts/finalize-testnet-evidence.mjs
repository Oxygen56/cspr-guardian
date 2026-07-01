import fs from "node:fs/promises";
import path from "node:path";
import { getTestnetReadiness } from "../src/testnet-readiness.mjs";
import { verifyLatestEvidenceBundle } from "../src/evidence-verifier.mjs";
import { waitForCasperDeploy } from "../src/casper-deploy-check.mjs";

process.env.CASPER_MODE = "real";
process.env.CASPER_NODE_RPC =
  process.env.CASPER_NODE_RPC || "https://node.testnet.casper.network/rpc";
process.env.CASPER_PRIVATE_KEY_FILE =
  process.env.CASPER_PRIVATE_KEY_FILE || ".local/casper-testnet-key.json";

const assetId = process.env.CASPER_DEMO_ASSET_ID || "invoice-usdc-7d";
const requestedAmountUsd = Number(process.env.CASPER_DEMO_AMOUNT_USD || "250000");
const waitMs = Number(process.env.CASPER_DEPLOY_WAIT_MS || "120000");
const pollMs = Number(process.env.CASPER_DEPLOY_POLL_MS || "8000");

try {
  const readiness = await getTestnetReadiness();
  if (!readiness.readyForAnchor) {
    const pending = {
      status: "needs_funding",
      message: "Fund the prepared Casper testnet key, then rerun pnpm finalize:testnet.",
      readiness
    };
    await writeFinalEvidence(pending);
    console.log(JSON.stringify(pending, null, 2));
    process.exitCode = 1;
  } else {
    const { runScenario } = await import("../src/agent.mjs");
    const scenario = await runScenario({ assetId, requestedAmountUsd });
    const deploy = await waitForCasperDeploy(scenario.anchor.deployHash, {
      rpcUrl: readiness.rpcUrl,
      timeoutMs: waitMs,
      pollMs
    });
    const verification = await verifyLatestEvidenceBundle();
    const finalEvidence = {
      status: verification.status === "verified" ? "ready_for_submission" : "verification_failed",
      generatedAt: new Date().toISOString(),
      project: "CSPR Guardian",
      readiness,
      anchor: {
        mode: scenario.anchor.mode,
        status: scenario.anchor.status,
        deployHash: scenario.anchor.deployHash,
        explorerUrl: scenario.anchor.explorerUrl,
        memo: scenario.anchor.memo,
        memoSource: scenario.anchor.memoSource,
        memoBits: scenario.anchor.memoBits,
        memoDerivation: scenario.anchor.memoDerivation,
        receiptHash: scenario.anchor.receipt.receiptHash,
        tools: scenario.anchor.receipt.tools
      },
      deploy,
      evidence: {
        evidenceHash: scenario.evidenceBundle.evidenceHash,
        verificationStatus: verification.status,
        checksPassed: verification.summary.passed,
        checksTotal: verification.summary.total
      },
      providerRevenue: scenario.providerRevenue,
      decision: scenario.decision
    };

    await writeFinalEvidence(finalEvidence);
    console.log(JSON.stringify(finalEvidence, null, 2));
    if (finalEvidence.status !== "ready_for_submission") {
      process.exitCode = 1;
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

async function writeFinalEvidence(evidence) {
  const outputDir = await resolveOutputDir();
  const jsonPath = path.join(outputDir, "casper-final-testnet-evidence.json");
  const mdPath = path.join(outputDir, "casper-final-testnet-evidence.md");
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(jsonPath, `${JSON.stringify(evidence, null, 2)}\n`);
  await fs.writeFile(mdPath, renderMarkdown(evidence));
}

async function resolveOutputDir() {
  const configured = process.env.FINAL_EVIDENCE_DIR;
  if (configured) return path.resolve(process.cwd(), configured);

  const workspaceOutputs = path.resolve(process.cwd(), "../../outputs");
  try {
    await fs.access(workspaceOutputs);
    return workspaceOutputs;
  } catch {
    return path.resolve(process.cwd(), "submission");
  }
}

function renderMarkdown(evidence) {
  if (evidence.status === "needs_funding") {
    return `# Casper Final Testnet Evidence

Status: needs funding

Public key:

\`\`\`text
${evidence.readiness.publicKeyHex || "missing"}
\`\`\`

Faucet:

\`\`\`text
${evidence.readiness.faucetUrl}
\`\`\`

After funding:

\`\`\`bash
pnpm check:testnet
pnpm preflight:testnet
pnpm finalize:testnet
\`\`\`
`;
  }

  return `# Casper Final Testnet Evidence

Status: ${evidence.status}

Explorer:

${evidence.anchor.explorerUrl}

Deploy hash:

\`\`\`text
${evidence.anchor.deployHash}
\`\`\`

Receipt hash:

\`\`\`text
${evidence.anchor.receiptHash}
\`\`\`

Transfer memo:

\`\`\`text
${evidence.anchor.memo}
\`\`\`

Memo derivation:

\`\`\`text
${evidence.anchor.memoDerivation}; source=${evidence.anchor.memoSource}; bits=${evidence.anchor.memoBits}
\`\`\`

Evidence hash:

\`\`\`text
${evidence.evidence.evidenceHash}
\`\`\`

Verification:

\`\`\`text
${evidence.evidence.checksPassed}/${evidence.evidence.checksTotal} checks passed
\`\`\`
`;
}

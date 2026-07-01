import fs from "node:fs/promises";
import path from "node:path";
import { buildReceipt } from "./casper-client.mjs";
import { preflightReceiptTransfer } from "./casper-real-adapter.mjs";
import { getLatestEvidenceBundle } from "./ledger.mjs";
import { getTestnetReadiness } from "./testnet-readiness.mjs";

export async function generateTestnetPreflight() {
  process.env.CASPER_NODE_RPC =
    process.env.CASPER_NODE_RPC || "https://node.testnet.casper.network/rpc";
  process.env.CASPER_PRIVATE_KEY_FILE =
    process.env.CASPER_PRIVATE_KEY_FILE || ".local/casper-testnet-key.json";

  const readiness = await getTestnetReadiness();
  const receipt = await loadReceipt();
  const preflight = await preflightReceiptTransfer(receipt);
  const result = {
    status: readiness.readyForAnchor ? "ready_to_anchor" : "needs_funding",
    generatedAt: new Date().toISOString(),
    readiness,
    preflight: {
      mode: preflight.mode,
      status: preflight.status,
      deployHash: preflight.deployHash,
      network: preflight.network,
      rpcUrl: preflight.rpcUrl,
      signerPublicKeyHex: preflight.signerPublicKeyHex,
      recipientPublicKeyHex: preflight.recipientPublicKeyHex,
      transferAmount: preflight.transferAmount,
      paymentAmount: preflight.paymentAmount,
      memo: preflight.memo,
      memoSource: preflight.memoSource,
      memoBits: preflight.memoBits,
      memoDerivation: preflight.memoDerivation,
      receiptHash: preflight.receiptHash,
      deployBuild: preflight.deployBuild
    }
  };

  assertNoPrivateKeyLeak(result);
  return result;
}

export async function writeTestnetPreflight(preflight, outputDir) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir());
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-testnet-preflight.json"),
    `${JSON.stringify(preflight, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-testnet-preflight.md"),
    renderTestnetPreflightMarkdown(preflight)
  );
}

export function renderTestnetPreflightMarkdown(preflight) {
  return `# Casper Testnet Preflight

Status: ${preflight.status}

Deploy build: ${preflight.preflight.deployBuild.status}

Broadcast: ${preflight.preflight.deployBuild.broadcast}

Signer:

\`\`\`text
${preflight.preflight.signerPublicKeyHex}
\`\`\`

Receipt hash:

\`\`\`text
${preflight.preflight.receiptHash}
\`\`\`

Transfer memo:

\`\`\`text
${preflight.preflight.memo}
\`\`\`

Memo derivation:

\`\`\`text
${preflight.preflight.memoDerivation}; source=${preflight.preflight.memoSource}; bits=${preflight.preflight.memoBits}
\`\`\`

Account status:

\`\`\`text
${preflight.readiness.accountStatus}
\`\`\`

Next step:

\`\`\`bash
pnpm check:testnet
pnpm preflight:testnet
pnpm seal:submission
\`\`\`
`;
}

async function loadReceipt() {
  const evidence = await getLatestEvidenceBundle();
  if (evidence.status !== "missing" && evidence.anchor?.receipt) {
    return evidence.anchor.receipt;
  }

  return buildReceipt({
    agentRun: {
      id: "preflight-run"
    },
    payments: [],
    riskReport: null,
    kybReport: null,
    liquidityReport: null,
    covenantReport: null,
    decision: {
      action: "preflight",
      approvedAmountUsd: 0
    }
  });
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

function assertNoPrivateKeyLeak(value) {
  const serialized = JSON.stringify(value);
  if (serialized.includes("BEGIN PRIVATE KEY") || serialized.includes("PRIVATE KEY")) {
    throw new Error("Preflight output would leak a private key.");
  }
}

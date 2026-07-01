import fs from "node:fs/promises";
import path from "node:path";
import { csprToMotes, preflightPaymentTransfer } from "./casper-real-adapter.mjs";
import { getLatestEvidenceBundle } from "./ledger.mjs";
import { getTestnetReadiness } from "./testnet-readiness.mjs";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export async function generateX402SettlementPreflight() {
  process.env.CASPER_NODE_RPC =
    process.env.CASPER_NODE_RPC || "https://node.testnet.casper.network/rpc";
  process.env.CASPER_PRIVATE_KEY_FILE =
    process.env.CASPER_PRIVATE_KEY_FILE || ".local/casper-testnet-key.json";

  const [readiness, evidence] = await Promise.all([
    getTestnetReadiness(),
    getLatestEvidenceBundle()
  ]);
  const payments = evidence?.payments || [];
  if (!payments.length) {
    throw new Error("Run the agent once before generating x402 settlement preflight evidence.");
  }

  const settlements = [];
  for (const payment of payments) {
    settlements.push(await preflightPaymentTransfer(payment));
  }

  const totalMotes = payments
    .reduce((sum, payment) => sum + BigInt(csprToMotes(payment.amount)), 0n)
    .toString();
  const result = {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    status: readiness.readyForAnchor ? "ready_to_settle" : "needs_funding",
    readiness: {
      rpcStatus: readiness.rpcStatus,
      chain: readiness.chain,
      accountStatus: readiness.accountStatus,
      readyForAnchor: readiness.readyForAnchor,
      publicKeyHex: readiness.publicKeyHex,
      faucetUrl: readiness.faucetUrl
    },
    evidence: {
      runId: evidence.run?.id || null,
      receiptHash: evidence.anchor?.receipt?.receiptHash || evidence.verification?.receiptHash || null,
      paymentCount: payments.length,
      totalCSPR: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0).toFixed(2),
      totalMotes
    },
    settlements: settlements.map((settlement) => ({
      tool: settlement.tool,
      status: settlement.status,
      mode: settlement.mode,
      deployHash: settlement.deployHash,
      network: settlement.network,
      rpcUrl: settlement.rpcUrl,
      signerPublicKeyHex: settlement.signerPublicKeyHex,
      requestedRecipient: settlement.requestedRecipient,
      recipientPublicKeyHex: settlement.recipientPublicKeyHex,
      recipientSource: settlement.recipientSource,
      amountCSPR: settlement.amountCSPR,
      transferAmount: settlement.transferAmount,
      paymentAmount: settlement.paymentAmount,
      memo: settlement.memo,
      memoSource: settlement.memoSource,
      memoBits: settlement.memoBits,
      memoDerivation: settlement.memoDerivation,
      authorizationHash: settlement.authorizationHash,
      paymentTxHash: settlement.paymentTxHash,
      nonce: settlement.nonce,
      explorerUrl: settlement.explorerUrl,
      deployBuild: settlement.deployBuild
    }))
  };

  assertNoPrivateKeyLeak(result);
  return result;
}

export async function writeX402SettlementPreflight(preflight, outputDir, { mirrorSubmission = true } = {}) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir());
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await writePair(resolvedOutputDir, preflight);

  if (mirrorSubmission) {
    await writePair(path.resolve(process.cwd(), "submission"), preflight);
  }
}

export function renderX402SettlementPreflightMarkdown(preflight) {
  const rows = preflight.settlements
    .map(
      (item) =>
        `| ${item.tool} | ${item.amountCSPR} | ${item.transferAmount} | ${item.deployBuild.status} | ${item.recipientSource} | ${item.deployHash} |`
    )
    .join("\n");

  return `# Casper x402 Settlement Preflight

Status: ${preflight.status}

Run id: ${preflight.evidence.runId}

Total: ${preflight.evidence.totalCSPR} CSPR (${preflight.evidence.totalMotes} motes)

Account status: ${preflight.readiness.accountStatus}

Public key:

\`\`\`text
${preflight.readiness.publicKeyHex || "missing"}
\`\`\`

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
${rows}

Recipient note: when \`CASPER_TREASURY_PUBLIC_KEY\` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set \`CASPER_TREASURY_PUBLIC_KEY\` to the provider account before real payment
settlement.
`;
}

async function writePair(dir, preflight) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, "casper-x402-settlement-preflight.json"),
    `${JSON.stringify(preflight, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(dir, "casper-x402-settlement-preflight.md"),
    renderX402SettlementPreflightMarkdown(preflight)
  );
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
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("x402 settlement preflight would leak private key material.");
  }
}

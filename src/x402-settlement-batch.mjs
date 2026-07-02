import fs from "node:fs/promises";
import path from "node:path";
import { csprToMotes, settlePaymentTransfer } from "./casper-real-adapter.mjs";
import { waitForCasperDeploy } from "./casper-deploy-check.mjs";
import { getLatestEvidenceBundle } from "./ledger.mjs";
import { getTestnetReadiness } from "./testnet-readiness.mjs";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export async function settleX402PaymentBatch({
  waitMs = Number(process.env.CASPER_X402_SETTLEMENT_WAIT_MS || "180000"),
  pollMs = Number(process.env.CASPER_X402_SETTLEMENT_POLL_MS || "8000"),
  transferAmountMotes = process.env.CASPER_X402_SETTLEMENT_TRANSFER_MOTES || "2500000000"
} = {}) {
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
    throw new Error("Run the agent once before settling x402 payments on testnet.");
  }
  if (!readiness.readyForAnchor) {
    throw new Error("Prepared Casper testnet key is not funded enough for x402 settlement.");
  }

  const settlements = [];
  for (const payment of payments) {
    settlements.push(await settlePaymentTransfer(payment, { transferAmountMotes }));
  }

  const confirmed = [];
  for (const settlement of settlements) {
    try {
      confirmed.push(
        await waitForCasperDeploy(settlement.deployHash, {
          rpcUrl: readiness.rpcUrl,
          timeoutMs: waitMs,
          pollMs
        })
      );
    } catch (error) {
      confirmed.push({
        status: "pending_or_unavailable",
        deployHash: settlement.deployHash,
        rpcUrl: readiness.rpcUrl,
        message: error.message
      });
    }
  }

  const totalMotes = payments
    .reduce((sum, payment) => sum + BigInt(csprToMotes(payment.amount)), 0n)
    .toString();
  const result = {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    status: confirmed.every((item) => item.status === "found")
      ? "settled_on_casper_testnet"
      : "submitted_wait_pending",
    readiness: {
      rpcStatus: readiness.rpcStatus,
      chain: readiness.chain,
      accountStatus: readiness.accountStatus,
      readyForAnchor: readiness.readyForAnchor,
      publicKeyHex: readiness.publicKeyHex
    },
    evidence: {
      runId: evidence.run?.id || null,
      receiptHash: evidence.anchor?.receipt?.receiptHash || evidence.verification?.receiptHash || null,
      paymentCount: payments.length,
      totalCSPR: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0).toFixed(2),
      totalMotes,
      settlementTransferMotes: transferAmountMotes,
      nativeTransferFloorApplied: settlements.some((item) => item.nativeTransferFloorApplied)
    },
    settlementNote:
      "These are Casper testnet settlement-anchor transfers for the four paid RWA tools. The x402 authorization keeps the exact tool price; the native testnet transfer uses the configured settlement amount so the Casper transaction is accepted. No mainnet funds or private keys are published.",
    settlements: settlements.map((settlement, index) => ({
      tool: settlement.tool,
      status: settlement.status,
      mode: settlement.mode,
      transactionType: settlement.transactionType,
      deployHash: settlement.deployHash,
      transactionHash: settlement.transactionHash,
      network: settlement.network,
      rpcUrl: settlement.rpcUrl,
      signerPublicKeyHex: settlement.signerPublicKeyHex,
      requestedRecipient: settlement.requestedRecipient,
      recipientPublicKeyHex: settlement.recipientPublicKeyHex,
      recipientSource: settlement.recipientSource,
      recipientFallbackReason: settlement.recipientFallbackReason || recipientFallbackReason(settlement),
      recipientLabel: publicRecipientLabel(settlement),
      amountCSPR: settlement.amountCSPR,
      x402AmountCSPR: settlement.x402AmountCSPR,
      x402AmountMotes: settlement.x402AmountMotes,
      nativeTransferFloorApplied: settlement.nativeTransferFloorApplied,
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
      deployBuild: settlement.deployBuild,
      confirmation: confirmed[index]
    }))
  };

  assertNoPrivateKeyLeak(result);
  return result;
}

export async function writeX402SettlementBatch(batch, outputDir, { mirrorSubmission = true } = {}) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir());
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await writePair(resolvedOutputDir, batch);

  if (mirrorSubmission) {
    await writePair(path.resolve(process.cwd(), "submission"), batch);
  }
}

export function renderX402SettlementBatchMarkdown(batch) {
  const rows = batch.settlements
    .map(
      (item) =>
        `| ${item.tool} | ${item.x402AmountCSPR} | ${item.transferAmount} | ${item.confirmation?.status || "unknown"} | ${item.recipientLabel || publicRecipientLabel(item)} | [${item.deployHash}](${item.explorerUrl}) |`
    )
    .join("\n");
  const links = batch.settlements
    .map((item) => `- ${item.tool}: ${item.explorerUrl}`)
    .join("\n");

  return `# Casper x402 Settlement Batch

Status: ${batch.status}

Run id: ${batch.evidence.runId}

Payment count: ${batch.evidence.paymentCount}

Total x402 value: ${batch.evidence.totalCSPR} CSPR (${batch.evidence.totalMotes} motes)

Native transfer amount per settlement: ${batch.evidence.settlementTransferMotes} motes

Network: ${batch.readiness.chain}

Settlement note: ${batch.settlementNote}

## Testnet Settlement Transactions

| Tool | x402 CSPR | Native transfer motes | Confirmation | Recipient | Explorer |
| --- | ---: | ---: | --- | --- | --- |
${rows}

## Explorer Links

${links}
`;
}

async function writePair(dir, batch) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, "casper-x402-settlement-batch.json"),
    `${JSON.stringify(batch, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(dir, "casper-x402-settlement-batch.md"),
    renderX402SettlementBatchMarkdown(batch)
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
    throw new Error("x402 settlement batch would leak private key material.");
  }
}

function publicRecipientLabel(settlement) {
  if (settlement.recipientSource === "configured") {
    return "configured provider recipient";
  }
  if (settlement.recipientSource === "agent_controlled_testnet_recipient") {
    return "agent-controlled testnet recipient";
  }
  return settlement.recipientSource || "unknown";
}

function recipientFallbackReason(settlement) {
  if (settlement.recipientFallbackReason) {
    return settlement.recipientFallbackReason;
  }
  if (settlement.recipientSource === "agent_controlled_testnet_recipient_invalid_pay_to") {
    return "configured_pay_to_was_not_a_casper_public_key";
  }
  if (settlement.recipientSource === "agent_controlled_testnet_recipient_missing_pay_to") {
    return "pay_to_missing";
  }
  return null;
}

import crypto from "node:crypto";
import { anchorReceiptTransfer } from "./casper-real-adapter.mjs";

export function buildReceipt({
  agentRun,
  payments,
  payment,
  riskReport,
  kybReport,
  liquidityReport,
  covenantReport,
  decision
}) {
  const paymentList = payments || [payment];
  const receipt = {
    version: "0.1",
    network: process.env.CASPER_NETWORK || "casper-test",
    project: "CSPR Guardian",
    agentRunId: agentRun.id,
    tools: paymentList.map((item) => item.tool),
    paymentHashes: paymentList.map((item) => item.txHash),
    riskReportHash: riskReport ? sha256(JSON.stringify(riskReport)) : null,
    kybReportHash: kybReport ? sha256(JSON.stringify(kybReport)) : null,
    liquidityReportHash: liquidityReport ? sha256(JSON.stringify(liquidityReport)) : null,
    covenantReportHash: covenantReport ? sha256(JSON.stringify(covenantReport)) : null,
    decisionHash: sha256(JSON.stringify(decision)),
    createdAt: new Date().toISOString()
  };

  return {
    ...receipt,
    receiptHash: sha256(JSON.stringify(receipt))
  };
}

export async function anchorReceipt(receipt) {
  const mode = process.env.CASPER_MODE || "mock";

  if (mode !== "real") {
    return mockAnchor(receipt);
  }

  return anchorReceiptTransfer(receipt);
}

export function mockPayment({ requirement, agentId }) {
  const payload = {
    requirement,
    agentId,
    paidAt: new Date().toISOString()
  };

  return {
    status: "settled",
    tool: requirement.tool,
    amount: requirement.amount,
    currency: requirement.currency,
    network: requirement.network,
    txHash: `mock-casper-pay-${sha256(JSON.stringify(payload)).slice(0, 48)}`,
    explorerUrl: null,
    payload
  };
}

function mockAnchor(receipt) {
  const deployHash = `mock-casper-receipt-${receipt.receiptHash.slice(0, 48)}`;

  return {
    mode: "mock",
    status: "anchored",
    deployHash,
    network: receipt.network,
    explorerUrl: `https://testnet.cspr.live/deploy/${deployHash}`,
    receipt
  };
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

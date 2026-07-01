import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const LEDGER_PATH = path.join(process.cwd(), "data", "run_ledger.json");
const EVIDENCE_PATH = path.join(process.cwd(), "data", "evidence_bundle.json");
const MAX_RUNS = 25;

export async function recordRun(result) {
  const ledger = await readLedger();
  const entry = {
    id: result.run.id,
    completedAt: result.run.completedAt,
    assetId: result.riskReport.asset.id,
    assetName: result.riskReport.asset.name,
    action: result.decision.action,
    approvedAmountUsd: result.decision.approvedAmountUsd,
    riskScore: result.riskReport.score,
    riskTier: result.decision.riskTier,
    providerRevenue: result.providerRevenue,
    receiptHash: result.anchor.receipt.receiptHash,
    deployHash: result.anchor.deployHash,
    anchorMode: result.anchor.mode,
    tools: result.anchor.receipt.tools
  };

  ledger.runs = [entry, ...ledger.runs.filter((run) => run.id !== entry.id)].slice(0, MAX_RUNS);
  await fs.writeFile(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`);
  return entry;
}

export async function getRunLedger() {
  return readLedger();
}

export async function getProviderLedger() {
  const ledger = await readLedger();
  const providers = new Map();

  for (const run of ledger.runs) {
    for (const provider of run.providerRevenue.providers) {
      const current = providers.get(provider.tool) || {
        tool: provider.tool,
        totalCSPR: 0,
        calls: 0,
        lastTxHash: null
      };
      current.totalCSPR += Number(provider.amount);
      current.calls += 1;
      current.lastTxHash = provider.txHash;
      providers.set(provider.tool, current);
    }
  }

  return {
    totalRuns: ledger.runs.length,
    totalCSPR: [...providers.values()]
      .reduce((sum, provider) => sum + provider.totalCSPR, 0)
      .toFixed(2),
    providers: [...providers.values()].map((provider) => ({
      ...provider,
      totalCSPR: provider.totalCSPR.toFixed(2)
    }))
  };
}

export async function recordEvidenceBundle(result) {
  const bundle = buildEvidenceBundle(result);
  await fs.writeFile(EVIDENCE_PATH, `${JSON.stringify(bundle, null, 2)}\n`);
  return bundle;
}

export async function getLatestEvidenceBundle() {
  try {
    return JSON.parse(await fs.readFile(EVIDENCE_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        status: "missing",
        message: "Run the agent once to generate an evidence bundle."
      };
    }
    throw error;
  }
}

function buildEvidenceBundle(result) {
  const core = {
    version: "0.2",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    run: result.run,
    paymentRequirements: result.paymentRequirements,
    payments: result.payments,
    reports: {
      risk: result.riskReport,
      kyb: result.kybReport,
      liquidity: result.liquidityReport,
      covenant: result.covenantReport
    },
    decision: result.decision,
    trace: result.trace,
    anchor: result.anchor,
    ledgerEntry: result.ledgerEntry,
    verification: {
      x402Proofs: result.payments.map((payment) => ({
        tool: payment.tool,
        txHash: payment.txHash,
        signature: payment.signature,
        nonce: payment.nonce,
        authorizationHash: payment.authorizationHash,
        authorization: payment.authorization
      })),
      reportHashes: {
        risk: result.anchor.receipt.riskReportHash,
        kyb: result.anchor.receipt.kybReportHash,
        liquidity: result.anchor.receipt.liquidityReportHash,
        covenant: result.anchor.receipt.covenantReportHash
      },
      decisionHash: result.anchor.receipt.decisionHash,
      receiptHash: result.anchor.receipt.receiptHash,
      explorerUrl: result.anchor.explorerUrl
    }
  };
  const evidenceHash = sha256(JSON.stringify(core));

  return {
    ...core,
    evidenceHash
  };
}

async function readLedger() {
  try {
    return JSON.parse(await fs.readFile(LEDGER_PATH, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") {
      return { runs: [] };
    }
    throw error;
  }
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

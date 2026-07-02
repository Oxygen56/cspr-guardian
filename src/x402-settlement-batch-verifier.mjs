import fs from "node:fs/promises";
import path from "node:path";
import { csprToMotes, deriveTransferMemo } from "./casper-real-adapter.mjs";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export function verifyX402SettlementBatch(batch) {
  if (!batch) {
    return {
      status: "missing",
      checks: [],
      summary: { passed: 0, total: 0 },
      message: "No x402 settlement batch was provided."
    };
  }

  const checks = [];
  const add = (name, ok, detail, extra = {}) => checks.push({ name, ok, detail, ...extra });
  const settlements = batch.settlements || [];
  const serialized = JSON.stringify(batch);

  add(
    "private_key_absent",
    !PRIVATE_KEY_PATTERN.test(serialized),
    "x402 settlement batch does not expose private key material."
  );
  add(
    "status",
    batch.status === "settled_on_casper_testnet",
    "x402 settlement batch is confirmed on Casper testnet.",
    { status: batch.status }
  );
  add(
    "payment_count",
    batch.evidence?.paymentCount === 4 && settlements.length === 4,
    "Batch covers the four x402 paid tools.",
    { paymentCount: batch.evidence?.paymentCount, settlements: settlements.length }
  );
  add(
    "network",
    batch.readiness?.chain === "casper-test" &&
      settlements.every((item) => item.network === "casper-test"),
    "All x402 settlement transactions target Casper testnet."
  );
  add(
    "total_x402_motes",
    batch.evidence?.totalMotes ===
      settlements.reduce((sum, item) => sum + BigInt(item.x402AmountMotes || 0), 0n).toString(),
    "Total x402 motes equals the sum of signed tool-payment amounts."
  );
  add(
    "distinct_transactions",
    new Set(settlements.map((item) => item.deployHash)).size === settlements.length,
    "Each x402 paid tool has a distinct Casper transaction hash."
  );

  for (const settlement of settlements) {
    const prefix = `x402_${settlement.tool}`;
    add(
      `${prefix}_submitted`,
      settlement.mode === "real" &&
        settlement.status === "submitted" &&
        settlement.deployBuild?.signed === true &&
        settlement.deployBuild?.broadcast === true,
      `${settlement.tool} was signed and broadcast.`
    );
    add(
      `${prefix}_confirmed`,
      settlement.confirmation?.status === "found",
      `${settlement.tool} transaction is queryable by the Casper RPC.`
    );
    add(
      `${prefix}_hash_shape`,
      /^[0-9a-f]{64}$/i.test(settlement.deployHash || ""),
      `${settlement.tool} has a 64-character Casper transaction hash.`
    );
    add(
      `${prefix}_explorer_url`,
      String(settlement.explorerUrl || "").includes(settlement.deployHash || "") &&
        String(settlement.explorerUrl || "").includes("testnet.cspr.live"),
      `${settlement.tool} has a public CSPR.live URL.`
    );
    add(
      `${prefix}_x402_amount_conversion`,
      settlement.x402AmountMotes === safeCsprToMotes(settlement.x402AmountCSPR || settlement.amountCSPR),
      `${settlement.tool} x402 amount converts exactly to motes.`
    );
    add(
      `${prefix}_settlement_floor`,
      BigInt(settlement.transferAmount || 0) >= BigInt(settlement.x402AmountMotes || 0),
      `${settlement.tool} native settlement transfer covers the signed x402 amount.`
    );

    let memo = null;
    try {
      memo = deriveTransferMemo(settlement.authorizationHash);
    } catch {
      memo = null;
    }
    add(
      `${prefix}_memo_derivation`,
      Boolean(memo) &&
        settlement.memo === memo.memo &&
        settlement.memoSource === memo.memoSource &&
        settlement.memoBits === memo.memoBits,
      `${settlement.tool} memo is derived from its x402 authorization hash.`
    );
  }

  const passed = checks.filter((check) => check.ok).length;
  return {
    status: passed === checks.length ? "verified" : "failed",
    checks,
    summary: {
      passed,
      total: checks.length
    }
  };
}

export async function verifyX402SettlementBatchFile(filePath) {
  const resolvedFile = filePath ? path.resolve(process.cwd(), filePath) : await resolveBatchFile();

  try {
    const batch = JSON.parse(await fs.readFile(resolvedFile, "utf8"));
    return {
      ...verifyX402SettlementBatch(batch),
      sourceFile: resolvedFile
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        status: "missing",
        checks: [],
        summary: { passed: 0, total: 0 },
        sourceFile: resolvedFile,
        message: "x402 settlement batch file was not found."
      };
    }

    return {
      status: "failed",
      checks: [{ name: "x402_settlement_batch_parse", ok: false, detail: error.message }],
      summary: { passed: 0, total: 1 },
      sourceFile: resolvedFile
    };
  }
}

async function resolveBatchFile() {
  const configured = process.env.X402_SETTLEMENT_BATCH_FILE;
  const outputDir = await resolveOutputDir();
  const candidates = [
    configured && path.resolve(process.cwd(), configured),
    path.join(outputDir, "casper-x402-settlement-batch.json"),
    path.resolve(process.cwd(), "submission/casper-x402-settlement-batch.json")
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try next conventional location.
    }
  }

  return candidates[0];
}

async function resolveOutputDir() {
  if (process.env.FINAL_EVIDENCE_DIR) {
    return path.resolve(process.cwd(), process.env.FINAL_EVIDENCE_DIR);
  }

  const workspaceOutputs = path.resolve(process.cwd(), "../../outputs");
  try {
    await fs.access(workspaceOutputs);
    return workspaceOutputs;
  } catch {
    return path.resolve(process.cwd(), "submission");
  }
}

function safeCsprToMotes(amountCSPR) {
  try {
    return csprToMotes(amountCSPR);
  } catch {
    return null;
  }
}

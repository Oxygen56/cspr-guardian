import fs from "node:fs/promises";
import path from "node:path";
import { csprToMotes, deriveTransferMemo } from "./casper-real-adapter.mjs";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export function verifyX402SettlementPreflight(preflight) {
  if (!preflight) {
    return {
      status: "missing",
      checks: [],
      summary: { passed: 0, total: 0 },
      message: "No x402 settlement preflight was provided."
    };
  }

  const checks = [];
  const add = (name, ok, detail, extra = {}) => {
    checks.push({ name, ok, detail, ...extra });
  };
  const serialized = JSON.stringify(preflight);

  add(
    "private_key_absent",
    !PRIVATE_KEY_PATTERN.test(serialized),
    "x402 settlement preflight does not expose private key material."
  );
  add(
    "payment_count",
    preflight.evidence?.paymentCount === 4 && preflight.settlements?.length === 4,
    "Preflight covers the four x402 paid tools.",
    {
      paymentCount: preflight.evidence?.paymentCount,
      settlements: preflight.settlements?.length || 0
    }
  );
  add(
    "network",
    preflight.readiness?.chain === "casper-test" &&
      preflight.settlements?.every((item) => item.network === "casper-test"),
    "All settlement deploys target Casper testnet."
  );
  add(
    "total_motes",
    preflight.evidence?.totalMotes ===
      preflight.settlements
        ?.reduce((sum, item) => sum + BigInt(item.transferAmount || 0), 0n)
        .toString(),
    "Total motes equals the sum of all x402 settlement transfer amounts.",
    { totalMotes: preflight.evidence?.totalMotes }
  );

  for (const settlement of preflight.settlements || []) {
    const prefix = `x402_${settlement.tool}`;
    add(
      `${prefix}_deploy_build`,
      settlement.mode === "real" &&
        settlement.status === "build_ready" &&
        settlement.deployBuild?.status === "ok" &&
        settlement.deployBuild?.signed === true &&
        settlement.deployBuild?.broadcast === false,
      `${settlement.tool} deploy is built and signed without broadcasting.`
    );
    add(
      `${prefix}_deploy_hash_shape`,
      /^[0-9a-f]{64}$/i.test(settlement.deployHash || ""),
      `${settlement.tool} deploy hash is a 64-character Casper deploy hash.`
    );
    add(
      `${prefix}_authorization_hash_shape`,
      /^[0-9a-f]{64}$/i.test(settlement.authorizationHash || ""),
      `${settlement.tool} authorization hash is a 64-character SHA-256 hash.`
    );
    const expectedMotes = safeCsprToMotes(settlement.amountCSPR);
    add(
      `${prefix}_amount_conversion`,
      settlement.transferAmount === expectedMotes,
      `${settlement.tool} CSPR amount converts exactly to motes.`,
      {
        amountCSPR: settlement.amountCSPR,
        transferAmount: settlement.transferAmount,
        expected: expectedMotes
      }
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
        settlement.memoBits === memo.memoBits &&
        settlement.memoDerivation === "uint64(first_16_hex_chars(authorizationHash))",
      `${settlement.tool} memo is deterministically derived from the x402 authorization hash.`
    );
    add(
      `${prefix}_recipient_shape`,
      /^0[12][0-9a-f]{64,66}$/i.test(settlement.recipientPublicKeyHex || ""),
      `${settlement.tool} recipient is a Casper public key.`
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

export async function verifyX402SettlementPreflightFile(filePath) {
  const resolvedFile = filePath
    ? path.resolve(process.cwd(), filePath)
    : await resolveX402PreflightFile();

  try {
    const preflight = JSON.parse(await fs.readFile(resolvedFile, "utf8"));
    return {
      ...verifyX402SettlementPreflight(preflight),
      sourceFile: resolvedFile
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        status: "missing",
        checks: [],
        summary: { passed: 0, total: 0 },
        sourceFile: resolvedFile,
        message: "x402 settlement preflight file was not found."
      };
    }

    return {
      status: "failed",
      checks: [
        {
          name: "x402_preflight_file_parse",
          ok: false,
          detail: error.message
        }
      ],
      summary: { passed: 0, total: 1 },
      sourceFile: resolvedFile
    };
  }
}

async function resolveX402PreflightFile() {
  const configured = process.env.X402_PREFLIGHT_FILE;
  const outputDir = await resolveOutputDir();
  const candidates = [
    configured && path.resolve(process.cwd(), configured),
    path.join(outputDir, "casper-x402-settlement-preflight.json"),
    path.resolve(process.cwd(), "submission/casper-x402-settlement-preflight.json")
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next conventional location.
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

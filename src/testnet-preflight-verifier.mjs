import fs from "node:fs/promises";
import path from "node:path";
import { deriveTransferMemo } from "./casper-real-adapter.mjs";

const MEMO_DERIVATION = "uint64(first_16_hex_chars(receiptHash))";
const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export function verifyTestnetPreflight(preflight) {
  if (!preflight) {
    return {
      status: "missing",
      checks: [],
      summary: { passed: 0, total: 0 },
      message: "No Casper testnet preflight evidence was provided."
    };
  }

  const checks = [];
  const add = (name, ok, detail, extra = {}) => {
    checks.push({ name, ok, detail, ...extra });
  };

  const deploy = preflight.preflight || {};
  const build = deploy.deployBuild || {};
  const serialized = JSON.stringify(preflight);

  add(
    "private_key_absent",
    !PRIVATE_KEY_PATTERN.test(serialized),
    "Preflight evidence does not expose private key material."
  );
  add(
    "rpc_chain",
    preflight.readiness?.rpcStatus === "ok" && preflight.readiness?.chain === "casper-test",
    "Casper testnet RPC is reachable and reports casper-test.",
    {
      rpcStatus: preflight.readiness?.rpcStatus,
      chain: preflight.readiness?.chain
    }
  );
  add(
    "real_deploy_mode",
    deploy.mode === "real" && deploy.status === "prepared",
    "Preflight was built through the real Casper deploy adapter.",
    { mode: deploy.mode, status: deploy.status }
  );
  add(
    "signed_not_broadcast",
    build.status === "ok" && build.signed === true && build.broadcast === false,
    "Deploy was built and signed without broadcasting.",
    { status: build.status, signed: build.signed, broadcast: build.broadcast }
  );
  add(
    "deploy_hash_shape",
    /^[0-9a-f]{64}$/i.test(deploy.deployHash || ""),
    "Deploy hash is a 64-character Casper deploy hash.",
    { deployHash: deploy.deployHash }
  );
  add(
    "receipt_hash_shape",
    /^[0-9a-f]{64}$/i.test(deploy.receiptHash || ""),
    "Receipt hash is a 64-character SHA-256 hash.",
    { receiptHash: deploy.receiptHash }
  );
  add(
    "signer_matches_readiness",
    Boolean(deploy.signerPublicKeyHex) &&
      deploy.signerPublicKeyHex === preflight.readiness?.publicKeyHex,
    "Deploy signer matches the prepared testnet account.",
    {
      signerPublicKeyHex: deploy.signerPublicKeyHex,
      readinessPublicKeyHex: preflight.readiness?.publicKeyHex
    }
  );
  add(
    "network_matches_readiness",
    deploy.network === "casper-test" && deploy.network === preflight.readiness?.chain,
    "Deploy network matches the testnet readiness chain.",
    { deployNetwork: deploy.network, readinessChain: preflight.readiness?.chain }
  );
  add(
    "amounts_positive",
    isPositiveIntegerString(deploy.transferAmount) && isPositiveIntegerString(deploy.paymentAmount),
    "Transfer and payment motes are positive integer strings.",
    { transferAmount: deploy.transferAmount, paymentAmount: deploy.paymentAmount }
  );

  let derivedMemo = null;
  try {
    derivedMemo = deriveTransferMemo(deploy.receiptHash);
  } catch (error) {
    add("memo_derivation", false, error.message);
  }

  if (derivedMemo) {
    add(
      "memo_derivation",
      String(deploy.memo) === derivedMemo.memo &&
        deploy.memoSource === derivedMemo.memoSource &&
        deploy.memoBits === derivedMemo.memoBits &&
        deploy.memoDerivation === MEMO_DERIVATION,
      "Transfer memo is deterministically derived from the receipt hash.",
      {
        expectedMemo: derivedMemo.memo,
        actualMemo: deploy.memo,
        expectedSource: derivedMemo.memoSource,
        actualSource: deploy.memoSource
      }
    );
    add(
      "memo_uint64",
      isUint64String(deploy.memo),
      "Transfer memo fits Casper transfer id uint64 constraints.",
      { memo: deploy.memo }
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

export async function verifyTestnetPreflightFile(filePath) {
  const resolvedFile = filePath
    ? path.resolve(process.cwd(), filePath)
    : await resolvePreflightEvidenceFile();

  try {
    const preflight = JSON.parse(await fs.readFile(resolvedFile, "utf8"));
    return {
      ...verifyTestnetPreflight(preflight),
      sourceFile: resolvedFile
    };
  } catch (error) {
    if (error.code === "ENOENT") {
      return {
        status: "missing",
        checks: [],
        summary: { passed: 0, total: 0 },
        sourceFile: resolvedFile,
        message: "Casper testnet preflight evidence file was not found."
      };
    }

    return {
      status: "failed",
      checks: [
        {
          name: "preflight_file_parse",
          ok: false,
          detail: error.message
        }
      ],
      summary: { passed: 0, total: 1 },
      sourceFile: resolvedFile
    };
  }
}

async function resolvePreflightEvidenceFile() {
  const configured = process.env.CASPER_PREFLIGHT_FILE;
  const outputDir = await resolveOutputDir();
  const candidates = [
    configured && path.resolve(process.cwd(), configured),
    path.join(outputDir, "casper-testnet-preflight.json"),
    path.resolve(process.cwd(), "submission/casper-testnet-preflight.json")
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

function isPositiveIntegerString(value) {
  return /^[1-9][0-9]*$/.test(String(value || ""));
}

function isUint64String(value) {
  if (!/^[0-9]+$/.test(String(value || ""))) return false;
  const memo = BigInt(value);
  return memo >= 0n && memo <= 2n ** 64n - 1n;
}

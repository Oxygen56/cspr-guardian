import crypto from "node:crypto";
import { canonicalJson, sha256 } from "./x402-casper.mjs";
import { getLatestEvidenceBundle } from "./ledger.mjs";

export async function verifyLatestEvidenceBundle() {
  const bundle = await getLatestEvidenceBundle();
  return verifyEvidenceBundle(bundle);
}

export function verifyEvidenceBundle(bundle) {
  if (!bundle || bundle.status === "missing") {
    return {
      status: "missing",
      checks: [],
      summary: { passed: 0, total: 0 },
      message: bundle?.message || "No evidence bundle is available."
    };
  }

  const checks = [];
  const add = (name, ok, detail, extra = {}) => {
    checks.push({ name, ok, detail, ...extra });
  };

  const { evidenceHash, ...coreBundle } = bundle;
  add("evidence_hash", sha256(JSON.stringify(coreBundle)) === evidenceHash, "Evidence hash matches bundle contents.", {
    expected: evidenceHash,
    actual: sha256(JSON.stringify(coreBundle))
  });

  const receipt = bundle.anchor?.receipt || {};
  const { receiptHash, ...receiptCore } = receipt;
  add("receipt_hash", sha256(JSON.stringify(receiptCore)) === receiptHash, "Receipt hash matches receipt contents.", {
    expected: receiptHash,
    actual: sha256(JSON.stringify(receiptCore))
  });

  verifyReports({ bundle, add });
  verifyReceiptLinks({ bundle, receipt, add });
  verifyPayments({ bundle, add });
  verifyRevenue({ bundle, add });

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

function verifyReports({ bundle, add }) {
  const reportHashes = bundle.verification?.reportHashes || {};
  const receipt = bundle.anchor?.receipt || {};
  const reports = bundle.reports || {};
  const reportPairs = [
    ["risk", reports.risk, reportHashes.risk, receipt.riskReportHash],
    ["kyb", reports.kyb, reportHashes.kyb, receipt.kybReportHash],
    ["liquidity", reports.liquidity, reportHashes.liquidity, receipt.liquidityReportHash],
    ["covenant", reports.covenant, reportHashes.covenant, receipt.covenantReportHash]
  ];

  for (const [name, report, expectedHash, receiptHash] of reportPairs) {
    const actualHash = report ? sha256(JSON.stringify(report)) : null;
    add(
      `${name}_report_hash`,
      actualHash === expectedHash && expectedHash === receiptHash,
      `${name} report hash matches evidence and receipt.`,
      { expected: expectedHash, actual: actualHash }
    );
  }

  const decisionHash = sha256(JSON.stringify(bundle.decision));
  add(
    "decision_hash",
    decisionHash === bundle.verification?.decisionHash && decisionHash === receipt.decisionHash,
    "Decision hash matches evidence and receipt.",
    { expected: bundle.verification?.decisionHash, actual: decisionHash }
  );
}

function verifyReceiptLinks({ bundle, receipt, add }) {
  const payments = bundle.payments || [];
  add(
    "receipt_tools",
    JSON.stringify(receipt.tools || []) === JSON.stringify(payments.map((payment) => payment.tool)),
    "Receipt tool list matches paid tools."
  );
  add(
    "receipt_payment_hashes",
    JSON.stringify(receipt.paymentHashes || []) === JSON.stringify(payments.map((payment) => payment.txHash)),
    "Receipt payment hashes match settled payment tx hashes."
  );
  add(
    "receipt_run_id",
    receipt.agentRunId === bundle.run?.id && receipt.agentRunId === bundle.ledgerEntry?.id,
    "Receipt run id matches evidence and ledger entry."
  );
  add(
    "anchor_receipt_hash",
    bundle.verification?.receiptHash === receipt.receiptHash && bundle.ledgerEntry?.receiptHash === receipt.receiptHash,
    "Receipt hash matches verification block and run ledger."
  );
}

function verifyPayments({ bundle, add }) {
  const payments = bundle.payments || [];
  const requirements = bundle.paymentRequirements || [];

  add("x402_payment_count", payments.length === requirements.length && payments.length > 0, "Payment count matches requirements.");

  payments.forEach((payment, index) => {
    const accepted = requirements[index]?.accepts?.[0];
    const authorization = payment.authorization || bundle.verification?.x402Proofs?.[index]?.authorization;
    const signature = payment.signature || bundle.verification?.x402Proofs?.[index]?.signature;
    const prefix = `x402_${payment.tool || index}`;

    add(
      `${prefix}_requirement`,
      Boolean(accepted) &&
        accepted.extra?.tool === payment.tool &&
        accepted.extra?.nonce === payment.nonce &&
        accepted.amount === payment.amount &&
        accepted.asset === payment.currency &&
        accepted.network === payment.network &&
        accepted.payTo === payment.payTo,
      `${payment.tool} payment matches its x402 requirement.`
    );

    add(
      `${prefix}_authorization_fields`,
      Boolean(authorization) &&
        authorization.tool === payment.tool &&
        authorization.nonce === payment.nonce &&
        authorization.amount === payment.amount &&
        authorization.asset === payment.currency &&
        authorization.network === payment.network &&
        authorization.payTo === payment.payTo,
      `${payment.tool} authorization fields match settled payment.`
    );

    const authorizationHash = authorization ? sha256(canonicalJson(authorization)) : null;
    add(
      `${prefix}_authorization_hash`,
      authorizationHash === payment.authorizationHash,
      `${payment.tool} authorization hash matches canonical authorization.`,
      { expected: payment.authorizationHash, actual: authorizationHash }
    );

    let signatureOk = false;
    try {
      const publicKey = crypto.createPublicKey(authorization.publicKeyPem);
      signatureOk = crypto.verify(
        null,
        Buffer.from(canonicalJson(authorization)),
        publicKey,
        Buffer.from(signature, "base64url")
      );
    } catch {
      signatureOk = false;
    }
    add(`${prefix}_signature`, signatureOk, `${payment.tool} Ed25519 signature verifies.`);

    const expectedTxHash = authorization
      ? `mock-casper-pay-${sha256(
          `${authorization.agentId}:${authorization.tool}:${authorization.nonce}:${signature}`
        ).slice(0, 48)}`
      : null;
    add(
      `${prefix}_tx_hash`,
      expectedTxHash === payment.txHash,
      `${payment.tool} mock Casper settlement hash is reproducible.`,
      { expected: payment.txHash, actual: expectedTxHash }
    );
  });
}

function verifyRevenue({ bundle, add }) {
  const payments = bundle.payments || [];
  const providerRevenue = bundle.ledgerEntry?.providerRevenue;
  const total = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0).toFixed(2);
  add(
    "provider_revenue_total",
    providerRevenue?.totalCSPR === total,
    "Provider revenue total matches paid tool amounts.",
    { expected: providerRevenue?.totalCSPR, actual: total }
  );
  add(
    "provider_revenue_items",
    JSON.stringify(providerRevenue?.providers?.map((provider) => provider.txHash) || []) ===
      JSON.stringify(payments.map((payment) => payment.txHash)),
    "Provider revenue entries match payment tx hashes."
  );
}

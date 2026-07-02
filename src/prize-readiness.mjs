import fs from "node:fs/promises";
import path from "node:path";
import { listTools } from "./agent.mjs";
import { verifyLatestEvidenceBundle } from "./evidence-verifier.mjs";
import { getLatestEvidenceBundle, getProviderLedger, getRunLedger } from "./ledger.mjs";
import { getTestnetReadiness } from "./testnet-readiness.mjs";

const REQUIRED_PAID_TOOLS = [
  "rwa.risk_score",
  "rwa.kyb_screen",
  "rwa.liquidity_depth",
  "rwa.covenant_monitor"
];

export async function getPrizeReadiness() {
  const [tools, evidence, verification, providerLedger, runLedger, readiness, assetsReady, finalEvidence] =
    await Promise.all([
      listTools(),
      getLatestEvidenceBundle(),
      verifyLatestEvidenceBundle(),
      getProviderLedger(),
      getRunLedger(),
      getTestnetReadiness(),
      hasSubmissionAssets(),
      readFinalTestnetEvidence()
    ]);

  const paidTools = tools.filter((tool) => tool.payment === "x402-casper");
  const paidToolNames = paidTools.map((tool) => tool.name);
  const hasRequiredPaidTools = REQUIRED_PAID_TOOLS.every((tool) => paidToolNames.includes(tool));
  const evidenceReady = evidence.status !== "missing";
  const x402Proofs = evidenceReady ? evidence.verification?.x402Proofs || [] : [];
  const reportHashes = evidenceReady ? evidence.verification?.reportHashes || {} : {};
  const latestRunRevenue = evidenceReady
    ? evidence.ledgerEntry?.providerRevenue?.totalCSPR ||
      evidence.payments
        ?.reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
        .toFixed(2)
    : providerLedger.totalCSPR;
  const evidenceCasperDeploy =
    evidenceReady &&
    evidence.anchor?.mode === "real" &&
    evidence.anchor?.deployHash &&
    !String(evidence.anchor.deployHash).startsWith("mock-") &&
    evidence.anchor?.explorerUrl?.includes("cspr.live");
  const finalCasperDeploy =
    finalEvidence?.status === "ready_for_submission" &&
    finalEvidence.anchor?.mode === "real" &&
    finalEvidence.anchor?.deployHash &&
    !String(finalEvidence.anchor.deployHash).startsWith("mock-") &&
    finalEvidence.anchor?.explorerUrl?.includes("cspr.live");
  const realCasperDeploy = Boolean(evidenceCasperDeploy || finalCasperDeploy);
  const realCasperExplorerUrl =
    finalCasperDeploy ? finalEvidence.anchor.explorerUrl : evidence.anchor?.explorerUrl;

  const criteria = [
    criterion({
      id: "x402-paid-tools",
      label: "x402 paid tools",
      weight: 20,
      passed:
        hasRequiredPaidTools &&
        x402Proofs.length === REQUIRED_PAID_TOOLS.length &&
        x402Proofs.every((proof) => proof.signature && proof.authorizationHash),
      value: `${x402Proofs.length}/${REQUIRED_PAID_TOOLS.length} signed proofs`,
      evidence: "Four paid CSPR tools with signed authorizations"
    }),
    criterion({
      id: "mcp-tool-discovery",
      label: "MCP tool discovery",
      weight: 15,
      passed: hasRequiredPaidTools && tools.some((tool) => tool.name === "casper.audit_receipt"),
      value: `${tools.length} discoverable tools`,
      evidence: "/mcp/tools exposes paid intelligence and receipt tools"
    }),
    criterion({
      id: "agentic-rwa-workflow",
      label: "Agentic RWA workflow",
      weight: 20,
      passed:
        runLedger.runs.length > 0 &&
        Boolean(evidence.reports?.risk) &&
        Boolean(evidence.reports?.kyb) &&
        Boolean(evidence.reports?.liquidity) &&
        Boolean(evidence.reports?.covenant) &&
        Boolean(evidence.decision?.action),
      value: `${latestRunRevenue} CSPR/run`,
      evidence: "Risk, KYB, liquidity, covenant, policy decision, provider revenue"
    }),
    criterion({
      id: "independent-verifier",
      label: "Independent verifier",
      weight: 15,
      passed:
        verification.status === "verified" &&
        verification.summary?.passed === verification.summary?.total &&
        verification.summary?.total >= 30,
      value:
        verification.summary?.total > 0
          ? `${verification.summary.passed}/${verification.summary.total}`
          : "missing",
      evidence: "Signatures, hashes, receipt, and revenue recompute"
    }),
    criterion({
      id: "casper-receipt",
      label: "Casper receipt",
      weight: 20,
      passed: realCasperDeploy,
      blocked: !readiness.readyForAnchor,
      value: realCasperDeploy
        ? "real testnet deploy"
        : readiness.readyForAnchor
          ? "ready to anchor"
          : "needs funding",
      evidence: realCasperDeploy
        ? realCasperExplorerUrl
        : "Fund testnet key and run npm run seal:submission"
    }),
    criterion({
      id: "submission-assets",
      label: "Submission assets",
      weight: 10,
      passed: assetsReady,
      value: assetsReady ? "screenshots ready" : "missing assets",
      evidence: "Dashboard screenshot, verifier screenshot, copy-ready submission notes"
    })
  ];

  const score = criteria.reduce((sum, item) => sum + (item.status === "pass" ? item.weight : 0), 0);
  const blockers = [
    ...criteria.filter((item) => item.status === "blocked").map((item) => item.evidence),
    ...(readiness.readyForAnchor
      ? []
      : [
          `Fund public key ${readiness.publicKeyHex || "(missing key)"} on Casper testnet`,
          "After funding, run npm run seal:submission to publish real receipt evidence"
        ])
  ];

  return {
    generatedAt: new Date().toISOString(),
    status: score === 100 ? "highest-prize-ready" : score >= 80 ? "final-gate" : "needs-work",
    score,
    maxScore: 100,
    highestPrizeGate: realCasperDeploy,
    criteria,
    blockers: [...new Set(blockers)],
    testnet: {
      rpcStatus: readiness.rpcStatus,
      chain: readiness.chain,
      accountStatus: readiness.accountStatus,
      readyForAnchor: readiness.readyForAnchor,
      publicKeyHex: readiness.publicKeyHex,
      faucetUrl: readiness.faucetUrl
    },
    currentEvidence: evidenceReady
      ? {
          runId: evidence.run.id,
          receiptHash: finalCasperDeploy
            ? finalEvidence.anchor.receiptHash
            : evidence.verification.receiptHash,
          explorerUrl:
            realCasperExplorerUrl || evidence.anchor?.explorerUrl || evidence.verification.explorerUrl,
          anchorMode: finalCasperDeploy ? finalEvidence.anchor.mode : evidence.anchor?.mode,
          reportHashes
        }
      : null
  };
}

function criterion({ id, label, weight, passed, blocked = false, value, evidence }) {
  return {
    id,
    label,
    weight,
    status: passed ? "pass" : blocked ? "blocked" : "partial",
    value,
    evidence
  };
}

async function hasSubmissionAssets() {
  const files = [
    "submission/assets/cspr-guardian-dashboard.png",
    "submission/assets/cspr-guardian-review-readiness.png",
    "submission/assets/cspr-guardian-judge-proof.png",
    "submission/assets/cspr-guardian-testnet-preflight.png",
    "submission/assets/cspr-guardian-evidence-verification.png",
    "submission/dorahacks-draft.md",
    "submission/demo-video-script.md",
    "submission/judge-evidence-map.md",
    "submission/judge-proof-pack.json",
    "submission/judge-proof-pack.md",
    "submission/casper-testnet-preflight.json",
    "submission/casper-testnet-preflight.md",
    "submission/casper-x402-settlement-batch.json",
    "submission/casper-x402-settlement-batch.md",
    "submission/review-readiness-snapshot.json",
    "submission/submission-assets.md"
  ];

  try {
    await Promise.all(files.map((file) => fs.access(path.join(process.cwd(), file))));
    return true;
  } catch {
    return false;
  }
}

async function readFinalTestnetEvidence() {
  const candidates = [
    path.resolve(process.cwd(), "../../outputs/casper-final-testnet-evidence.json"),
    path.resolve(process.cwd(), "submission/casper-final-testnet-evidence.json")
  ];

  for (const candidate of candidates) {
    try {
      return JSON.parse(await fs.readFile(candidate, "utf8"));
    } catch {
      // Try the next conventional location.
    }
  }

  return null;
}

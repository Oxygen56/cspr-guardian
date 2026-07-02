import fs from "node:fs/promises";
import path from "node:path";
import { callPaidRiskOracle, listTools, runScenario } from "./agent.mjs";
import { verifyLatestEvidenceBundle } from "./evidence-verifier.mjs";
import { getLatestEvidenceBundle } from "./ledger.mjs";
import { getPrizeReadiness } from "./prize-readiness.mjs";
import { verifyTestnetPreflightFile } from "./testnet-preflight-verifier.mjs";
import { getTestnetReadiness } from "./testnet-readiness.mjs";
import { verifyX402SettlementPreflightFile } from "./x402-settlement-preflight-verifier.mjs";
import { sha256, signDemoPayment } from "./x402-casper.mjs";

export async function generateJudgeProofPack({
  assetId = "invoice-usdc-7d",
  requestedAmountUsd = 250000
} = {}) {
  const tools = await listTools();
  const challenge = await callPaidRiskOracle({ assetId, requestedAmountUsd });
  const paymentProof = signDemoPayment(challenge.body.requirement, {
    agentId: "judge-proof-agent"
  });
  const paidCall = await callPaidRiskOracle({
    assetId,
    requestedAmountUsd,
    paymentProof
  });
  const replayCall = await callPaidRiskOracle({
    assetId,
    requestedAmountUsd,
    paymentProof
  });
  const scenario = await runScenario({ assetId, requestedAmountUsd });
  const evidenceBundle = await getLatestEvidenceBundle();
  const verification = await verifyLatestEvidenceBundle();
  const prizeReadiness = await getPrizeReadiness();
  const testnetReadiness = await getTestnetReadiness();
  const preflightVerification = await verifyTestnetPreflightFile();
  const x402PreflightVerification = await verifyX402SettlementPreflightFile();
  const authorization = paidCall.body.payment.authorization;

  const assertions = [
    {
      id: "mcp-tool-discovery",
      status: tools.filter((tool) => tool.payment === "x402-casper").length >= 4 ? "pass" : "fail",
      evidence: `${tools.length} tools exposed, including four x402-Casper paid tools`
    },
    {
      id: "payment-required",
      status: challenge.status === 402 && Boolean(challenge.headers["PAYMENT-REQUIRED"]) ? "pass" : "fail",
      evidence: "Risk oracle returns HTTP 402 plus PAYMENT-REQUIRED before payment"
    },
    {
      id: "signed-payment",
      status: paidCall.status === 200 && paidCall.body.payment.status === "settled" ? "pass" : "fail",
      evidence: "Ed25519 signed authorization unlocks the paid oracle"
    },
    {
      id: "nonce-replay-protection",
      status: replayCall.status === 402 && /nonce already used/i.test(replayCall.body.error) ? "pass" : "fail",
      evidence: "Reusing the same signed payment proof is rejected"
    },
    {
      id: "agentic-rwa-run",
      status:
        scenario.payments.length === 4 &&
        scenario.decision.action === "approve" &&
        scenario.providerRevenue.totalCSPR === "0.62"
          ? "pass"
          : "fail",
      evidence: "Agent buys four signals, decides under policy, and records provider revenue"
    },
    {
      id: "independent-verifier",
      status:
        verification.status === "verified" &&
        verification.summary.passed === verification.summary.total
          ? "pass"
          : "fail",
      evidence: `${verification.summary.passed}/${verification.summary.total} checks passed`
    },
    {
      id: "real-deploy-preflight",
      status: preflightVerification.status === "verified" ? "pass" : "blocked",
      evidence:
        preflightVerification.status === "verified"
          ? `${preflightVerification.summary.passed}/${preflightVerification.summary.total} real deploy preflight checks passed`
          : "Run npm run preflight:testnet and npm run verify:preflight before final submission"
    },
    {
      id: "x402-settlement-preflight",
      status: x402PreflightVerification.status === "verified" ? "pass" : "blocked",
      evidence:
        x402PreflightVerification.status === "verified"
          ? `${x402PreflightVerification.summary.passed}/${x402PreflightVerification.summary.total} signed x402 settlement transfer checks passed`
          : "Run npm run preflight:x402 and npm run verify:x402-preflight before final submission"
    },
    {
      id: "casper-final-gate",
      status: prizeReadiness.highestPrizeGate ? "pass" : "blocked",
      evidence: prizeReadiness.highestPrizeGate
        ? "Real CSPR.live deploy evidence is present"
        : "Fund testnet key and rerun npm run seal:submission"
    }
  ];

  const proofPack = {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    assetId,
    requestedAmountUsd,
    assertions,
    mcp: {
      endpoint: "/mcp/tools",
      toolCount: tools.length,
      paidTools: tools
        .filter((tool) => tool.payment === "x402-casper")
        .map((tool) => ({
          name: tool.name,
          price: tool.price,
          payment: tool.payment
        }))
    },
    x402Flow: {
      beforePayment: {
        status: challenge.status,
        paymentRequiredHeaderPresent: Boolean(challenge.headers["PAYMENT-REQUIRED"]),
        requirement: challenge.body.requirement
      },
      signedAuthorization: {
        tool: authorization.tool,
        assetId: authorization.assetId,
        agentId: authorization.agentId,
        amount: authorization.amount,
        network: authorization.network,
        nonce: authorization.nonce,
        authorizationHash: paidCall.body.payment.authorizationHash,
        publicKeyFingerprint: sha256(authorization.publicKeyPem).slice(0, 24),
        signature: paidCall.body.payment.signature
      },
      settlement: {
        status: paidCall.body.payment.status,
        txHash: paidCall.body.payment.txHash,
        amount: paidCall.body.payment.amount,
        currency: paidCall.body.payment.currency
      },
      replayAttempt: {
        status: replayCall.status,
        error: replayCall.body.error
      }
    },
    scenario: {
      runId: scenario.run.id,
      decision: scenario.decision.action,
      approvedAmountUsd: scenario.decision.approvedAmountUsd,
      providerRevenue: scenario.providerRevenue.totalCSPR,
      paidTools: scenario.payments.map((payment) => payment.tool),
      receiptHash: scenario.anchor.receipt.receiptHash,
      anchorMode: scenario.anchor.mode,
      deployHash: scenario.anchor.deployHash,
      explorerUrl: String(scenario.anchor.deployHash || "").startsWith("mock-")
        ? null
        : scenario.anchor.explorerUrl
    },
    evidenceVerification: {
      status: verification.status,
      summary: verification.summary,
      failedChecks: verification.checks.filter((check) => !check.ok).map((check) => check.name),
      signatureChecks: verification.checks.filter(
        (check) => check.ok && check.name.includes("signature")
      ).length,
      hashChecks: verification.checks.filter((check) => check.ok && check.name.includes("hash")).length,
      evidenceHash: evidenceBundle.evidenceHash
    },
    prizeReadiness: {
      status: prizeReadiness.status,
      score: prizeReadiness.score,
      maxScore: prizeReadiness.maxScore,
      highestPrizeGate: prizeReadiness.highestPrizeGate,
      criteria: prizeReadiness.criteria,
      blockers: prizeReadiness.blockers,
      currentEvidence: prizeReadiness.currentEvidence || null
    },
    testnet: {
      rpcStatus: testnetReadiness.rpcStatus,
      chain: testnetReadiness.chain,
      accountStatus: testnetReadiness.accountStatus,
      readyForAnchor: testnetReadiness.readyForAnchor,
      publicKeyHex: testnetReadiness.publicKeyHex,
      faucetUrl: testnetReadiness.faucetUrl,
      preflightVerification: {
        status: preflightVerification.status,
        sourceFile: preflightVerification.sourceFile,
        summary: preflightVerification.summary,
        failedChecks: preflightVerification.checks
          .filter((check) => !check.ok)
          .map((check) => check.name)
      },
      x402SettlementPreflight: {
        status: x402PreflightVerification.status,
        sourceFile: x402PreflightVerification.sourceFile,
        summary: x402PreflightVerification.summary,
        failedChecks: x402PreflightVerification.checks
          .filter((check) => !check.ok)
          .map((check) => check.name)
      }
    }
  };

  assertNoPrivateKeyLeak(proofPack);
  return proofPack;
}

export async function writeJudgeProofPack(
  proofPack,
  outputDir = "submission",
  { fileBaseName = "judge-proof-pack" } = {}
) {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, `${fileBaseName}.json`),
    `${JSON.stringify(proofPack, null, 2)}\n`
  );
  await fs.writeFile(path.join(outputDir, `${fileBaseName}.md`), renderJudgeProofMarkdown(proofPack));
}

export function summarizeJudgeProofPack(proofPack) {
  return {
    status: proofPack.assertions.every((item) => item.status === "pass" || item.status === "blocked")
      ? "generated"
      : "needs_review",
    score: `${proofPack.prizeReadiness.score}/${proofPack.prizeReadiness.maxScore}`,
    finalGate: proofPack.prizeReadiness.highestPrizeGate ? "cleared" : "needs_testnet_funding",
    verification: `${proofPack.evidenceVerification.summary.passed}/${proofPack.evidenceVerification.summary.total}`
  };
}

export function renderJudgeProofMarkdown(pack) {
  const rows = pack.assertions
    .map((item) => `| ${item.id} | ${item.status} | ${item.evidence} |`)
    .join("\n");
  const paidRows = pack.mcp.paidTools
    .map((tool) => `| ${tool.name} | ${tool.price} | ${tool.payment} |`)
    .join("\n");
  const criteriaRows = pack.prizeReadiness.criteria
    .map((item) => `| ${item.label} | ${item.status} | ${item.value} | ${item.weight} |`)
    .join("\n");
  const finalExplorerUrl =
    pack.prizeReadiness.currentEvidence?.explorerUrl ||
    (String(pack.scenario.deployHash || "").startsWith("mock-") ? null : pack.scenario.explorerUrl);
  const finalGateSummary = pack.prizeReadiness.highestPrizeGate
    ? `The highest-prize gate is cleared by a real Casper testnet receipt.

- Explorer URL: ${finalExplorerUrl || "missing"}
- Final receipt hash: ${pack.prizeReadiness.currentEvidence?.receiptHash || "missing"}
- Public key: ${pack.testnet.publicKeyHex || "missing"}
- Account status: ${pack.testnet.accountStatus}
- Ready for anchor: ${pack.testnet.readyForAnchor}
- Deploy preflight verification: ${pack.testnet.preflightVerification.status} (${pack.testnet.preflightVerification.summary.passed}/${pack.testnet.preflightVerification.summary.total})`
    : `The remaining highest-prize gate is a real Casper testnet deploy.

- Public key: ${pack.testnet.publicKeyHex || "missing"}
- Account status: ${pack.testnet.accountStatus}
- Ready for anchor: ${pack.testnet.readyForAnchor}
- Deploy preflight verification: ${pack.testnet.preflightVerification.status} (${pack.testnet.preflightVerification.summary.passed}/${pack.testnet.preflightVerification.summary.total})
- Faucet: ${pack.testnet.faucetUrl}

After funding, run:

\`\`\`bash
npm run seal:submission
\`\`\``;

  return `# Judge Proof Pack

Generated: ${pack.generatedAt}

Project: CSPR Guardian

Prize readiness: ${pack.prizeReadiness.score}/${pack.prizeReadiness.maxScore} (${pack.prizeReadiness.status})

## Assertions

| Check | Status | Evidence |
| --- | --- | --- |
${rows}

## x402 Payment Flow

- Before payment: oracle returned ${pack.x402Flow.beforePayment.status} with PAYMENT-REQUIRED header.
- Signed authorization hash: ${pack.x402Flow.signedAuthorization.authorizationHash}
- Demo settlement hash: ${pack.x402Flow.settlement.txHash}
- Replay attempt: ${pack.x402Flow.replayAttempt.status}, ${pack.x402Flow.replayAttempt.error}

## MCP Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
${paidRows}

## Agent Run

- Run id: ${pack.scenario.runId}
- Decision: ${pack.scenario.decision}
- Approved amount: $${pack.scenario.approvedAmountUsd.toLocaleString("en-US")}
- Provider revenue: ${pack.scenario.providerRevenue} CSPR
- Receipt hash: ${pack.scenario.receiptHash}
- Demo anchor mode: ${pack.scenario.anchorMode}
- Demo explorer URL: ${pack.scenario.explorerUrl || "not used for final judging"}
- Final Casper receipt: ${finalExplorerUrl || "see Current Final Gate"}

## Evidence Verification

- Status: ${pack.evidenceVerification.status}
- Checks: ${pack.evidenceVerification.summary.passed}/${pack.evidenceVerification.summary.total}
- Signature checks: ${pack.evidenceVerification.signatureChecks}
- Hash checks: ${pack.evidenceVerification.hashChecks}
- Evidence hash: ${pack.evidenceVerification.evidenceHash}

## Prize Readiness Criteria

| Criterion | Status | Value | Weight |
| --- | --- | --- | --- |
${criteriaRows}

## Current Final Gate

${finalGateSummary}
`;
}

function assertNoPrivateKeyLeak(value) {
  const serialized = JSON.stringify(value);
  if (serialized.includes("BEGIN PRIVATE KEY") || serialized.includes("PRIVATE KEY")) {
    throw new Error("Proof pack would leak a private key.");
  }
}

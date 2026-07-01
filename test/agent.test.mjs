import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  callPaidCovenantOracle,
  callPaidLiquidityOracle,
  callPaidRiskOracle,
  runScenario
} from "../src/agent.mjs";
import { renderBuidlSubmissionMarkdown } from "../src/buidl-submission.mjs";
import { generateBuidlSubmissionPage } from "../src/buidl-submission.mjs";
import { csprToMotes, deriveTransferMemo } from "../src/casper-real-adapter.mjs";
import { getLatestEvidenceBundle, getProviderLedger, getRunLedger } from "../src/ledger.mjs";
import { verifyLatestEvidenceBundle } from "../src/evidence-verifier.mjs";
import {
  buildFundingSeal,
  buildReadySeal,
  renderFinalSubmissionSealMarkdown
} from "../src/final-submission-seal.mjs";
import {
  buildHighestPrizeGates,
  deriveHighestPrizeUnlockStatus,
  fetchCsprLiveFaucetConfig,
  renderHighestPrizeUnlockMarkdown
} from "../src/highest-prize-unlock.mjs";
import { generateJudgeProofPack, summarizeJudgeProofPack } from "../src/judge-proof-pack.mjs";
import { getPrizeReadiness } from "../src/prize-readiness.mjs";
import {
  buildPublicDemoReadinessChecks,
  renderPublicDemoHandoffMarkdown
} from "../src/public-demo-readiness.mjs";
import {
  buildSubmissionFields,
  summarizePublicSubmissionFields
} from "../src/submission-profile.mjs";
import {
  deriveSubmissionAuditStatus,
  renderSubmissionAuditMarkdown,
  summarizeChecks
} from "../src/submission-audit.mjs";
import { getTestnetReadiness } from "../src/testnet-readiness.mjs";
import { verifyTestnetPreflight } from "../src/testnet-preflight-verifier.mjs";
import { verifyX402SettlementPreflight } from "../src/x402-settlement-preflight-verifier.mjs";
import { signDemoPayment } from "../src/x402-casper.mjs";

test("paid oracle returns x402-style requirement before payment", async () => {
  const result = await callPaidRiskOracle({ assetId: "invoice-usdc-7d" });
  assert.equal(result.status, 402);
  assert.equal(result.body.requirement.x402Version, 1);
  assert.equal(result.body.requirement.accepts[0].asset, "CSPR");
  assert.ok(result.headers["PAYMENT-REQUIRED"]);
});

test("liquidity oracle also requires x402-Casper payment", async () => {
  const result = await callPaidLiquidityOracle({ assetId: "invoice-usdc-7d" });
  assert.equal(result.status, 402);
  assert.equal(result.body.requirement.accepts[0].resource, "/api/oracle/liquidity-depth?assetId=invoice-usdc-7d");
  assert.equal(result.body.requirement.accepts[0].amount, "0.15");
});

test("covenant monitor also requires x402-Casper payment", async () => {
  const result = await callPaidCovenantOracle({ assetId: "invoice-usdc-7d" });
  assert.equal(result.status, 402);
  assert.equal(result.body.requirement.accepts[0].resource, "/api/oracle/covenant-monitor?assetId=invoice-usdc-7d");
  assert.equal(result.body.requirement.accepts[0].amount, "0.12");
});

test("signed x402-Casper proof unlocks an oracle once and blocks replay", async () => {
  const challenge = await callPaidRiskOracle({ assetId: "invoice-usdc-7d" });
  const proof = signDemoPayment(challenge.body.requirement, { agentId: "test-agent" });
  const first = await callPaidRiskOracle({
    assetId: "invoice-usdc-7d",
    paymentProof: proof
  });
  const replay = await callPaidRiskOracle({
    assetId: "invoice-usdc-7d",
    paymentProof: proof
  });

  assert.equal(first.status, 200);
  assert.equal(first.body.payment.status, "settled");
  assert.equal(replay.status, 402);
  assert.match(replay.body.error, /nonce already used/);
});

test("agent scenario completes payment, decision, and Casper receipt", async () => {
  const result = await runScenario({ assetId: "invoice-usdc-7d", requestedAmountUsd: 250000 });
  assert.equal(result.payments.length, 4);
  assert.equal(result.payments[0].status, "settled");
  assert.equal(result.payments[1].status, "settled");
  assert.equal(result.payments[2].status, "settled");
  assert.equal(result.payments[3].status, "settled");
  assert.equal(result.providerRevenue.totalCSPR, "0.62");
  assert.deepEqual(result.anchor.receipt.tools, [
    "rwa.risk_score",
    "rwa.kyb_screen",
    "rwa.liquidity_depth",
    "rwa.covenant_monitor"
  ]);
  assert.ok(result.anchor.receipt.covenantReportHash);
  assert.ok(result.decision.approvedAmountUsd > 0);
  assert.equal(result.anchor.status, "anchored");
  assert.ok(result.anchor.receipt.receiptHash);
  assert.equal(result.trace.length, 9);

  const runLedger = await getRunLedger();
  const providerLedger = await getProviderLedger();
  const evidenceBundle = await getLatestEvidenceBundle();
  assert.ok(runLedger.runs.find((run) => run.id === result.run.id));
  assert.ok(Number(providerLedger.totalCSPR) >= 0.62);
  assert.equal(evidenceBundle.run.id, result.run.id);
  assert.equal(evidenceBundle.payments.length, 4);
  assert.equal(evidenceBundle.verification.x402Proofs.length, 4);
  assert.ok(evidenceBundle.verification.x402Proofs.every((proof) => proof.signature));
  assert.ok(evidenceBundle.verification.x402Proofs.every((proof) => proof.authorization));
  assert.equal(evidenceBundle.verification.receiptHash, result.anchor.receipt.receiptHash);
  assert.ok(evidenceBundle.evidenceHash);

  const verification = await verifyLatestEvidenceBundle();
  assert.equal(verification.status, "verified");
  assert.equal(verification.summary.passed, verification.summary.total);
  assert.ok(verification.checks.find((check) => check.name.endsWith("_signature") && check.ok));
});

test("testnet readiness reports RPC and funding state without exposing private key", async () => {
  const readiness = await getTestnetReadiness();
  assert.equal(readiness.rpcStatus, "ok");
  assert.equal(readiness.chain, "casper-test");
  assert.equal(readiness.faucetUrl, "https://testnet.cspr.live/tools/faucet");
  assert.ok(readiness.publicKeyHex || readiness.accountStatus === "missing_key");
  assert.equal(JSON.stringify(readiness).includes("BEGIN PRIVATE KEY"), false);
});

test("prize readiness maps evidence to the remaining highest-prize gate", async () => {
  await runScenario({ assetId: "invoice-usdc-7d", requestedAmountUsd: 250000 });
  const readiness = await getPrizeReadiness();
  const byId = Object.fromEntries(readiness.criteria.map((item) => [item.id, item]));

  assert.equal(byId["x402-paid-tools"].status, "pass");
  assert.equal(byId["mcp-tool-discovery"].status, "pass");
  assert.equal(byId["agentic-rwa-workflow"].status, "pass");
  assert.equal(byId["independent-verifier"].status, "pass");
  assert.ok(["pass", "blocked", "partial"].includes(byId["casper-receipt"].status));
  assert.ok(readiness.score >= 70);
  assert.equal(JSON.stringify(readiness).includes("BEGIN PRIVATE KEY"), false);
});

test("judge proof pack captures x402, replay, verifier, and prize gate", async () => {
  const proof = await generateJudgeProofPack({
    assetId: "invoice-usdc-7d",
    requestedAmountUsd: 250000
  });
  const summary = summarizeJudgeProofPack(proof);
  const byId = Object.fromEntries(proof.assertions.map((item) => [item.id, item]));

  assert.equal(summary.status, "generated");
  assert.equal(byId["payment-required"].status, "pass");
  assert.equal(byId["signed-payment"].status, "pass");
  assert.equal(byId["nonce-replay-protection"].status, "pass");
  assert.ok(["pass", "blocked"].includes(byId["real-deploy-preflight"].status));
  assert.equal(proof.x402Flow.beforePayment.status, 402);
  assert.equal(proof.x402Flow.replayAttempt.status, 402);
  assert.match(proof.x402Flow.replayAttempt.error, /nonce already used/i);
  assert.equal(proof.evidenceVerification.status, "verified");
  assert.equal(proof.evidenceVerification.summary.passed, proof.evidenceVerification.summary.total);
  assert.ok(proof.prizeReadiness.score >= 70);
  assert.equal(JSON.stringify(proof).includes("BEGIN PRIVATE KEY"), false);
});

test("real Casper receipt memo is a valid uint64 derived from receipt hash", () => {
  const receiptHash = "abcd000000000000ffffffffffffffffffffffffffffffffffffffffffffffff";
  const memo = deriveTransferMemo(receiptHash);

  assert.equal(memo.memoSource, "abcd000000000000");
  assert.equal(memo.memoBits, 64);
  assert.equal(memo.memo, BigInt("0xabcd000000000000").toString());
  assert.ok(BigInt(memo.memo) <= 2n ** 64n - 1n);
  assert.equal(csprToMotes("0.25"), "250000000");
  assert.equal(csprToMotes("1.000000001"), "1000000001");
});

test("testnet preflight verifier checks real deploy memo and leak safety", () => {
  const receiptHash = "f11dac5e96824865297a9f32a1cf53e615a5bcb6fcf59a426241c98521d8704b";
  const memo = deriveTransferMemo(receiptHash);
  const publicKeyHex = "011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2";
  const result = verifyTestnetPreflight({
    status: "needs_funding",
    readiness: {
      rpcStatus: "ok",
      chain: "casper-test",
      publicKeyHex
    },
    preflight: {
      mode: "real",
      status: "prepared",
      deployHash: "88baa2326ad7f124eab1335a08a44bc765214ff6b65d3d0a4316904000e8de5b",
      network: "casper-test",
      signerPublicKeyHex: publicKeyHex,
      recipientPublicKeyHex: publicKeyHex,
      transferAmount: "1",
      paymentAmount: "100000000",
      memo: memo.memo,
      memoSource: memo.memoSource,
      memoBits: memo.memoBits,
      memoDerivation: "uint64(first_16_hex_chars(receiptHash))",
      receiptHash,
      deployBuild: {
        status: "ok",
        signed: true,
        broadcast: false
      }
    }
  });

  assert.equal(result.status, "verified");
  assert.equal(result.summary.passed, result.summary.total);
});

test("x402 settlement preflight verifier checks signed Casper payment transfer path", () => {
  const authorizationHash = "abcd000000000000ffffffffffffffffffffffffffffffffffffffffffffffff";
  const memo = deriveTransferMemo(authorizationHash);
  const publicKeyHex = "011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2";
  const settlement = {
    tool: "rwa.risk_score",
    status: "build_ready",
    mode: "real",
    deployHash: "1fc14583f424ada9b89e4394aa1eace52391101e8cc194bbe037e138a9e7a897",
    network: "casper-test",
    signerPublicKeyHex: publicKeyHex,
    recipientPublicKeyHex: publicKeyHex,
    recipientSource: "self_fallback_invalid_pay_to",
    amountCSPR: "0.25",
    transferAmount: "250000000",
    paymentAmount: "100000000",
    memo: memo.memo,
    memoSource: memo.memoSource,
    memoBits: memo.memoBits,
    memoDerivation: "uint64(first_16_hex_chars(authorizationHash))",
    authorizationHash,
    paymentTxHash: "mock-casper-pay-" + "a".repeat(48),
    deployBuild: {
      status: "ok",
      signed: true,
      broadcast: false
    }
  };
  const result = verifyX402SettlementPreflight({
    readiness: { chain: "casper-test" },
    evidence: {
      paymentCount: 4,
      totalMotes: "1000000000"
    },
    settlements: [
      settlement,
      { ...settlement, tool: "rwa.kyb_screen" },
      { ...settlement, tool: "rwa.liquidity_depth" },
      { ...settlement, tool: "rwa.covenant_monitor" }
    ]
  });

  assert.equal(result.status, "verified");
  assert.equal(result.summary.passed, result.summary.total);
});

test("final submission seal keeps unfunded state explicit", () => {
  const seal = buildFundingSeal({
    readiness: {
      accountStatus: "unfunded_or_unavailable",
      readyForAnchor: false,
      publicKeyHex: "01abc",
      faucetUrl: "https://testnet.cspr.live/tools/faucet",
      requiredMotes: "100000001"
    },
    packManifest: {
      status: "ready_except_real_testnet_gate",
      missingRequired: [],
      files: [{ path: "README-SUBMIT.md" }],
      zip: {
        path: "/tmp/cspr-guardian-final-submission.zip",
        sha256: "abc"
      }
    },
    generatedAt: "2026-07-01T00:00:00.000Z"
  });
  const markdown = renderFinalSubmissionSealMarkdown(seal);

  assert.equal(seal.status, "needs_funding");
  assert.equal(seal.finalGate.highestPrizeGate, false);
  assert.match(markdown, /pnpm seal:submission/);
  assert.equal(JSON.stringify(seal).includes("privateKeyHex"), false);
});

test("final submission seal only marks highest-prize ready with real final evidence", () => {
  const seal = buildReadySeal({
    readiness: {
      accountStatus: "funded",
      readyForAnchor: true,
      publicKeyHex: "01abc"
    },
    finalEvidence: {
      status: "ready_for_submission",
      anchor: {
        deployHash: "a".repeat(64),
        explorerUrl: "https://testnet.cspr.live/deploy/" + "a".repeat(64),
        receiptHash: "b".repeat(64),
        memo: "1",
        memoDerivation: "uint64(first_16_hex_chars(receiptHash))"
      },
      evidence: {
        verificationStatus: "verified",
        checksPassed: 34,
        checksTotal: 34,
        evidenceHash: "c".repeat(64)
      }
    },
    prizeReadiness: {
      highestPrizeGate: true,
      status: "highest-prize-ready",
      score: 100
    },
    judgeProof: {
      status: "generated"
    },
    packManifest: {
      status: "ready",
      missingRequired: [],
      files: [{ path: "manifest.json" }],
      zip: {
        path: "/tmp/cspr-guardian-final-submission.zip",
        sha256: "d".repeat(64)
      }
    },
    generatedAt: "2026-07-01T00:00:00.000Z"
  });
  const markdown = renderFinalSubmissionSealMarkdown(seal);

  assert.equal(seal.status, "ready_for_highest_prize_submission");
  assert.equal(seal.finalGate.prizeScore, 100);
  assert.match(markdown, /34\/34 checks passed/);
  assert.equal(JSON.stringify(seal).includes("BEGIN PRIVATE KEY"), false);
});

test("BUIDL submission markdown summarizes proof and final gate without secrets", () => {
  const markdown = renderBuidlSubmissionMarkdown({
    version: "0.1",
    generatedAt: "2026-07-01T00:00:00.000Z",
    project: {
      name: "CSPR Guardian",
      tagline: "Casper payment and audit receipts for autonomous RWA treasury agents.",
      oneLiner: "CSPR Guardian lets agents buy RWA intelligence and export receipts.",
      categories: ["Casper", "AI agents", "x402"]
    },
    submissionFields: {
      shortDescription: "Agentic RWA workflow with paid tools and Casper receipts.",
      repoUrl: "<repo>",
      demoUrl: "<demo>",
      videoUrl: "<video>",
      casperExplorerUrl: "<explorer>"
    },
    publicSubmissionFields: {
      complete: false,
      missing: ["repoUrl", "demoUrl", "videoUrl"]
    },
    readiness: {
      status: "final-gate",
      score: 80,
      maxScore: 100,
      highestPrizeGate: false,
      blockers: ["Fund testnet key"]
    },
    proof: {
      assertions: [
        {
          id: "signed-payment",
          status: "pass",
          evidence: "Ed25519 authorization unlocks the paid oracle"
        }
      ],
      evidenceChecks: { passed: 34, total: 34 },
      preflightVerification: { summary: { passed: 11, total: 11 } },
      paidTools: [
        {
          name: "rwa.risk_score",
          price: "0.25 CSPR",
          payment: "x402-casper"
        }
      ]
    },
    testnet: {
      publicKeyHex: "01abc",
      accountStatus: "unfunded_or_unavailable",
      preflightStatus: "ok",
      readyForAnchor: false,
      nextCommand: "pnpm seal:submission"
    },
    artifacts: {
      submissionPack: "cspr-guardian-final-submission.zip",
      submissionPackSha256Source: "casper-final-submission-seal.json",
      sourceZip: "cspr-guardian-prototype.zip",
      judgeProof: "casper-judge-proof-pack.md",
      finalSeal: "casper-final-submission-seal.md",
      preflight: "casper-testnet-preflight.md",
      screenshots: ["cspr-guardian-dashboard.png"]
    }
  });

  assert.match(markdown, /80\/100/);
  assert.match(markdown, /Fund testnet key/);
  assert.match(markdown, /01abc/);
  assert.match(markdown, /casper-final-submission-seal\.json/);
  assert.match(markdown, /Missing public links: repoUrl, demoUrl, videoUrl/);
  assert.equal(markdown.includes("BEGIN PRIVATE KEY"), false);
});

test("BUIDL submission generation preserves existing public repo and demo links", async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "cspr-buidl-"));
  await fs.writeFile(
    path.join(outputDir, "casper-buidl-submission.json"),
    JSON.stringify({
      submissionFields: {
        repoUrl: "https://github.com/example/cspr-guardian",
        demoUrl: "https://example.github.io/cspr-guardian/",
        videoUrl: "<paste 90-second demo video URL>"
      }
    })
  );

  const previousRepo = process.env.SUBMISSION_REPO_URL;
  const previousDemo = process.env.SUBMISSION_DEMO_URL;
  delete process.env.SUBMISSION_REPO_URL;
  delete process.env.SUBMISSION_DEMO_URL;
  try {
    const page = await generateBuidlSubmissionPage({ outputDir });
    assert.equal(page.submissionFields.repoUrl, "https://github.com/example/cspr-guardian");
    assert.equal(page.submissionFields.demoUrl, "https://example.github.io/cspr-guardian/");
    assert.deepEqual(page.publicSubmissionFields.missing, ["videoUrl"]);
  } finally {
    if (previousRepo === undefined) {
      delete process.env.SUBMISSION_REPO_URL;
    } else {
      process.env.SUBMISSION_REPO_URL = previousRepo;
    }
    if (previousDemo === undefined) {
      delete process.env.SUBMISSION_DEMO_URL;
    } else {
      process.env.SUBMISSION_DEMO_URL = previousDemo;
    }
  }
});

test("submission profile reads public links from environment and detects placeholders", () => {
  const placeholderFields = buildSubmissionFields({ env: {} });
  const completeFields = buildSubmissionFields({
    env: {
      SUBMISSION_REPO_URL: "https://github.com/example/cspr-guardian",
      SUBMISSION_DEMO_URL: "https://cspr-guardian.example.com",
      SUBMISSION_VIDEO_URL: "https://youtu.be/example"
    }
  });

  assert.deepEqual(summarizePublicSubmissionFields(placeholderFields).missing, [
    "repoUrl",
    "demoUrl",
    "videoUrl"
  ]);
  assert.equal(summarizePublicSubmissionFields(completeFields).complete, true);
});

test("highest prize unlock report separates faucet funding and public links", async () => {
  const faucetConfig = await fetchCsprLiveFaucetConfig({
    fetchImpl: async () => ({
      ok: true,
      text: async () => `var config = {
        network_name: "casper-test",
        cspr_live_api_url: "https://api.testnet.cspr.live",
        with_faucet: "0" !== '1',
        with_wallet: "1" === '1',
        recaptcha_site_key: "site-key",
        faucet_account_hash: "abc"
      };`
    })
  });
  const publicSubmission = summarizePublicSubmissionFields(buildSubmissionFields({ env: {} }));
  const gates = buildHighestPrizeGates({
    readiness: {
      accountStatus: "unfunded_or_unavailable",
      readyForAnchor: false,
      publicKeyHex: "01abc",
      requiredMotes: "100000001"
    },
    publicSubmission,
    finalSeal: { status: "needs_funding", finalGate: {} }
  });
  const unlock = {
    generatedAt: "2026-07-01T00:00:00.000Z",
    status: deriveHighestPrizeUnlockStatus(gates),
    testnet: { publicKeyHex: "01abc", requiredMotes: "100000001" },
    faucet: {
      url: "https://testnet.cspr.live/tools/faucet",
      walletRequired: faucetConfig.withWallet,
      recaptchaRequired: Boolean(faucetConfig.recaptchaSiteKey),
      faucetEnabled: faucetConfig.withFaucet
    },
    publicSubmission,
    gates,
    nextAction: "Open faucet",
    commands: {
      faucetHelper: "pnpm fund:testnet",
      afterFunding: ["pnpm seal:submission"],
      afterPublicLinks: ["pnpm export:buidl"]
    }
  };
  const markdown = renderHighestPrizeUnlockMarkdown(unlock);

  assert.equal(faucetConfig.withWallet, true);
  assert.equal(faucetConfig.withFaucet, true);
  assert.equal(deriveHighestPrizeUnlockStatus(gates), "needs_funding_and_public_links");
  assert.match(markdown, /wallet required = true/);
  assert.match(markdown, /Manual Faucet Steps/);
  assert.match(markdown, /pnpm fund:testnet/);
  assert.match(markdown, /repoUrl, demoUrl, videoUrl/);
  assert.equal(JSON.stringify(unlock).includes("privateKeyHex"), false);
});

test("highest prize unlock recognizes funded state ready for final seal", () => {
  const fields = buildSubmissionFields({
    env: {
      SUBMISSION_REPO_URL: "https://github.com/example/cspr-guardian",
      SUBMISSION_DEMO_URL: "https://cspr-guardian.example.com",
      SUBMISSION_VIDEO_URL: "https://youtu.be/example"
    }
  });
  const gates = buildHighestPrizeGates({
    readiness: {
      accountStatus: "funded",
      readyForAnchor: true,
      publicKeyHex: "01abc",
      balanceMotes: "5000000000",
      requiredMotes: "100000001"
    },
    publicSubmission: summarizePublicSubmissionFields(fields),
    finalSeal: { status: "needs_funding", finalGate: {} }
  });

  assert.equal(deriveHighestPrizeUnlockStatus(gates), "ready_to_run_final_seal");
  assert.equal(
    gates.find((gate) => gate.name === "real_casper_receipt_deploy").readyToComplete,
    true
  );
});

test("submission audit status treats external submission work as blocked gates", () => {
  const pass = (name) => ({ name, status: "pass", ok: true, detail: `${name} passed.` });
  const blocked = (name) => ({
    name,
    status: "blocked",
    ok: false,
    detail: `${name} blocked.`
  });
  const fail = (name) => ({ name, status: "fail", ok: false, detail: `${name} failed.` });
  const baseChecks = [
    "evidence_verified",
    "preflight_verified",
    "submission_pack_present",
    "buidl_page_present",
    "public_submission_fields",
    "public_demo_host_ready",
    "ci_readiness_present",
    "final_seal_present",
    "highest_prize_unlock_present",
    "private_key_leak_scan",
    "source_zip_exclusions",
    "final_pack_no_self_reference"
  ].map(pass);

  assert.equal(
    deriveSubmissionAuditStatus([...baseChecks, pass("highest_prize_gate")]),
    "ready_for_highest_prize_submission"
  );
  assert.equal(
    deriveSubmissionAuditStatus([...baseChecks, blocked("highest_prize_gate")]),
    "ready_except_real_testnet_gate"
  );
  assert.equal(
    deriveSubmissionAuditStatus([
      ...baseChecks.filter((check) => check.name !== "public_submission_fields"),
      blocked("public_submission_fields"),
      blocked("public_demo_host_ready"),
      blocked("highest_prize_gate")
    ]),
    "ready_except_external_submission_gates"
  );
  assert.equal(
    deriveSubmissionAuditStatus([...baseChecks, blocked("highest_prize_gate"), fail("buidl_page_present")]),
    "needs_review"
  );
});

test("submission audit markdown makes external seal and audit boundaries explicit", () => {
  const audit = {
    generatedAt: "2026-07-01T00:00:00.000Z",
    status: "ready_except_external_submission_gates",
    summary: summarizeChecks([
      { name: "evidence_verified", status: "pass", detail: "34/34 evidence checks passed." },
      { name: "public_submission_fields", status: "blocked", detail: "Public submission links still need values: repoUrl.", items: [{ name: "repoUrl", value: "<repo>", complete: false }] },
      { name: "public_demo_host_ready", status: "blocked", detail: "Hosting configuration is ready; public demo links still need to be published." },
      { name: "highest_prize_gate", status: "blocked", detail: "Only the real funded Casper testnet receipt deploy remains." }
    ]),
    finalGate: {
      sealStatus: "needs_funding",
      prizeScore: 80,
      highestPrizeGate: false,
      accountStatus: "unfunded_or_unavailable",
      publicKeyHex: "01abc",
      explorerUrl: null,
      nextCommand: "pnpm seal:submission"
    },
    artifacts: {
      submissionPackZip: {
        path: "/tmp/cspr-guardian-final-submission.zip",
        sha256: "a".repeat(64)
      },
      sourceZip: {
        path: "/tmp/cspr-guardian-prototype.zip"
      }
    },
    checks: [
      { name: "evidence_verified", status: "pass", detail: "34/34 evidence checks passed." },
      {
        name: "public_submission_fields",
        status: "blocked",
        detail: "Public submission links still need values: repoUrl.",
        items: [{ name: "repoUrl", value: "<repo>", complete: false }]
      },
      {
        name: "public_demo_host_ready",
        status: "blocked",
        detail: "Hosting configuration is ready; public demo links still need to be published."
      },
      { name: "highest_prize_gate", status: "blocked", detail: "Only the real funded Casper testnet receipt deploy remains." }
    ]
  };
  const markdown = renderSubmissionAuditMarkdown(audit);

  assert.match(markdown, /ready_except_external_submission_gates/);
  assert.match(markdown, /repoUrl: missing/);
  assert.match(markdown, /pnpm seal:submission/);
  assert.match(markdown, /casper-final-submission-seal/);
  assert.match(markdown, /casper-submission-audit/);
  assert.equal(markdown.includes("BEGIN PRIVATE KEY"), false);
});

test("public demo handoff verifies hosting config and calls out missing public links", () => {
  const publicSubmission = {
    complete: false,
    missing: ["repoUrl", "demoUrl", "videoUrl"]
  };
  const checks = buildPublicDemoReadinessChecks({
    files: {
      dockerfile: 'RUN corepack enable && pnpm install --prod --frozen-lockfile\nCMD ["pnpm", "start"]',
      dockerignore: ".git\n.local\n.env\nnode_modules\noutputs\n",
      renderYaml: "runtime: docker\nhealthCheckPath: /api/health\n",
      server: 'if (req.method === "GET" && url.pathname === "/api/health") {}',
      packageJson: { scripts: { start: "node src/server.mjs" } },
      envExample: "SUBMISSION_REPO_URL=\nSUBMISSION_DEMO_URL=\nSUBMISSION_VIDEO_URL=\n"
    },
    publicSubmission
  });
  const readiness = {
    generatedAt: "2026-07-01T00:00:00.000Z",
    status: "needs_review",
    summary: {
      passed: checks.filter((check) => check.status === "pass").length,
      failed: checks.filter((check) => check.status === "fail").length,
      total: checks.length
    },
    publicSubmission,
    checks
  };
  const markdown = renderPublicDemoHandoffMarkdown(readiness);

  assert.equal(checks.find((check) => check.name === "public_links_configured").status, "fail");
  assert.match(markdown, /SUBMISSION_REPO_URL/);
  assert.match(markdown, /\/api\/health/);
  assert.match(markdown, /repoUrl/);
  assert.equal(markdown.includes("BEGIN PRIVATE KEY"), false);
});

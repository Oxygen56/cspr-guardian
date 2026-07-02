const runButton = document.querySelector("#runButton");
const assetSelect = document.querySelector("#assetSelect");
const amountInput = document.querySelector("#amountInput");
const decisionBadge = document.querySelector("#decisionBadge");
const decisionBody = document.querySelector("#decisionBody");
const traceList = document.querySelector("#traceList");
const receiptBlock = document.querySelector("#receiptBlock");
const revenueLabel = document.querySelector("#revenueLabel");
const runCountLabel = document.querySelector("#runCountLabel");
const providerSummary = document.querySelector("#providerSummary");
const providerList = document.querySelector("#providerList");
const runHistory = document.querySelector("#runHistory");
const evidenceSummary = document.querySelector("#evidenceSummary");
const evidenceBlock = document.querySelector("#evidenceBlock");
const downloadEvidenceButton = document.querySelector("#downloadEvidenceButton");
const testnetBadge = document.querySelector("#testnetBadge");
const testnetSummary = document.querySelector("#testnetSummary");
const testnetBlock = document.querySelector("#testnetBlock");
const copyPublicKeyButton = document.querySelector("#copyPublicKeyButton");
const runPreflightButton = document.querySelector("#runPreflightButton");
const faucetLink = document.querySelector("#faucetLink");
const preflightBadge = document.querySelector("#preflightBadge");
const preflightSummary = document.querySelector("#preflightSummary");
const preflightBlock = document.querySelector("#preflightBlock");
const prizeBadge = document.querySelector("#prizeBadge");
const prizeSummary = document.querySelector("#prizeSummary");
const prizeCriteria = document.querySelector("#prizeCriteria");
const prizeBlockers = document.querySelector("#prizeBlockers");
const prizeBlock = document.querySelector("#prizeBlock");
const refreshSealButton = document.querySelector("#refreshSealButton");
const downloadSealButton = document.querySelector("#downloadSealButton");
const sealBadge = document.querySelector("#sealBadge");
const sealSummary = document.querySelector("#sealSummary");
const sealCommands = document.querySelector("#sealCommands");
const sealBlock = document.querySelector("#sealBlock");
const refreshAuditButton = document.querySelector("#refreshAuditButton");
const downloadAuditButton = document.querySelector("#downloadAuditButton");
const auditBadge = document.querySelector("#auditBadge");
const auditSummary = document.querySelector("#auditSummary");
const auditChecks = document.querySelector("#auditChecks");
const auditBlock = document.querySelector("#auditBlock");
const generateProofButton = document.querySelector("#generateProofButton");
const downloadProofButton = document.querySelector("#downloadProofButton");
const proofBadge = document.querySelector("#proofBadge");
const proofSummary = document.querySelector("#proofSummary");
const proofAssertions = document.querySelector("#proofAssertions");
const proofBlock = document.querySelector("#proofBlock");
const verificationBadge = document.querySelector("#verificationBadge");
const verificationSummary = document.querySelector("#verificationSummary");
const verificationBlock = document.querySelector("#verificationBlock");
let latestEvidenceBundle = null;
let latestReadiness = null;
let latestVerification = null;
let latestPrizeReadiness = null;
let latestJudgeProof = null;
let latestPreflight = null;
let latestFinalSeal = null;
let latestSubmissionAudit = null;

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 0
});

boot();

runButton.addEventListener("click", async () => {
  runButton.disabled = true;
  runButton.textContent = "Running";

  try {
    const response = await fetch("/api/run-scenario", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        assetId: assetSelect.value,
        requestedAmountUsd: Number(amountInput.value)
      })
    });
    const result = await response.json();
    renderResult(result);
  } finally {
    runButton.disabled = false;
    runButton.textContent = "Run Agent";
  }
});

assetSelect.addEventListener("change", () => {
  const selected = window.__assets.find((asset) => asset.id === assetSelect.value);
  amountInput.value = selected?.requestedAmountUsd || 100000;
});

downloadEvidenceButton.addEventListener("click", () => {
  if (!latestEvidenceBundle || latestEvidenceBundle.status === "missing") return;

  const blob = new Blob([JSON.stringify(latestEvidenceBundle, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cspr-guardian-evidence-${latestEvidenceBundle.run.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

generateProofButton.addEventListener("click", async () => {
  generateProofButton.disabled = true;
  generateProofButton.textContent = "Generating";
  proofBadge.textContent = "Running";
  proofBadge.className = "badge muted";

  try {
    const response = await fetch("/api/judge-proof", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        assetId: assetSelect.value,
        requestedAmountUsd: Number(amountInput.value)
      })
    });
    latestJudgeProof = await response.json();
    renderJudgeProof(latestJudgeProof);
    await refreshLedgers();
    await refreshEvidence();
    await refreshVerification();
    await refreshTestnetReadiness();
    await refreshPrizeReadiness();
    await refreshFinalSeal();
    await refreshSubmissionAudit();
  } finally {
    generateProofButton.disabled = false;
    generateProofButton.textContent = "Generate Proof";
  }
});

downloadProofButton.addEventListener("click", () => {
  if (!latestJudgeProof) return;
  const blob = new Blob([JSON.stringify(latestJudgeProof, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cspr-guardian-judge-proof-${latestJudgeProof.scenario.runId}.json`;
  link.click();
  URL.revokeObjectURL(url);
});

refreshSealButton.addEventListener("click", async () => {
  refreshSealButton.disabled = true;
  refreshSealButton.textContent = "Refreshing";
  try {
    await refreshFinalSeal();
    await refreshSubmissionAudit();
  } finally {
    refreshSealButton.disabled = false;
    refreshSealButton.textContent = "Refresh";
  }
});

downloadSealButton.addEventListener("click", () => {
  if (!latestFinalSeal) return;
  const blob = new Blob([JSON.stringify(latestFinalSeal, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cspr-guardian-final-submission-seal.json";
  link.click();
  URL.revokeObjectURL(url);
});

refreshAuditButton.addEventListener("click", async () => {
  refreshAuditButton.disabled = true;
  refreshAuditButton.textContent = "Refreshing";
  try {
    await refreshSubmissionAudit();
  } finally {
    refreshAuditButton.disabled = false;
    refreshAuditButton.textContent = "Refresh";
  }
});

downloadAuditButton.addEventListener("click", () => {
  if (!latestSubmissionAudit) return;
  const blob = new Blob([JSON.stringify(latestSubmissionAudit, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "cspr-guardian-submission-audit.json";
  link.click();
  URL.revokeObjectURL(url);
});

copyPublicKeyButton.addEventListener("click", async () => {
  if (!latestReadiness?.publicKeyHex) return;
  await navigator.clipboard.writeText(latestReadiness.publicKeyHex);
  copyPublicKeyButton.textContent = "Copied";
  window.setTimeout(() => {
    copyPublicKeyButton.textContent = "Copy Public Key";
  }, 1400);
});

runPreflightButton.addEventListener("click", async () => {
  runPreflightButton.disabled = true;
  runPreflightButton.textContent = "Running";
  preflightBadge.textContent = "Running";
  preflightBadge.className = "badge muted";

  try {
    const response = await fetch("/api/testnet/preflight", {
      method: "POST",
      headers: { "content-type": "application/json" }
    });
    latestPreflight = await response.json();
    renderPreflight(latestPreflight);
    await refreshTestnetReadiness();
    await refreshPrizeReadiness();
    await refreshFinalSeal();
    await refreshSubmissionAudit();
  } finally {
    runPreflightButton.disabled = false;
    runPreflightButton.textContent = "Run Preflight";
  }
});

async function boot() {
  const response = await fetch("/api/assets");
  const dataset = await response.json();
  window.__assets = dataset.assets;

  assetSelect.innerHTML = dataset.assets
    .map((asset) => `<option value="${asset.id}">${asset.name}</option>`)
    .join("");

  amountInput.value = dataset.assets[0].requestedAmountUsd;
  await refreshLedgers();
  await refreshEvidence();
  await refreshVerification();
  await refreshTestnetReadiness();
  await refreshPrizeReadiness();
  await refreshFinalSeal();
  await refreshSubmissionAudit();
  renderJudgeProof(null);
  renderPreflight(null);
}

function renderResult(result) {
  const {
    decision,
    riskReport,
    kybReport,
    liquidityReport,
    covenantReport,
    trace,
    anchor,
    payments,
    providerRevenue
  } = result;
  decisionBadge.textContent = decision.action;
  decisionBadge.className = `badge ${decision.action}`;
  revenueLabel.textContent = `${providerRevenue.totalCSPR} CSPR`;

  decisionBody.className = "decision-body";
  decisionBody.innerHTML = `
    <div class="decision-summary">
      <div class="summary-tile">
        <span>Risk score</span>
        <strong>${riskReport.score}</strong>
      </div>
      <div class="summary-tile">
        <span>Approved size</span>
        <strong>${money.format(decision.approvedAmountUsd)}</strong>
      </div>
      <div class="summary-tile">
        <span>Oracle confidence</span>
        <strong>${percent.format(riskReport.confidence)}</strong>
      </div>
    </div>
    <div class="factor-grid">
      ${riskReport.factors
        .map(
          (factor) => `
          <div class="factor">
            <header><span>${factor.label}</span><strong>${factor.value}</strong></header>
            <div class="bar"><span style="width:${factor.value}%"></span></div>
          </div>`
        )
        .join("")}
    </div>
    <p class="rationale">${decision.rationale}</p>
    <div class="kyb-box">
      <strong>KYB policy: ${kybReport.policyResult}</strong>
      <span>${kybReport.entityStatus} entity, sanctions ${kybReport.sanctionsScreen}, ${kybReport.jurisdictionRisk} jurisdiction risk</span>
    </div>
    <div class="kyb-box liquidity-box">
      <strong>Liquidity policy: ${liquidityReport.policyResult}</strong>
      <span>${liquidityReport.coverageRatio}x coverage, ${liquidityReport.slippageBps} bps slippage, ${money.format(liquidityReport.maxExecutableUsd)} max executable</span>
    </div>
    <div class="kyb-box covenant-box">
      <strong>Covenant policy: ${covenantReport.policyResult}</strong>
      <span>${covenantReport.reviewCadenceHours}h cadence, ${covenantReport.triggers.length} monitored triggers</span>
    </div>
    ${
      [...riskReport.warnings, ...kybReport.flags, ...liquidityReport.warnings, ...covenantReport.recommendedActions].length
        ? `<ul class="warnings">${[
            ...riskReport.warnings,
            ...kybReport.flags,
            ...liquidityReport.warnings,
            ...covenantReport.recommendedActions
          ]
            .map((warning) => `<li>${warning}</li>`)
            .join("")}</ul>`
        : ""
    }
  `;

  traceList.innerHTML = trace
    .map(
      (item) => `
      <li>
        <strong>${item.label}</strong>
        <p>${item.detail}</p>
        ${item.txHash ? `<p><code>${item.txHash}</code></p>` : ""}
      </li>`
    )
    .join("");

  receiptBlock.textContent = JSON.stringify(
    {
      payments,
      providerRevenue,
      kybReport,
      liquidityReport,
      covenantReport,
      receipt: anchor.receipt,
      deployHash: anchor.deployHash,
      explorerUrl: anchor.explorerUrl
    },
    null,
    2
  );

  providerList.innerHTML = providerRevenue.providers
    .map(
      (provider) => `
      <article class="provider-row">
        <span>${provider.tool}</span>
        <strong>${provider.amount} ${provider.currency}</strong>
        <code>${provider.txHash}</code>
      </article>`
    )
    .join("");

  refreshLedgers();
  refreshEvidence();
  refreshVerification();
  refreshTestnetReadiness();
  refreshPrizeReadiness();
  refreshFinalSeal();
  refreshSubmissionAudit();
}

async function refreshLedgers() {
  const [providerResponse, runsResponse] = await Promise.all([
    fetch("/api/provider-ledger"),
    fetch("/api/runs")
  ]);
  const providerLedger = await providerResponse.json();
  const runLedger = await runsResponse.json();

  runCountLabel.textContent = String(providerLedger.totalRuns);
  providerSummary.innerHTML = `
    <div class="summary-tile">
      <span>All-time revenue</span>
      <strong>${providerLedger.totalCSPR} CSPR</strong>
    </div>
  `;
  providerList.innerHTML = providerLedger.providers
    .map(
      (provider) => `
      <article class="provider-row">
        <span>${provider.tool}</span>
        <strong>${provider.totalCSPR} CSPR</strong>
        <small>${provider.calls} calls</small>
        <code>${provider.lastTxHash}</code>
      </article>`
    )
    .join("");

  runHistory.innerHTML = runLedger.runs
    .slice(0, 6)
    .map(
      (run) => `
      <article class="run-row">
        <span>${new Date(run.completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
        <strong>${run.action.toUpperCase()} ${money.format(run.approvedAmountUsd)}</strong>
        <em>${run.assetName}</em>
        <code>${run.receiptHash.slice(0, 18)}...</code>
      </article>`
    )
    .join("");
}

async function refreshEvidence() {
  const response = await fetch("/api/evidence/latest");
  latestEvidenceBundle = await response.json();

  if (latestEvidenceBundle.status === "missing") {
    evidenceSummary.innerHTML = `<div class="summary-tile"><span>Status</span><strong>Missing</strong></div>`;
    evidenceBlock.textContent = JSON.stringify(latestEvidenceBundle, null, 2);
    downloadEvidenceButton.disabled = true;
    return;
  }

  downloadEvidenceButton.disabled = false;
  evidenceSummary.innerHTML = `
    <div class="summary-tile">
      <span>Evidence hash</span>
      <strong>${latestEvidenceBundle.evidenceHash.slice(0, 12)}...</strong>
    </div>
    <div class="summary-tile">
      <span>Signed payments</span>
      <strong>${latestEvidenceBundle.payments.length}</strong>
    </div>
    <div class="summary-tile">
      <span>Receipt hash</span>
      <strong>${latestEvidenceBundle.verification.receiptHash.slice(0, 12)}...</strong>
    </div>
  `;
  evidenceBlock.textContent = JSON.stringify(
    {
      evidenceHash: latestEvidenceBundle.evidenceHash,
      runId: latestEvidenceBundle.run.id,
      x402Proofs: latestEvidenceBundle.verification.x402Proofs,
      reportHashes: latestEvidenceBundle.verification.reportHashes,
      decisionHash: latestEvidenceBundle.verification.decisionHash,
      receiptHash: latestEvidenceBundle.verification.receiptHash,
      explorerUrl: latestEvidenceBundle.verification.explorerUrl
    },
    null,
    2
  );
}

async function refreshTestnetReadiness() {
  const response = await fetch("/api/testnet/readiness");
  latestReadiness = await response.json();
  const ready = latestReadiness.readyForAnchor;
  const funded = latestReadiness.accountStatus === "funded";
  const missingKey = latestReadiness.accountStatus === "missing_key";
  const statusLabel = ready ? "Ready" : funded ? "Low Balance" : missingKey ? "Missing Key" : "Needs Funding";

  testnetBadge.textContent = statusLabel;
  testnetBadge.className = `badge ${ready ? "approve" : missingKey ? "reject" : "limit"}`;
  copyPublicKeyButton.disabled = !latestReadiness.publicKeyHex;
  updateTestnetActionLink();

  testnetSummary.innerHTML = `
    <div class="summary-tile">
      <span>RPC</span>
      <strong>${latestReadiness.rpcStatus}</strong>
    </div>
    <div class="summary-tile">
      <span>Chain</span>
      <strong>${latestReadiness.chain || "unknown"}</strong>
    </div>
    <div class="summary-tile">
      <span>Account</span>
      <strong>${latestReadiness.accountStatus}</strong>
    </div>
    <div class="summary-tile">
      <span>Required motes</span>
      <strong>${latestReadiness.requiredMotes}</strong>
    </div>
  `;

  testnetBlock.textContent = JSON.stringify(
    {
      rpcUrl: latestReadiness.rpcUrl,
      chain: latestReadiness.chain,
      apiVersion: latestReadiness.apiVersion,
      latestBlock: latestReadiness.latestBlock,
      publicKeyHex: latestReadiness.publicKeyHex,
      accountStatus: latestReadiness.accountStatus,
      balanceMotes: latestReadiness.balanceMotes,
      balanceError: latestReadiness.balanceError,
      readyForAnchor: latestReadiness.readyForAnchor,
      faucetUrl: latestReadiness.faucetUrl
    },
    null,
    2
  );
}

async function refreshVerification() {
  const response = await fetch("/api/evidence/verify");
  latestVerification = await response.json();

  if (latestVerification.status === "missing") {
    verificationBadge.textContent = "Missing";
    verificationBadge.className = "badge reject";
    verificationSummary.innerHTML = `<div class="summary-tile"><span>Status</span><strong>Missing</strong></div>`;
    verificationBlock.textContent = JSON.stringify(latestVerification, null, 2);
    return;
  }

  const verified = latestVerification.status === "verified";
  verificationBadge.textContent = verified ? "Verified" : "Failed";
  verificationBadge.className = `badge ${verified ? "approve" : "reject"}`;
  verificationSummary.innerHTML = `
    <div class="summary-tile">
      <span>Checks passed</span>
      <strong>${latestVerification.summary.passed}/${latestVerification.summary.total}</strong>
    </div>
    <div class="summary-tile">
      <span>Signatures</span>
      <strong>${countChecks("signature")}</strong>
    </div>
    <div class="summary-tile">
      <span>Hashes</span>
      <strong>${countChecks("hash")}</strong>
    </div>
  `;
  verificationBlock.textContent = JSON.stringify(
    {
      status: latestVerification.status,
      summary: latestVerification.summary,
      failedChecks: latestVerification.checks.filter((check) => !check.ok),
      verifiedChecks: latestVerification.checks
        .filter((check) => check.ok)
        .map((check) => check.name)
    },
    null,
    2
  );
}

function countChecks(pattern) {
  return latestVerification.checks.filter((check) => check.name.includes(pattern) && check.ok).length;
}

function renderPreflight(preflight) {
  if (!preflight) {
    preflightBadge.textContent = "Waiting";
    preflightBadge.className = "badge muted";
    preflightSummary.innerHTML = `
      <div class="summary-tile">
        <span>Deploy build</span>
        <strong>Pending</strong>
      </div>
      <div class="summary-tile">
        <span>Broadcast</span>
        <strong>false</strong>
      </div>
      <div class="summary-tile">
        <span>Memo</span>
        <strong>Pending</strong>
      </div>
    `;
    preflightBlock.textContent = JSON.stringify({ status: "waiting" }, null, 2);
    return;
  }

  const buildOk = preflight.preflight?.deployBuild?.status === "ok";
  const ready = preflight.status === "ready_to_anchor";
  preflightBadge.textContent = ready ? "Ready" : buildOk ? "Build OK" : "Review";
  preflightBadge.className = `badge ${ready ? "approve" : buildOk ? "limit" : "reject"}`;
  preflightSummary.innerHTML = `
    <div class="summary-tile">
      <span>Deploy build</span>
      <strong>${preflight.preflight.deployBuild.status}</strong>
    </div>
    <div class="summary-tile">
      <span>Broadcast</span>
      <strong>${preflight.preflight.deployBuild.broadcast}</strong>
    </div>
    <div class="summary-tile">
      <span>Memo bits</span>
      <strong>${preflight.preflight.memoBits}</strong>
    </div>
  `;
  preflightBlock.textContent = JSON.stringify(
    {
      status: preflight.status,
      readiness: {
        rpcStatus: preflight.readiness.rpcStatus,
        chain: preflight.readiness.chain,
        accountStatus: preflight.readiness.accountStatus,
        readyForAnchor: preflight.readiness.readyForAnchor,
        publicKeyHex: preflight.readiness.publicKeyHex
      },
      preflight: preflight.preflight
    },
    null,
    2
  );
}

function renderJudgeProof(proof) {
  if (!proof) {
    proofBadge.textContent = "Waiting";
    proofBadge.className = "badge muted";
    proofSummary.innerHTML = `
      <div class="summary-tile">
        <span>Status</span>
        <strong>Ready</strong>
      </div>
      <div class="summary-tile">
        <span>Checks</span>
        <strong>0/7</strong>
      </div>
      <div class="summary-tile">
        <span>Final gate</span>
        <strong>pending</strong>
      </div>
    `;
    proofAssertions.innerHTML = "";
    proofBlock.textContent = JSON.stringify({ status: "waiting" }, null, 2);
    downloadProofButton.disabled = true;
    return;
  }

  const passed = proof.assertions.filter((item) => item.status === "pass").length;
  const blocked = proof.assertions.filter((item) => item.status === "blocked").length;
  const failed = proof.assertions.filter((item) => item.status === "fail").length;
  proofBadge.textContent = failed ? "Review" : blocked ? "Final Gate" : "Verified";
  proofBadge.className = `badge ${failed ? "reject" : blocked ? "limit" : "approve"}`;
  downloadProofButton.disabled = false;

  proofSummary.innerHTML = `
    <div class="summary-tile">
      <span>Assertions</span>
      <strong>${passed}/${proof.assertions.length}</strong>
    </div>
    <div class="summary-tile">
      <span>Evidence checks</span>
      <strong>${proof.evidenceVerification.summary.passed}/${proof.evidenceVerification.summary.total}</strong>
    </div>
    <div class="summary-tile">
      <span>Replay result</span>
      <strong>${proof.x402Flow.replayAttempt.status}</strong>
    </div>
  `;

  proofAssertions.innerHTML = proof.assertions
    .map(
      (item) => `
      <article class="proof-row ${item.status}">
        <strong>${item.id}</strong>
        <span>${item.evidence}</span>
        <b>${item.status}</b>
      </article>`
    )
    .join("");

  proofBlock.textContent = JSON.stringify(
    {
      assertions: proof.assertions,
      x402Flow: {
        beforePayment: proof.x402Flow.beforePayment.status,
        signedAuthorizationHash: proof.x402Flow.signedAuthorization.authorizationHash,
        settlementTxHash: proof.x402Flow.settlement.txHash,
        replayAttempt: proof.x402Flow.replayAttempt
      },
      scenario: proof.scenario,
      evidenceVerification: proof.evidenceVerification,
      prizeReadiness: proof.prizeReadiness,
      testnet: proof.testnet
    },
    null,
    2
  );
}

async function refreshPrizeReadiness() {
  const response = await fetch("/api/prize-readiness");
  latestPrizeReadiness = await response.json();
  const ready = latestPrizeReadiness.status === "highest-prize-ready";
  const finalGate = latestPrizeReadiness.status === "final-gate";

  prizeBadge.textContent = ready ? "Ready" : finalGate ? "Final Gate" : "Needs Work";
  prizeBadge.className = `badge ${ready ? "approve" : finalGate ? "limit" : "reject"}`;

  prizeSummary.innerHTML = `
    <div class="summary-tile">
      <span>Score</span>
      <strong>${latestPrizeReadiness.score}/${latestPrizeReadiness.maxScore}</strong>
    </div>
    <div class="summary-tile">
      <span>Final gate</span>
      <strong>${latestPrizeReadiness.highestPrizeGate ? "cleared" : "testnet deploy"}</strong>
    </div>
    <div class="summary-tile">
      <span>Blockers</span>
      <strong>${latestPrizeReadiness.blockers.length}</strong>
    </div>
  `;

  prizeCriteria.innerHTML = latestPrizeReadiness.criteria
    .map(
      (item) => `
      <article class="prize-row ${item.status}">
        <div>
          <strong>${item.label}</strong>
          <span>${formatPrizeEvidence(item.evidence)}</span>
        </div>
        <em>${item.value}</em>
        <b>${item.status === "pass" ? item.weight : 0}/${item.weight}</b>
      </article>`
    )
    .join("");

  prizeBlockers.innerHTML = latestPrizeReadiness.blockers.length
    ? `<ul>${latestPrizeReadiness.blockers.map((blocker) => `<li>${blocker}</li>`).join("")}</ul>`
    : "";

  prizeBlock.textContent = JSON.stringify(
    {
      status: latestPrizeReadiness.status,
      score: latestPrizeReadiness.score,
      highestPrizeGate: latestPrizeReadiness.highestPrizeGate,
      criteria: latestPrizeReadiness.criteria,
      testnet: latestPrizeReadiness.testnet,
      currentEvidence: latestPrizeReadiness.currentEvidence
    },
    null,
    2
  );

  updateTestnetActionLink();
}

function formatPrizeEvidence(evidence) {
  if (typeof evidence === "string" && evidence.startsWith("https://testnet.cspr.live/transaction/")) {
    return `<a href="${evidence}" target="_blank" rel="noreferrer">CSPR.live transaction</a>`;
  }
  return evidence;
}

function updateTestnetActionLink() {
  if (latestPrizeReadiness?.currentEvidence?.explorerUrl) {
    faucetLink.href = latestPrizeReadiness.currentEvidence.explorerUrl;
    faucetLink.textContent = "Open CSPR.live Tx";
    return;
  }

  faucetLink.href = latestReadiness?.faucetUrl || "https://testnet.cspr.live/tools/faucet";
  faucetLink.textContent = "Open Faucet";
}

async function refreshFinalSeal() {
  const response = await fetch("/api/submission/seal");
  latestFinalSeal = await response.json();
  renderFinalSeal(latestFinalSeal);
}

async function refreshSubmissionAudit() {
  const response = await fetch("/api/submission/audit");
  latestSubmissionAudit = await response.json();
  renderSubmissionAudit(latestSubmissionAudit);
}

function renderFinalSeal(seal) {
  const ready = seal.status === "ready_for_highest_prize_submission";
  const needsFunding = seal.status === "needs_funding";
  const review = seal.status === "needs_review";

  sealBadge.textContent = ready ? "Ready" : needsFunding ? "Funding" : review ? "Review" : "Failed";
  sealBadge.className = `badge ${ready ? "approve" : needsFunding || review ? "limit" : "reject"}`;
  downloadSealButton.disabled = false;

  sealSummary.innerHTML = `
    <div class="summary-tile">
      <span>Status</span>
      <strong>${seal.status}</strong>
    </div>
    <div class="summary-tile">
      <span>Pack files</span>
      <strong>${seal.submissionPack?.files ?? "n/a"}</strong>
    </div>
    <div class="summary-tile">
      <span>Missing</span>
      <strong>${seal.submissionPack?.missingRequired ?? "n/a"}</strong>
    </div>
    <div class="summary-tile">
      <span>Prize score</span>
      <strong>${seal.submissionPack?.finalGate?.prizeScore ?? seal.finalGate?.prizeScore ?? 80}/100</strong>
    </div>
  `;

  sealCommands.innerHTML = `
    <article class="seal-row ${ready ? "pass" : needsFunding ? "blocked" : "partial"}">
      <div>
        <strong>${ready ? "Explorer" : "Next command"}</strong>
        <span>${ready ? seal.finalGate.explorerUrl || "missing" : seal.finalGate.nextCommand || "pnpm seal:submission"}</span>
      </div>
      <b>${ready ? "ready" : seal.finalGate.accountStatus || "pending"}</b>
    </article>
    <article class="seal-row ${seal.submissionPack?.missingRequired === 0 ? "pass" : "blocked"}">
      <div>
        <strong>Submission pack</strong>
        <span>${seal.submissionPack?.zipSha256 ? seal.submissionPack.zipSha256.slice(0, 18) + "..." : "missing"}</span>
      </div>
      <b>${seal.submissionPack?.status || "missing"}</b>
    </article>
  `;

  sealBlock.textContent = JSON.stringify(
    {
      status: seal.status,
      finalGate: seal.finalGate,
      submissionPack: seal.submissionPack,
      verification: seal.verification,
      commandsAfterFunding: seal.commandsAfterFunding,
      message: seal.message
    },
    null,
    2
  );
}

function renderSubmissionAudit(audit) {
  const ready = audit.status === "ready_for_highest_prize_submission";
  const finalGate =
    audit.status === "ready_except_real_testnet_gate" ||
    audit.status === "ready_except_external_submission_gates" ||
    audit.status === "ready_except_public_submission_links";
  const review = audit.status === "needs_review";

  auditBadge.textContent = ready ? "Ready" : finalGate ? "Final Gate" : review ? "Review" : "Failed";
  auditBadge.className = `badge ${ready ? "approve" : finalGate ? "limit" : "reject"}`;
  downloadAuditButton.disabled = false;

  auditSummary.innerHTML = `
    <div class="summary-tile">
      <span>Status</span>
      <strong>${audit.status}</strong>
    </div>
    <div class="summary-tile">
      <span>Passed</span>
      <strong>${audit.summary.passed}/${audit.summary.total}</strong>
    </div>
    <div class="summary-tile">
      <span>Blocked</span>
      <strong>${audit.summary.blocked}</strong>
    </div>
    <div class="summary-tile">
      <span>Failed</span>
      <strong>${audit.summary.failed}</strong>
    </div>
  `;

  auditChecks.innerHTML = audit.checks
    .map(
      (check) => `
      <article class="audit-row ${check.status}">
        <div>
          <strong>${check.name}</strong>
          <span>${check.detail}</span>
        </div>
        <b>${check.status}</b>
      </article>`
    )
    .join("");

  auditBlock.textContent = JSON.stringify(
    {
      status: audit.status,
      summary: audit.summary,
      finalGate: audit.finalGate,
      artifacts: audit.artifacts,
      failedChecks: audit.checks.filter((check) => check.status === "fail"),
      blockedChecks: audit.checks.filter((check) => check.status === "blocked")
    },
    null,
    2
  );
}

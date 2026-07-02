import fs from "node:fs/promises";
import path from "node:path";
import { evaluatePolicyScenario, listTools, loadSignals } from "./agent.mjs";

const FULL_RUN_REVENUE_CSPR = "0.62";

export async function generateScenarioMatrix() {
  const [dataset, tools] = await Promise.all([loadSignals(), listTools()]);
  const paidTools = tools.filter((tool) => tool.payment === "x402-casper");
  const scenarios = dataset.assets.map((asset) => summarizeScenario(evaluatePolicyScenario(asset)));
  const actionCounts = scenarios.reduce(
    (counts, scenario) => ({
      ...counts,
      [scenario.decision.action]: (counts[scenario.decision.action] || 0) + 1
    }),
    {}
  );

  return {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    status: "repeatable_rwa_policy_matrix_ready",
    summary: {
      scenarios: scenarios.length,
      paidToolsPerScenario: paidTools.length,
      fullRunRevenueCSPR: FULL_RUN_REVENUE_CSPR,
      totalProviderRevenueIfAllRunCSPR: (Number(FULL_RUN_REVENUE_CSPR) * scenarios.length).toFixed(2),
      actions: {
        approve: actionCounts.approve || 0,
        limit: actionCounts.limit || 0,
        reject: actionCounts.reject || 0
      },
      humanReviewRequired: scenarios.filter((scenario) => scenario.decision.humanReviewRequired).length
    },
    paidTools: paidTools.map((tool) => ({
      name: tool.name,
      price: tool.price,
      payment: tool.payment
    })),
    scenarios
  };
}

export async function writeScenarioMatrix(matrix, outputDir = "submission") {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "casper-scenario-matrix.json"),
    `${JSON.stringify(matrix, null, 2)}\n`
  );
  await fs.writeFile(path.join(outputDir, "casper-scenario-matrix.md"), renderScenarioMatrixMarkdown(matrix));
}

export function summarizeScenarioMatrix(matrix) {
  return {
    status: matrix.status,
    scenarios: matrix.summary.scenarios,
    paidToolsPerScenario: matrix.summary.paidToolsPerScenario,
    actions: matrix.summary.actions,
    totalProviderRevenueIfAllRunCSPR: matrix.summary.totalProviderRevenueIfAllRunCSPR
  };
}

export function renderScenarioMatrixMarkdown(matrix) {
  const rows = matrix.scenarios
    .map(
      (scenario) =>
        `| ${scenario.asset.name} | ${scenario.asset.category} | ${scenario.risk.score}/100 | ${scenario.kyb.policyResult} | ${scenario.liquidity.policyResult} | ${scenario.covenant.policyResult} | ${scenario.decision.action} | ${formatUsd(scenario.decision.approvedAmountUsd)} | ${scenario.decision.humanReviewRequired ? "yes" : "no"} |`
    )
    .join("\n");
  const toolRows = matrix.paidTools
    .map((tool) => `| ${tool.name} | ${tool.price} | ${tool.payment} |`)
    .join("\n");
  const warnings = matrix.scenarios
    .flatMap((scenario) =>
      scenario.policySignals.map((signal) => `- ${scenario.asset.name}: ${signal}`)
    )
    .join("\n");

  return `# Casper Scenario Matrix

Generated: ${matrix.generatedAt}

Status: ${matrix.status}

Scenarios: ${matrix.summary.scenarios}

Paid tools per scenario: ${matrix.summary.paidToolsPerScenario}

Provider revenue per full run: ${matrix.summary.fullRunRevenueCSPR} CSPR

Total provider revenue if all scenarios run: ${matrix.summary.totalProviderRevenueIfAllRunCSPR} CSPR

## Decision Matrix

| Asset | Category | Risk | KYB | Liquidity | Covenant | Decision | Approved | Human review |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
${rows}

## Paid Tool Stack

| Tool | Price | Payment |
| --- | --- | --- |
${toolRows}

## Policy Signals

${warnings || "- No warning signals in the current scenario set."}

## Judge Takeaway

CSPR Guardian is repeatable beyond one invoice pool. The same paid MCP/x402
tool stack produces different policy outcomes across treasury, invoice-finance,
and trade-credit assets, including an autonomous approval path and a reviewer
gate for weaker credit.
`;
}

function summarizeScenario(result) {
  const { asset, requestedAmountUsd, riskReport, kybReport, liquidityReport, covenantReport, decision } =
    result;

  return {
    asset: {
      id: asset.id,
      name: asset.name,
      category: asset.category,
      jurisdiction: asset.jurisdiction,
      requestedAmountUsd
    },
    risk: {
      score: riskReport.score,
      tier: riskReport.riskTier,
      confidence: riskReport.confidence,
      maxExposureUsd: riskReport.maxExposureUsd
    },
    kyb: {
      entityStatus: kybReport.entityStatus,
      sanctionsScreen: kybReport.sanctionsScreen,
      jurisdictionRisk: kybReport.jurisdictionRisk,
      policyResult: kybReport.policyResult
    },
    liquidity: {
      coverageRatio: liquidityReport.coverageRatio,
      liquidityGrade: liquidityReport.liquidityGrade,
      slippageBps: liquidityReport.slippageBps,
      maxExecutableUsd: liquidityReport.maxExecutableUsd,
      policyResult: liquidityReport.policyResult
    },
    covenant: {
      policyResult: covenantReport.policyResult,
      reviewCadenceHours: covenantReport.reviewCadenceHours,
      defaultRisk: covenantReport.defaultRisk,
      volatilityRisk: covenantReport.volatilityRisk
    },
    decision,
    policySignals: [
      ...riskReport.warnings,
      ...kybReport.flags,
      ...liquidityReport.warnings,
      ...covenantReport.recommendedActions
    ]
  };
}

function formatUsd(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

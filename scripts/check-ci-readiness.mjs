import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { readJsonIfExists, resolveOutputDir } from "../src/final-submission-seal.mjs";

const execFileAsync = promisify(execFile);
const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

const checks = [];
const projectDir = process.cwd();
const outputDir = await resolveOutputDir(projectDir);

try {
  await runCheck({
    name: "unit_tests",
    command: process.execPath,
    args: ["--test"],
    detail: "Node test suite passes."
  });
  await runCheck({
    name: "evidence_verifier",
    command: process.execPath,
    args: ["scripts/verify-evidence.mjs"],
    detail: "Evidence bundle verifies signatures, hashes, receipt links, and revenue."
  });
  await runCheck({
    name: "preflight_verifier",
    command: process.execPath,
    args: ["scripts/verify-testnet-preflight.mjs", "submission/casper-testnet-preflight.json"],
    detail: "Committed signed Casper preflight evidence verifies without private key material."
  });
  await runCheck({
    name: "x402_settlement_preflight_verifier",
    command: process.execPath,
    args: [
      "scripts/verify-x402-settlement-preflight.mjs",
      "submission/casper-x402-settlement-preflight.json"
    ],
    detail: "Committed signed x402 settlement transfer preflight verifies without private key material."
  });
  await runCheck({
    name: "x402_settlement_batch_verifier",
    command: process.execPath,
    args: [
      "scripts/verify-x402-settlement.mjs",
      "submission/casper-x402-settlement-batch.json"
    ],
    detail: "Committed real x402 settlement-anchor transactions verify without private key material."
  });
  await runCheck({
    name: "final_review_unlock_report",
    command: process.execPath,
    args: ["scripts/prepare-highest-prize-unlock.mjs"],
    detail: "Final review unlock report captures funding, public-link, and final-seal gates."
  });
  await runCheck({
    name: "public_demo_readiness",
    command: process.execPath,
    args: ["scripts/check-public-demo-readiness.mjs"],
    detail: "Docker, Render, health endpoint, and public-demo handoff are ready."
  });

  const publicDemo = await readJsonIfExists(path.join(outputDir, "casper-public-demo-readiness.json"));
  const readiness = buildCiReadiness({ publicDemo });
  await writeCiReadiness(readiness, outputDir);
  console.log(JSON.stringify(readiness, null, 2));

  if (readiness.status !== "ci_ready") {
    process.exitCode = 1;
  }
} catch (error) {
  const readiness = buildCiReadiness({
    publicDemo: null,
    error: error.message
  });
  await writeCiReadiness(readiness, outputDir).catch(() => {});
  console.error(error.message);
  process.exitCode = 1;
}

async function runCheck({ name, command, args, detail }) {
  try {
    await execFileAsync(command, args, {
      cwd: projectDir,
      env: {
        ...process.env,
        CASPER_PREFLIGHT_FILE: process.env.CASPER_PREFLIGHT_FILE || "submission/casper-testnet-preflight.json"
      },
      maxBuffer: 1024 * 1024 * 16
    });
    checks.push({ name, status: "pass", detail });
  } catch (error) {
    checks.push({
      name,
      status: "fail",
      detail: error.stderr || error.stdout || error.message
    });
    throw new Error(`${name} failed`);
  }
}

function buildCiReadiness({ publicDemo, error = null }) {
  const failed = checks.filter((check) => check.status === "fail");
  const publicDemoExternalOnly =
    publicDemo?.status === "host_ready_needs_public_links" &&
    JSON.stringify(publicDemo).includes("public_links_configured");
  const readiness = {
    version: "0.1",
    generatedAt: new Date().toISOString(),
    project: "CSPR Guardian",
    status: failed.length === 0 ? "ci_ready" : "needs_review",
    summary: {
      passed: checks.filter((check) => check.status === "pass").length,
      failed: failed.length,
      total: checks.length
    },
    publicDemo: {
      status: publicDemo?.status || "missing",
      externalLinkGateOnly: Boolean(publicDemoExternalOnly),
      missingPublicLinks: publicDemo?.publicSubmission?.missing || []
    },
    checks,
    error
  };

  assertNoPrivateKeyLeak(readiness);
  return readiness;
}

async function writeCiReadiness(readiness, outputDir) {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "casper-ci-readiness.json"),
    `${JSON.stringify(readiness, null, 2)}\n`
  );
  await fs.writeFile(path.join(outputDir, "casper-ci-readiness.md"), renderCiReadinessMarkdown(readiness));
}

function renderCiReadinessMarkdown(readiness) {
  const checks = readiness.checks
    .map((check) => `| ${check.name} | ${check.status} | ${String(check.detail).replace(/\n+/gu, " ").slice(0, 240)} |`)
    .join("\n");
  const missingLinks = readiness.publicDemo.missingPublicLinks.length
    ? readiness.publicDemo.missingPublicLinks.map((item) => `- ${item}`).join("\n")
    : "- None";

  return `# Casper CI Readiness

Generated: ${readiness.generatedAt}

Status: ${readiness.status}

Checks: ${readiness.summary.passed}/${readiness.summary.total} passed, ${readiness.summary.failed} failed.

## Public Demo External Gate

Public demo status: ${readiness.publicDemo.status}

Missing public links:

${missingLinks}

## Checks

| Check | Status | Detail |
| --- | --- | --- |
${checks}
`;
}

function assertNoPrivateKeyLeak(value) {
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("CI readiness would leak private key material.");
  }
}

import fs from "node:fs/promises";
import path from "node:path";
import { resolveOutputDir } from "./final-submission-seal.mjs";

const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export function parseFundingWatchOptions(argv = [], env = process.env) {
  return {
    intervalMs: positiveInt(readArg(argv, "--interval-ms") || env.CASPER_FUNDING_POLL_MS, 30000),
    timeoutMs: positiveInt(readArg(argv, "--timeout-ms") || env.CASPER_FUNDING_TIMEOUT_MS, 15 * 60 * 1000),
    once: argv.includes("--once") || env.CASPER_FUNDING_ONCE === "true",
    seal: !argv.includes("--no-seal") && env.CASPER_FUNDING_NO_SEAL !== "true"
  };
}

export function buildFundingWatchReport({
  status,
  readiness,
  attempts,
  options,
  sealResult = null,
  generatedAt = new Date().toISOString()
}) {
  const report = {
    version: "0.1",
    generatedAt,
    project: "CSPR Guardian",
    status,
    readiness: summarizeReadiness(readiness),
    attempts,
    options: {
      intervalMs: options.intervalMs,
      timeoutMs: options.timeoutMs,
      once: options.once,
      seal: options.seal
    },
    sealResult,
    nextAction: nextActionForStatus(status, options)
  };

  assertNoPrivateKeyLeak(report);
  return report;
}

export async function writeFundingWatchReport(report, outputDir) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir(process.cwd()));
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-testnet-funding-watch.json"),
    `${JSON.stringify(report, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-testnet-funding-watch.md"),
    renderFundingWatchMarkdown(report)
  );
}

export function summarizeReadiness(readiness = {}) {
  return {
    rpcStatus: readiness.rpcStatus || "unknown",
    chain: readiness.chain || null,
    accountStatus: readiness.accountStatus || "unknown",
    readyForAnchor: Boolean(readiness.readyForAnchor),
    publicKeyHex: readiness.publicKeyHex || null,
    balanceMotes: readiness.balanceMotes || null,
    requiredMotes: readiness.requiredMotes || null,
    faucetUrl: readiness.faucetUrl || "https://testnet.cspr.live/tools/faucet",
    balanceError: readiness.balanceError || null,
    latestBlock: readiness.latestBlock || null
  };
}

export function renderFundingWatchMarkdown(report) {
  const attempts = report.attempts
    .map(
      (attempt) =>
        `| ${attempt.checkedAt} | ${attempt.accountStatus} | ${attempt.readyForAnchor ? "yes" : "no"} | ${attempt.balanceMotes || ""} | ${attempt.latestBlock || ""} |`
    )
    .join("\n");

  return `# Casper Testnet Funding Watch

Generated: ${report.generatedAt}

Status: ${report.status}

Public key:

\`\`\`text
${report.readiness.publicKeyHex || "missing"}
\`\`\`

Faucet:

\`\`\`text
${report.readiness.faucetUrl}
\`\`\`

Next action:

\`\`\`text
${report.nextAction}
\`\`\`

Seal result: ${report.sealResult?.status || "not_run"}

## Attempts

| Checked At | Account Status | Ready | Balance Motes | Latest Block |
| --- | --- | --- | --- | --- |
${attempts}
`;
}

function readArg(argv, name) {
  const exact = argv.find((arg) => arg.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = argv.indexOf(name);
  if (index >= 0) return argv[index + 1];
  return null;
}

function positiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function nextActionForStatus(status, options) {
  if (status === "seal_completed") {
    return "Run pnpm audit:submission and submit the final pack.";
  }
  if (status === "funded") {
    return options.seal ? "Run pnpm seal:submission." : "Funding is ready; run pnpm seal:submission.";
  }
  if (status === "seal_failed") {
    return "Review the seal output, then rerun pnpm seal:submission.";
  }
  if (status === "timed_out") {
    return "Keep the faucet request open or rerun pnpm wait:testnet after requesting funds.";
  }
  return "Open the faucet with pnpm fund:testnet, then keep this watcher running.";
}

function assertNoPrivateKeyLeak(value) {
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("Funding watch report would leak private key material.");
  }
}

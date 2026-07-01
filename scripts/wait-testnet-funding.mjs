import { spawnSync } from "node:child_process";
import { getTestnetReadiness } from "../src/testnet-readiness.mjs";
import {
  buildFundingWatchReport,
  parseFundingWatchOptions,
  summarizeReadiness,
  writeFundingWatchReport
} from "../src/testnet-funding-watch.mjs";

const options = parseFundingWatchOptions(process.argv.slice(2));
const startedAt = Date.now();
const attempts = [];

try {
  while (true) {
    const checkedAt = new Date().toISOString();
    const readiness = await getTestnetReadiness();
    const summary = summarizeReadiness(readiness);
    attempts.push({ checkedAt, ...summary });

    if (readiness.readyForAnchor) {
      const sealResult = options.seal ? runSeal() : null;
      const status = sealResult
        ? sealResult.exitCode === 0
          ? "seal_completed"
          : "seal_failed"
        : "funded";
      const report = buildFundingWatchReport({
        status,
        readiness,
        attempts,
        options,
        sealResult
      });
      await writeFundingWatchReport(report);
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = status === "seal_completed" || status === "funded" ? 0 : 1;
      break;
    }

    const timedOut = Date.now() - startedAt >= options.timeoutMs;
    if (options.once || timedOut) {
      const report = buildFundingWatchReport({
        status: timedOut ? "timed_out" : "needs_funding",
        readiness,
        attempts,
        options
      });
      await writeFundingWatchReport(report);
      console.log(JSON.stringify(report, null, 2));
      process.exitCode = 1;
      break;
    }

    await sleep(options.intervalMs);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

function runSeal() {
  const result = spawnSync("pnpm", ["seal:submission"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit"
  });

  return {
    status: result.status === 0 ? "completed" : "failed",
    exitCode: result.status ?? 1,
    signal: result.signal || null
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { spawn } from "node:child_process";
import {
  generateHighestPrizeUnlock,
  writeHighestPrizeUnlock
} from "../src/highest-prize-unlock.mjs";

const unlock = await generateHighestPrizeUnlock();
await writeHighestPrizeUnlock(unlock);

if (process.argv.includes("--open-faucet") || process.env.OPEN_FAUCET === "true") {
  openFaucet(unlock.faucet.url);
}

console.log(
  JSON.stringify(
    {
      status: unlock.status,
      publicKeyHex: unlock.testnet.publicKeyHex,
      accountStatus: unlock.testnet.accountStatus,
      readyForAnchor: unlock.testnet.readyForAnchor,
      missingGates: unlock.remainingGates.map((gate) => gate.name),
      faucetUrl: unlock.faucet.url,
      nextAction: unlock.nextAction
    },
    null,
    2
  )
);

function openFaucet(url) {
  const opener =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "cmd"
        : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  const child = spawn(opener, args, {
    detached: true,
    stdio: "ignore"
  });
  child.unref();
}

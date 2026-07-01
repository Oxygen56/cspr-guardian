import { spawn, spawnSync } from "node:child_process";
import {
  generateHighestPrizeUnlock,
  writeHighestPrizeUnlock
} from "../src/highest-prize-unlock.mjs";

const unlock = await generateHighestPrizeUnlock();
await writeHighestPrizeUnlock(unlock);

const copyRequested =
  process.argv.includes("--copy-public-key") || process.env.COPY_PUBLIC_KEY === "true";
const copiedPublicKey = copyRequested ? copyPublicKey(unlock.testnet.publicKeyHex) : false;

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
      publicKeyCopiedToClipboard: copiedPublicKey,
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

function copyPublicKey(publicKeyHex) {
  if (!publicKeyHex) return false;

  const candidates =
    process.platform === "darwin"
      ? [["pbcopy"]]
      : process.platform === "win32"
        ? [["clip"]]
        : [
            ["wl-copy"],
            ["xclip", "-selection", "clipboard"],
            ["xsel", "--clipboard", "--input"]
          ];

  for (const [command, ...args] of candidates) {
    const result = spawnSync(command, args, {
      input: publicKeyHex,
      encoding: "utf8",
      stdio: ["pipe", "ignore", "ignore"]
    });
    if (result.status === 0) {
      return true;
    }
  }

  return false;
}

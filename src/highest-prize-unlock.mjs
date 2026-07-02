import fs from "node:fs/promises";
import path from "node:path";
import { readJsonIfExists, resolveOutputDir } from "./final-submission-seal.mjs";
import {
  buildSubmissionFields,
  isPublicUrl,
  summarizePublicSubmissionFields
} from "./submission-profile.mjs";
import { getTestnetReadiness } from "./testnet-readiness.mjs";

const DEFAULT_CONFIG_URL = "https://testnet.cspr.live/config.js";
const DEFAULT_FAUCET_URL = "https://testnet.cspr.live/tools/faucet";
const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;

export async function generateHighestPrizeUnlock({
  projectDir = process.cwd(),
  outputDir,
  env = process.env,
  generatedAt = new Date().toISOString(),
  faucetConfig
} = {}) {
  const resolvedProjectDir = path.resolve(projectDir);
  const resolvedOutputDir = outputDir
    ? path.resolve(resolvedProjectDir, outputDir)
    : await resolveOutputDir(resolvedProjectDir);
  const [readiness, detectedFaucetConfig, finalSeal, buidlJson] = await Promise.all([
    getTestnetReadiness(),
    faucetConfig ? faucetConfig : fetchCsprLiveFaucetConfig().catch((error) => ({
      status: "unavailable",
      sourceUrl: DEFAULT_CONFIG_URL,
      error: error.message
    })),
    readJsonIfExists(path.join(resolvedOutputDir, "casper-final-submission-seal.json")),
    readJsonIfExists(path.join(resolvedOutputDir, "casper-buidl-submission.json"))
  ]);

  const submissionFields =
    buidlJson?.submissionFields ||
    buildSubmissionFields({
      env,
      casperExplorerUrl: finalSeal?.finalGate?.explorerUrl || null
    });
  const publicSubmission = summarizePublicSubmissionFields(submissionFields);
  const gates = buildHighestPrizeGates({ readiness, publicSubmission, finalSeal });
  const status = deriveHighestPrizeUnlockStatus(gates);
  const unlock = {
    version: "0.1",
    generatedAt,
    project: "CSPR Guardian",
    status,
    testnet: {
      publicKeyHex:
        readiness.publicKeyHex ||
        finalSeal?.finalGate?.publicKeyHex ||
        buidlJson?.readiness?.testnet?.publicKeyHex ||
        null,
      accountStatus: readiness.accountStatus || "unknown",
      readyForAnchor: Boolean(readiness.readyForAnchor),
      balanceMotes: readiness.balanceMotes || null,
      requiredMotes: readiness.requiredMotes || null,
      chain: readiness.chain || null,
      rpcStatus: readiness.rpcStatus || "unknown",
      rpcUrl: readiness.rpcUrl || null
    },
    faucet: {
      url: readiness.faucetUrl || DEFAULT_FAUCET_URL,
      configSourceUrl: detectedFaucetConfig.sourceUrl || DEFAULT_CONFIG_URL,
      configStatus: detectedFaucetConfig.status || "detected",
      networkName: detectedFaucetConfig.networkName || null,
      apiUrl: detectedFaucetConfig.apiUrl || null,
      faucetEnabled: detectedFaucetConfig.withFaucet ?? null,
      walletRequired: detectedFaucetConfig.withWallet ?? true,
      recaptchaRequired: Boolean(detectedFaucetConfig.recaptchaSiteKey),
      faucetAccountHash: detectedFaucetConfig.faucetAccountHash || null
    },
    publicSubmission,
    finalSeal: {
      status: finalSeal?.status || "missing",
      explorerUrl: finalSeal?.finalGate?.explorerUrl || null,
      deployHash: finalSeal?.finalGate?.deployHash || null
    },
    remainingGates: gates.filter((gate) => !gate.complete),
    gates,
    commands: {
      faucetHelper: "npm run fund:testnet",
      waitForFunding: "npm run wait:testnet",
      afterFunding: [
        "npm run check:testnet",
        "npm run preflight:testnet",
        "npm run verify:preflight",
        "npm run seal:submission",
        "npm run audit:submission"
      ],
      afterPublicLinks: [
        "SUBMISSION_REPO_URL=<public repo> SUBMISSION_DEMO_URL=<hosted demo> SUBMISSION_VIDEO_URL=<demo video> npm run export:buidl",
        "npm run export:submission",
        "npm run audit:submission"
      ],
      finalVerification: [
        "npm run test",
        "npm run check:ci",
        "npm run verify:evidence",
        "npm run verify:preflight",
        "npm run verify:x402-preflight"
      ]
    },
    nextAction: deriveNextAction({ status, readiness, publicSubmission, finalSeal })
  };

  assertNoPrivateKeyLeak(unlock);
  return unlock;
}

export function buildHighestPrizeGates({ readiness, publicSubmission, finalSeal }) {
  const linkItems = Object.fromEntries((publicSubmission.items || []).map((item) => [item.name, item]));
  const explorerUrl = finalSeal?.finalGate?.explorerUrl || null;
  const realReceiptComplete =
    finalSeal?.status === "ready_for_highest_prize_submission" && isPublicUrl(explorerUrl);

  return [
    {
      name: "fund_testnet_key",
      complete: Boolean(readiness.readyForAnchor),
      detail: readiness.readyForAnchor
        ? "Prepared Casper testnet key is funded and ready to anchor."
        : "Fund the prepared Casper testnet public key through the CSPR.live faucet.",
      evidence: {
        accountStatus: readiness.accountStatus || "unknown",
        publicKeyHex: readiness.publicKeyHex || null,
        requiredMotes: readiness.requiredMotes || null,
        balanceMotes: readiness.balanceMotes || null
      }
    },
    {
      name: "publish_public_repo",
      complete: Boolean(linkItems.repoUrl?.complete),
      detail: linkItems.repoUrl?.complete
        ? "Public repository URL is configured."
        : "Publish the source repository and export SUBMISSION_REPO_URL."
    },
    {
      name: "publish_hosted_demo",
      complete: Boolean(linkItems.demoUrl?.complete),
      detail: linkItems.demoUrl?.complete
        ? "Hosted demo URL is configured."
        : "Deploy the demo and export SUBMISSION_DEMO_URL."
    },
    {
      name: "publish_demo_video",
      complete: Boolean(linkItems.videoUrl?.complete),
      detail: linkItems.videoUrl?.complete
        ? "Demo video URL is configured."
        : "Record the walkthrough and export SUBMISSION_VIDEO_URL."
    },
    {
      name: "real_casper_receipt_deploy",
      complete: realReceiptComplete,
      readyToComplete: Boolean(readiness.readyForAnchor && !realReceiptComplete),
      detail: realReceiptComplete
        ? "Final seal contains a public CSPR.live deploy URL."
        : readiness.readyForAnchor
          ? "Funding is ready; run npm run seal:submission to broadcast and seal the real receipt."
          : "Waiting for a funded testnet key before broadcasting the real receipt deploy.",
      evidence: {
        sealStatus: finalSeal?.status || "missing",
        explorerUrl,
        deployHash: finalSeal?.finalGate?.deployHash || null
      }
    }
  ];
}

export function deriveHighestPrizeUnlockStatus(gates) {
  if (gates.every((gate) => gate.complete)) {
    return "ready_for_highest_prize_submission";
  }

  const missing = new Set(gates.filter((gate) => !gate.complete).map((gate) => gate.name));
  const missingPublicLinks = ["publish_public_repo", "publish_hosted_demo", "publish_demo_video"].some(
    (name) => missing.has(name)
  );
  const missingFunding = missing.has("fund_testnet_key");

  if (!missingFunding && !missingPublicLinks && missing.has("real_casper_receipt_deploy")) {
    return "ready_to_run_final_seal";
  }

  if (missingFunding && missingPublicLinks) {
    return "needs_funding_and_public_links";
  }

  if (missingFunding) {
    return "needs_funding";
  }

  if (missingPublicLinks) {
    return "needs_public_links";
  }

  return "needs_review";
}

export async function fetchCsprLiveFaucetConfig({
  configUrl = DEFAULT_CONFIG_URL,
  fetchImpl = globalThis.fetch
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("No fetch implementation is available.");
  }

  const response = await fetchImpl(configUrl);
  if (!response.ok) {
    throw new Error(`Could not fetch CSPR.live config: HTTP ${response.status}`);
  }

  const source = await response.text();
  return {
    status: "detected",
    sourceUrl: configUrl,
    networkName: readString(source, "network_name"),
    apiUrl: readString(source, "cspr_live_api_url"),
    rpcUrl: readString(source, "cspr_rpc_url"),
    withFaucet: readBool(source, "with_faucet"),
    withWallet: readBool(source, "with_wallet"),
    recaptchaSiteKey: readString(source, "recaptcha_site_key"),
    faucetAccountHash: readString(source, "faucet_account_hash")
  };
}

export async function writeHighestPrizeUnlock(unlock, outputDir, { mirrorSubmission = true } = {}) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir(process.cwd()));
  await writePair(resolvedOutputDir, unlock);

  if (mirrorSubmission) {
    await writePair(path.resolve(process.cwd(), "submission"), unlock);
  }
}

export function renderHighestPrizeUnlockMarkdown(unlock) {
  const gates = unlock.gates
    .map((gate) => `| ${gate.name} | ${gate.complete ? "pass" : gate.readyToComplete ? "ready" : "open"} | ${gate.detail} |`)
    .join("\n");
  const missingLinks = unlock.publicSubmission.missing.length
    ? unlock.publicSubmission.missing.join(", ")
    : "none";
  const ready = unlock.status === "ready_for_highest_prize_submission";
  const fundingSection = ready
    ? `## Final Testnet Receipt

- Account status: ${unlock.testnet.accountStatus}
- Ready for anchor: ${unlock.testnet.readyForAnchor}
- Explorer URL: ${unlock.finalSeal?.explorerUrl || "missing"}
- Deploy hash: ${unlock.finalSeal?.deployHash || "missing"}`
    : `## Manual Faucet Steps

1. Run \`${unlock.commands.faucetHelper || "npm run fund:testnet"}\` to copy the prepared public key and open the funding guide plus faucet page.
2. In CSPR.live, connect Casper Wallet on Casper testnet.
3. Request faucet funds for the copied public key.
4. Run \`${unlock.commands.waitForFunding || "npm run wait:testnet"}\`; it waits for the balance and then runs the final seal.`;
  const commandSection = ready
    ? `## Final Verification Commands

\`\`\`bash
${unlock.commands.finalVerification.join("\n")}
\`\`\``
    : `## Commands After Funding

\`\`\`bash
${unlock.commands.afterFunding.join("\n")}
\`\`\``;

  return `# Casper Highest Prize Unlock

Generated: ${unlock.generatedAt}

Status: ${unlock.status}

## Testnet Funding

Public key:

\`\`\`text
${unlock.testnet.publicKeyHex || "missing"}
\`\`\`

Faucet:

\`\`\`text
${unlock.faucet.url}
\`\`\`

Faucet checks: wallet required = ${unlock.faucet.walletRequired}, reCAPTCHA required = ${unlock.faucet.recaptchaRequired}, faucet enabled = ${unlock.faucet.faucetEnabled}

Required motes: ${unlock.testnet.requiredMotes || "unknown"}

${fundingSection}

## Public Links

Missing: ${missingLinks}

## Gates

| Gate | Status | Detail |
| --- | --- | --- |
${gates}

## Next Action

${unlock.nextAction}

${commandSection}

## Commands After Public Links

\`\`\`bash
${unlock.commands.afterPublicLinks.join("\n")}
\`\`\`
`;
}

function deriveNextAction({ status, readiness, publicSubmission, finalSeal }) {
  if (status === "ready_for_highest_prize_submission") {
    return "Submit the final pack with the public repo, hosted demo, video, and Casper explorer URL.";
  }

  if (!readiness.readyForAnchor) {
    return `Run npm run fund:testnet, complete the faucet request at ${readiness.faucetUrl || DEFAULT_FAUCET_URL}, then run npm run wait:testnet.`;
  }

  if (!publicSubmission.complete) {
    return `Publish public links for ${publicSubmission.missing.join(", ")}, then rerun npm run export:buidl and npm run audit:submission.`;
  }

  if (finalSeal?.status !== "ready_for_highest_prize_submission") {
    return "Funding and links are ready; run npm run seal:submission to broadcast the real Casper receipt and rebuild the pack.";
  }

  return "Review the audit report before submission.";
}

async function writePair(dir, unlock) {
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, "casper-highest-prize-unlock.json"),
    `${JSON.stringify(unlock, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(dir, "casper-highest-prize-unlock.md"),
    renderHighestPrizeUnlockMarkdown(unlock)
  );
}

function readString(source, name) {
  const match = source.match(new RegExp(`${name}:\\s*"([^"]*)"`, "u"));
  return match ? match[1] : null;
}

function readBool(source, name) {
  const match = source.match(new RegExp(`${name}:\\s*"([01])"\\s*(===|!==)\\s*'1'`, "u"));
  if (!match) return null;
  return match[2] === "===" ? match[1] === "1" : match[1] !== "1";
}

function assertNoPrivateKeyLeak(value) {
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("Highest prize unlock report would leak private key material.");
  }
}

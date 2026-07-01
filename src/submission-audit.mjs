import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { verifyLatestEvidenceBundle } from "./evidence-verifier.mjs";
import {
  fileSha256,
  readJsonIfExists,
  resolveOutputDir
} from "./final-submission-seal.mjs";
import { getPublicDemoReadiness } from "./public-demo-readiness.mjs";
import { summarizePublicSubmissionFields } from "./submission-profile.mjs";
import { verifyTestnetPreflightFile } from "./testnet-preflight-verifier.mjs";
import { verifyX402SettlementPreflightFile } from "./x402-settlement-preflight-verifier.mjs";

const execFileAsync = promisify(execFile);
const PRIVATE_KEY_PATTERN = /BEGIN [A-Z ]*PRIVATE KEY|"privateKey(?:Hex|Pem)?"\s*:/i;
const TEXT_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".txt"
]);

export async function generateSubmissionAudit({
  projectDir = process.cwd(),
  outputDir,
  generatedAt = new Date().toISOString()
} = {}) {
  const resolvedProjectDir = path.resolve(projectDir);
  const resolvedOutputDir = outputDir
    ? path.resolve(resolvedProjectDir, outputDir)
    : await resolveOutputDir(resolvedProjectDir);
  const paths = auditPaths(resolvedOutputDir);

  const [
    evidenceVerification,
    preflightVerification,
    x402PreflightVerification,
    packManifest,
    finalSeal,
    highestPrizeUnlock,
    buidlJson,
    ciReadiness,
    prizeReadiness,
    finalEvidence,
    publicDemoReadiness,
    buidlMarkdown,
    sourceZipEntries,
    finalPackEntries,
    leakScan
  ] = await Promise.all([
    verifyLatestEvidenceBundle().catch((error) => failedVerification(error.message)),
    verifyTestnetPreflightFile(paths.preflightJson).catch((error) =>
      failedVerification(error.message)
    ),
    verifyX402SettlementPreflightFile(paths.x402PreflightJson).catch((error) =>
      failedVerification(error.message)
    ),
    readJsonIfExists(paths.packManifest),
    readJsonIfExists(paths.finalSealJson),
    readJsonIfExists(paths.highestPrizeUnlockJson),
    readJsonIfExists(paths.buidlJson),
    readJsonIfExists(paths.ciReadinessJson),
    readJsonIfExists(paths.prizeReadinessJson),
    readJsonIfExists(paths.finalEvidenceJson),
    getPublicDemoReadiness({
      projectDir: resolvedProjectDir,
      outputDir: resolvedOutputDir
    }).catch((error) => ({ status: "failed", summary: { passed: 0, failed: 1, total: 1 }, error: error.message })),
    readTextIfExists(paths.buidlMarkdown),
    listZipEntries(paths.sourceZip),
    listZipEntries(paths.finalPackZip),
    scanForPrivateKeyLeaks(resolvedOutputDir)
  ]);

  const packZip = await summarizeZip(paths.finalPackZip);
  const sourceZip = await summarizeZip(paths.sourceZip);
  const checks = buildSubmissionAuditChecks({
    evidenceVerification,
    preflightVerification,
    x402PreflightVerification,
    packManifest,
    finalSeal,
    highestPrizeUnlock,
    buidlJson,
    ciReadiness,
    buidlMarkdown,
    publicDemoReadiness,
    prizeReadiness,
    finalEvidence,
    sourceZip,
    packZip,
    sourceZipEntries,
    finalPackEntries,
    leakScan
  });
  const summary = summarizeChecks(checks);
  const status = deriveSubmissionAuditStatus(checks);

  const audit = {
    version: "0.1",
    generatedAt,
    project: "CSPR Guardian",
    status,
    summary,
    finalGate: {
      highestPrizeGate: Boolean(finalSeal?.finalGate?.highestPrizeGate),
      sealStatus: finalSeal?.status || "missing",
      prizeStatus: prizeReadiness?.status || "unknown",
      prizeScore: prizeReadiness?.score ?? null,
      accountStatus:
        finalSeal?.finalGate?.accountStatus || prizeReadiness?.testnet?.accountStatus || "unknown",
      publicKeyHex:
        finalSeal?.finalGate?.publicKeyHex || prizeReadiness?.testnet?.publicKeyHex || null,
      explorerUrl:
        finalSeal?.finalGate?.explorerUrl ||
        finalEvidence?.anchor?.explorerUrl ||
        finalEvidence?.explorerUrl ||
        null,
      nextCommand: finalSeal?.finalGate?.nextCommand || "npm run seal:submission"
    },
    artifacts: {
      submissionPackZip: packZip,
      sourceZip,
      finalSeal: paths.finalSealJson,
      highestPrizeUnlock: paths.highestPrizeUnlockJson,
      buidlSubmission: paths.buidlMarkdown,
      preflight: paths.preflightJson,
      auditJson: path.join(resolvedOutputDir, "casper-submission-audit.json"),
      auditMarkdown: path.join(resolvedOutputDir, "casper-submission-audit.md")
    },
    checks
  };

  assertNoPrivateKeyLeak(audit);
  return audit;
}

export function buildSubmissionAuditChecks({
  evidenceVerification,
  preflightVerification,
  x402PreflightVerification,
  packManifest,
  finalSeal,
  highestPrizeUnlock,
  buidlJson,
  ciReadiness,
  buidlMarkdown,
  publicDemoReadiness,
  prizeReadiness,
  finalEvidence,
  sourceZip,
  packZip,
  sourceZipEntries,
  finalPackEntries,
  leakScan
}) {
  const checks = [];
  const add = (name, status, detail, extra = {}) => {
    checks.push({
      name,
      detail,
      ...extra,
      status,
      ok: status === "pass"
    });
  };

  add(
    "evidence_verified",
    evidenceVerification?.status === "verified" ? "pass" : "fail",
    evidenceVerification?.summary
      ? `${evidenceVerification.summary.passed}/${evidenceVerification.summary.total} evidence checks passed.`
      : "Evidence verification is missing.",
    {
      evidenceStatus: evidenceVerification?.status || "missing",
      passed: evidenceVerification?.summary?.passed ?? 0,
      total: evidenceVerification?.summary?.total ?? 0
    }
  );

  add(
    "preflight_verified",
    preflightVerification?.status === "verified" ? "pass" : "fail",
    preflightVerification?.summary
      ? `${preflightVerification.summary.passed}/${preflightVerification.summary.total} preflight checks passed.`
      : "Casper testnet preflight verification is missing.",
    {
      preflightStatus: preflightVerification?.status || "missing",
      passed: preflightVerification?.summary?.passed ?? 0,
      total: preflightVerification?.summary?.total ?? 0,
      sourceFile: preflightVerification?.sourceFile || null
    }
  );

  add(
    "x402_settlement_preflight_verified",
    x402PreflightVerification?.status === "verified" ? "pass" : "fail",
    x402PreflightVerification?.summary
      ? `${x402PreflightVerification.summary.passed}/${x402PreflightVerification.summary.total} x402 settlement preflight checks passed.`
      : "x402 settlement preflight verification is missing.",
    {
      x402PreflightStatus: x402PreflightVerification?.status || "missing",
      passed: x402PreflightVerification?.summary?.passed ?? 0,
      total: x402PreflightVerification?.summary?.total ?? 0,
      sourceFile: x402PreflightVerification?.sourceFile || null
    }
  );

  const missingRequired = packManifest?.missingRequired?.length ?? null;
  const packStatusOk = ["ready", "ready_except_real_testnet_gate"].includes(
    packManifest?.status
  );
  add(
    "submission_pack_present",
    packManifest && packZip.exists && missingRequired === 0 && packStatusOk ? "pass" : "fail",
    packManifest
      ? `Final pack status is ${packManifest.status}; missing required files: ${missingRequired}.`
      : "Final submission pack manifest is missing.",
    {
      packStatus: packManifest?.status || "missing",
      files: packManifest?.files?.length ?? 0,
      missingRequired,
      zipPath: packZip.path,
      zipSha256: packZip.sha256
    }
  );

  const buidlReady =
    Boolean(buidlJson) &&
    typeof buidlMarkdown === "string" &&
    buidlMarkdown.includes("CSPR Guardian") &&
    buidlMarkdown.includes("npm run seal:submission") &&
    buidlMarkdown.includes("casper-final-submission-seal.json");
  add(
    "buidl_page_present",
    buidlReady ? "pass" : "fail",
    buidlReady
      ? "BUIDL page fields, final seal reference, and funding command are present."
      : "BUIDL page export is missing required submission cues.",
    {
      jsonPresent: Boolean(buidlJson),
      markdownPresent: typeof buidlMarkdown === "string"
    }
  );

  const publicFields = summarizePublicSubmissionFields(buidlJson?.submissionFields || {});
  add(
    "public_submission_fields",
    publicFields.complete ? "pass" : "blocked",
    publicFields.complete
      ? "Repository, hosted demo, and video URLs are concrete public links."
      : `Public submission links still need values: ${publicFields.missing.join(", ")}.`,
    publicFields
  );

  const publicDemoFailedChecks =
    publicDemoReadiness?.checks?.filter((check) => check.status === "fail") || [];
  const onlyPublicLinksMissing =
    publicDemoFailedChecks.length === 1 &&
    publicDemoFailedChecks[0].name === "public_links_configured";
  add(
    "public_demo_host_ready",
    publicDemoReadiness?.status === "host_ready"
      ? "pass"
      : onlyPublicLinksMissing
        ? "blocked"
        : "fail",
    publicDemoReadiness?.status === "host_ready"
      ? "Docker, Render, health endpoint, start script, and public links are ready."
      : onlyPublicLinksMissing
        ? "Hosting configuration is ready; public demo links still need to be published."
        : publicDemoReadiness?.error || "Public demo hosting readiness needs review.",
    {
      publicDemoStatus: publicDemoReadiness?.status || "missing",
      publicDemoSummary: publicDemoReadiness?.summary || null,
      failedChecks: publicDemoFailedChecks.map((check) => check.name)
    }
  );

  const ciChecks = ciReadiness?.checks?.map((check) => check.name) || [];
  const ciReady =
    ciReadiness?.status === "ci_ready" &&
    ciReadiness?.summary?.failed === 0 &&
    [
      "unit_tests",
      "evidence_verifier",
      "preflight_verifier",
      "x402_settlement_preflight_verifier",
      "highest_prize_unlock_report",
      "public_demo_readiness"
    ].every((name) => ciChecks.includes(name));
  add(
    "ci_readiness_present",
    ciReady ? "pass" : "fail",
    ciReady
      ? "CI readiness report covers tests, evidence, preflight, highest-prize unlock, and public demo readiness."
      : "CI readiness report is missing or incomplete.",
    {
      ciStatus: ciReadiness?.status || "missing",
      ciSummary: ciReadiness?.summary || null,
      ciChecks
    }
  );

  const sealOk =
    Boolean(finalSeal) &&
    ["needs_funding", "ready_for_highest_prize_submission", "needs_review"].includes(
      finalSeal.status
    ) &&
    Boolean(finalSeal.submissionPack?.zipSha256 || packZip.sha256);
  add(
    "final_seal_present",
    sealOk ? "pass" : "fail",
    finalSeal
      ? `Final seal is ${finalSeal.status}; package hash source is ${
          finalSeal.submissionPack?.zipSha256 ? "seal" : "current zip"
        }.`
      : "Final submission seal is missing.",
    {
      sealStatus: finalSeal?.status || "missing",
      zipSha256: finalSeal?.submissionPack?.zipSha256 || packZip.sha256 || null
    }
  );

  const unlockOk =
    Boolean(highestPrizeUnlock) &&
    Array.isArray(highestPrizeUnlock.gates) &&
    highestPrizeUnlock.gates.length >= 5 &&
    typeof highestPrizeUnlock.nextAction === "string" &&
    Boolean(highestPrizeUnlock.testnet?.publicKeyHex || highestPrizeUnlock.faucet?.url);
  add(
    "highest_prize_unlock_present",
    unlockOk ? "pass" : "fail",
    unlockOk
      ? `Highest-prize unlock report is ${highestPrizeUnlock.status} with ${highestPrizeUnlock.remainingGates?.length ?? 0} remaining gate(s).`
      : "Highest-prize unlock report is missing or incomplete.",
    {
      unlockStatus: highestPrizeUnlock?.status || "missing",
      remainingGates: highestPrizeUnlock?.remainingGates?.map((gate) => gate.name) || []
    }
  );

  const highestReady =
    finalSeal?.status === "ready_for_highest_prize_submission" &&
    finalSeal?.finalGate?.highestPrizeGate === true &&
    prizeReadiness?.highestPrizeGate === true &&
    finalEvidence?.status === "ready_for_submission";
  const highestBlocked =
    finalSeal?.status === "needs_funding" ||
    prizeReadiness?.status === "final-gate" ||
    packManifest?.status === "ready_except_real_testnet_gate";
  add(
    "highest_prize_gate",
    highestReady ? "pass" : highestBlocked ? "blocked" : "fail",
    highestReady
      ? "Real Casper testnet receipt evidence is ready for highest-prize submission."
      : highestBlocked
        ? "Only the real funded Casper testnet receipt deploy remains."
        : "Highest-prize final gate is not in a recognizable ready or funding state.",
    {
      sealStatus: finalSeal?.status || "missing",
      highestPrizeGate: Boolean(prizeReadiness?.highestPrizeGate),
      finalEvidenceStatus: finalEvidence?.status || "missing"
    }
  );

  add(
    "private_key_leak_scan",
    leakScan.matches.length === 0 ? "pass" : "fail",
    leakScan.matches.length === 0
      ? `${leakScan.filesScanned} text artifacts scanned with no private key material.`
      : `Private key pattern found in ${leakScan.matches.length} artifact(s).`,
    {
      filesScanned: leakScan.filesScanned,
      matches: leakScan.matches
    }
  );

  const forbiddenSourceEntries = sourceZipEntries.entries.filter((entry) =>
    /(^|\/)(node_modules|\.local)(\/|$)|(^|\/)\.env$/u.test(entry)
  );
  add(
    "source_zip_exclusions",
    sourceZip.exists && sourceZipEntries.ok && forbiddenSourceEntries.length === 0
      ? "pass"
      : "fail",
    sourceZipEntries.ok
      ? "Source archive excludes node_modules, .local, and .env."
      : sourceZipEntries.error || "Source archive entries could not be inspected.",
    {
      sourceZipPath: sourceZip.path,
      entries: sourceZipEntries.entries.length,
      forbiddenEntries: forbiddenSourceEntries
    }
  );

  const selfReferences = finalPackEntries.entries.filter((entry) =>
    /casper-final-submission-seal|cspr-guardian-final-seal|casper-submission-audit/iu.test(entry)
  );
  add(
    "final_pack_no_self_reference",
    packZip.exists && finalPackEntries.ok && selfReferences.length === 0 ? "pass" : "fail",
    finalPackEntries.ok
      ? "Final pack does not include external seal or audit files that would self-reference the zip."
      : finalPackEntries.error || "Final pack entries could not be inspected.",
    {
      finalPackPath: packZip.path,
      entries: finalPackEntries.entries.length,
      selfReferences
    }
  );

  return checks;
}

export function deriveSubmissionAuditStatus(checks) {
  const summary = summarizeChecks(checks);
  const blockedChecks = checks.filter((check) => check.status === "blocked");
  const blockedNames = new Set(blockedChecks.map((check) => check.name));
  const onlyHighestPrizeGateBlocked =
    blockedChecks.length === 1 && blockedChecks[0].name === "highest_prize_gate";
  const onlyKnownExternalGatesBlocked =
    blockedChecks.length > 0 &&
    blockedChecks.every((check) =>
      ["highest_prize_gate", "public_submission_fields", "public_demo_host_ready"].includes(
        check.name
      )
    );

  if (summary.failed === 0 && summary.blocked === 0) {
    return "ready_for_highest_prize_submission";
  }

  if (summary.failed === 0 && onlyHighestPrizeGateBlocked) {
    return "ready_except_real_testnet_gate";
  }

  if (summary.failed === 0 && onlyKnownExternalGatesBlocked) {
    return blockedNames.has("highest_prize_gate")
      ? "ready_except_external_submission_gates"
      : "ready_except_public_submission_links";
  }

  return "needs_review";
}

export function summarizeChecks(checks) {
  return {
    passed: checks.filter((check) => check.status === "pass").length,
    blocked: checks.filter((check) => check.status === "blocked").length,
    failed: checks.filter((check) => check.status === "fail").length,
    total: checks.length
  };
}

export async function writeSubmissionAudit(audit, outputDir) {
  const resolvedOutputDir = outputDir || (await resolveOutputDir(process.cwd()));
  await fs.mkdir(resolvedOutputDir, { recursive: true });
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-submission-audit.json"),
    `${JSON.stringify(audit, null, 2)}\n`
  );
  await fs.writeFile(
    path.join(resolvedOutputDir, "casper-submission-audit.md"),
    renderSubmissionAuditMarkdown(audit)
  );
}

export function renderSubmissionAuditMarkdown(audit) {
  const checks = audit.checks
    .map((check) => `| ${check.name} | ${check.status} | ${check.detail} |`)
    .join("\n");
  const failed = audit.checks
    .filter((check) => check.status === "fail")
    .map((check) => `- ${check.name}: ${check.detail}`)
    .join("\n");
  const blocked = audit.checks
    .filter((check) => check.status === "blocked")
    .map((check) => `- ${check.name}: ${check.detail}`)
    .join("\n");

  return `# Casper Submission Audit

Generated: ${audit.generatedAt}

Status: ${audit.status}

Checks: ${audit.summary.passed}/${audit.summary.total} passed, ${audit.summary.blocked} blocked, ${audit.summary.failed} failed.

## Final Gate

- Seal status: ${audit.finalGate.sealStatus}
- Prize score: ${audit.finalGate.prizeScore ?? "unknown"}/100
- Highest-prize gate: ${audit.finalGate.highestPrizeGate ? "cleared" : "needs real Casper testnet deploy"}
- Account status: ${audit.finalGate.accountStatus}
- Public key: ${audit.finalGate.publicKeyHex || "missing"}
- Explorer URL: ${audit.finalGate.explorerUrl || "missing"}
- Next command: \`${audit.finalGate.nextCommand}\`

## Public Submission Links

${renderPublicSubmissionLinks(audit)}

## Checks

| Check | Status | Detail |
| --- | --- | --- |
${checks}

## Action Items

${failed || "- No failed audit checks."}
${blocked ? `\n${blocked}` : ""}

## Integrity Files

- Submission pack: \`${audit.artifacts.submissionPackZip.path}\`
- Submission pack SHA-256: \`${audit.artifacts.submissionPackZip.sha256 || "missing"}\`
- Source archive: \`${audit.artifacts.sourceZip.path}\`
- Final seal: \`casper-final-submission-seal.json\`
- Seal markdown: \`casper-final-submission-seal.md\`
- Highest-prize unlock: \`casper-highest-prize-unlock.json\`

The submission zip intentionally does not include \`casper-final-submission-seal.*\` or \`casper-submission-audit.*\`; those files sit beside it as external integrity proofs.
`;
}

function renderPublicSubmissionLinks(audit) {
  const check = audit.checks.find((item) => item.name === "public_submission_fields");
  if (!check) return "- Public link check is missing.";

  return check.items
    .map(
      (item) =>
        `- ${item.name}: ${item.complete ? item.value : "missing"}`
    )
    .join("\n");
}

function auditPaths(outputDir) {
  return {
    sourceZip: path.join(outputDir, "cspr-guardian-prototype.zip"),
    finalPackZip: path.join(outputDir, "cspr-guardian-final-submission.zip"),
    packManifest: path.join(outputDir, "cspr-guardian-final-submission", "manifest.json"),
    finalSealJson: path.join(outputDir, "casper-final-submission-seal.json"),
    buidlJson: path.join(outputDir, "casper-buidl-submission.json"),
    buidlMarkdown: path.join(outputDir, "casper-buidl-submission.md"),
    ciReadinessJson: path.join(outputDir, "casper-ci-readiness.json"),
    x402PreflightJson: path.join(outputDir, "casper-x402-settlement-preflight.json"),
    prizeReadinessJson: path.join(outputDir, "casper-prize-readiness.json"),
    finalEvidenceJson: path.join(outputDir, "casper-final-testnet-evidence.json"),
    highestPrizeUnlockJson: path.join(outputDir, "casper-highest-prize-unlock.json"),
    preflightJson: path.join(outputDir, "casper-testnet-preflight.json")
  };
}

async function summarizeZip(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return {
      exists: true,
      path: filePath,
      bytes: stat.size,
      sha256: await fileSha256(filePath)
    };
  } catch {
    return {
      exists: false,
      path: filePath,
      bytes: 0,
      sha256: null
    };
  }
}

async function listZipEntries(zipPath) {
  try {
    await fs.access(zipPath);
  } catch {
    return {
      ok: false,
      entries: [],
      error: `${zipPath} is missing.`
    };
  }

  for (const command of [
    ["zipinfo", ["-1", zipPath]],
    ["unzip", ["-Z", "-1", zipPath]]
  ]) {
    try {
      const { stdout } = await execFileAsync(command[0], command[1], {
        maxBuffer: 1024 * 1024 * 8
      });
      return {
        ok: true,
        entries: stdout.split(/\r?\n/u).filter(Boolean),
        error: null
      };
    } catch {
      // Try the next zip listing tool.
    }
  }

  return {
    ok: false,
    entries: [],
    error: `Could not inspect zip entries for ${zipPath}.`
  };
}

async function scanForPrivateKeyLeaks(outputDir) {
  const files = await collectTextFiles(outputDir);
  const matches = [];

  for (const filePath of files) {
    try {
      const text = await fs.readFile(filePath, "utf8");
      if (PRIVATE_KEY_PATTERN.test(text)) {
        matches.push(path.relative(outputDir, filePath));
      }
    } catch {
      // Skip unreadable generated artifacts.
    }
  }

  return {
    filesScanned: files.length,
    matches
  };
}

async function collectTextFiles(rootDir) {
  const files = [];
  const walk = async (dir) => {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  };

  await walk(rootDir);
  return files;
}

async function readTextIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }
}

function failedVerification(message) {
  return {
    status: "failed",
    checks: [],
    summary: { passed: 0, total: 1 },
    message
  };
}

function assertNoPrivateKeyLeak(value) {
  if (PRIVATE_KEY_PATTERN.test(JSON.stringify(value))) {
    throw new Error("Submission audit would leak private key material.");
  }
}

import { resolveOutputDir } from "../src/final-submission-seal.mjs";
import {
  generateSubmissionAudit,
  writeSubmissionAudit
} from "../src/submission-audit.mjs";

try {
  const outputDir = await resolveOutputDir(process.cwd());
  const audit = await generateSubmissionAudit({ outputDir });
  await writeSubmissionAudit(audit, outputDir);

  console.log(
    JSON.stringify(
      {
        status: audit.status,
        checks: audit.summary,
        finalGate: audit.finalGate.highestPrizeGate ? "cleared" : "needs_real_testnet_deploy",
        auditJson: audit.artifacts.auditJson,
        auditMarkdown: audit.artifacts.auditMarkdown
      },
      null,
      2
    )
  );

  if (audit.status === "needs_review") {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

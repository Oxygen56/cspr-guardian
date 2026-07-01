import { resolveOutputDir } from "../src/final-submission-seal.mjs";
import {
  getPublicDemoReadiness,
  writePublicDemoReadiness
} from "../src/public-demo-readiness.mjs";

try {
  const outputDir = await resolveOutputDir(process.cwd());
  const readiness = await getPublicDemoReadiness({ outputDir });
  await writePublicDemoReadiness(readiness, outputDir);
  console.log(
    JSON.stringify(
      {
        status: readiness.status,
        checks: readiness.summary,
        publicLinks: readiness.publicSubmission.complete ? "ready" : "needs_public_links",
        missingPublicLinks: readiness.publicSubmission.missing,
        files: [
          `${outputDir}/casper-public-demo-readiness.json`,
          `${outputDir}/casper-public-demo-handoff.md`
        ]
      },
      null,
      2
    )
  );

  if (readiness.status === "needs_review") {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

import {
  generateBuidlSubmissionPage,
  writeBuidlSubmissionPage
} from "../src/buidl-submission.mjs";
import { resolveOutputDir } from "../src/final-submission-seal.mjs";

try {
  const outputDir = await resolveOutputDir(process.cwd());
  const page = await generateBuidlSubmissionPage({ outputDir });
  await writeBuidlSubmissionPage(page, outputDir);
  console.log(
    JSON.stringify(
      {
        status: page.readiness.status,
        score: `${page.readiness.score}/${page.readiness.maxScore}`,
        finalGate: page.readiness.highestPrizeGate ? "cleared" : "needs_real_testnet_deploy",
        publicLinks: page.publicSubmissionFields.complete ? "ready" : "needs_repo_demo_video_urls",
        missingPublicLinks: page.publicSubmissionFields.missing,
        outputDir,
        files: ["casper-buidl-submission.md", "casper-buidl-submission.json"]
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

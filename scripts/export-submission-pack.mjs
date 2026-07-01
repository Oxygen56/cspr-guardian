import fs from "node:fs/promises";
import path from "node:path";
import {
  generateBuidlSubmissionPage,
  writeBuidlSubmissionPage
} from "../src/buidl-submission.mjs";
import { getPrizeReadiness } from "../src/prize-readiness.mjs";
import { createSubmissionPack } from "../src/submission-pack.mjs";

try {
  const outputDir = await resolveOutputDir();
  await refreshPrizeReadiness(outputDir);
  await refreshBuidlSubmission(outputDir);
  const pack = await createSubmissionPack({ outputDir });
  console.log(
    JSON.stringify(
      {
        status: pack.status,
        files: pack.files.length,
        missingRequired: pack.missingRequired.length,
        finalGate: pack.finalGate.highestPrizeGate ? "cleared" : "needs_real_testnet_deploy",
        packDir: pack.packDir,
        zipPath: pack.zipPath,
        zip: pack.zip
      },
      null,
      2
    )
  );

  if (pack.missingRequired.length > 0) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

async function refreshBuidlSubmission(outputDir) {
  const page = await generateBuidlSubmissionPage({ outputDir });
  await writeBuidlSubmissionPage(page, outputDir);
}

async function refreshPrizeReadiness(outputDir) {
  const readiness = await getPrizeReadiness();
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(
    path.join(outputDir, "casper-prize-readiness.json"),
    `${JSON.stringify(readiness, null, 2)}\n`
  );
  await fs.writeFile(
    path.resolve(process.cwd(), "submission/prize-readiness-snapshot.json"),
    `${JSON.stringify(readiness, null, 2)}\n`
  );
}

async function resolveOutputDir() {
  const workspaceOutputs = path.resolve(process.cwd(), "../../outputs");
  try {
    await fs.access(workspaceOutputs);
    return workspaceOutputs;
  } catch {
    return path.resolve(process.cwd(), "submission");
  }
}

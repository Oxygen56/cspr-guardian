import { verifyLatestEvidenceBundle } from "../src/evidence-verifier.mjs";

const result = await verifyLatestEvidenceBundle();
console.log(JSON.stringify(result, null, 2));

if (result.status !== "verified") {
  process.exitCode = 1;
}

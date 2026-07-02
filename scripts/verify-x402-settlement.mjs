import { verifyX402SettlementBatchFile } from "../src/x402-settlement-batch-verifier.mjs";

const result = await verifyX402SettlementBatchFile(process.argv[2]);
console.log(JSON.stringify(result, null, 2));

if (result.status !== "verified") {
  process.exitCode = 1;
}

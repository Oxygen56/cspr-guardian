import { verifyX402SettlementPreflightFile } from "../src/x402-settlement-preflight-verifier.mjs";

const filePath = process.argv[2];
const result = await verifyX402SettlementPreflightFile(filePath);

console.log(JSON.stringify(result, null, 2));

if (result.status !== "verified") {
  process.exitCode = 1;
}

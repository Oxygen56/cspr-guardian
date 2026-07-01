import { verifyTestnetPreflightFile } from "../src/testnet-preflight-verifier.mjs";

const filePath = process.argv[2];
const result = await verifyTestnetPreflightFile(filePath);

console.log(JSON.stringify(result, null, 2));

if (result.status !== "verified") {
  process.exitCode = 1;
}

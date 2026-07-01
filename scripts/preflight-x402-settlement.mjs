import {
  generateX402SettlementPreflight,
  writeX402SettlementPreflight
} from "../src/x402-settlement-preflight.mjs";

try {
  const preflight = await generateX402SettlementPreflight();
  await writeX402SettlementPreflight(preflight);
  console.log(JSON.stringify(preflight, null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

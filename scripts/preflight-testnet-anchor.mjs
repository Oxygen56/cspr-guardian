import {
  generateTestnetPreflight,
  writeTestnetPreflight
} from "../src/testnet-preflight.mjs";

try {
  const preflight = await generateTestnetPreflight();
  await writeTestnetPreflight(preflight);
  console.log(JSON.stringify(preflight, null, 2));
  if (!preflight.readiness.readyForAnchor) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

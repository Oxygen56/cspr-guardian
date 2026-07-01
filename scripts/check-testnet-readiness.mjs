import { getTestnetReadiness } from "../src/testnet-readiness.mjs";

try {
  const readiness = await getTestnetReadiness();
  console.log(JSON.stringify(readiness, null, 2));
  if (!readiness.readyForAnchor) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

import { settleX402PaymentBatch, writeX402SettlementBatch } from "../src/x402-settlement-batch.mjs";

try {
  const batch = await settleX402PaymentBatch();
  await writeX402SettlementBatch(batch);
  console.log(JSON.stringify(batch, null, 2));
  if (batch.status !== "settled_on_casper_testnet") {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

import { runScenario } from "../src/agent.mjs";

process.env.CASPER_MODE = "real";
process.env.CASPER_NODE_RPC =
  process.env.CASPER_NODE_RPC || "https://node.testnet.casper.network/rpc";
process.env.CASPER_PRIVATE_KEY_FILE =
  process.env.CASPER_PRIVATE_KEY_FILE || ".local/casper-testnet-key.json";

const assetId = process.env.CASPER_DEMO_ASSET_ID || "invoice-usdc-7d";
const requestedAmountUsd = Number(process.env.CASPER_DEMO_AMOUNT_USD || "250000");

try {
  const result = await runScenario({ assetId, requestedAmountUsd });
  console.log(
    JSON.stringify(
      {
        status: result.anchor.status,
        mode: result.anchor.mode,
        deployHash: result.anchor.deployHash,
        explorerUrl: result.anchor.explorerUrl,
        memo: result.anchor.memo,
        receiptHash: result.anchor.receipt.receiptHash,
        tools: result.anchor.receipt.tools,
        providerRevenue: result.providerRevenue
      },
      null,
      2
    )
  );
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}

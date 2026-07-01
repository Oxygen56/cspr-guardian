import { checkCasperDeploy } from "../src/casper-deploy-check.mjs";

const deployHash = process.argv[2] || process.env.CASPER_DEPLOY_HASH;

if (!deployHash) {
  console.error("Usage: npm run check:deploy -- <deploy-hash>");
  process.exit(1);
}

const rpcUrl = process.env.CASPER_NODE_RPC || "https://node.testnet.casper.network/rpc";

try {
  console.log(JSON.stringify(await checkCasperDeploy(deployHash, { rpcUrl }), null, 2));
} catch (error) {
  console.error(`Deploy not found or RPC unavailable: ${error.message}`);
  process.exitCode = 1;
}

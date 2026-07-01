import sdk from "casper-js-sdk";

const DEFAULT_RPC_URL = "https://node.testnet.casper.network/rpc";

const { HttpHandler, RpcClient } = sdk;

export async function checkCasperDeploy(deployHash, { rpcUrl = DEFAULT_RPC_URL } = {}) {
  if (!deployHash) {
    throw new Error("Deploy hash is required.");
  }

  const rpcClient = new RpcClient(new HttpHandler(rpcUrl));
  const deploy = await rpcClient.getDeploy(deployHash);

  return {
    status: "found",
    deployHash,
    rpcUrl,
    explorerUrl: `https://testnet.cspr.live/deploy/${deployHash}`,
    apiVersion: deploy.apiVersion || deploy.rawJSON?.api_version || null
  };
}

export async function waitForCasperDeploy(
  deployHash,
  { rpcUrl = DEFAULT_RPC_URL, timeoutMs = 120000, pollMs = 8000 } = {}
) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt <= timeoutMs) {
    try {
      const result = await checkCasperDeploy(deployHash, { rpcUrl });
      return {
        ...result,
        waitedMs: Date.now() - startedAt
      };
    } catch (error) {
      lastError = error;
      await sleep(pollMs);
    }
  }

  throw new Error(
    `Deploy ${deployHash} was not queryable after ${timeoutMs}ms: ${lastError?.message || "unknown error"}`
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

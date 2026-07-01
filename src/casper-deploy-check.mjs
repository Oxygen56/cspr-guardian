import sdk from "casper-js-sdk";

const DEFAULT_RPC_URL = "https://node.testnet.casper.network/rpc";

const { HttpHandler, RpcClient } = sdk;

export async function checkCasperDeploy(deployHash, { rpcUrl = DEFAULT_RPC_URL } = {}) {
  if (!deployHash) {
    throw new Error("Deploy or transaction hash is required.");
  }

  const rpcClient = new RpcClient(new HttpHandler(rpcUrl));
  try {
    const deploy = await rpcClient.getDeploy(deployHash);

    return {
      status: "found",
      transactionType: "deploy",
      deployHash,
      rpcUrl,
      explorerUrl: `https://testnet.cspr.live/deploy/${deployHash}`,
      apiVersion: deploy.apiVersion || deploy.rawJSON?.api_version || null
    };
  } catch (deployError) {
    try {
      const transaction = await rpcClient.getTransactionByTransactionHash(deployHash);
      return {
        status: "found",
        transactionType: "transaction_v1",
        deployHash,
        transactionHash: deployHash,
        rpcUrl,
        explorerUrl: `https://testnet.cspr.live/transaction/${deployHash}`,
        apiVersion: transaction.apiVersion || transaction.rawJSON?.api_version || null
      };
    } catch (transactionError) {
      throw new Error(
        `Deploy or transaction ${deployHash} was not queryable: deploy=${deployError.message}; transaction=${transactionError.message}`
      );
    }
  }
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
    `Deploy or transaction ${deployHash} was not queryable after ${timeoutMs}ms: ${lastError?.message || "unknown error"}`
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

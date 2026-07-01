import fs from "node:fs/promises";
import path from "node:path";
import sdk from "casper-js-sdk";

const DEFAULT_RPC_URL = "https://node.testnet.casper.network/rpc";
const DEFAULT_KEY_FILE = ".local/casper-testnet-key.json";
const DEFAULT_FAUCET_URL = "https://testnet.cspr.live/tools/faucet";

const {
  HttpHandler,
  KeyAlgorithm,
  PrivateKey,
  PurseIdentifier,
  RpcClient
} = sdk;

export async function getTestnetReadiness() {
  const rpcUrl = process.env.CASPER_NODE_RPC || DEFAULT_RPC_URL;
  const keyFile = process.env.CASPER_PRIVATE_KEY_FILE || DEFAULT_KEY_FILE;
  const transferMotes = BigInt(process.env.CASPER_RECEIPT_TRANSFER_MOTES || "1");
  const paymentMotes = BigInt(process.env.CASPER_RECEIPT_PAYMENT_MOTES || "100000000");
  const requiredMotes = BigInt(
    process.env.CASPER_REQUIRED_BALANCE_MOTES || String(transferMotes + paymentMotes)
  );
  const readiness = {
    rpcUrl,
    faucetUrl: DEFAULT_FAUCET_URL,
    keyFile,
    requiredMotes: requiredMotes.toString(),
    rpcStatus: "unknown",
    accountStatus: "unknown",
    readyForAnchor: false
  };

  let rpcClient;
  try {
    rpcClient = new RpcClient(new HttpHandler(rpcUrl));
    const status = await rpcClient.getStatus();
    readiness.rpcStatus = "ok";
    readiness.apiVersion = status.apiVersion;
    readiness.chain = status.chainSpecName;
    readiness.latestBlock = status.lastAddedBlockInfo?.height;
  } catch (error) {
    readiness.rpcStatus = "unavailable";
    readiness.rpcError = error.message;
    return readiness;
  }

  let privateKey;
  try {
    privateKey = await loadPrivateKey(keyFile);
    readiness.publicKeyHex = privateKey.publicKey.toHex();
  } catch (error) {
    readiness.accountStatus = "missing_key";
    readiness.keyError = error.message;
    return readiness;
  }

  try {
    const balance = await rpcClient.queryLatestBalance(
      PurseIdentifier.fromPublicKey(privateKey.publicKey)
    );
    const balanceMotes = BigInt(balance.balance.toString());
    readiness.accountStatus = "funded";
    readiness.balanceMotes = balanceMotes.toString();
    readiness.readyForAnchor =
      readiness.chain === "casper-test" && balanceMotes >= requiredMotes;
  } catch (error) {
    readiness.accountStatus = "unfunded_or_unavailable";
    readiness.balanceError = error.message;
  }

  return readiness;
}

async function loadPrivateKey(keyFile) {
  const algorithmName = process.env.CASPER_PRIVATE_KEY_ALGORITHM || "ED25519";
  const algorithm =
    algorithmName === "SECP256K1" ? KeyAlgorithm.SECP256K1 : KeyAlgorithm.ED25519;

  if (process.env.CASPER_PRIVATE_KEY_HEX) {
    return PrivateKey.fromHex(process.env.CASPER_PRIVATE_KEY_HEX, algorithm);
  }

  if (process.env.CASPER_PRIVATE_KEY_PEM) {
    return PrivateKey.fromPem(process.env.CASPER_PRIVATE_KEY_PEM, algorithm);
  }

  const filePath = path.isAbsolute(keyFile) ? keyFile : path.join(process.cwd(), keyFile);
  const keyData = JSON.parse(await fs.readFile(filePath, "utf8"));
  const fileAlgorithm =
    keyData.algorithm === "SECP256K1" ? KeyAlgorithm.SECP256K1 : KeyAlgorithm.ED25519;

  if (keyData.privateKeyHex) {
    return PrivateKey.fromHex(keyData.privateKeyHex, fileAlgorithm);
  }

  if (keyData.privateKeyPem) {
    return PrivateKey.fromPem(keyData.privateKeyPem, fileAlgorithm);
  }

  throw new Error(`No private key found in ${keyFile}.`);
}

import fs from "node:fs/promises";
import path from "node:path";

export async function anchorReceiptTransfer(receipt) {
  const { deploy, summary, rpcClient } = await prepareReceiptTransferDeploy(receipt, {
    checkBalance: process.env.CASPER_PREFLIGHT_BALANCE !== "false"
  });

  const result = await rpcClient.putDeploy(deploy);
  const deployHash = formatDeployHash(result.deployHash) || formatDeployHash(deploy.hash);

  return {
    ...summary,
    status: "submitted",
    deployHash,
    explorerUrl: `https://testnet.cspr.live/deploy/${deployHash}`,
    receipt
  };
}

export async function preflightReceiptTransfer(receipt) {
  const { summary } = await prepareReceiptTransferDeploy(receipt, {
    checkBalance: false
  });

  return {
    ...summary,
    status: "build_ready",
    deployBuild: {
      status: "ok",
      signed: true,
      broadcast: false
    }
  };
}

export async function preflightPaymentTransfer(payment, { recipientPublicKeyHex } = {}) {
  const hashSource = payment.authorizationHash || payment.txHash;
  const { memo, memoSource, memoBits } = deriveTransferMemo(hashSource);
  const transferAmount = csprToMotes(payment.amount);
  const { summary } = await prepareTransferDeploy({
    checkBalance: false,
    transferAmount,
    memo,
    memoSource,
    memoBits,
    memoDerivation: "uint64(first_16_hex_chars(authorizationHash))",
    receiptHash: null,
    recipientPublicKeyHex,
    payTo: payment.payTo,
    metadata: {
      tool: payment.tool,
      amountCSPR: payment.amount,
      authorizationHash: payment.authorizationHash,
      paymentTxHash: payment.txHash,
      nonce: payment.nonce
    }
  });

  return {
    ...summary,
    status: "build_ready",
    deployBuild: {
      status: "ok",
      signed: true,
      broadcast: false
    }
  };
}

export function deriveTransferMemo(receiptHash) {
  const hexPrefix = String(receiptHash || "").replace(/^0x/, "").slice(0, 16);
  if (!/^[0-9a-fA-F]{16}$/.test(hexPrefix)) {
    throw new Error("Receipt hash must contain at least 16 hexadecimal characters.");
  }

  return {
    memo: BigInt(`0x${hexPrefix}`).toString(),
    memoSource: hexPrefix,
    memoBits: 64
  };
}

export function csprToMotes(amountCSPR) {
  const value = String(amountCSPR ?? "").trim();
  if (!/^[0-9]+(?:\.[0-9]{1,9})?$/.test(value)) {
    throw new Error(`Invalid CSPR amount: ${amountCSPR}`);
  }

  const [whole, fraction = ""] = value.split(".");
  const fractionMotes = `${fraction}000000000`.slice(0, 9);
  return (BigInt(whole) * 1_000_000_000n + BigInt(fractionMotes)).toString();
}

async function prepareReceiptTransferDeploy(receipt, { checkBalance }) {
  const { memo, memoSource, memoBits } = deriveTransferMemo(receipt.receiptHash);
  return prepareTransferDeploy({
    checkBalance,
    transferAmount: process.env.CASPER_RECEIPT_TRANSFER_MOTES || "1",
    memo,
    memoSource,
    memoBits,
    memoDerivation: "uint64(first_16_hex_chars(receiptHash))",
    receiptHash: receipt.receiptHash,
    recipientPublicKeyHex: process.env.CASPER_RECEIPT_SINK_PUBLIC_KEY,
    metadata: { receipt }
  });
}

async function prepareTransferDeploy({
  checkBalance,
  transferAmount,
  memo,
  memoSource,
  memoBits,
  memoDerivation,
  receiptHash,
  recipientPublicKeyHex,
  payTo,
  metadata = {}
}) {
  const privateKey = await loadPrivateKey();
  const {
    HttpHandler,
    PurseIdentifier,
    RpcClient,
    makeCsprTransferDeploy
  } = await loadCasperSdk();
  const rpcUrl = process.env.CASPER_NODE_RPC || "https://node.testnet.casper.network/rpc";
  const chainName = process.env.CASPER_CHAIN_NAME || process.env.CASPER_NETWORK || "casper-test";
  const paymentAmount = process.env.CASPER_RECEIPT_PAYMENT_MOTES || "100000000";
  const recipient = resolveRecipientPublicKey({
    requested: recipientPublicKeyHex || payTo,
    fallback: privateKey.publicKey.toHex()
  });

  const rpcClient = new RpcClient(new HttpHandler(rpcUrl));

  if (checkBalance) {
    await ensureFunded({
      rpcClient,
      publicKey: privateKey.publicKey,
      PurseIdentifier,
      requiredMotes: BigInt(transferAmount) + BigInt(paymentAmount)
    });
  }

  const deploy = makeCsprTransferDeploy({
    senderPublicKeyHex: privateKey.publicKey.toHex(),
    recipientPublicKeyHex: recipient.publicKeyHex,
    transferAmount,
    paymentAmount,
    chainName,
    memo
  });

  deploy.sign(privateKey);
  deploy.validate();
  const deployHash = formatDeployHash(deploy.hash);

  return {
    deploy,
    rpcClient,
    summary: {
      mode: "real",
      status: "prepared",
      deployHash,
      network: chainName,
      rpcUrl,
      signerPublicKeyHex: privateKey.publicKey.toHex(),
      recipientPublicKeyHex: recipient.publicKeyHex,
      requestedRecipient: recipient.requested,
      recipientSource: recipient.source,
      transferAmount,
      paymentAmount,
      memo,
      memoSource,
      memoBits,
      memoDerivation,
      receiptHash,
      explorerUrl: deployHash ? `https://testnet.cspr.live/deploy/${deployHash}` : null,
      ...metadata
    }
  };
}

function resolveRecipientPublicKey({ requested, fallback }) {
  if (isCasperPublicKeyHex(requested)) {
    return {
      requested,
      publicKeyHex: requested,
      source: "configured"
    };
  }

  return {
    requested: requested || null,
    publicKeyHex: fallback,
    source: requested ? "self_fallback_invalid_pay_to" : "self_fallback_missing_pay_to"
  };
}

function isCasperPublicKeyHex(value) {
  return /^0[12][0-9a-f]{64,66}$/i.test(String(value || ""));
}

function formatDeployHash(hash) {
  if (!hash) return null;
  if (typeof hash === "string") return hash;
  if (typeof hash.toHex === "function") return hash.toHex();
  if (hash.hashBytes) return Buffer.from(hash.hashBytes).toString("hex");
  return String(hash);
}

async function loadPrivateKey() {
  const { KeyAlgorithm, PrivateKey } = await loadCasperSdk();
  const keyFile = process.env.CASPER_PRIVATE_KEY_FILE;
  const fileKey = keyFile ? await readKeyFile(keyFile) : {};
  const algorithmName = process.env.CASPER_PRIVATE_KEY_ALGORITHM || fileKey.algorithm;
  const algorithm =
    algorithmName === "SECP256K1" ? KeyAlgorithm.SECP256K1 : KeyAlgorithm.ED25519;

  const privateKeyHex = process.env.CASPER_PRIVATE_KEY_HEX || fileKey.privateKeyHex;
  const privateKeyPem = process.env.CASPER_PRIVATE_KEY_PEM || fileKey.privateKeyPem;

  if (privateKeyHex) {
    return PrivateKey.fromHex(privateKeyHex, algorithm);
  }

  if (privateKeyPem) {
    return PrivateKey.fromPem(privateKeyPem, algorithm);
  }

  throw new Error(
    "CASPER_MODE=real requires CASPER_PRIVATE_KEY_HEX, CASPER_PRIVATE_KEY_PEM, or CASPER_PRIVATE_KEY_FILE."
  );
}

async function loadCasperSdk() {
  const sdk = (await import("casper-js-sdk")).default;
  return sdk;
}

async function readKeyFile(keyFile) {
  const filePath = path.isAbsolute(keyFile) ? keyFile : path.join(process.cwd(), keyFile);
  return JSON.parse(await fs.readFile(filePath, "utf8"));
}

async function ensureFunded({ rpcClient, publicKey, PurseIdentifier, requiredMotes }) {
  try {
    const balance = await rpcClient.queryLatestBalance(PurseIdentifier.fromPublicKey(publicKey));
    const balanceMotes = BigInt(balance.balance.toString());

    if (balanceMotes < requiredMotes) {
      throw new Error(
        `Casper testnet balance is ${balanceMotes} motes, but ${requiredMotes} motes are required.`
      );
    }
  } catch (error) {
    if (error.message.startsWith("Casper testnet balance is")) {
      throw error;
    }

    throw new Error(
      `Casper testnet account is not funded or balance is unavailable for ${publicKey.toHex()}: ${error.message}`
    );
  }
}

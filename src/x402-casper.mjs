import crypto from "node:crypto";

const usedNonces = new Set();
const demoKeyPair = crypto.generateKeyPairSync("ed25519");
const demoPublicKeyPem = demoKeyPair.publicKey.export({ type: "spki", format: "pem" });

export function createPaymentRequirement({
  tool,
  assetId,
  resource,
  amount,
  description,
  expiresInMs = 5 * 60 * 1000
}) {
  const network = process.env.CASPER_NETWORK || "casper-test";
  const payTo = process.env.CASPER_TREASURY_PUBLIC_KEY || "demo-casper-treasury";

  return {
    x402Version: 1,
    error: "Payment required",
    accepts: [
      {
        scheme: "exact-casper-receipt-v1",
        network,
        asset: "CSPR",
        amount,
        payTo,
        resource,
        description,
        extra: {
          tool,
          assetId,
          nonce: crypto.randomUUID(),
          expiresAt: new Date(Date.now() + expiresInMs).toISOString()
        }
      }
    ]
  };
}

export function signDemoPayment(requirement, { agentId }) {
  const selected = requirement.accepts[0];
  const authorization = {
    x402Version: requirement.x402Version,
    scheme: selected.scheme,
    network: selected.network,
    asset: selected.asset,
    amount: selected.amount,
    payTo: selected.payTo,
    resource: selected.resource,
    tool: selected.extra.tool,
    assetId: selected.extra.assetId,
    nonce: selected.extra.nonce,
    validBefore: selected.extra.expiresAt,
    agentId,
    publicKeyPem: demoPublicKeyPem
  };
  const signature = crypto
    .sign(null, Buffer.from(canonicalJson(authorization)), demoKeyPair.privateKey)
    .toString("base64url");

  return {
    requirement,
    payload: {
      authorization,
      signature
    }
  };
}

export function verifyAndSettlePayment(paymentProof, expected) {
  const proof = parsePaymentProof(paymentProof);
  if (!proof?.requirement?.accepts?.[0] || !proof?.payload?.authorization || !proof?.payload?.signature) {
    return invalid("Malformed payment payload");
  }

  const accepted = proof.requirement.accepts[0];
  const { authorization } = proof.payload;
  const fieldChecks = [
    ["scheme", accepted.scheme],
    ["network", accepted.network],
    ["asset", accepted.asset],
    ["amount", accepted.amount],
    ["payTo", accepted.payTo],
    ["resource", accepted.resource]
  ];

  for (const [field, expectedValue] of fieldChecks) {
    if (authorization[field] !== expectedValue) {
      return invalid(`Payment authorization ${field} mismatch`);
    }
  }

  if (accepted.extra.tool !== expected.tool || authorization.tool !== expected.tool) {
    return invalid("Payment tool mismatch");
  }

  if (accepted.extra.assetId !== expected.assetId || authorization.assetId !== expected.assetId) {
    return invalid("Payment asset mismatch");
  }

  if (Number(authorization.amount) < Number(expected.minAmount)) {
    return invalid("Payment amount below requirement");
  }

  if (authorization.payTo !== expected.payTo) {
    return invalid("Payment destination mismatch");
  }

  if (authorization.validBefore !== accepted.extra.expiresAt) {
    return invalid("Payment expiry mismatch");
  }

  if (Date.parse(authorization.validBefore) <= Date.now()) {
    return invalid("Payment authorization expired");
  }

  if (usedNonces.has(authorization.nonce)) {
    return invalid("Payment nonce already used");
  }

  const publicKey = crypto.createPublicKey(authorization.publicKeyPem);
  const signatureOk = crypto.verify(
    null,
    Buffer.from(canonicalJson(authorization)),
    publicKey,
    Buffer.from(proof.payload.signature, "base64url")
  );

  if (!signatureOk) {
    return invalid("Invalid payment signature");
  }

  usedNonces.add(authorization.nonce);

  const txHash = `mock-casper-pay-${sha256(
    `${authorization.agentId}:${authorization.tool}:${authorization.nonce}:${proof.payload.signature}`
  ).slice(0, 48)}`;

  return {
    isValid: true,
    settlement: {
      status: "settled",
      tool: authorization.tool,
      amount: authorization.amount,
      currency: authorization.asset,
      network: authorization.network,
      payTo: authorization.payTo,
      agentId: authorization.agentId,
      nonce: authorization.nonce,
      txHash,
      explorerUrl: null,
      signature: proof.payload.signature,
      authorization,
      authorizationHash: sha256(canonicalJson(authorization))
    }
  };
}

export function encodePaymentHeader(requirement) {
  return Buffer.from(JSON.stringify(requirement)).toString("base64url");
}

export function encodeProofHeader(paymentProof) {
  return Buffer.from(JSON.stringify(paymentProof)).toString("base64url");
}

function parsePaymentProof(paymentProof) {
  if (!paymentProof || typeof paymentProof === "object") return paymentProof;

  try {
    return JSON.parse(paymentProof);
  } catch {
    try {
      return JSON.parse(Buffer.from(paymentProof, "base64url").toString("utf8"));
    } catch {
      return null;
    }
  }
}

function invalid(reason) {
  return {
    isValid: false,
    invalidReason: reason
  };
}

export function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }

  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

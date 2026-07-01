import sdk from "casper-js-sdk";

const { KeyAlgorithm, PrivateKey } = sdk;
const algorithmName = process.argv.includes("--secp256k1") ? "SECP256K1" : "ED25519";
const algorithm = algorithmName === "SECP256K1" ? KeyAlgorithm.SECP256K1 : KeyAlgorithm.ED25519;
const privateKey = await PrivateKey.generate(algorithm);

console.log(
  JSON.stringify(
    {
      algorithm: algorithmName,
      publicKeyHex: privateKey.publicKey.toHex(),
      privateKeyPem: privateKey.toPem(),
      nextSteps: [
        "Fund publicKeyHex from the Casper testnet faucet.",
        "Set CASPER_PRIVATE_KEY_ALGORITHM and CASPER_PRIVATE_KEY_PEM.",
        "Run npm run anchor:testnet."
      ]
    },
    null,
    2
  )
);

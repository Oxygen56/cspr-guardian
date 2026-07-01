import fs from "node:fs/promises";
import path from "node:path";
import sdk from "casper-js-sdk";

const { KeyAlgorithm, PrivateKey } = sdk;
const force = process.argv.includes("--force");
const keyFile = getArg("--out") || ".local/casper-testnet-key.json";
const instructionsFile = ".local/casper-testnet-funding.md";
const keyPath = path.resolve(process.cwd(), keyFile);
const instructionsPath = path.resolve(process.cwd(), instructionsFile);
const faucetUrl = "https://testnet.cspr.live/tools/faucet";

await fs.mkdir(path.dirname(keyPath), { recursive: true });

let keyData;
if (!force) {
  try {
    keyData = JSON.parse(await fs.readFile(keyPath, "utf8"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

if (!keyData) {
  const privateKey = await PrivateKey.generate(KeyAlgorithm.ED25519);
  keyData = {
    algorithm: "ED25519",
    publicKeyHex: privateKey.publicKey.toHex(),
    privateKeyPem: privateKey.toPem(),
    createdAt: new Date().toISOString()
  };
  await fs.writeFile(keyPath, `${JSON.stringify(keyData, null, 2)}\n`, { mode: 0o600 });
  await fs.chmod(keyPath, 0o600);
}

const instructions = `# CSPR Guardian Testnet Funding

Public key to fund:

\`\`\`
${keyData.publicKeyHex}
\`\`\`

Faucet:

${faucetUrl}

After funding, run:

\`\`\`bash
CASPER_PRIVATE_KEY_FILE=${keyFile} pnpm check:testnet
CASPER_PRIVATE_KEY_FILE=${keyFile} pnpm anchor:testnet
\`\`\`

Do not commit or upload \`${keyFile}\`.
`;

await fs.writeFile(instructionsPath, instructions);

console.log(
  JSON.stringify(
    {
      status: "ready_to_fund",
      publicKeyHex: keyData.publicKeyHex,
      keyFile,
      fundingInstructions: instructionsFile,
      faucetUrl,
      nextSteps: [
        "Open the faucet and fund publicKeyHex.",
        `Run CASPER_PRIVATE_KEY_FILE=${keyFile} pnpm check:testnet.`,
        `Run CASPER_PRIVATE_KEY_FILE=${keyFile} pnpm anchor:testnet after the balance appears.`
      ]
    },
    null,
    2
  )
);

function getArg(name) {
  const exact = process.argv.find((arg) => arg.startsWith(`${name}=`));
  if (exact) return exact.slice(name.length + 1);
  const index = process.argv.indexOf(name);
  if (index >= 0) return process.argv[index + 1];
  return null;
}

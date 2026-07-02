# Casper Testnet Anchoring

The demo now includes a real Casper adapter behind `CASPER_MODE=real`.
By default the app stays in mock mode so the dashboard can run without a funded
testnet account.

## What The Real Adapter Does

`src/casper-real-adapter.mjs` uses `casper-js-sdk@5.0.12` to:

1. Load an ED25519 or SECP256K1 private key from environment variables.
2. Build a minimal CSPR transfer deploy.
3. Put a numeric u64 memo derived from the first 16 hex characters of the
   `receiptHash` into the transfer.
4. Sign the deploy.
5. Submit it with `RpcClient.putDeploy`.
6. Return a CSPR.live testnet explorer link.

This is the fastest path to public receipt evidence. A later prize-hardening
step can replace the transfer memo with a dedicated receipt registry contract.

## Required Environment

```bash
CASPER_MODE=real
CASPER_NETWORK=casper-test
CASPER_CHAIN_NAME=casper-test
CASPER_NODE_RPC=https://node.testnet.casper.network/rpc
CASPER_PRIVATE_KEY_ALGORITHM=ED25519
CASPER_PRIVATE_KEY_HEX=<funded testnet private key>
CASPER_PRIVATE_KEY_FILE=<local-testnet-key-file>
CASPER_RECEIPT_SINK_PUBLIC_KEY=<recipient public key, optional>
CASPER_RECEIPT_TRANSFER_MOTES=2500000000
CASPER_RECEIPT_PAYMENT_MOTES=100000000
```

If `CASPER_RECEIPT_SINK_PUBLIC_KEY` is omitted, the adapter sends the receipt
transfer to the signer account itself.

## Generate And Fund A Key

Safer local workflow:

```bash
npm run prepare:testnet
```

This writes a local testnet key file with file mode `600`, writes a local
funding handoff, and prints only the public key. Do not commit or upload local
key material.

Raw keygen workflow:

```bash
npm run keygen:casper
```

Fund the printed `publicKeyHex` with Casper testnet CSPR. The current official
faucet path is through CSPR.live testnet with Casper Wallet connected.

## Check Funding And RPC Health

```bash
CASPER_PRIVATE_KEY_FILE=<local-testnet-key-file> npm run check:testnet
```

The readiness script and the dashboard Testnet Readiness panel confirm:

- RPC endpoint responds.
- Chain is `casper-test`.
- API version is visible.
- Account balance can be queried.
- Balance is at least the receipt transfer plus payment amount.
- No private key material is exposed in the API response or UI.

Dashboard API:

```text
GET /api/testnet/readiness
```

The official CSPR.live faucet page currently requires a connected wallet and a
reCAPTCHA client token, so funding still needs a human wallet action.

Current verified default RPC:

```text
https://node.testnet.casper.network/rpc
```

## Preflight The Real Deploy

Before broadcasting, build and sign a real transfer deploy locally without
submitting it:

```bash
CASPER_PRIVATE_KEY_FILE=<local-testnet-key-file> npm run preflight:testnet
```

This catches key, SDK, chain, payment, transfer, deploy-hash, and memo-format
issues before the account is funded. It writes:

- `casper-testnet-preflight.json`
- `casper-testnet-preflight.md`

During the earlier pre-funding rehearsal this reported the funding gate as
pending while still proving `deployBuild.status` equals `ok`. The final
submission now uses the funded account and published CSPR.live receipt.

Verify the generated preflight evidence:

```bash
npm run verify:preflight
```

The verifier checks that the preflight came from the real Casper adapter, the
deploy was signed but not broadcast, the deploy hash is well formed, the signer
matches the prepared public key, the memo is derived from the receipt hash, and
no private key material appears in the evidence.

Dashboard API:

```text
POST /api/testnet/preflight
```

The Testnet Readiness panel exposes the same proof through the Run Preflight
button and only returns public deploy-build metadata.

## Run A Real Anchor

```bash
CASPER_MODE=real npm start
```

Then run the dashboard scenario. The `Casper Receipt` panel should show:

- `mode: "real"`
- `status: "submitted"`
- a real `deployHash`
- an explorer URL
- `memo` equal to `uint53(first_13_hex_chars(receiptHash))`

You can also run the flow without the browser:

```bash
CASPER_PRIVATE_KEY_FILE=<local-testnet-key-file> npm run anchor:testnet
```

For final submission, run the post-funding evidence pipeline:

```bash
CASPER_PRIVATE_KEY_FILE=<local-testnet-key-file> npm run finalize:testnet
```

It checks funding, runs the real anchor, waits for the deploy to become
queryable, verifies the evidence bundle, and writes final evidence files.

Verify the returned deploy hash:

```bash
npm run check:deploy -- <deploy-hash>
```

## One-Command Final Seal

After the prepared public key is funded, run:

```bash
npm run seal:submission
```

If the account is still unfunded, this writes
`casper-final-submission-seal.json` and `.md` with the public key, faucet, and
next command. Once funded, it runs preflight verification, final real Casper
anchoring, judge proof generation, source archive rebuild, and submission pack
export in one pass.

## Export The Submission Pack

After the proof files and screenshots are current, gather the source archive,
writeup, screenshots, preflight proof, judge proof, and SHA-256 manifest:

```bash
npm run export:submission
```

This writes `cspr-guardian-final-submission/` and
`cspr-guardian-final-submission.zip` under the workspace outputs directory.
The `seal:submission` command also refreshes this pack after real deploy
evidence exists.

## Evidence Needed For DoraHacks

Before submission, open the explorer URL and confirm the deploy exists on
Casper testnet. Paste the explorer link into the DoraHacks project page and
show it in the demo video.

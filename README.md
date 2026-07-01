# CSPR Guardian

CSPR Guardian is a Casper Agentic Buildathon project aimed at the top prize:
an autonomous RWA allocation agent that discovers paid MCP tools, signs and
settles x402-style Casper payment proofs, calls risk and KYB oracles, makes a
policy decision, and anchors an audit receipt to Casper.

Public judge demo: https://oxygen56.github.io/cspr-guardian/

Walkthrough video: https://oxygen56.github.io/cspr-guardian/walkthrough.html

Funding handoff: https://oxygen56.github.io/cspr-guardian/funding.html

The current version is a local demo with a mock Casper payment/deploy adapter.
It is deliberately structured so the mock adapter can be replaced with a real
Casper testnet signer before submission.

## Why This Can Win

- It is agentic beyond a chat UI: the agent discovers a tool, handles payment,
  calls the paid service, decides, and writes an audit proof.
- It uses the buildathon primitives together: MCP-style tool discovery, x402
  payment flow, Casper network receipt, AI-agent workflow, DeFi/RWA use case.
- It creates a two-sided agent economy: paid risk data providers can expose
  MCP tools and autonomous treasury agents can pay per decision.
- It gives judges a clean demo path with visible traces, hashes, ledgers, and a
  downloadable evidence bundle.

## Run

```bash
npm start
```

Open `http://localhost:4173`.

In this Codex workspace, Node is available at:

```bash
/Users/oxygen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node src/server.mjs
```

## Test

```bash
npm test
```

Or in this workspace:

```bash
/Users/oxygen/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test
```

## Casper Testnet Commands

Generate a testnet key:

```bash
pnpm keygen:casper
```

Safer local workflow that stores the private key under `.local/` and prints
only the public key:

```bash
pnpm prepare:testnet
```

Check whether the generated account is funded and ready:

```bash
pnpm check:testnet
```

Write the highest-prize unlock report with the faucet/public-link gates and
next commands:

```bash
pnpm unlock:highest-prize
```

Open the CSPR.live faucet and copy the prepared public key to the clipboard:

```bash
pnpm fund:testnet
```

Wait for the faucet transfer, then automatically run the final seal once the
account is funded:

```bash
pnpm wait:testnet
```

Build and sign the real Casper transfer deploy without broadcasting it:

```bash
pnpm preflight:testnet
```

Build and sign real Casper transfer deploys for the four x402 tool payments
without broadcasting them:

```bash
pnpm preflight:x402
```

Verify the signed preflight evidence:

```bash
pnpm verify:preflight
```

Verify the signed x402 settlement preflight evidence:

```bash
pnpm verify:x402-preflight
```

Verify the latest local evidence bundle:

```bash
pnpm verify:evidence
```

Generate a judge proof pack with MCP, x402, replay-protection, verifier, and
prize-readiness evidence:

```bash
pnpm judge:proof
```

Export copy-ready BUIDL page fields and judge narrative:

```bash
pnpm export:buidl
```

Optional public submission links can be injected before export:

```bash
SUBMISSION_REPO_URL=https://github.com/you/cspr-guardian \
SUBMISSION_DEMO_URL=https://your-demo.example \
SUBMISSION_VIDEO_URL=https://youtu.be/your-demo \
pnpm export:buidl
```

Export the source archive, screenshots, proof files, and SHA-256 manifest into
a final submission pack:

```bash
pnpm export:submission
```

Audit the final pack, BUIDL fields, evidence verification, preflight proof,
seal state, zip exclusions, and private-key leak safety:

```bash
pnpm audit:submission
```

Check public-demo hosting readiness and generate a handoff for Render/Docker:

```bash
pnpm check:public-demo
```

Run the checks that also execute in GitHub Actions:

```bash
pnpm check:ci
```

One-command final gate after funding: if the account is still unfunded it
writes a funding handoff; if funded it preflights, finalizes real Casper
evidence, regenerates judge proof, rebuilds the source archive, and exports the
final submission pack:

```bash
pnpm seal:submission
```

After funding the printed public key on Casper testnet, `pnpm seal:submission`
is the one-command final gate. The lower-level real receipt anchor remains
available for debugging:

```bash
CASPER_PRIVATE_KEY_FILE=.local/casper-testnet-key.json pnpm anchor:testnet
```

Generate only the final post-funding evidence file without rebuilding the whole
submission pack:

```bash
CASPER_PRIVATE_KEY_FILE=.local/casper-testnet-key.json pnpm finalize:testnet
```

Check a deploy hash:

```bash
pnpm check:deploy <deploy-hash>
```

## Demo Flow

1. Choose an RWA opportunity.
2. Run the agent.
3. Watch the trace:
   - MCP tool discovery
   - Ed25519 x402-Casper payment authorization
   - paid RWA risk oracle call
   - paid KYB/sanctions oracle call
   - paid liquidity-depth oracle call
   - paid covenant-monitor call
   - autonomous allocation decision
   - Casper receipt anchoring
4. Show Testnet Readiness: RPC health, prepared public key, funding status, and
   whether the account is ready for a real anchor.
5. Show the receipt hash, deploy hash, provider ledger, and run history.
6. Open Evidence Verification and show every signature/hash check passing.
7. Download the Evidence Bundle JSON and point to the x402 proofs, report
   hashes, decision hash, receipt hash, and evidence hash.

## What Is Implemented

- Local agent orchestration.
- MCP-like tool discovery endpoint.
- x402-style HTTP 402 payment challenge with `PAYMENT-REQUIRED` headers.
- Ed25519 signed payment proofs with expiry and nonce replay protection.
- Four paid tools: RWA risk scoring, KYB/sanctions policy screening,
  liquidity-depth analysis, and covenant monitoring.
- Provider revenue accounting and persisted run history.
- Prize Readiness endpoint at `/api/prize-readiness` that maps evidence to
  buildathon-winning signals and keeps the real Casper deploy as the final gate.
- Judge Proof Pack endpoint at `/api/judge-proof` and dashboard panel for live
  402 challenge, signed authorization, replay rejection, and verifier evidence.
- Testnet preflight endpoint at `/api/testnet/preflight` and dashboard action
  that builds and signs the real deploy without broadcasting.
- Testnet preflight verifier at `pnpm verify:preflight` that checks the real
  deploy adapter, signed-but-not-broadcast state, deploy hash, signer, memo
  derivation, and private-key leak safety.
- x402 settlement preflight at `pnpm preflight:x402` and
  `pnpm verify:x402-preflight` that builds signed-but-not-broadcast Casper
  transfer deploys for every paid tool payment, converts CSPR to motes, derives
  transfer memos from x402 authorization hashes, and proves no private key
  material is exposed.
- Downloadable evidence bundle at `/api/evidence/latest` with signed x402
  proofs, report hashes, decision hash, receipt hash, and an evidence hash.
- Evidence verifier at `/api/evidence/verify` and `pnpm verify:evidence` that
  checks x402 authorization signatures, authorization hashes, payment hashes,
  report hashes, decision hash, receipt hash, evidence hash, and revenue totals.
- Judge proof pack script at `pnpm judge:proof` that generates a machine-readable
  and Markdown proof bundle for reviewers.
- Submission pack exporter at `pnpm export:submission` that gathers the source
  archive, screenshots, judge proof, preflight proof, writeups, and SHA-256
  manifest under the workspace outputs directory.
- BUIDL submission exporter at `pnpm export:buidl` that creates copy-ready
  DoraHacks/ETHGlobal fields, proof summary, artifact list, demo flow, and
  optional public repo/demo/video URLs from environment variables.
- Final submission sealer at `pnpm seal:submission` that turns a funded
  testnet account into final Casper evidence and a refreshed submission pack in
  one command, or writes a funding handoff if the account is still unfunded.
- Highest-prize unlock report at `pnpm unlock:highest-prize` that records the
  faucet/wallet/reCAPTCHA funding gate, public repo/demo/video link gate, and
  exact commands to run once the account is funded.
- Submission audit at `pnpm audit:submission` and `/api/submission/audit` that
  checks evidence verification, preflight verification, final pack integrity,
  BUIDL fields, public repo/demo/video links, final seal state, source zip
  exclusions, final-pack self-reference safety, and private-key leak safety.
- Public demo readiness at `pnpm check:public-demo` with Dockerfile,
  `.dockerignore`, Render blueprint, `/api/health`, and a generated hosting
  handoff.
- CI readiness at `pnpm check:ci` plus `.github/workflows/submission-readiness.yml`
  for public repo verification.
- Dashboard Final Seal panel and `/api/submission/seal` endpoint that expose
  the current submission gate, package hash, funding status, and next command.
- Dashboard Submission Audit panel that shows pass/blocked/fail status for the
  whole submission package.
- Real deploy preflight script at `pnpm preflight:testnet` that builds and signs
  the Casper transfer deploy without broadcasting.
- Autonomous RWA scoring and allocation policy.
- Mock Casper payment and receipt deploy hashes.
- Dashboard showing trace, decision, revenue, KYB result, receipt JSON,
  provider ledger, run history, Prize Readiness, Final Seal, Testnet Readiness,
  Evidence Bundle JSON, and Evidence Verification.

## Final Submission TODO

- Switch `CASPER_MODE=mock` to `CASPER_MODE=real` for final testnet evidence.
- Use the included `CASPER_MODE=real` adapter with a funded testnet key.
- Run `pnpm preflight:testnet` and confirm deploy build is `ok`.
- Run `pnpm verify:preflight` and confirm every preflight check passes.
- Run `pnpm preflight:x402` and `pnpm verify:x402-preflight` to prove each
  x402 paid tool has a signed Casper settlement transfer path.
- Run `pnpm check:public-demo`; before publishing links, the only failed item
  should be `public_links_configured`.
- Run `pnpm check:ci` and confirm local CI readiness passes.
- Set `SUBMISSION_REPO_URL`, `SUBMISSION_DEMO_URL`, and
  `SUBMISSION_VIDEO_URL`, then run `pnpm export:buidl`.
- Run `pnpm export:submission` and upload the generated submission pack.
- Run `pnpm audit:submission` and confirm the only blocked items, before
  funding and public-link upload, are `highest_prize_gate` and
  `public_submission_fields`.
- After funding, run `pnpm seal:submission` to regenerate final evidence, judge
  proof, source zip, submission pack, and final seal in one pass.
- Run `pnpm audit:submission` again and confirm it says
  `ready_for_highest_prize_submission`.
- Record a 90-second video showing the full paid-agent flow.
- Submit the repo, live demo, and DoraHacks writeup.

See `docs/casper-testnet-anchoring.md` for the exact environment variables.

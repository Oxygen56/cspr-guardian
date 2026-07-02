# CSPR Guardian

CSPR Guardian is a Casper Agentic Buildathon project aimed at the top prize:
an autonomous RWA allocation agent that discovers paid MCP tools, signs and
settles x402-style Casper payment proofs, calls risk and KYB oracles, makes a
policy decision, and anchors an audit receipt to Casper.

Public judge demo: https://oxygen56.github.io/cspr-guardian/

Judge scorecard: https://oxygen56.github.io/cspr-guardian/judge-scorecard.html

Walkthrough video: https://oxygen56.github.io/cspr-guardian/walkthrough.html

Judge proof room: https://oxygen56.github.io/cspr-guardian/proof-room.html

Public proof manifest: https://oxygen56.github.io/cspr-guardian/proof/proof-manifest.md

Scenario matrix: https://oxygen56.github.io/cspr-guardian/proof/casper-scenario-matrix.md

Competitive positioning: https://oxygen56.github.io/cspr-guardian/proof/competitive-positioning.md

Funding handoff: https://oxygen56.github.io/cspr-guardian/funding.html

Final Casper receipt: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

Current status: `100/100` prize readiness, real Casper testnet receipt
published, public demo live, source repo public, 64-second walkthrough live,
and `ready_for_highest_prize_submission` audit status.

## Why This Can Win

- It is agentic beyond a chat UI: the agent discovers tools, handles payment,
  calls paid services, decides, and writes audit proof.
- It uses the buildathon primitives together: MCP-style tool discovery, x402
  payment flow, Casper network receipt, AI-agent workflow, DeFi/RWA use case.
- It creates a two-sided agent economy: paid risk data providers can expose
  MCP tools and autonomous treasury agents can pay per decision.
- It gives judges a clean demo path with visible traces, hashes, ledgers, and a
  downloadable evidence bundle.
- It has public proof beyond screenshots: `24/24` tests, `34/34` evidence
  verification, `14/14` submission audit, signed deploy preflight, and a real
  CSPR.live receipt.
- It includes a concise competitive positioning brief that frames visible
  buildathon categories without relying on unsupported claims about other teams.
- It gives judges a one-page scorecard that maps the project to technical
  execution, Casper integration, agent workflow, innovation, and judge UX.
- It proves repeatability across three RWA asset types with distinct policy
  outcomes, not only one invoice-finance happy path.

## Run

```bash
npm start
```

Open `http://localhost:4173`.

## Test

```bash
npm test
```

## Casper Testnet Commands

All local commands below use `npm`; no global `pnpm` install is required.

Generate a testnet key:

```bash
npm run keygen:casper
```

Safer local workflow that stores the private key under `.local/` and prints
only the public key:

```bash
npm run prepare:testnet
```

Check whether the generated account is funded and ready:

```bash
npm run check:testnet
```

Write the highest-prize unlock report with the faucet/public-link gates and
next commands:

```bash
npm run unlock:highest-prize
```

Open the CSPR.live faucet and copy the prepared public key to the clipboard:

```bash
npm run fund:testnet
```

Wait for the faucet transfer, then automatically run the final seal once the
account is funded:

```bash
npm run wait:testnet
```

Build and sign the real Casper transfer deploy without broadcasting it:

```bash
npm run preflight:testnet
```

Build and sign real Casper transfer deploys for the four x402 tool payments
without broadcasting them:

```bash
npm run preflight:x402
```

Verify the signed preflight evidence:

```bash
npm run verify:preflight
```

Verify the signed x402 settlement preflight evidence:

```bash
npm run verify:x402-preflight
```

Verify the latest local evidence bundle:

```bash
npm run verify:evidence
```

Generate a judge proof pack with MCP, x402, replay-protection, verifier, and
prize-readiness evidence:

```bash
npm run judge:proof
```

Export copy-ready BUIDL page fields and judge narrative:

```bash
npm run export:buidl
```

Optional public submission links can be injected before export:

```bash
SUBMISSION_REPO_URL=https://github.com/you/cspr-guardian \
SUBMISSION_DEMO_URL=https://your-demo.example \
SUBMISSION_VIDEO_URL=https://youtu.be/your-demo \
npm run export:buidl
```

Export the source archive, screenshots, proof files, and SHA-256 manifest into
a final submission pack:

```bash
npm run export:submission
```

Audit the final pack, BUIDL fields, evidence verification, preflight proof,
seal state, zip exclusions, and private-key leak safety:

```bash
npm run audit:submission
```

Check public-demo hosting readiness and generate a handoff for Render/Docker:

```bash
npm run check:public-demo
```

Run the checks that also execute in GitHub Actions:

```bash
npm run check:ci
```

One-command final pack refresh: the funded account preflights, finalizes real
Casper evidence, regenerates judge proof, rebuilds the source archive, and
exports the final submission pack:

```bash
npm run seal:submission
```

The prepared public key is now funded on Casper testnet, so
`npm run seal:submission` is the one-command final pack refresh. The lower-level
real receipt anchor remains available for debugging and uses the unpublished
local testnet key file by default:

```bash
npm run anchor:testnet
```

Generate only the final post-funding evidence file without rebuilding the whole
submission pack. This also uses the unpublished local testnet key file by
default:

```bash
npm run finalize:testnet
```

Check a deploy hash:

```bash
npm run check:deploy -- <deploy-hash>
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
- Testnet preflight verifier at `npm run verify:preflight` that checks the real
  deploy adapter, signed-but-not-broadcast state, deploy hash, signer, memo
  derivation, and private-key leak safety.
- x402 settlement preflight at `npm run preflight:x402` and
  `npm run verify:x402-preflight` that builds signed-but-not-broadcast Casper
  transfer deploys for every paid tool payment, converts CSPR to motes, derives
  transfer memos from x402 authorization hashes, and proves no private key
  material is exposed.
- Downloadable evidence bundle at `/api/evidence/latest` with signed x402
  proofs, report hashes, decision hash, receipt hash, and an evidence hash.
- Evidence verifier at `/api/evidence/verify` and `npm run verify:evidence` that
  checks x402 authorization signatures, authorization hashes, payment hashes,
  report hashes, decision hash, receipt hash, evidence hash, and revenue totals.
- Judge proof pack script at `npm run judge:proof` that generates a machine-readable
  and Markdown proof bundle for reviewers.
- Submission pack exporter at `npm run export:submission` that gathers the source
  archive, screenshots, judge proof, preflight proof, writeups, and SHA-256
  manifest under the workspace outputs directory.
- BUIDL submission exporter at `npm run export:buidl` that creates copy-ready
  DoraHacks/ETHGlobal fields, proof summary, artifact list, demo flow, and
  optional public repo/demo/video URLs from environment variables.
- Final submission sealer at `npm run seal:submission` that turns a funded
  testnet account into final Casper evidence and a refreshed submission pack in
  one command, or writes a funding handoff if the account is still unfunded.
- Highest-prize unlock report at `npm run unlock:highest-prize` that records the
  faucet/wallet/reCAPTCHA funding gate, public repo/demo/video link gate, and
  exact commands to run once the account is funded.
- Submission audit at `npm run audit:submission` and `/api/submission/audit` that
  checks evidence verification, preflight verification, final pack integrity,
  BUIDL fields, public repo/demo/video links, final seal state, source zip
  exclusions, final-pack self-reference safety, and private-key leak safety.
- Public demo readiness at `npm run check:public-demo` with Dockerfile,
  `.dockerignore`, Render blueprint, `/api/health`, and a generated hosting
  handoff.
- CI readiness at `npm run check:ci` plus `.github/workflows/submission-readiness.yml`
  for public repo verification.
- Dashboard Final Seal panel and `/api/submission/seal` endpoint that expose
  the current submission gate, package hash, funding status, and next command.
- Dashboard Submission Audit panel that shows pass/blocked/fail status for the
  whole submission package.
- Real deploy preflight script at `npm run preflight:testnet` that builds and signs
  the Casper transfer deploy without broadcasting.
- Autonomous RWA scoring and allocation policy.
- Demo-mode Casper payment hashes for repeatable local runs, plus final real
  Casper testnet receipt evidence for the submitted build.
- Dashboard showing trace, decision, revenue, KYB result, receipt JSON,
  provider ledger, run history, Prize Readiness, Final Seal, Testnet Readiness,
  Evidence Bundle JSON, and Evidence Verification.

## Final Submission Verification

These commands refresh or verify the submitted state:

- `npm run seal:submission` refreshes final evidence, judge proof, source zip,
  submission pack, and final seal in one pass.
- `npm run audit:submission` confirms
  `ready_for_highest_prize_submission`.
- `npm run check:public-demo` confirms public demo links and hosting readiness.
- `npm run check:ci` mirrors the public GitHub Actions readiness workflow.
- `npm test` confirms the local test suite.

The final public materials are the repo, hosted judge demo, 64-second
walkthrough, proof room, CSPR.live transaction, proof screenshots, generated
BUIDL fields, and final submission pack.

See `docs/casper-testnet-anchoring.md` for the exact environment variables.

# CSPR Guardian

## One-Liner

CSPR Guardian turns Casper into the payment and audit layer for autonomous RWA
treasury agents.

## 30-Second Judge Summary

CSPR Guardian is built to be judged as a complete Casper agent economy demo,
not as a standalone chatbot or a single paid endpoint. An autonomous treasury
agent discovers paid MCP-style tools, receives x402-style payment requirements,
signs replay-safe Ed25519 authorizations, buys four RWA intelligence products,
makes a constrained allocation decision, records provider revenue, and anchors
the final evidence trail to a real Casper testnet transaction.

Final proof:

- Review readiness: `100/100`, final review gate cleared.
- Judge proof pack: `10/10` core assertions passing.
- Evidence verifier: `34/34` checks passing.
- Submission audit: `15/15` checks passing, `0` blocked, `0` failed.
- x402 settlement anchors: four Casper testnet transactions tied to signed
  x402 authorizations.
- Architecture map: one-screen trust-boundary view for discovery, HTTP 402,
  replay-safe payment, settlement anchors, policy decision, verifier, and
  secret handling.
- Reality boundary and judge FAQ: clear separation between real testnet
  evidence, reproducible sample provider data, and production requirements.
- Browser proof verifier: judges can recompute every public proof artifact
  SHA-256 directly in the browser.
- Judge proof room:
  `https://oxygen56.github.io/cspr-guardian/proof-room.html`.
- Judge scorecard:
  `https://oxygen56.github.io/cspr-guardian/judge-scorecard.html`.
- Architecture and threat model:
  `https://oxygen56.github.io/cspr-guardian/architecture.html`.
- Reality boundary and judge FAQ:
  `https://oxygen56.github.io/cspr-guardian/judge-faq.html`.
- Browser proof verifier:
  `https://oxygen56.github.io/cspr-guardian/verifier.html`.
- Competitive positioning:
  `https://oxygen56.github.io/cspr-guardian/proof/competitive-positioning.md`.
- Repeatable scenario matrix:
  `https://oxygen56.github.io/cspr-guardian/proof/casper-scenario-matrix.md`.
- x402 settlement batch:
  `https://oxygen56.github.io/cspr-guardian/proof/casper-x402-settlement-batch.md`.
- Casper receipt:
  `https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a`.

## Problem

Autonomous agents can source DeFi/RWA opportunities, but they lack a reliable
way to pay specialized services, prove which data they used, and leave an
auditable record for humans and DAOs.

## Solution

CSPR Guardian is an agent workflow that:

1. Discovers a paid RWA risk oracle through MCP-style tool metadata.
2. Receives x402-style Casper payment requirements.
3. Signs Ed25519 payment proofs with expiry and nonce replay protection.
4. Calls paid RWA risk, KYB/sanctions, liquidity-depth, and covenant-monitoring oracles.
5. Makes an allocation decision under a safety policy.
6. Records provider revenue and run history.
7. Exports a downloadable evidence bundle with x402 proofs and receipt hashes.
8. Anchors a decision receipt to Casper.

## Why Casper

Casper is used as the trust layer for agent commerce: payments, receipt hashes,
and decision provenance can be verified without trusting the app server. This
is especially important for RWA and treasury workflows where every automated
decision needs an audit trail.

## Why This Should Rank Above Typical Entries

Many buildathon projects can show one part of the stack: an x402 API, an MCP
tool list, a DeFi assistant, or a RWA dashboard. CSPR Guardian combines those
signals into a single verifiable workflow:

- It is agentic end to end: discover, pay, analyze, decide, prove.
- It uses four paid RWA intelligence tools, not one isolated endpoint.
- It publishes four Casper testnet settlement-anchor transactions for the
  signed x402 tool payments.
- It has replay protection and independent recomputation of signatures, hashes,
  receipts, and provider revenue.
- It links business value to Casper: every RWA allocation can be audited by a
  human, DAO, or compliance reviewer.
- It includes a public Casper testnet receipt, public demo, public source repo,
  walkthrough video, proof pack, screenshots, and final audit output.

## What Is Working

- Hosted judge demo.
- Public source repository.
- 64-second final walkthrough video.
- Real Casper testnet receipt.
- Local agent orchestration.
- MCP-like tool discovery endpoint.
- x402-style payment-required oracle with `PAYMENT-REQUIRED` headers.
- Signed payment proofs with nonce replay protection.
- Autonomous RWA scoring and allocation policy.
- Paid KYB/sanctions screening tool.
- Paid liquidity-depth oracle.
- Paid covenant-monitoring oracle.
- Provider revenue accounting and persisted run history.
- Downloadable Evidence Bundle JSON with x402 proofs, report hashes, decision
  hash, receipt hash, and evidence hash.
- Evidence verifier that recomputes x402 signatures, authorization hashes,
  payment hashes, report hashes, decision hash, receipt hash, evidence hash,
  and revenue totals.
- Testnet readiness scripts for key generation, RPC health, balance checking,
  deploy preflight, x402 settlement preflight, and real receipt anchoring.
- Judge evidence map that ties every review signal to a visible artifact.
- Real Casper testnet transaction published on CSPR.live.
- Dashboard showing the full trace.
- Final submission pack with SHA-256 manifest and private-key leak checks.

## Judge Path

1. Open the hosted judge demo and show `100/100` review readiness.
2. Open the Judge Scorecard for the one-minute rubric path.
3. Watch the 64-second walkthrough for the full proof path.
4. Open the real CSPR.live transaction.
5. Inspect the Judge Proof Pack for MCP discovery, HTTP 402, signed payment,
   replay rejection, agentic RWA run, independent verification, and final gate.
6. Open the x402 Settlement Batch to show four public Casper testnet anchors.
7. Open the Scenario Matrix to show repeatable outcomes across three RWA assets.
8. Run the Browser Proof Verifier to recompute the public proof manifest hashes.
9. Open the Reality Boundary FAQ to show what is real, what is testnet
   prototype scope, and what production work remains.
10. Inspect Evidence Verification for `34/34` recomputed checks.
11. Inspect Submission Audit for final submission checks.

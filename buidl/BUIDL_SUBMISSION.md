# CSPR Guardian BUIDL Submission

## One-Line Pitch

CSPR Guardian is a Casper-native agentic RWA treasury workflow where an
autonomous agent discovers paid intelligence tools, receives x402-style payment
requirements, signs replay-safe Casper payment authorizations, buys RWA risk
signals, makes a constrained allocation decision, records provider revenue, and
anchors the final evidence on Casper testnet.

## Problem

Autonomous treasury agents cannot safely allocate to real-world assets if their
inputs are unaudited, unpaid, or disconnected from the final decision. A judge,
auditor, allocator, or counterparty needs to know:

- what risk, KYB, liquidity, and covenant intelligence was used;
- whether the agent actually paid for the intelligence it consumed;
- whether payment authorizations can be replayed;
- how the allocation decision was derived;
- which Casper receipt anchors the final evidence.

Most agent demos show either reasoning or a transaction. CSPR Guardian shows the
full money-data-decision-receipt path.

## Solution

CSPR Guardian runs a repeatable paid-agent workflow:

1. The agent discovers MCP-style paid RWA intelligence tools.
2. Each paid tool returns HTTP 402-style payment requirements.
3. The agent signs Ed25519 x402-Casper payment authorizations with nonce and
   expiry replay protection.
4. The agent buys four intelligence products: risk, KYB/sanctions, liquidity
   depth, and covenant monitoring.
5. The agent applies policy constraints and produces a deterministic allocation
   decision.
6. Provider revenue is recorded for the paid-tool side of the marketplace.
7. Four x402 settlement-anchor transactions are published on Casper testnet.
8. The final decision evidence is anchored with a real CSPR.live receipt.
9. Public proof artifacts can be recomputed by the browser verifier.

## Demo

- Judge decision brief: https://oxygen56.github.io/cspr-guardian/judge-decision.html
- Live demo: https://oxygen56.github.io/cspr-guardian/
- Walkthrough: https://oxygen56.github.io/cspr-guardian/walkthrough.html
- Proof room: https://oxygen56.github.io/cspr-guardian/proof-room.html
- Browser verifier: https://oxygen56.github.io/cspr-guardian/verifier.html
- Source: https://github.com/Oxygen56/cspr-guardian
- Final Casper receipt: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

Local run:

```bash
npm install
npm start
npm test
```

## Technical Architecture

- `public/` and `docs/`: judge-facing dashboard, proof room, walkthrough, scorecard,
  architecture map, FAQ, and browser verifier.
- `src/agent.mjs`: autonomous RWA workflow, MCP-style tool discovery, paid tool
  calls, provider ledger, policy decision, and evidence bundle generation.
- `src/x402-casper.mjs`: signed x402-Casper payment proof, nonce replay checks,
  hash derivation, and receipt data.
- `src/casper-real-adapter.mjs`: Casper SDK path for testnet evidence.
- `src/evidence-verifier.mjs`: independent recomputation of signatures, hashes,
  revenue totals, reports, decision hash, receipt hash, and evidence hash.
- `src/submission-audit.mjs`: final BUIDL audit for public links, pack contents,
  leak safety, verifier status, and submission readiness.
- `scripts/`: reproducible commands for proof generation, x402 settlement,
  testnet preflight, submission pack export, and public proof publishing.

## Evidence

- Review readiness: `100/100`, final review gate cleared.
- Tests: `25/25` passing.
- Evidence verifier: `34/34` checks passing.
- Submission audit: `15/15` checks passing, `0` blocked, `0` failed.
- Browser verifier: `32/32` public proof artifacts verified, `0` failed.
- x402 settlement anchors: four Casper testnet transactions tied to signed
  x402 authorizations.
- Final CSPR.live receipt:
  `7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a`.
- Reality boundary: deterministic sample provider data is separated from real
  Casper testnet evidence and production requirements.

## Judging Rubric Mapping

| Rubric area | CSPR Guardian evidence |
| --- | --- |
| Technical implementation | End-to-end workflow, test suite, evidence verifier, submission audit, x402 settlement anchors, real receipt, proof manifest. |
| Agentic AI integration | Agent discovers tools, pays, consumes intelligence, applies policy, records revenue, and exports proof without a manual decision step. |
| Casper ecosystem fit | Casper is used for x402-style payment evidence, settlement anchors, signed preflight, CSPR.live final receipt, and machine-to-machine commerce framing. |
| RWA/DeFi applicability | Risk, KYB/sanctions, liquidity, and covenant intelligence gate treasury allocation before capital movement. |
| Innovation | Two-sided paid intelligence market for autonomous treasury agents, with replay-safe payments and independently verifiable decision evidence. |
| Usability and review experience | Judge decision page, scorecard, architecture map, proof room, browser verifier, FAQ, walkthrough, copy-ready links, and public proof manifest. |

## Competitive Positioning

The strongest public competitors tend to have one sharp primitive: oracle,
coverage, toolkit, RWA settlement, governance, or x402 payment routing. CSPR
Guardian's advantage is the complete commercial loop around those primitives:
paid access, provider revenue, diligence reports, constrained decision,
settlement anchors, final receipt, and browser-recomputable proof.

Final-review advantage:
https://oxygen56.github.io/cspr-guardian/proof/final-review-advantage.md

## Scope Boundary

CSPR Guardian is a Casper testnet buildathon prototype, not a mainnet custody or
investment product. Production use would require licensed data providers,
custody controls, compliance review, monitoring, incident response, and mainnet
settlement policy. The submission is explicit about this boundary so judges can
trust the evidence it does claim.

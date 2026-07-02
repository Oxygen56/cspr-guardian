# Judge Scorecard

Snapshot date: 2026-07-02.

This is the fastest scoring path for CSPR Guardian. It maps the project to the
signals a Casper Agentic Buildathon judge can verify in minutes.

## Executive Score

| Signal | Current proof |
| --- | --- |
| Prize readiness | `100/100`, highest-prize gate cleared |
| Submission audit | `14/14` checks passed, `0` blocked, `0` failed |
| Evidence verifier | `34/34` recomputed checks passed |
| x402 settlement preflight | `28/28` signed transfer checks passed |
| Paid tools | 4 RWA intelligence tools |
| Repeatable scenarios | 3 RWA assets with different policy outcomes |
| Provider revenue | `0.62 CSPR` per full run |
| Public proof artifacts | SHA-256 manifest in the public proof room |
| Casper receipt | Real CSPR.live testnet transaction |

## Rubric Matrix

| Rubric area | Why CSPR Guardian should score high | Judge evidence |
| --- | --- | --- |
| Technical execution | It has tests, audit, evidence verification, signed Casper deploy preflight, x402 settlement preflight, and leak checks. | `npm test`, `casper-submission-audit.md`, `casper-judge-proof-pack.md` |
| Casper integration | Casper is used for public receipt anchoring, signed preflight, x402-style payment authorization, memo derivation, and explorer-verifiable evidence. | CSPR.live transaction, `casper-final-testnet-evidence.md`, `casper-testnet-preflight.md` |
| Agentic AI workflow | The agent discovers tools, pays for intelligence, gathers RWA signals, applies policy, decides, records revenue, and exports proof. | Dashboard, walkthrough, evidence bundle, judge proof pack |
| Repeatability | The same paid RWA intelligence stack handles treasury, invoice-finance, and trade-credit scenarios. | `casper-scenario-matrix.md`, `casper-scenario-matrix.json` |
| Innovation | The project is not a chatbot or isolated endpoint; it demonstrates a two-sided paid intelligence market for autonomous treasury agents. | Competitive positioning brief and provider ledger |
| Usability for judges | The public site exposes a 64-second walkthrough, proof room, scorecard, final audit, manifest, and copy-ready BUIDL fields. | `judge-scorecard.html`, `proof-room.html`, `proof-manifest.md` |

## Differentiation Against Visible Categories

| Visible buildathon category | CSPR Guardian edge |
| --- | --- |
| DeFi assistant or conversational agent | Adds paid tool discovery, x402 payment authorization, replay protection, RWA policy, and audit receipts. |
| Spend guard or payment guard | Goes beyond detection/control by running the paid service workflow and recording provider revenue. |
| Governance or sentinel dashboard | Proves decision provenance: what data was bought, which policy ran, and what on-chain receipt anchors the result. |
| RWA escrow or milestone cockpit | Adds paid risk, KYB/sanctions, liquidity, and covenant intelligence before capital allocation. |
| Multi-agent economy demo | Narrows the economy to a judge-verifiable commercial loop with revenue, signatures, hashes, and a Casper receipt. |

## One-Minute Judge Path

1. Open the hosted demo and confirm `100/100`.
2. Watch the 64-second walkthrough.
3. Open the real CSPR.live receipt.
4. Open the proof room and read the submission audit.
5. Check the SHA-256 proof manifest.
6. Open the repeatable scenario matrix.

## Public Links

- Judge demo: https://oxygen56.github.io/cspr-guardian/
- Judge scorecard: https://oxygen56.github.io/cspr-guardian/judge-scorecard.html
- Proof room: https://oxygen56.github.io/cspr-guardian/proof-room.html
- Proof manifest: https://oxygen56.github.io/cspr-guardian/proof/proof-manifest.md
- Scenario matrix: https://oxygen56.github.io/cspr-guardian/proof/casper-scenario-matrix.md
- Competitive positioning: https://oxygen56.github.io/cspr-guardian/proof/competitive-positioning.md
- Casper receipt: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

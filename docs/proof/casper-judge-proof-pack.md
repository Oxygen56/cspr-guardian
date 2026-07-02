# Judge Proof Pack

Generated: 2026-07-02T12:38:41.325Z

Project: CSPR Guardian

Prize readiness: 100/100 (highest-prize-ready)

## Assertions

| Check | Status | Evidence |
| --- | --- | --- |
| mcp-tool-discovery | pass | 7 tools exposed, including four x402-Casper paid tools |
| payment-required | pass | Risk oracle returns HTTP 402 plus PAYMENT-REQUIRED before payment |
| signed-payment | pass | Ed25519 signed authorization unlocks the paid oracle |
| nonce-replay-protection | pass | Reusing the same signed payment proof is rejected |
| agentic-rwa-run | pass | Agent buys four signals, decides under policy, and records provider revenue |
| independent-verifier | pass | 34/34 checks passed |
| real-deploy-preflight | pass | 11/11 real deploy preflight checks passed |
| x402-settlement-preflight | pass | 28/28 signed x402 settlement transfer checks passed |
| casper-final-gate | pass | Real CSPR.live deploy evidence is present |

## x402 Payment Flow

- Before payment: oracle returned 402 with PAYMENT-REQUIRED header.
- Signed authorization hash: bc87d8857f7376b8def9dd0a75f8aa29a1d8ef653c117e0ed7fc178e7a9ef5d2
- Demo settlement hash: mock-casper-pay-867574cc06a405062f3458d8c17acef88e6f35e38df3a88d
- Replay attempt: 402, Payment nonce already used

## MCP Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
| rwa.risk_score | 0.25 CSPR | x402-casper |
| rwa.kyb_screen | 0.10 CSPR | x402-casper |
| rwa.liquidity_depth | 0.15 CSPR | x402-casper |
| rwa.covenant_monitor | 0.12 CSPR | x402-casper |

## Agent Run

- Run id: run-1e288ff3-5260-45f3-bd60-f018cf4a4216
- Decision: approve
- Approved amount: $207,452
- Provider revenue: 0.62 CSPR
- Receipt hash: 119f5f133635e35ca2b9d28d527c8fb4b1ef8b92cacc0bce6e1e8b1ff8ef7d1c
- Demo anchor mode: mock
- Demo explorer URL: not used for final judging
- Final Casper receipt: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

## Evidence Verification

- Status: verified
- Checks: 34/34
- Signature checks: 4
- Hash checks: 17
- Evidence hash: dd08c70eb8b809a2d96f90d1409f761ac37fb0baaedda7ab683424259409168a

## Prize Readiness Criteria

| Criterion | Status | Value | Weight |
| --- | --- | --- | --- |
| x402 paid tools | pass | 4/4 signed proofs | 20 |
| MCP tool discovery | pass | 7 discoverable tools | 15 |
| Agentic RWA workflow | pass | 0.62 CSPR/run | 20 |
| Independent verifier | pass | 34/34 | 15 |
| Casper receipt | pass | real testnet deploy | 20 |
| Submission assets | pass | screenshots ready | 10 |

## Current Final Gate

The highest-prize gate is cleared by a real Casper testnet receipt.

- Explorer URL: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a
- Final receipt hash: 23fd7a0e66756456960cc2522f2a5dbc0a3ae09b6d1b0ba4e285550e50d4fe16
- Public key: 011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
- Account status: funded
- Ready for anchor: true
- Deploy preflight verification: verified (11/11)

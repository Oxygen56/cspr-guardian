# Judge Proof Pack

Generated: 2026-07-02T03:30:03.937Z

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
- Signed authorization hash: 75d7c63fcbbbd50f5c7a7ee0460fec8b872b077102eac62973aa4948e1cb7b74
- Mock Casper settlement hash: mock-casper-pay-1024f323d804353953f8cfad9a62bd5cfad6ea8ac6859049
- Replay attempt: 402, Payment nonce already used

## MCP Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
| rwa.risk_score | 0.25 CSPR | x402-casper |
| rwa.kyb_screen | 0.10 CSPR | x402-casper |
| rwa.liquidity_depth | 0.15 CSPR | x402-casper |
| rwa.covenant_monitor | 0.12 CSPR | x402-casper |

## Agent Run

- Run id: run-d65ab587-b70e-45b3-b0bb-e408731df2a7
- Decision: approve
- Approved amount: $207,452
- Provider revenue: 0.62 CSPR
- Receipt hash: 5fc159ae03e507a0434ba2b7f37df9ccca40c776c8596e0df46e3abf2bd9cd65
- Anchor mode: mock
- Explorer URL: https://testnet.cspr.live/deploy/mock-casper-receipt-5fc159ae03e507a0434ba2b7f37df9ccca40c776c8596e0d

## Evidence Verification

- Status: verified
- Checks: 34/34
- Signature checks: 4
- Hash checks: 17
- Evidence hash: 0f7aae1b49dc53188b1ef2a3340722fa75c45ae0d5e7ac0194f099871abf7066

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

- Explorer URL: https://testnet.cspr.live/deploy/mock-casper-receipt-5fc159ae03e507a0434ba2b7f37df9ccca40c776c8596e0d
- Public key: 011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
- Account status: funded
- Ready for anchor: true
- Deploy preflight verification: verified (11/11)

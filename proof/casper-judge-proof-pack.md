# Judge Proof Pack

Generated: 2026-07-02T20:04:09.381Z

Project: CSPR Guardian

Review readiness: 100/100 (final-review-ready)

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
| x402-real-settlement | pass | 34/34 real x402 settlement-anchor checks passed |
| casper-final-gate | pass | Real CSPR.live deploy evidence is present |

## x402 Payment Flow

- Before payment: oracle returned 402 with PAYMENT-REQUIRED header.
- Signed authorization hash: f8643e651c10fe40e5a454f3e0bbe0ac74d97dcf7c3082ce75f8058b94e5cbe8
- Demo settlement hash: mock-casper-pay-e183b184d75b225371411a0c63dd312932c13ef64afd52d8
- Replay attempt: 402, Payment nonce already used
- Real x402 settlement anchors: verified (34/34)

## MCP Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
| rwa.risk_score | 0.25 CSPR | x402-casper |
| rwa.kyb_screen | 0.10 CSPR | x402-casper |
| rwa.liquidity_depth | 0.15 CSPR | x402-casper |
| rwa.covenant_monitor | 0.12 CSPR | x402-casper |

## Agent Run

- Run id: run-aa9663b7-c910-4dba-8758-e50cd9fefa3e
- Decision: approve
- Approved amount: $207,452
- Provider revenue: 0.62 CSPR
- Receipt hash: cd31fdf7bc4178b9bf9d95420f95d2742a2b7c8e744edcc09d83056b63f280f0
- Demo anchor mode: mock
- Demo explorer URL: not used for final judging
- Final Casper receipt: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

## Evidence Verification

- Status: verified
- Checks: 34/34
- Signature checks: 4
- Hash checks: 17
- Evidence hash: e4cda74d8985901ce312feb4bd032c816a71982b0706d38d73ebc4cb09b2e2bf

## Review Readiness Criteria

| Criterion | Status | Value | Weight |
| --- | --- | --- | --- |
| x402 paid tools | pass | 4/4 signed proofs | 20 |
| MCP tool discovery | pass | 7 discoverable tools | 15 |
| Agentic RWA workflow | pass | 0.62 CSPR/run | 20 |
| Independent verifier | pass | 34/34 | 15 |
| Casper receipt | pass | real testnet deploy | 20 |
| Submission assets | pass | screenshots ready | 10 |

## Current Final Gate

The final review gate is cleared by a real Casper testnet receipt.

- Explorer URL: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a
- Final receipt hash: 23fd7a0e66756456960cc2522f2a5dbc0a3ae09b6d1b0ba4e285550e50d4fe16
- Public key: 011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
- Account status: funded
- Ready for anchor: true
- Deploy preflight verification: verified (11/11)

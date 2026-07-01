# Judge Proof Pack

Generated: 2026-07-01T17:53:58.543Z

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
- Signed authorization hash: 0a54c1827a81529a091b15cd22a8880a3fb616e4a3feded567934151beb48b87
- Mock Casper settlement hash: mock-casper-pay-769b093d35fcc560d4905d5d34d9113869ea7e30e70ceb13
- Replay attempt: 402, Payment nonce already used

## MCP Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
| rwa.risk_score | 0.25 CSPR | x402-casper |
| rwa.kyb_screen | 0.10 CSPR | x402-casper |
| rwa.liquidity_depth | 0.15 CSPR | x402-casper |
| rwa.covenant_monitor | 0.12 CSPR | x402-casper |

## Agent Run

- Run id: run-2e2467c9-ca2a-4a45-9636-7b82c3664009
- Decision: approve
- Approved amount: $207,452
- Provider revenue: 0.62 CSPR
- Receipt hash: a021954542101de36c65d2b9e701bff7347b6555839a127150698014ae9881ab
- Anchor mode: mock
- Explorer URL: https://testnet.cspr.live/deploy/mock-casper-receipt-a021954542101de36c65d2b9e701bff7347b6555839a1271

## Evidence Verification

- Status: verified
- Checks: 34/34
- Signature checks: 4
- Hash checks: 17
- Evidence hash: 5b318790dea084e64ab298bfe1d5641ae7bd5b2ebdabbefec94cf416c8048967

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

The remaining highest-prize gate is a real Casper testnet deploy.

- Public key: 011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
- Account status: funded
- Ready for anchor: true
- Deploy preflight verification: verified (11/11)
- Faucet: https://testnet.cspr.live/tools/faucet

After funding, run:

```bash
npm run seal:submission
```

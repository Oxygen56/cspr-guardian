# Judge Proof Pack

Generated: 2026-07-01T10:29:56.298Z

Project: CSPR Guardian

Prize readiness: 80/100 (final-gate)

## Assertions

| Check | Status | Evidence |
| --- | --- | --- |
| mcp-tool-discovery | pass | 7 tools exposed, including four x402-Casper paid tools |
| payment-required | pass | Risk oracle returns HTTP 402 plus PAYMENT-REQUIRED before payment |
| signed-payment | pass | Ed25519 signed authorization unlocks the paid oracle |
| nonce-replay-protection | pass | Reusing the same signed payment proof is rejected |
| agentic-rwa-run | pass | Agent buys four signals, decides under policy, and records provider revenue |
| independent-verifier | pass | 34/34 checks passed |
| casper-final-gate | blocked | Fund testnet key and rerun pnpm finalize:testnet |

## x402 Payment Flow

- Before payment: oracle returned 402 with PAYMENT-REQUIRED header.
- Signed authorization hash: a16d281bfad3814902670559f52039811de912311d25e1328a4d9d3c1b1e8b12
- Mock Casper settlement hash: mock-casper-pay-f6f9de9aa2f3a8a55bd5d2de88bc40602dd346fe84fc6275
- Replay attempt: 402, Payment nonce already used

## MCP Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
| rwa.risk_score | 0.25 CSPR | x402-casper |
| rwa.kyb_screen | 0.10 CSPR | x402-casper |
| rwa.liquidity_depth | 0.15 CSPR | x402-casper |
| rwa.covenant_monitor | 0.12 CSPR | x402-casper |

## Agent Run

- Run id: run-24d9a21f-7597-4531-904d-b3f3b8dc72be
- Decision: approve
- Approved amount: $207,452
- Provider revenue: 0.62 CSPR
- Receipt hash: b80b0e46be735a9f64c7349acc53143144486f9a140aa6d10791ef18d4ed0b02
- Anchor mode: mock
- Explorer URL: https://testnet.cspr.live/deploy/mock-casper-receipt-b80b0e46be735a9f64c7349acc53143144486f9a140aa6d1

## Evidence Verification

- Status: verified
- Checks: 34/34
- Signature checks: 4
- Hash checks: 17
- Evidence hash: 84eb65c97b1c5f855c30906255db635f7c291d73dbb41ebf3d81ea24dfb5d056

## Prize Readiness Criteria

| Criterion | Status | Value | Weight |
| --- | --- | --- | --- |
| x402 paid tools | pass | 4/4 signed proofs | 20 |
| MCP tool discovery | pass | 7 discoverable tools | 15 |
| Agentic RWA workflow | pass | 0.62 CSPR/run | 20 |
| Independent verifier | pass | 34/34 | 15 |
| Casper receipt | blocked | needs funding | 20 |
| Submission assets | pass | screenshots ready | 10 |

## Current Final Gate

The remaining highest-prize gate is a real Casper testnet deploy.

- Public key: 011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
- Account status: unfunded_or_unavailable
- Ready for anchor: false
- Faucet: https://testnet.cspr.live/tools/faucet

After funding, run:

```bash
pnpm finalize:testnet
```

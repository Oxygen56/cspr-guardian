# Casper x402 Settlement Preflight

Status: needs_funding

Run id: run-2601ba13-e6a3-495b-a393-e2cb42f82a90

Total: 0.62 CSPR (620000000 motes)

Account status: unfunded_or_unavailable

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | b53eb9b217fb002115d4fa738aa3016e755727bfea31155e20741de025c3690e |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | ab91afae7c34c5649d6c9c30e6f8ea07b71dc5dae0b29a38830560bdc486a053 |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | 3979405a14456871644e8736aef9d3e0b66e0b257c14f6e26a3c04daf84e02e3 |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | 388220dcd77a208fcc5288afcd431d0b885a238a99a530334c6c2dfac431abc7 |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

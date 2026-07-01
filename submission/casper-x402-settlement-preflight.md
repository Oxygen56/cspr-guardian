# Casper x402 Settlement Preflight

Status: needs_funding

Run id: run-5013f3f1-838b-4bc9-a103-5887e66f1414

Total: 0.62 CSPR (620000000 motes)

Account status: unfunded_or_unavailable

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | 5bc564dfdfadae58a4d5c92a666829504c790b8b30fe388021db7048d2a3b48f |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | b5c55a7413fbd8f90242aba17e3e558faa17e9ca3851caf78fb7cb84913b90eb |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | ce3020fcbb5b8f4c489aff8aabea3ae908d7e6e20d4f2dd1528457b883c7175d |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | 6c81629ae9a89e1134d6e8301e013714469fbe2bc3c8021aa394c6813503e6ea |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

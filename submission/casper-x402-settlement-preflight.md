# Casper x402 Settlement Preflight

Status: needs_funding

Run id: run-3ded3c74-76bb-4448-9bcf-fbcc5bde683c

Total: 0.62 CSPR (620000000 motes)

Account status: unfunded_or_unavailable

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | 557e33cf21f2149acf8c7aaf673d891e174fca3869fa0a0db754e16b6dad6d65 |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | 8ec0e7a23f945518bcdb01f4e0b39c1873fba14e89ffcf9b04ffd424f6957035 |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | 088a8c3e092a87899be0ea2d1988dce1f5e2d00d641d73bcac49e571d07980d6 |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | 365bd32ad8e090292de92cbeee4c37f7b5e81d54aa4c1f6dc09404b83ca40fcb |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

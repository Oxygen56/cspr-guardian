# Casper x402 Settlement Preflight

Status: needs_funding

Run id: run-a32be99e-f52c-418c-9fc4-518bfda7c42f

Total: 0.62 CSPR (620000000 motes)

Account status: unfunded_or_unavailable

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | 3d8f2929e379ac15a34bb0e309fe6cf3184f9e5904fb5b5804ff5139803b956d |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | f279670af0fe8781bc81d0d4eab2df3e31509b3ea01d5b142cce83e03d569acd |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | b1618cfee327cc142e6aa3135bfc7b05da28f11b25516efd55d3571a9de91704 |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | c62ad2f257a935d06a53b08d2ab296222b760eb9fea08136245868371721c9da |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

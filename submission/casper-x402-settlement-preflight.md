# Casper x402 Settlement Preflight

Status: needs_funding

Run id: run-d8e05423-d13f-43d5-af4c-d01a033cacf5

Total: 0.62 CSPR (620000000 motes)

Account status: unfunded_or_unavailable

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | 0f851999b316471b9ffc54344242064c26074b5b155676289f055e3df48dc07d |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | a400fcedbe1acd67ac4160dade32f0f3030f8e1840fdbe7a1396f6d82acee2e5 |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | 17079344c7cf77d68832120a648aa16d4df4d6e0091dbf92f7a320dbc823625f |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | 69d1f29ccda69a1c8d834096d1ba533277fedb5f591f713a9d98010f0bff3dfd |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

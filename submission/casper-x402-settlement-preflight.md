# Casper x402 Settlement Preflight

Status: needs_funding

Run id: run-8491e9f8-43ca-4178-a9f8-ba9830f28f39

Total: 0.62 CSPR (620000000 motes)

Account status: unfunded_or_unavailable

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | ccc65fb85dede266eea24cdb1ee28557e5b725a813682a22b732511279c1ef8b |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | 47b42b77ab0b546b9deeadff97a8c09902ef696c9b53f86ef134d8ec617379f3 |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | dbfeaada1bf42776fcbf23e44d0236fd5aab7d20735cf41f4f8e71c56966c122 |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | 4dea703fdad7bfd16c9b0fd02231a3115e3c958126b72cdd044c848367e1d85b |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

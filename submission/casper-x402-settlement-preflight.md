# Casper x402 Settlement Preflight

Status: needs_funding

Run id: run-f750dcbe-f80d-44a7-a263-88b799065c15

Total: 0.62 CSPR (620000000 motes)

Account status: unfunded_or_unavailable

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | 7f11eeb95334cae8eb80a2d2fe005b413fe874cb632ef401dc6249a8e1e5770e |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | 538d864748ef0696305419a62003c25750efccbec5d4144dbd5d0c5f46a74712 |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | 65b509c5f066692d9faa84ce88f406640400af63f60251ba8979eb6ea81d8206 |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | bda63761ba842c9bf991881cb78f8cf4b576f2fed1c040442504b4a1890dfd39 |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

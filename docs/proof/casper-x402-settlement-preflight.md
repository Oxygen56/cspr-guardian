# Casper x402 Settlement Preflight

Status: ready_to_settle

Run id: run-1c6b7fe1-3c0b-4da3-916d-05e5a667f93c

Total: 0.62 CSPR (620000000 motes)

Account status: funded

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | self_fallback_invalid_pay_to | ab7e220ad7c65237635fdad53e62138edce70ebe9a4254d5aa4b0fc64b42a635 |
| rwa.kyb_screen | 0.10 | 100000000 | ok | self_fallback_invalid_pay_to | 9453c611948e9e72d266cd018839bb0d78a26dffc6c6e6ada9af262f62329d17 |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | self_fallback_invalid_pay_to | 1b80d489a62bc3114f3d4c20b90a5123a23d8651fb2a41de4f0eb3c89dbf2ccd |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | self_fallback_invalid_pay_to | b55920bf1f64f3256d614a9da7fec2394214cf3e94603c5961ec1ab1cf4183e5 |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

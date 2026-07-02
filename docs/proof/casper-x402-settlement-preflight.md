# Casper x402 Settlement Preflight

Status: ready_to_settle

Run id: run-c2c70314-ecbf-4aac-af8a-3b6975f52204

Total: 0.62 CSPR (620000000 motes)

Account status: funded

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

## Signed-But-Not-Broadcast Transfers

| Tool | CSPR | Motes | Build | Recipient | Deploy hash |
| --- | --- | --- | --- | --- | --- |
| rwa.risk_score | 0.25 | 250000000 | ok | agent-controlled testnet recipient | 88d17aa9a49a0723ac8d2cb1ecb4ccad2ecebe2bad0ba8878c90047c02b76e3f |
| rwa.kyb_screen | 0.10 | 100000000 | ok | agent-controlled testnet recipient | f1226d5900d9eb20ed21e1d714a1c986c4b3456ac638691c736c32f51e9d240b |
| rwa.liquidity_depth | 0.15 | 150000000 | ok | agent-controlled testnet recipient | a813462474b42cd193d0a0effcf157e29b324169d163e13920a30404e4157e11 |
| rwa.covenant_monitor | 0.12 | 120000000 | ok | agent-controlled testnet recipient | 258afff1254d965a1d1ed39023479dd303840e554d35cf7e511f3d28cc2e748f |

Recipient note: when `CASPER_TREASURY_PUBLIC_KEY` is not a Casper public key,
the preflight uses the signer public key as a non-broadcast recipient so the
deploy build, memo derivation, and signature path can still be verified safely.
Set `CASPER_TREASURY_PUBLIC_KEY` to the provider account before real payment
settlement.

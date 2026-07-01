# Casper Testnet Preflight

Status: needs_funding

Deploy build: ok

Broadcast: false

Signer:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

Receipt hash:

```text
f11dac5e96824865297a9f32a1cf53e615a5bcb6fcf59a426241c98521d8704b
```

Transfer memo:

```text
17374232459717265509
```

Memo derivation:

```text
uint64(first_16_hex_chars(receiptHash)); source=f11dac5e96824865; bits=64
```

Account status:

```text
unfunded_or_unavailable
```

Next step:

```bash
pnpm check:testnet
pnpm preflight:testnet
pnpm finalize:testnet
```

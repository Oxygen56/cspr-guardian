# Casper Testnet Preflight

Status: ready_to_anchor

Deploy build: ok

Broadcast: false

Signer:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

Receipt hash:

```text
3a0972e49f9b8cb2d4366d8eac5f7e9e37813f7f727301cf53837630916db651
```

Transfer memo:

```text
1020996107237816
```

Memo derivation:

```text
uint53(first_13_hex_chars(receiptHash)); source=3a0972e49f9b8; bits=52
```

Account status:

```text
funded
```

Next step:

```bash
npm run check:testnet
npm run preflight:testnet
npm run seal:submission
```

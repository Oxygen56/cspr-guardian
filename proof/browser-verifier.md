# Browser Proof Verifier

This artifact documents the browser verifier that lets judges recompute the
public proof-room SHA-256 manifest without cloning the repository or running a
local command.

Public page:

```text
https://oxygen56.github.io/cspr-guardian/verifier.html
```

## What It Verifies

The browser verifier fetches:

```text
proof/proof-manifest.json
```

Then it fetches every file listed in `manifest.entries`, computes SHA-256 with
the browser Web Crypto API, compares the computed hash and byte length against
the manifest, and displays the pass/fail status.

## Acceptance Criteria

| Check | Expected result |
| --- | --- |
| Manifest fetch | `proof/proof-manifest.json` loads from the same origin |
| Entry count | The manifest summary count equals the entry list length |
| Artifact fetch | Every `proof/*.md` and `proof/*.json` artifact loads |
| Hash match | Every computed SHA-256 equals the manifest SHA-256 |
| Byte match | Every fetched byte length equals the manifest byte count |
| Final status | The page reports all artifacts verified |

## Why This Matters

Most BUIDL submissions ask judges to trust screenshots, copy, or local commands.
CSPR Guardian gives judges a browser-native integrity check for the whole public
proof room. The same public site that presents the demo can also verify that
the proof artifacts match the published SHA-256 manifest.

## Manual Fallback

If a browser blocks JavaScript, judges can still read the same manifest:

```text
https://oxygen56.github.io/cspr-guardian/proof/proof-manifest.md
```

The local equivalent is:

```bash
npm run proof:manifest
```

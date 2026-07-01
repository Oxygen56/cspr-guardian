# Casper Highest Prize Unlock

Generated: 2026-07-01T13:11:35.797Z

Status: needs_funding_and_public_links

## Testnet Funding

Public key:

```text
011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
```

Faucet:

```text
https://testnet.cspr.live/tools/faucet
```

Faucet checks: wallet required = true, reCAPTCHA required = true, faucet enabled = true

Required motes: 100000001

## Public Links

Missing: demoUrl, videoUrl

## Gates

| Gate | Status | Detail |
| --- | --- | --- |
| fund_testnet_key | open | Fund the prepared Casper testnet public key through the CSPR.live faucet. |
| publish_public_repo | pass | Public repository URL is configured. |
| publish_hosted_demo | open | Deploy the demo and export SUBMISSION_DEMO_URL. |
| publish_demo_video | open | Record the walkthrough and export SUBMISSION_VIDEO_URL. |
| real_casper_receipt_deploy | open | Waiting for a funded testnet key before broadcasting the real receipt deploy. |

## Next Action

Open https://testnet.cspr.live/tools/faucet, fund the public key, then run pnpm seal:submission.

## Commands After Funding

```bash
pnpm check:testnet
pnpm preflight:testnet
pnpm verify:preflight
pnpm seal:submission
pnpm audit:submission
```

## Commands After Public Links

```bash
SUBMISSION_REPO_URL=<public repo> SUBMISSION_DEMO_URL=<hosted demo> SUBMISSION_VIDEO_URL=<demo video> pnpm export:buidl
pnpm export:submission
pnpm audit:submission
```

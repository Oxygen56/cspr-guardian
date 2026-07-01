# Casper Highest Prize Unlock

Generated: 2026-07-01T18:00:40.659Z

Status: ready_for_highest_prize_submission

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

Required motes: 2600000000

## Manual Faucet Steps

1. Run `npm run fund:testnet` to copy the prepared public key and open the funding guide plus faucet page.
2. In CSPR.live, connect Casper Wallet on Casper testnet.
3. Request faucet funds for the copied public key.
4. Run `npm run wait:testnet`; it waits for the balance and then runs the final seal.

## Public Links

Missing: none

## Gates

| Gate | Status | Detail |
| --- | --- | --- |
| fund_testnet_key | pass | Prepared Casper testnet key is funded and ready to anchor. |
| publish_public_repo | pass | Public repository URL is configured. |
| publish_hosted_demo | pass | Hosted demo URL is configured. |
| publish_demo_video | pass | Demo video URL is configured. |
| real_casper_receipt_deploy | pass | Final seal contains a public CSPR.live deploy URL. |

## Next Action

Submit the final pack with the public repo, hosted demo, video, and Casper explorer URL.

## Commands After Funding

```bash
npm run check:testnet
npm run preflight:testnet
npm run verify:preflight
npm run seal:submission
npm run audit:submission
```

## Commands After Public Links

```bash
SUBMISSION_REPO_URL=<public repo> SUBMISSION_DEMO_URL=<hosted demo> SUBMISSION_VIDEO_URL=<demo video> npm run export:buidl
npm run export:submission
npm run audit:submission
```

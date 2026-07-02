# Casper Highest Prize Unlock

Generated: 2026-07-02T16:13:30.355Z

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

## Final Testnet Receipt

- Account status: funded
- Ready for anchor: true
- Explorer URL: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a
- Deploy hash: 7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

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

## Final Verification Commands

```bash
npm run test
npm run check:ci
npm run verify:evidence
npm run verify:preflight
npm run verify:x402-preflight
```

## Commands After Public Links

```bash
SUBMISSION_REPO_URL=<public repo> SUBMISSION_DEMO_URL=<hosted demo> SUBMISSION_VIDEO_URL=<demo video> npm run export:buidl
npm run export:submission
npm run audit:submission
```

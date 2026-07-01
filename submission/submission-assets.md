# Submission Assets

Use these files when preparing the DoraHacks or ETHGlobal project page.

Public links already prepared:

- Repository: https://github.com/Oxygen56/cspr-guardian
- Hosted judge demo: https://oxygen56.github.io/cspr-guardian/

| Asset | Purpose |
| --- | --- |
| `submission/assets/cspr-guardian-dashboard.png` | Main product screenshot showing the end-to-end CSPR Guardian dashboard |
| `submission/assets/cspr-guardian-prize-readiness.png` | Prize-readiness screenshot showing `80/100`, passed buildathon signals, and the final Casper deploy gate |
| `submission/assets/cspr-guardian-judge-proof.png` | Judge proof screenshot showing `6/7`, replay `402`, and verifier `34/34` |
| `submission/assets/cspr-guardian-testnet-preflight.png` | Testnet preflight screenshot showing deploy build `ok`, broadcast `false`, and memo bits `64` |
| `submission/assets/cspr-guardian-evidence-verification.png` | Technical proof screenshot showing `Verified` and `34/34` checks |
| `submission/prize-readiness-snapshot.json` | Machine-readable `/api/prize-readiness` snapshot |
| `submission/judge-proof-pack.json` | Machine-readable proof of MCP discovery, x402 payment flow, replay rejection, verifier status, and prize-readiness gate |
| `submission/judge-proof-pack.md` | Human-readable version of the judge proof pack |
| `submission/casper-testnet-preflight.json` | Machine-readable signed-deploy preflight after running `pnpm preflight:testnet` |
| `submission/casper-testnet-preflight.md` | Human-readable signed-deploy preflight |
| `submission/casper-x402-settlement-preflight.json` | Machine-readable signed-but-not-broadcast Casper transfer preflight for four x402 tool payments |
| `submission/casper-x402-settlement-preflight.md` | Human-readable x402 settlement preflight |
| `submission/casper-highest-prize-unlock.json` | Machine-readable highest-prize unlock gate report for faucet funding, public links, and final seal commands |
| `submission/casper-highest-prize-unlock.md` | Human-readable highest-prize unlock checklist |
| `casper-buidl-submission.md` | Copy-ready BUIDL page fields, proof summary, and demo flow |
| `casper-buidl-submission.json` | Machine-readable BUIDL page source data |
| `casper-submission-audit.md` | External pre-submit audit proving evidence, preflight, pack, BUIDL, seal, leak-scan, and zip checks |
| `casper-submission-audit.json` | Machine-readable external submission audit |
| `casper-public-demo-handoff.md` | Public hosting handoff for Render/Docker, health check, and final BUIDL link export |
| `casper-public-demo-readiness.json` | Machine-readable public demo hosting readiness |
| `casper-ci-readiness.md` | Public repository CI/readiness summary |
| `casper-ci-readiness.json` | Machine-readable CI/readiness result |
| `submission/dorahacks-draft.md` | Copy-ready project narrative |
| `submission/demo-video-script.md` | 90-second demo script |
| `submission/judge-evidence-map.md` | Prize-signal-to-artifact walkthrough |

Current screenshot capture state:

- Decision: `approve`.
- Prize Readiness: `80/100`, `Final Gate`.
- Judge Proof Pack: `6/7` assertions, replay result `402`.
- Testnet Preflight: deploy build `ok`, broadcast `false`, memo bits `64`.
- Final Seal external output: `needs_funding`, missing required files `0`.
- Highest Prize Unlock external output: faucet/wallet funding gate, public link
  gate, and post-funding commands are machine-readable.
- Submission Audit external output: `ready_except_external_submission_gates`
  before funding/public links, then `ready_for_highest_prize_submission` after
  final seal and public repo/demo/video URLs.
- Evidence verification: `Verified`.
- Checks passed: `34/34`.
- Paid tools: `4`.
- Provider revenue: `0.62 CSPR`.
- Page private-key leak check: clear.

Final prize-readiness caveat:

- The local Casper testnet key is generated, RPC is healthy, and the finalization
  pipeline is ready.
- The generated testnet account still needs faucet funding before the app can
  publish a real receipt deploy and CSPR.live explorer URL.
- The BUIDL page should be re-exported with `SUBMISSION_REPO_URL`,
  `SUBMISSION_DEMO_URL`, and `SUBMISSION_VIDEO_URL` once those public links are
  available. Repository and hosted demo URLs are already available; the public
  walkthrough video URL still needs to be uploaded.
- The public demo can be hosted from the included `Dockerfile` and
  `render.yaml`; `pnpm check:public-demo` writes the handoff.
- The public repository can run `.github/workflows/submission-readiness.yml`;
  `pnpm check:ci` mirrors that workflow locally.

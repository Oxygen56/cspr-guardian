# Submission Assets

Use these files when preparing the DoraHacks or ETHGlobal project page.

Public links already prepared:

- Repository: https://github.com/Oxygen56/cspr-guardian
- Hosted judge demo: https://oxygen56.github.io/cspr-guardian/
- Judge scorecard: https://oxygen56.github.io/cspr-guardian/judge-scorecard.html
- Walkthrough video: https://oxygen56.github.io/cspr-guardian/walkthrough.html
- Judge proof room: https://oxygen56.github.io/cspr-guardian/proof-room.html
- Competitive positioning:
  https://oxygen56.github.io/cspr-guardian/proof/competitive-positioning.md

| Asset | Purpose |
| --- | --- |
| `submission/assets/cspr-guardian-dashboard.png` | Main product screenshot showing the end-to-end CSPR Guardian dashboard |
| `submission/assets/cspr-guardian-prize-readiness.png` | Current prize-readiness screenshot showing `100/100`, cleared final gate, and zero blockers |
| `submission/assets/cspr-guardian-judge-proof.png` | Judge proof screenshot; regenerated judge proof shows final gate `pass` |
| `submission/assets/cspr-guardian-testnet-preflight.png` | Testnet preflight screenshot; deploy build `ok`, broadcast `false`, and safe memo bits `52` |
| `submission/assets/cspr-guardian-evidence-verification.png` | Technical proof screenshot showing `Verified` and `34/34` checks |
| `submission/prize-readiness-snapshot.json` | Machine-readable `/api/prize-readiness` snapshot |
| `submission/judge-proof-pack.json` | Machine-readable proof of MCP discovery, x402 payment flow, replay rejection, verifier status, and prize-readiness gate |
| `submission/judge-proof-pack.md` | Human-readable version of the judge proof pack |
| `submission/casper-testnet-preflight.json` | Machine-readable signed-deploy preflight after running `npm run preflight:testnet` |
| `submission/casper-testnet-preflight.md` | Human-readable signed-deploy preflight |
| `submission/casper-x402-settlement-preflight.json` | Machine-readable signed-but-not-broadcast Casper transfer preflight for four x402 tool payments |
| `submission/casper-x402-settlement-preflight.md` | Human-readable x402 settlement preflight |
| `submission/casper-x402-settlement-batch.json` | Machine-readable real x402 settlement-anchor batch with four Casper testnet transactions |
| `submission/casper-x402-settlement-batch.md` | Human-readable x402 settlement-anchor batch |
| `submission/casper-highest-prize-unlock.json` | Machine-readable highest-prize unlock report with funded testnet account, public links, and final receipt |
| `submission/casper-highest-prize-unlock.md` | Human-readable highest-prize unlock checklist |
| `casper-testnet-funding-watch.json` | Machine-readable testnet funding watcher status from the final funding flow |
| `casper-testnet-funding-watch.md` | Human-readable watcher status for `npm run wait:testnet` |
| `casper-buidl-submission.md` | Copy-ready BUIDL page fields, proof summary, and demo flow |
| `casper-buidl-submission.json` | Machine-readable BUIDL page source data |
| `casper-submission-audit.md` | External pre-submit audit proving evidence, preflight, pack, BUIDL, seal, leak-scan, and zip checks |
| `casper-submission-audit.json` | Machine-readable external submission audit |
| `docs/judge-scorecard.html` | One-page judge scoring matrix |
| `docs/proof-room.html` | Public proof room linking final audit, proof pack, seal, preflight, BUIDL, and CI artifacts |
| `docs/proof/proof-manifest.md` | SHA-256 manifest for all public proof-room artifacts |
| `docs/proof/judge-scorecard.md` | Markdown judge scorecard included in the public proof manifest |
| `docs/proof/competitive-positioning.md` | Public competitive positioning brief |
| `docs/proof/*` | Public Markdown and JSON proof artifacts for browser-based judge review |
| `casper-public-demo-handoff.md` | Public hosting handoff for Render/Docker, health check, and final BUIDL link export |
| `casper-public-demo-readiness.json` | Machine-readable public demo hosting readiness |
| `casper-scenario-matrix.md` | Human-readable repeatable RWA scenario matrix |
| `casper-scenario-matrix.json` | Machine-readable repeatable RWA scenario matrix |
| `casper-ci-readiness.md` | Public repository CI/readiness summary |
| `casper-ci-readiness.json` | Machine-readable CI/readiness result |
| `submission/dorahacks-draft.md` | Copy-ready project narrative |
| `submission/judge-scorecard.md` | Scorecard source for the public proof artifact |
| `submission/competitive-positioning.md` | Competitive positioning source for the public proof artifact |
| `submission/demo-video-script.md` | 64-second final walkthrough script |
| `submission/judge-evidence-map.md` | Prize-signal-to-artifact walkthrough |

Current screenshot capture state:

- Decision: `approve`.
- Static screenshots have been refreshed after final testnet funding and
  receipt publication.
- Prize Readiness: `100/100`, `highest-prize-ready`.
- Judge Proof Pack: final gate `pass`, replay result `402`.
- Testnet Preflight: deploy build `ok`, broadcast `false`, memo bits `52`.
- Final Seal external output: `ready_for_highest_prize_submission`.
- Highest Prize Unlock external output: `ready_for_highest_prize_submission`
  with zero remaining gates.
- Submission Audit external output: `ready_for_highest_prize_submission`,
  final checks passed, `0` blocked, `0` failed.
- x402 Settlement Batch: `settled_on_casper_testnet`, four transaction anchors.
- Casper explorer URL:
  `https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a`.
- Evidence verification: `Verified`.
- Checks passed: `34/34`.
- Paid tools: `4`.
- Provider revenue: `0.62 CSPR`.
- Page private-key leak check: clear.

Final prize-readiness status:

- The local Casper testnet key is funded, RPC is healthy, and the final
  receipt transaction is published on Casper testnet.
- Repository, hosted demo, walkthrough video, and Casper explorer URLs are
  exported into the BUIDL page.
- The public demo can be hosted from the included `Dockerfile` and
  `render.yaml`; `npm run check:public-demo` writes the handoff.
- The public repository can run `.github/workflows/submission-readiness.yml`;
  `npm run check:ci` mirrors that workflow locally.

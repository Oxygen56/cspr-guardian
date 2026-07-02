# Submission Assets

Use these files when preparing the DoraHacks or ETHGlobal project page.

Public links already prepared:

- Repository: https://github.com/Oxygen56/cspr-guardian
- Hosted judge demo: https://oxygen56.github.io/cspr-guardian/
- Judge decision brief: https://oxygen56.github.io/cspr-guardian/judge-decision.html
- Judge scorecard: https://oxygen56.github.io/cspr-guardian/judge-scorecard.html
- Architecture map: https://oxygen56.github.io/cspr-guardian/architecture.html
- Reality boundary and judge FAQ: https://oxygen56.github.io/cspr-guardian/judge-faq.html
- Browser proof verifier: https://oxygen56.github.io/cspr-guardian/verifier.html
- Walkthrough video: https://oxygen56.github.io/cspr-guardian/walkthrough.html
- Judge proof room: https://oxygen56.github.io/cspr-guardian/proof-room.html
- Competitive positioning:
  https://oxygen56.github.io/cspr-guardian/proof/competitive-positioning.md

| Asset | Purpose |
| --- | --- |
| `submission/assets/cspr-guardian-dashboard.png` | Main product screenshot showing the end-to-end CSPR Guardian dashboard |
| `submission/assets/cspr-guardian-review-readiness.png` | Current review-readiness screenshot showing `100/100`, cleared final gate, and zero blockers |
| `submission/assets/cspr-guardian-judge-proof.png` | Judge proof screenshot; regenerated judge proof shows final gate `pass` |
| `submission/assets/cspr-guardian-testnet-preflight.png` | Testnet preflight screenshot; deploy build `ok`, broadcast `false`, and safe memo bits `52` |
| `submission/assets/cspr-guardian-evidence-verification.png` | Technical proof screenshot showing `Verified` and `34/34` checks |
| `submission/review-readiness-snapshot.json` | Machine-readable review snapshot |
| `submission/judge-proof-pack.json` | Machine-readable proof of MCP discovery, x402 payment flow, replay rejection, verifier status, and review-readiness gate |
| `submission/judge-proof-pack.md` | Human-readable version of the judge proof pack |
| `submission/casper-testnet-preflight.json` | Machine-readable signed-deploy preflight after running `npm run preflight:testnet` |
| `submission/casper-testnet-preflight.md` | Human-readable signed-deploy preflight |
| `submission/casper-x402-settlement-preflight.json` | Machine-readable signed-but-not-broadcast Casper transfer preflight for four x402 tool payments |
| `submission/casper-x402-settlement-preflight.md` | Human-readable x402 settlement preflight |
| `submission/casper-x402-settlement-batch.json` | Machine-readable real x402 settlement-anchor batch with four Casper testnet transactions |
| `submission/casper-x402-settlement-batch.md` | Human-readable x402 settlement-anchor batch |
| `submission/casper-final-review-unlock.json` | Machine-readable final review unlock report with funded testnet account, public links, and final receipt |
| `submission/casper-final-review-unlock.md` | Human-readable final review unlock checklist |
| `casper-testnet-funding-watch.json` | Machine-readable testnet funding watcher status from the final funding flow |
| `casper-testnet-funding-watch.md` | Human-readable watcher status for `npm run wait:testnet` |
| `casper-buidl-submission.md` | Copy-ready BUIDL page fields, proof summary, and demo flow |
| `casper-buidl-submission.json` | Machine-readable BUIDL page source data |
| `casper-submission-audit.md` | External pre-submit audit proving evidence, preflight, pack, BUIDL, seal, leak-scan, and zip checks |
| `casper-submission-audit.json` | Machine-readable external submission audit |
| `docs/judge-scorecard.html` | One-page judge scoring matrix |
| `docs/judge-decision.html` | Final review decision brief for judges |
| `docs/architecture.html` | One-screen architecture and trust-boundary map |
| `docs/verifier.html` | Browser proof verifier that recomputes public artifact SHA-256 hashes |
| `docs/judge-faq.html` | Reality boundary and judge FAQ for what is real, testnet scope, and production requirements |
| `docs/proof-room.html` | Public proof room linking final audit, proof pack, seal, preflight, BUIDL, and CI artifacts |
| `docs/proof/proof-manifest.md` | SHA-256 manifest for all public proof-room artifacts |
| `docs/proof/judge-decision.md` | Markdown source for the public judge decision brief |
| `docs/proof/browser-verifier.md` | Markdown source describing the browser verifier acceptance criteria |
| `docs/proof/architecture.md` | Markdown architecture and threat model included in the public proof manifest |
| `docs/proof/judge-faq.md` | Markdown reality boundary and judge FAQ included in the public proof manifest |
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
| `submission/dorahacks-page-update.md` | Current compact DoraHacks page update with latest reviewer links and verification metrics |
| `submission/judge-decision.md` | Judge decision brief source for the public proof artifact |
| `submission/judge-scorecard.md` | Scorecard source for the public proof artifact |
| `submission/architecture.md` | Architecture and threat-model source for the public proof artifact |
| `submission/browser-verifier.md` | Browser verifier source for the public proof artifact |
| `submission/judge-faq.md` | Reality boundary and judge FAQ source for the public proof artifact |
| `submission/competitive-positioning.md` | Competitive positioning source for the public proof artifact |
| `submission/demo-video-script.md` | 64-second final walkthrough script |
| `submission/judge-evidence-map.md` | Review-signal-to-artifact walkthrough |

Current screenshot capture state:

- Decision: `approve`.
- Static screenshots have been refreshed after final testnet funding and
  receipt publication.
- Review readiness: `100/100`, `final-review-ready`.
- Judge Proof Pack: final gate `pass`, replay result `402`.
- Testnet Preflight: deploy build `ok`, broadcast `false`, memo bits `52`.
- Final Seal external output: `ready_for_final_review`.
- Final review unlock external output: `ready_for_final_review`
  with zero remaining gates.
- Submission Audit external output: `ready_for_final_review`,
  final checks passed, `0` blocked, `0` failed.
- x402 Settlement Batch: `settled_on_casper_testnet`, four transaction anchors.
- Casper explorer URL:
  `https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a`.
- Evidence verification: `Verified`.
- Checks passed: `34/34`.
- Paid tools: `4`.
- Provider revenue: `0.62 CSPR`.
- Page private-key leak check: clear.

Final review-readiness status:

- The local Casper testnet key is funded, RPC is healthy, and the final
  receipt transaction is published on Casper testnet.
- Repository, hosted demo, walkthrough video, and Casper explorer URLs are
  exported into the BUIDL page.
- The public demo can be hosted from the included `Dockerfile` and
  `render.yaml`; `npm run check:public-demo` writes the handoff.
- The public repository can run `.github/workflows/submission-readiness.yml`;
  `npm run check:ci` mirrors that workflow locally.

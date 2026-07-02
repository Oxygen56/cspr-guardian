# Judge Evidence Map

Use this as the submission proof map. It tells judges exactly where to look and
what each screen or artifact proves.

## Core Claim

CSPR Guardian turns Casper into the payment and audit layer for autonomous RWA
treasury agents. An agent discovers paid tools, pays for specialized
intelligence, makes a constrained allocation decision, and exports a verifiable
receipt.

Public repo: https://github.com/Oxygen56/cspr-guardian

Hosted judge demo: https://oxygen56.github.io/cspr-guardian/

Judge scorecard: https://oxygen56.github.io/cspr-guardian/judge-scorecard.html

Walkthrough video: https://oxygen56.github.io/cspr-guardian/walkthrough.html

Judge proof room: https://oxygen56.github.io/cspr-guardian/proof-room.html

Reality boundary and judge FAQ: https://oxygen56.github.io/cspr-guardian/judge-faq.html

Casper receipt:
https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

## Top-Score Positioning

The judging hook is the complete loop. CSPR Guardian is not just an x402 API,
not just an MCP catalog, and not just a DeFi assistant. It combines all of
those into a verifiable RWA treasury workflow:

1. Discover paid MCP-style tools.
2. Receive HTTP 402 payment requirements.
3. Sign replay-safe Casper payment authorizations.
4. Buy risk, KYB, liquidity, and covenant intelligence.
5. Make a constrained allocation decision.
6. Recompute the evidence independently.
7. Publish a real Casper testnet receipt.

That gives judges a concrete Casper-native agent economy: paid service
providers, autonomous buyers, policy-bounded decisions, revenue accounting, and
an audit trail that can be inspected after the demo.

## Rubric Alignment

| Rubric Area | CSPR Guardian Evidence |
| --- | --- |
| Technical execution | `25/25` tests, final audit checks, `34/34` evidence checks, signed deploy preflight, four x402 settlement anchors, and public CSPR.live receipt |
| Innovation and originality | End-to-end paid RWA intelligence market, not a simple API wrapper or chatbot |
| AI agent use | The agent discovers tools, pays, consumes paid data, decides under policy, and exports proof |
| Casper integration | x402-style Casper payments, Casper testnet public key, deploy preflight, real transaction, receipt hash, and CSPR.live explorer URL |
| User and judge experience | Hosted demo, 64-second walkthrough, architecture map, reality boundary FAQ, proof screenshots, copy-ready BUIDL fields, downloadable JSON artifacts |
| Fast rubric review | One-page scorecard and trust-boundary map show technical execution, Casper integration, agent workflow, innovation, and judge UX |

## Evidence Table

| Prize Signal | What To Show | Artifact |
| --- | --- | --- |
| Casper-native trust layer | Real receipt deploy hash and CSPR.live explorer URL | `npm run seal:submission`, Casper Receipt panel |
| Agent-to-agent commerce | Four paid tools earning CSPR per run | Provider Ledger panel |
| x402-style payment flow | HTTP 402 challenge, signed payment proof, nonce replay rejection | `/api/oracle/*`, tests, Evidence Bundle |
| x402 real settlement | Four x402 settlement-anchor transactions are published on Casper testnet and tied to the signed authorizations | `submission/casper-x402-settlement-batch.md`, `npm run settle:x402:testnet`, `npm run verify:x402-settlement` |
| MCP-style tool discovery | Agent discovers paid RWA tools before calling them | Agent Trace, `/mcp/tools` |
| Autonomous workflow | Agent evaluates risk, KYB, liquidity, and covenants before deciding | Decision panel and trace |
| RWA relevance | Invoice financing pool gets risk, compliance, liquidity, and covenant checks | RWA signal reports |
| Repeatability | Treasury, invoice-finance, and trade-credit assets produce distinct policy outcomes through the same paid tool stack | `casper-scenario-matrix.md`, `npm run scenario:matrix` |
| Auditability | Evidence bundle hashes every payment proof, report, decision, and receipt | Evidence Bundle panel and JSON |
| Independent verification | Signatures, tx hashes, report hashes, receipt hash, evidence hash, and revenue totals recompute | Evidence Verification panel, `npm run verify:evidence` |
| Reviewer proof pack | 402 challenge, signed payment, replay rejection, agent run, verifier, prize gate | `submission/judge-proof-pack.md`, `submission/judge-proof-pack.json`, `npm run judge:proof` |
| Real deploy readiness | Signed Casper transfer deploy builds locally without broadcasting | `submission/casper-testnet-preflight.md`, `submission/casper-testnet-preflight.json`, `npm run preflight:testnet` |
| x402 preflight path | Each paid tool payment can build a signed Casper transfer deploy without broadcasting | `submission/casper-x402-settlement-preflight.md`, `npm run preflight:x402`, `npm run verify:x402-preflight` |
| Testnet readiness | RPC health, public key, funding status, and readiness gate are visible | Testnet Readiness panel |
| Business model | Providers earn per tool call and history persists across runs | Provider Ledger and Run History |
| Submission clarity | Copy-ready BUIDL fields, artifact links, demo flow, and remaining gate are consolidated | `casper-buidl-submission.md`, `npm run export:buidl` |
| One-minute judge path | Scorecard gives judges a direct route through readiness, receipt, audit, manifest, and competitive proof | `docs/judge-scorecard.html`, `docs/proof/judge-scorecard.md` |
| Browser-accessible proof | Final audit, proof pack, seal, preflight, BUIDL, CI, and public demo artifacts are linked from one page | `docs/proof-room.html`, `docs/proof/*` |
| Artifact integrity | Every public proof-room Markdown/JSON artifact has a published SHA-256 hash | `docs/proof/proof-manifest.md`, `npm run proof:manifest` |
| Competitive differentiation | Visible buildathon categories are addressed without unsupported claims about other teams | `docs/proof/competitive-positioning.md` |
| Architecture clarity | Payment, replay, settlement, policy, verifier, Casper anchor, and secret-handling boundaries are mapped to proof artifacts | `docs/architecture.html`, `docs/proof/architecture.md` |
| Reality boundary | Testnet prototype scope, reproducible provider data, public evidence, and production requirements are explicit | `docs/judge-faq.html`, `docs/proof/judge-faq.md` |
| Submission auditability | Final pack, BUIDL page, seal, leak scan, source zip exclusions, and self-reference checks are verified before upload | Submission Audit panel, `casper-submission-audit.md`, `npm run audit:submission` |
| Highest-prize unlock gate | Faucet funding, wallet/reCAPTCHA requirement, public links, and post-funding commands are consolidated | `submission/casper-highest-prize-unlock.md`, `npm run unlock:highest-prize` |
| Hosted demo readiness | Docker, Render blueprint, health endpoint, and public-link export path are prepared | `casper-public-demo-handoff.md`, `npm run check:public-demo`, `/api/health` |
| Public repo verification | Tests, evidence verifier, preflight verifier, and hosting readiness run in CI | `.github/workflows/submission-readiness.yml`, `casper-ci-readiness.md`, `npm run check:ci` |

## Ready Screenshot Assets

- `submission/assets/cspr-guardian-dashboard.png`: full dashboard screenshot
  after a successful agent run.
- `submission/assets/cspr-guardian-prize-readiness.png`: focused buildathon
  scorecard showing passed x402/MCP/RWA/verifier criteria and the real testnet
  deploy gate.
- `submission/assets/cspr-guardian-judge-proof.png`: focused dashboard proof
  showing 402, signed payment, replay rejection, and 34/34 evidence checks.
- `submission/assets/cspr-guardian-testnet-preflight.png`: focused dashboard
  proof that the Casper transfer deploy builds and signs locally without
  broadcasting.
- `submission/assets/cspr-guardian-evidence-verification.png`: focused
  verifier screenshot showing `Verified` and `34/34` checks.
- `submission/judge-proof-pack.md`: quick-review proof pack for judges.
- `submission/judge-proof-pack.json`: machine-readable proof pack.
- `submission/casper-testnet-preflight.md`: human-readable real deploy preflight.
- `submission/casper-testnet-preflight.json`: machine-readable real deploy preflight.
- `submission/casper-x402-settlement-preflight.md`: human-readable real
  x402 settlement transfer preflight.
- `submission/casper-x402-settlement-preflight.json`: machine-readable x402
  settlement preflight.
- `submission/casper-x402-settlement-batch.md`: human-readable real x402
  settlement-anchor batch with four Casper testnet transaction links.
- `submission/casper-x402-settlement-batch.json`: machine-readable x402
  settlement-anchor batch.
- `submission/casper-highest-prize-unlock.md`: human-readable highest-prize
  report with the funded testnet account, public links, and final CSPR.live receipt.
- `submission/casper-highest-prize-unlock.json`: machine-readable
  highest-prize unlock report.
- `submission/submission-assets.md`: screenshot and upload checklist.
- `casper-buidl-submission.md`: copy-ready BUIDL submission page fields and
  final judge narrative.
- `docs/proof-room.html`: public proof room with browser-accessible audit,
  proof pack, seal, preflight, BUIDL, CI, and public demo artifacts.
- `docs/judge-scorecard.html`: one-page rubric scorecard for judges.
- `docs/architecture.html`: one-screen architecture and trust-boundary map.
- `docs/proof/architecture.md`: hashed Markdown architecture proof.
- `docs/judge-faq.html`: reality boundary and judge FAQ.
- `docs/proof/judge-faq.md`: hashed Markdown reality boundary proof.
- `docs/proof/judge-scorecard.md`: Markdown scorecard included in the proof manifest.
- `docs/proof/casper-scenario-matrix.md`: repeatable RWA scenario matrix.
- `docs/proof/casper-scenario-matrix.json`: machine-readable scenario matrix.
- `docs/proof/proof-manifest.md`: SHA-256 manifest for all public proof-room
  artifacts.
- `docs/proof/competitive-positioning.md`: public judge-facing benchmark brief.
- `docs/proof/*`: public Markdown and JSON proof artifacts.
- `casper-submission-audit.md`: external audit showing submission package
  status and any remaining final gate.
- `casper-public-demo-handoff.md`: public hosting handoff for repo, hosted
  demo, video, and BUIDL link export.
- `casper-ci-readiness.md`: summary of the same checks wired into GitHub
  Actions for the public repository.

## 64-Second Judge Path

1. Start with Prize Readiness: `100/100`, highest-prize gate cleared, blockers `0`.
2. Open the Judge Scorecard.
3. Open the real CSPR.live transaction.
4. Show x402 Settlement Batch: four Casper testnet settlement-anchor transactions.
5. Show Scenario Matrix: three RWA assets, distinct policy outcomes, same paid tools.
6. Show Judge Proof Pack: 402 challenge, signed payment, replay rejected, final gate.
7. Show Provider Ledger: `0.62 CSPR` revenue across four paid tools.
8. Show Reality Boundary: testnet scope, reproducible sample data, and production requirements.
9. Show Evidence Verification: `34/34` recomputed checks.
10. Show Submission Audit: final submission checks passing.
11. Close with the repeatable model: any RWA intelligence provider can expose a
   paid MCP tool, and any autonomous treasury can buy intelligence with an
   auditable Casper receipt.

## Current Pre-Submission Status

- Local demo, tests, provider ledger, run history, and evidence bundle are
  working.
- Current RPC endpoint is verified: `https://node.testnet.casper.network/rpc`.
- A local testnet key is funded and has published the final receipt transaction.
- `npm run seal:submission` is now idempotent: it reuses the existing final
  evidence and refreshes the final submission pack without rebroadcasting.
- `npm run audit:submission` verifies the pack as
  `ready_for_highest_prize_submission` with `15/15` checks passed.
- `npm run preflight:x402` builds signed Casper transfer deploys for each paid
  x402 tool call without broadcasting; `npm run verify:x402-preflight` checks the
  deploy hashes, motes conversion, memo derivation, and recipient shape.
- `npm run settle:x402:testnet` has published four Casper testnet
  settlement-anchor transactions for the signed x402 tool payments;
  `npm run verify:x402-settlement` verifies `34/34` settlement-anchor checks.
- `npm run unlock:highest-prize` records zero remaining gates and the final
  Casper explorer URL.
- Public repo, hosted judge demo, walkthrough video, and the real Casper
  explorer URL are now available
  and exported into the BUIDL page.
- Docker/Render hosting configuration and `/api/health` are included as the
  reproducible server-hosting path, while GitHub Pages carries the public judge
  demo.
- A GitHub Actions workflow is included so the public repository can show a
  reproducible green submission-readiness check.

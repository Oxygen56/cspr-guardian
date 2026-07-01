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

Walkthrough video: https://oxygen56.github.io/cspr-guardian/walkthrough.html

## Evidence Table

| Prize Signal | What To Show | Artifact |
| --- | --- | --- |
| Casper-native trust layer | Real receipt deploy hash and CSPR.live explorer URL | `pnpm anchor:testnet`, Casper Receipt panel |
| Agent-to-agent commerce | Four paid tools earning CSPR per run | Provider Ledger panel |
| x402-style payment flow | HTTP 402 challenge, signed payment proof, nonce replay rejection | `/api/oracle/*`, tests, Evidence Bundle |
| MCP-style tool discovery | Agent discovers paid RWA tools before calling them | Agent Trace, `/mcp/tools` |
| Autonomous workflow | Agent evaluates risk, KYB, liquidity, and covenants before deciding | Decision panel and trace |
| RWA relevance | Invoice financing pool gets risk, compliance, liquidity, and covenant checks | RWA signal reports |
| Auditability | Evidence bundle hashes every payment proof, report, decision, and receipt | Evidence Bundle panel and JSON |
| Independent verification | Signatures, tx hashes, report hashes, receipt hash, evidence hash, and revenue totals recompute | Evidence Verification panel, `pnpm verify:evidence` |
| Reviewer proof pack | 402 challenge, signed payment, replay rejection, agent run, verifier, prize gate | `submission/judge-proof-pack.md`, `submission/judge-proof-pack.json`, `pnpm judge:proof` |
| Real deploy readiness | Signed Casper transfer deploy builds locally without broadcasting | `submission/casper-testnet-preflight.md`, `submission/casper-testnet-preflight.json`, `pnpm preflight:testnet` |
| x402 real settlement path | Each paid tool payment can build a signed Casper transfer deploy without broadcasting | `submission/casper-x402-settlement-preflight.md`, `pnpm preflight:x402`, `pnpm verify:x402-preflight` |
| Testnet readiness | RPC health, public key, funding status, and readiness gate are visible | Testnet Readiness panel |
| Business model | Providers earn per tool call and history persists across runs | Provider Ledger and Run History |
| Submission clarity | Copy-ready BUIDL fields, artifact links, demo flow, and remaining gate are consolidated | `casper-buidl-submission.md`, `pnpm export:buidl` |
| Submission auditability | Final pack, BUIDL page, seal, leak scan, source zip exclusions, and self-reference checks are verified before upload | Submission Audit panel, `casper-submission-audit.md`, `pnpm audit:submission` |
| Highest-prize unlock gate | Faucet funding, wallet/reCAPTCHA requirement, public links, and post-funding commands are consolidated | `submission/casper-highest-prize-unlock.md`, `pnpm unlock:highest-prize` |
| Hosted demo readiness | Docker, Render blueprint, health endpoint, and public-link export path are prepared | `casper-public-demo-handoff.md`, `pnpm check:public-demo`, `/api/health` |
| Public repo verification | Tests, evidence verifier, preflight verifier, and hosting readiness run in CI | `.github/workflows/submission-readiness.yml`, `casper-ci-readiness.md`, `pnpm check:ci` |

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
- `submission/casper-highest-prize-unlock.md`: human-readable highest-prize
  gate report for faucet funding, public links, and final seal commands.
- `submission/casper-highest-prize-unlock.json`: machine-readable
  highest-prize unlock report.
- `submission/submission-assets.md`: screenshot and upload checklist.
- `casper-buidl-submission.md`: copy-ready BUIDL submission page fields and
  final judge narrative.
- `casper-submission-audit.md`: external audit showing submission package
  status and any remaining final gate.
- `casper-public-demo-handoff.md`: public hosting handoff for repo, hosted
  demo, video, and BUIDL link export.
- `casper-ci-readiness.md`: summary of the same checks wired into GitHub
  Actions for the public repository.

## 90-Second Judge Path

1. Run the agent from the dashboard.
2. Point to the trace: discovery -> payment -> paid tools -> decision -> receipt.
3. Open Provider Ledger and show `0.62 CSPR` revenue across four tools.
4. Open Testnet Readiness and show RPC health plus funding status.
5. Open Evidence Bundle and show signed x402 proofs plus report hashes.
6. Open Evidence Verification and show all checks passing.
7. Open the judge proof pack and show 402 -> signed payment -> replay rejected.
8. Open Casper Receipt and show receipt hash, deploy hash, and explorer URL.
9. Close with the repeatable model: any RWA intelligence provider can expose a
   paid MCP tool, and any autonomous treasury can buy intelligence with an
   auditable Casper receipt.

## Current Pre-Submission Status

- Local demo, tests, provider ledger, run history, and evidence bundle are
  working.
- Current RPC endpoint is verified: `https://node.testnet.casper.network/rpc`.
- A local testnet key is prepared and waiting for faucet funding.
- `pnpm finalize:testnet` is ready to produce final explorer evidence after
  funding.
- `pnpm audit:submission` is ready to verify the pack and currently should show
  only the remaining real funded testnet deploy gate as blocked after the public
  repo, hosted demo, and walkthrough video URLs are exported.
- `pnpm preflight:x402` builds signed Casper transfer deploys for each paid
  x402 tool call without broadcasting; `pnpm verify:x402-preflight` checks the
  deploy hashes, motes conversion, memo derivation, and recipient shape.
- `pnpm unlock:highest-prize` records the current CSPR.live faucet/wallet
  funding gate and exact post-funding commands.
- The remaining hard evidence is a funded testnet account plus one real
  explorer URL.
- Public repo, hosted judge demo, and walkthrough video URLs are now available
  and exported into the BUIDL page.
- Docker/Render hosting configuration and `/api/health` are included as the
  reproducible server-hosting path, while GitHub Pages carries the public judge
  demo.
- A GitHub Actions workflow is included so the public repository can show a
  reproducible green submission-readiness check.

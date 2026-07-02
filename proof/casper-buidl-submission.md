# CSPR Guardian BUIDL Submission

Generated: 2026-07-02T21:23:25.985Z

## Copy-Paste Fields

Project name:

```text
CSPR Guardian
```

Tagline:

```text
Casper payment and audit receipts for autonomous RWA treasury agents.
```

Short description:

```text
Review-ready RWA agent where autonomous treasuries buy paid x402/MCP risk tools and anchor verifiable decision evidence to Casper.
```

Categories:

```text
Casper, AI agents, x402, MCP, RWA, DeFi, auditability
```

Repository URL:

```text
https://github.com/Oxygen56/cspr-guardian
```

Demo URL:

```text
https://oxygen56.github.io/cspr-guardian/
```

Video URL:

```text
https://oxygen56.github.io/cspr-guardian/walkthrough.html
```

Casper explorer URL:

```text
https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a
```

## Long Description

CSPR Guardian lets an agent discover paid RWA intelligence tools, pay through x402-style Casper proofs, make a constrained allocation decision, and export a verifiable receipt.

CSPR Guardian demonstrates a Casper-native agent economy. An autonomous RWA
treasury agent discovers paid MCP-style tools, receives x402-style payment
requirements, signs Ed25519 payment authorizations with nonce replay protection,
buys risk/KYB/liquidity/covenant intelligence, makes a constrained allocation
decision, records provider revenue, and exports tamper-evident evidence.

The key Casper angle is provenance: each run produces payment hashes, report
hashes, a decision hash, a receipt hash, and a Casper receipt anchor path. The
final seal publishes real CSPR.live deploy evidence and regenerates this pack
with the final review gate cleared.

This is designed to be easier to evaluate than single-feature entries. It is not only an
x402 endpoint, not only an MCP catalog, and not only a DeFi assistant. It is a
complete paid-agent workflow with replay-safe payments, four paid RWA
intelligence tools, provider revenue, four x402 settlement-anchor transactions,
independent verification, a public demo, and a real Casper testnet receipt.

The hosted proof room gives judges browser-accessible Markdown and JSON
artifacts for the final audit, proof pack, submission seal, testnet evidence,
preflight files, x402 settlement batch, architecture and threat model, browser
proof verifier, reality boundary FAQ, BUIDL fields, CI readiness, and public
demo readiness:
https://oxygen56.github.io/cspr-guardian/proof-room.html

The judge decision brief is the fastest final-review entry point:
https://oxygen56.github.io/cspr-guardian/judge-decision.html

## Rubric Alignment

| Area | Evidence |
| --- | --- |
| Technical execution | 100/100 review readiness, 34/34 evidence checks, signed deploy preflight, real x402 settlement anchors, public CSPR.live receipt |
| Innovation and originality | Paid RWA intelligence market with autonomous buyers, paid providers, replay-safe payment proofs, and verifiable allocation evidence |
| AI agent use | Agent discovers tools, pays, consumes risk/KYB/liquidity/covenant data, decides under policy, and exports proof |
| Casper integration | x402-style Casper payments, testnet account, settlement anchors, receipt hash, deploy evidence, and explorer URLs |
| Judge experience | Hosted demo, 64-second walkthrough, judge decision brief, one-screen architecture map, browser proof verifier, reality boundary FAQ, screenshots, proof pack, audit output, and copy-ready links |

## Readiness

- Score: 100/100
- Status: final-review-ready
- Final review gate cleared: true
- Public links ready: true
- Missing public links: none
- Testnet account: funded
- Public key: 011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
- Preflight build: ok
- Next command: npm run seal:submission

## Remaining Gate

- None

## Judge Proof

Evidence checks: 34/34

Preflight checks: 11/11

| Assertion | Status | Evidence |
| --- | --- | --- |
| mcp-tool-discovery | pass | 7 tools exposed, including four x402-Casper paid tools |
| payment-required | pass | Risk oracle returns HTTP 402 plus PAYMENT-REQUIRED before payment |
| signed-payment | pass | Ed25519 signed authorization unlocks the paid oracle |
| nonce-replay-protection | pass | Reusing the same signed payment proof is rejected |
| agentic-rwa-run | pass | Agent buys four signals, decides under policy, and records provider revenue |
| independent-verifier | pass | 34/34 checks passed |
| real-deploy-preflight | pass | 11/11 real deploy preflight checks passed |
| x402-settlement-preflight | pass | 28/28 signed x402 settlement transfer checks passed |
| x402-real-settlement | pass | 34/34 real x402 settlement-anchor checks passed |
| casper-final-gate | pass | Real CSPR.live deploy evidence is present |

## Paid Tools

| Tool | Price | Payment |
| --- | --- | --- |
| rwa.risk_score | 0.25 CSPR | x402-casper |
| rwa.kyb_screen | 0.10 CSPR | x402-casper |
| rwa.liquidity_depth | 0.15 CSPR | x402-casper |
| rwa.covenant_monitor | 0.12 CSPR | x402-casper |

## Demo Flow

1. Open the dashboard and show Review Readiness at 100/100.
2. Run the agent on the RWA opportunity.
3. Show MCP discovery, x402 payment requirements, signed payment proofs, and replay rejection.
4. Show paid RWA risk, KYB, liquidity, and covenant reports.
5. Show the decision, provider revenue, run history, and receipt hash.
6. Open the x402 settlement batch with four Casper testnet transaction links.
7. Open the architecture map and show trust boundaries.
8. Open the browser verifier and recompute all public proof artifact hashes.
9. Open the reality boundary FAQ and show what is testnet prototype scope.
10. Show Evidence Verification with all checks passing.
11. Show Final Seal and the submission pack hash.
12. Open the real CSPR.live explorer URL for the final receipt.

## Artifacts

- Submission pack: `cspr-guardian-final-submission.zip`
- Submission pack SHA-256: see `casper-final-submission-seal.json`
- Source zip: `cspr-guardian-prototype.zip`
- Judge proof: `casper-judge-proof-pack.md`
- Final seal: `casper-final-submission-seal.md`
- Preflight proof: `casper-testnet-preflight.md`
- x402 settlement batch: `casper-x402-settlement-batch.md`
- Judge decision brief: `judge-decision.md`
- Architecture and threat model: `architecture.md`
- Browser proof verifier: `browser-verifier.md`
- Reality boundary and judge FAQ: `judge-faq.md`

Screenshots:

- `cspr-guardian-dashboard.png`
- `cspr-guardian-review-readiness.png`
- `cspr-guardian-judge-proof.png`
- `cspr-guardian-testnet-preflight.png`
- `cspr-guardian-evidence-verification.png`

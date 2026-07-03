# DoraHacks Page Update

Use this as the current DoraHacks project description if the page can still be
edited.

## Short Description

CSPR Guardian is the audit trail for autonomous RWA treasury agents: buy paid
risk intelligence, decide under policy, and prove the evidence on Casper.

## Details

CSPR Guardian makes autonomous RWA treasury decisions easier to trust. Before
an agent allocates capital, it proves which paid data it bought, how the policy
decision was made, who earned provider revenue, and which Casper receipt
anchors the evidence.

In one line: buy the data, decide under policy, prove it on Casper.

Reviewer start point:
https://oxygen56.github.io/cspr-guardian/judge-decision.html

Final proof:

- Review readiness: 100/100, final review gate cleared.
- Browser proof verifier: 33/33 public artifacts verified, 0 failed.
- Evidence verifier: 34/34 checks passing.
- Submission audit: 15/15 checks passing, 0 blocked, 0 failed.
- Unit tests: 25/25 passing.
- x402 settlement anchors: four Casper testnet transactions tied to signed
  x402 authorizations.
- Final Casper receipt:
  https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a

What it demonstrates:

- A simple treasury audit workflow: paid data -> policy decision -> Casper proof.
- Paid MCP-style tool discovery and x402-style settlement semantics.
- Ed25519 signed payment authorizations with nonce replay protection.
- Four paid RWA intelligence products: risk, KYB/sanctions, liquidity depth,
  and covenant monitoring.
- Provider revenue accounting and verifier-ready receipts.
- A deterministic RWA allocation decision with report hashes, payment hashes,
  a decision hash, and a receipt hash.
- A browser-native proof verifier that recomputes SHA-256 hashes for the public
  proof manifest without requiring a repo clone.
- A category-leadership brief showing why the full
  money-data-decision-receipt loop is stronger than a single primitive demo.
- A reality boundary that separates real Casper testnet evidence, reproducible
  sample provider data, and production requirements.

Links:

- Judge decision brief: https://oxygen56.github.io/cspr-guardian/judge-decision.html
- Demo app: https://oxygen56.github.io/cspr-guardian/
- Walkthrough: https://oxygen56.github.io/cspr-guardian/walkthrough.html
- Proof room: https://oxygen56.github.io/cspr-guardian/proof-room.html
- Browser proof verifier: https://oxygen56.github.io/cspr-guardian/verifier.html
- Judge scorecard: https://oxygen56.github.io/cspr-guardian/judge-scorecard.html
- Architecture map: https://oxygen56.github.io/cspr-guardian/architecture.html
- Reality boundary and FAQ: https://oxygen56.github.io/cspr-guardian/judge-faq.html
- Category leadership: https://oxygen56.github.io/cspr-guardian/proof/category-leadership.md
- Final-review advantage: https://oxygen56.github.io/cspr-guardian/proof/final-review-advantage.md
- x402 settlement batch: https://oxygen56.github.io/cspr-guardian/proof/casper-x402-settlement-batch.md
- Scenario matrix: https://oxygen56.github.io/cspr-guardian/proof/casper-scenario-matrix.md
- Repository: https://github.com/Oxygen56/cspr-guardian

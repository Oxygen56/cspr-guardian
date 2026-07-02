# Reality Boundary And Judge FAQ

This artifact answers the questions a judge should ask before trusting the
submission. It separates the real, verifiable parts from the prototype scope.

Public page:

```text
https://oxygen56.github.io/cspr-guardian/judge-faq.html
```

## What Is Real

| Claim | Evidence |
| --- | --- |
| The demo is public | `https://oxygen56.github.io/cspr-guardian/` |
| The final Casper receipt is public | `https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a` |
| The x402 settlement anchors are public | `proof/casper-x402-settlement-batch.md` |
| The agent produces signed payment proofs | `proof/casper-judge-proof-pack.md` and JSON proof pack |
| Replayed payment proofs are rejected | `proof/casper-judge-proof-pack.md` |
| Evidence is independently recomputed | `proof/casper-submission-audit.md`, `proof/proof-manifest.md` |
| The submission pack is audited | `proof/casper-submission-audit.md` |
| The public artifacts are leak-scanned | `proof/casper-submission-audit.json` |

## Prototype Boundary

| Area | Current scope | Production requirement |
| --- | --- | --- |
| Network | Casper testnet evidence and settlement anchors | Mainnet deployment policy, custody controls, and production monitoring |
| RWA data providers | Deterministic provider data in the repo for reproducible judging | Licensed KYB, sanctions, liquidity, and covenant providers |
| Payments | x402-style Casper authorization and testnet settlement-anchor transactions | Provider settlement registry, SLA enforcement, and payment dispute handling |
| Treasury action | Policy-bounded allocation decision and audit evidence | Real custody integration, human approval controls, and legal/compliance review |
| Security | Private-key leak scans and no published private keys | Formal threat review, key management, and operational incident procedures |

## Judge Questions

### Is this more than a UI?

Yes. The agent discovers paid tools, receives HTTP 402-style payment
requirements, signs payment authorizations, consumes four paid intelligence
signals, rejects replay, records provider revenue, produces a policy decision,
and exports proof artifacts.

### Is Casper used in a meaningful way?

Yes. Casper is used as the durable receipt and settlement-anchor layer. The
submission includes one final CSPR.live receipt plus four public x402
settlement-anchor transactions tied to the paid tool authorizations.

### Is it a mainnet financial product?

No. It is a testnet buildathon prototype. It demonstrates the payment,
evidence, and audit mechanics without representing production custody,
investment advice, or mainnet financial execution.

### Can a judge verify it without trusting screenshots?

Yes. The proof room publishes Markdown and JSON artifacts plus a SHA-256
manifest. The verifier recomputes signatures, payment hashes, report hashes,
decision hash, receipt hash, evidence hash, and provider revenue totals.

### Why should this stand out against simpler x402 or agent demos?

CSPR Guardian combines the full loop in one review path: paid discovery,
payment requirement, signed authorization, replay protection, paid RWA
intelligence, provider revenue, policy-bounded decision, public settlement
anchors, final Casper receipt, and independent verification.

### What is the fastest verification path?

1. Open the judge demo.
2. Open the proof room and confirm `100/100`, `15/15`, and `34/34`.
3. Open the architecture map to inspect trust boundaries.
4. Open the x402 settlement batch and final CSPR.live receipt.
5. Open this FAQ to confirm the prototype boundary.

# Architecture And Threat Model

This artifact gives judges a one-screen map of what CSPR Guardian does and how
each trust boundary is verified.

Public page:

```text
https://oxygen56.github.io/cspr-guardian/architecture.html
```

Reality boundary:

```text
https://oxygen56.github.io/cspr-guardian/judge-faq.html
```

## System Map

```text
Treasury agent
  -> MCP tool discovery
  -> HTTP 402 x402-Casper requirements
  -> Ed25519 payment authorizations with nonce replay protection
  -> paid RWA intelligence providers
  -> policy-bounded allocation decision
  -> evidence bundle and independent verifier
  -> Casper testnet receipt anchor
```

## Trust Boundaries

| Boundary | Risk | Control | Judge evidence |
| --- | --- | --- | --- |
| Tool discovery | Agent calls an unpriced or hidden tool | MCP-style metadata lists paid tools before use | `casper-judge-proof-pack.md` |
| Payment challenge | Service grants data before payment | Paid tools return HTTP 402 and `PAYMENT-REQUIRED` | `casper-judge-proof-pack.md` |
| Payment proof | A proof is replayed or forged | Ed25519 signature, nonce, expiry, and authorization hash | `casper-judge-proof-pack.json` |
| Settlement anchor | x402 claims are only local mocks | Four Casper testnet settlement-anchor transactions | `casper-x402-settlement-batch.md` |
| RWA intelligence | Agent decides from unsupported data | Four paid reports: risk, KYB, liquidity, covenant | Evidence bundle and scenario matrix |
| Policy decision | Agent over-allocates capital | Deterministic cap, risk gates, and scenario replay | `casper-scenario-matrix.md` |
| Evidence bundle | Screenshots are stale or unverifiable | Hashes, signatures, revenue totals, and receipt recompute | `casper-submission-audit.md` |
| Casper anchor | Final receipt is not public | CSPR.live transaction and memo derivation | `casper-final-testnet-evidence.md` |
| Secret handling | Private key leaks into public artifacts | Leak scans before proof publish and submission pack export | `casper-submission-audit.json` |

## Why This Matters For Scoring

CSPR Guardian is not just an interface over a model. It is a full agent
commerce loop with priced tools, signed authorization, replay protection,
provider revenue, repeatable RWA policy outcomes, public settlement anchors,
and a final Casper receipt.

The key judging advantage is that every important claim has a corresponding
artifact:

- "The agent used paid tools" maps to HTTP 402, x402 signatures, and paid tool
  ledger entries.
- "The provider was paid" maps to provider revenue and four Casper testnet
  settlement-anchor transactions.
- "The decision was constrained" maps to deterministic policy output and the
  three-scenario matrix.
- "The proof is not screenshot-only" maps to verifier output, proof manifest
  hashes, and the public CSPR.live receipt.

## One-Minute Verification Path

1. Open `architecture.html` for the system map.
2. Open `proof/casper-x402-settlement-batch.md` for four settlement anchors.
3. Open `proof/casper-scenario-matrix.md` for repeatability.
4. Open `proof/casper-submission-audit.md` for final audit status.
5. Open the CSPR.live transaction for the final receipt.
6. Open `judge-faq.html` to confirm what is real, what is testnet prototype
   scope, and what production work remains.

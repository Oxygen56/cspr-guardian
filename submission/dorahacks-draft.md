# CSPR Guardian

## One-Liner

CSPR Guardian turns Casper into the payment and audit layer for autonomous RWA
treasury agents.

## Problem

Autonomous agents can source DeFi/RWA opportunities, but they lack a reliable
way to pay specialized services, prove which data they used, and leave an
auditable record for humans and DAOs.

## Solution

CSPR Guardian is an agent workflow that:

1. Discovers a paid RWA risk oracle through MCP-style tool metadata.
2. Receives x402-style Casper payment requirements.
3. Signs Ed25519 payment proofs with expiry and nonce replay protection.
4. Calls paid RWA risk, KYB/sanctions, liquidity-depth, and covenant-monitoring oracles.
5. Makes an allocation decision under a safety policy.
6. Records provider revenue and run history.
7. Exports a downloadable evidence bundle with x402 proofs and receipt hashes.
8. Anchors a decision receipt to Casper.

## Why Casper

Casper is used as the trust layer for agent commerce: payments, receipt hashes,
and decision provenance can be verified without trusting the app server. This
is especially important for RWA and treasury workflows where every automated
decision needs an audit trail.

## What Is Working

- Local agent orchestration.
- MCP-like tool discovery endpoint.
- x402-style payment-required oracle with `PAYMENT-REQUIRED` headers.
- Signed payment proofs with nonce replay protection.
- Autonomous RWA scoring and allocation policy.
- Paid KYB/sanctions screening tool.
- Paid liquidity-depth oracle.
- Paid covenant-monitoring oracle.
- Provider revenue accounting and persisted run history.
- Downloadable Evidence Bundle JSON with x402 proofs, report hashes, decision
  hash, receipt hash, and evidence hash.
- Evidence verifier that recomputes x402 signatures, authorization hashes,
  payment hashes, report hashes, decision hash, receipt hash, evidence hash,
  and revenue totals.
- Testnet readiness scripts for key generation, RPC health, balance checking,
  and real receipt anchoring.
- Judge evidence map that ties every prize signal to a visible artifact.
- Mock Casper payment and receipt deploy hashes.
- Dashboard showing the full trace.

## What Comes Before Final Submission

- Fund generated Casper testnet key.
- Real Casper testnet receipt deploy.
- Real explorer link.
- Hosted demo.
- Walkthrough video.

# 90-Second Demo Script

## 0-10s

CSPR Guardian is a Casper payment and audit layer for autonomous RWA treasury
agents. It lets agents buy specialized tools, make a constrained allocation
decision, and leave a verifiable Casper receipt.

## 10-25s

Open the dashboard and choose the USDC invoice financing pool. The agent will
not call free mock data: each tool exposes an x402-style payment requirement.

## 25-45s

Run the agent. Show the trace:

- MCP tool discovery
- signed x402-Casper payment authorizations
- paid RWA risk oracle
- paid KYB/sanctions oracle
- paid liquidity-depth oracle
- paid covenant-monitoring oracle

## 45-65s

Show the decision panel. The agent combines risk score, KYB policy, liquidity
coverage, slippage, and executable size. It approves, limits, or rejects under
a safety policy.

## 65-78s

Show Provider Ledger and Run History. Four paid tools earn CSPR and every run
persists receipt hashes, proving the agent-to-agent marketplace model.

## 78-90s

Show the Evidence Bundle, Evidence Verification, and Casper Receipt panels.
The verifier recomputes signatures, payment hashes, report hashes, decision
hash, receipt hash, and evidence hash. Download the JSON evidence bundle, then
open the testnet explorer link after `CASPER_MODE=real` is funded.

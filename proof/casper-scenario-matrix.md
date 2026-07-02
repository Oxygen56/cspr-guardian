# Casper Scenario Matrix

Generated: 2026-07-02T13:37:45.446Z

Status: repeatable_rwa_policy_matrix_ready

Scenarios: 3

Paid tools per scenario: 4

Provider revenue per full run: 0.62 CSPR

Total provider revenue if all scenarios run: 1.86 CSPR

## Decision Matrix

| Asset | Category | Risk | KYB | Liquidity | Covenant | Decision | Approved | Human review |
| --- | --- | --- | --- | --- | --- | --- | ---: | --- |
| USDC invoice financing pool | invoice-finance | 91/100 | pass | pass | standard-watch | approve | $207,452 | no |
| Tokenized T-bill rollover vault | treasury | 93/100 | pass | pass | standard-watch | approve | $426,357 | no |
| Emerging market trade credit note | trade-credit | 59/100 | manual-review | cap-or-review | critical-watch | reject | $0 | yes |

## Paid Tool Stack

| Tool | Price | Payment |
| --- | --- | --- |
| rwa.risk_score | 0.25 CSPR | x402-casper |
| rwa.kyb_screen | 0.10 CSPR | x402-casper |
| rwa.liquidity_depth | 0.15 CSPR | x402-casper |
| rwa.covenant_monitor | 0.12 CSPR | x402-casper |

## Policy Signals

- USDC invoice financing pool: Enable weekly covenant checks
- USDC invoice financing pool: Persist monitoring proof with the Casper receipt
- Tokenized T-bill rollover vault: Enable weekly covenant checks
- Tokenized T-bill rollover vault: Persist monitoring proof with the Casper receipt
- Emerging market trade credit note: KYB requires manual review
- Emerging market trade credit note: Elevated 90-day late-payment rate
- Emerging market trade credit note: Thin exit liquidity
- Emerging market trade credit note: Policy score below autonomous allocation threshold
- Emerging market trade credit note: KYB document freshness needs review
- Emerging market trade credit note: BR jurisdiction risk is medium
- Emerging market trade credit note: Requested allocation is large relative to exit liquidity
- Emerging market trade credit note: Estimated slippage exceeds autonomous policy threshold
- Emerging market trade credit note: Block autonomous execution until reviewer approval
- Emerging market trade credit note: Enable daily covenant checks
- Emerging market trade credit note: Persist monitoring proof with the Casper receipt

## Judge Takeaway

CSPR Guardian is repeatable beyond one invoice pool. The same paid MCP/x402
tool stack produces different policy outcomes across treasury, invoice-finance,
and trade-credit assets, including an autonomous approval path and a reviewer
gate for weaker credit.

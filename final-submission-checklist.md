# Final Submission Checklist

This project is not prize-ready until every required evidence item below is
true and visible to judges.

## Hard Evidence

- Real Casper testnet transaction or deploy hash for one decision receipt.
- Explorer link that opens the receipt transaction.
- `npm run check:testnet` output showing RPC health, funded account status, and
  enough balance for the receipt anchor.
- `npm run preflight:testnet` output showing a signed deploy build with
  `deployBuild.status: "ok"` and a numeric memo derived from the receipt hash.
- `npm run verify:preflight` output showing the real deploy preflight checks
  passing without exposing private key material.
- `npm run preflight:x402` and `npm run verify:x402-preflight` output showing all
  four x402 paid tool payments can build signed Casper transfer deploys without
  broadcasting or exposing private key material.
- `npm run unlock:highest-prize` output producing
  `casper-highest-prize-unlock.json` and `.md`, with faucet/wallet funding
  state, public-link state, and the exact post-funding commands.
- `PAYMENT-REQUIRED` response visible for at least one paid oracle.
- Signed x402-Casper payment proof visible in the receipt JSON or logs.
- Downloadable Evidence Bundle JSON with x402 proofs, report hashes, decision
  hash, receipt hash, and evidence hash.
- Evidence Verification panel or `npm run verify:evidence` output showing all
  signature, hash, receipt, and revenue checks passing.
- `npm run judge:proof` output showing the 402 challenge, signed authorization,
  replay rejection, agent run, verifier, and final Casper gate.
- `npm run export:submission` output producing a final submission directory and
  zip with `manifest.json` SHA-256 hashes.
- `npm run seal:submission` output producing `casper-final-submission-seal.json`
  and `.md`; the final submitted state must say
  `ready_for_highest_prize_submission`.
- `npm run audit:submission` output producing `casper-submission-audit.json` and
  `.md`; the final submitted state should say
  `ready_for_highest_prize_submission`.
- `npm run check:public-demo` output producing `casper-public-demo-readiness.json`
  and `casper-public-demo-handoff.md`; before public-link upload only
  `public_links_configured` should be missing.
- `npm run check:ci` output producing `casper-ci-readiness.json` and `.md`, plus
  a green GitHub Actions run from `.github/workflows/submission-readiness.yml`.
- Repository URL with source code, README, and local run instructions.
- Hosted demo URL or a screen recording that proves the flow.
- Public video URL and hosted demo URL exported through `SUBMISSION_DEMO_URL`
  and `SUBMISSION_VIDEO_URL` before the final BUIDL export.
- DoraHacks BUIDL page with screenshots, video, and track tags.
- Product, preflight, judge proof, and verifier screenshots from
  `submission/assets/`; Final Seal JSON/MD from the outputs directory provides
  the external package-hash proof, and Submission Audit JSON/MD provides the
  external pre-submit self-check.

## Highest-Prize Demo Script

1. Start on the dashboard with an RWA opportunity selected.
2. Run the agent.
3. Show MCP tool discovery.
4. Show HTTP 402 payment requirement.
5. Show signed payment proofs and provider revenue.
6. Show paid RWA risk output and paid KYB/sanctions output.
7. Show paid liquidity-depth output.
8. Show paid covenant-monitor output.
9. Show provider revenue history and run history.
10. Show the Evidence Bundle panel and download the JSON.
11. Show Evidence Verification with all checks passing.
12. Show the judge proof pack: 402 -> signed payment -> replay rejected.
13. Show the autonomous allocation decision.
14. Open the Casper explorer receipt.
15. Close with the business model: every risk provider can monetize MCP tools,
   and every autonomous treasury gets auditable decisions.

## Next Implementation Tasks

1. Run `npm run check:public-demo` and use `casper-public-demo-handoff.md` to
   publish the repository, host the demo, and record/upload the walkthrough.
2. Run `npm run check:ci` and confirm local readiness passes.
3. Export BUIDL fields with `SUBMISSION_REPO_URL`, `SUBMISSION_DEMO_URL`, and
   `SUBMISSION_VIDEO_URL`.
4. Fund the generated testnet public key.
5. Run `npm run check:testnet` until `readyForAnchor` is `true`.
6. Run `npm run unlock:highest-prize` and confirm funding/public-link gates are
   accurately reported.
7. Run `npm run preflight:testnet` and confirm the signed deploy build is `ok`.
8. Run `npm run verify:preflight` and confirm every preflight check passes.
9. Run `npm run preflight:x402` and `npm run verify:x402-preflight`.
10. Run `npm run seal:submission` to finalize the real deploy, rebuild proof files,
   rebuild the source zip, and export the final pack.
11. Run `npm run audit:submission` and confirm all checks pass.
12. Confirm `casper-final-submission-seal.json` says
   `ready_for_highest_prize_submission`.
13. Confirm `casper-submission-audit.json` says
   `ready_for_highest_prize_submission`.
14. Replace the funding-gate note with the real CSPR.live explorer link.
15. Upload screenshots from `submission/assets/`.
16. Replace local JSON ledger with a hosted database for multi-user history.
17. Add live oracle data integrations for RWA issuers.

The code already includes a `CASPER_MODE=real` transfer-memo adapter. It still
needs the generated testnet key to be funded and a verified explorer link
before the project can claim real on-chain evidence.

## Risks

- A mock deploy hash cannot win the top prize by itself.
- A generic chatbot UX will look weaker than the agent trace.
- RWA claims need to stay framed as demo intelligence, not financial advice.

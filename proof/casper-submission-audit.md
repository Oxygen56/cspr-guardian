# Casper Submission Audit

Generated: 2026-07-02T17:29:49.304Z

Status: ready_for_highest_prize_submission

Checks: 15/15 passed, 0 blocked, 0 failed.

## Final Gate

- Seal status: ready_for_highest_prize_submission
- Prize score: 100/100
- Highest-prize gate: cleared
- Account status: funded
- Public key: 011255a703e9f2855746cf9443e898047320a813975ac9756fff41777ab47f07c2
- Explorer URL: https://testnet.cspr.live/transaction/7982fc56043fe482643d49478c0ecaf696f1e7db979021a23ae6a4841516cb5a
- Next command: `npm run seal:submission`

## Public Submission Links

- repoUrl: https://github.com/Oxygen56/cspr-guardian
- demoUrl: https://oxygen56.github.io/cspr-guardian/
- videoUrl: https://oxygen56.github.io/cspr-guardian/walkthrough.html

## Checks

| Check | Status | Detail |
| --- | --- | --- |
| evidence_verified | pass | 34/34 evidence checks passed. |
| preflight_verified | pass | 11/11 preflight checks passed. |
| x402_settlement_preflight_verified | pass | 28/28 x402 settlement preflight checks passed. |
| x402_settlement_batch_verified | pass | 34/34 real x402 settlement-anchor checks passed. |
| submission_pack_present | pass | Final pack status is ready; missing required files: 0. |
| buidl_page_present | pass | BUIDL page fields, final seal reference, and funding command are present. |
| public_submission_fields | pass | Repository, hosted demo, and video URLs are concrete public links. |
| public_demo_host_ready | pass | Docker, Render, health endpoint, start script, and public links are ready. |
| ci_readiness_present | pass | CI readiness report covers tests, evidence, preflight, highest-prize unlock, and public demo readiness. |
| final_seal_present | pass | Final seal is ready_for_highest_prize_submission; package hash source is seal. |
| highest_prize_unlock_present | pass | Highest-prize unlock report is ready_for_highest_prize_submission with 0 remaining gate(s). |
| highest_prize_gate | pass | Real Casper testnet receipt evidence is ready for highest-prize submission. |
| private_key_leak_scan | pass | 70 text artifacts scanned with no private key material. |
| source_zip_exclusions | pass | Source archive excludes node_modules, .local, and .env. |
| final_pack_no_self_reference | pass | Final pack does not include external seal or audit files that would self-reference the zip. |

## Action Items

- No failed audit checks.


## Integrity Files

- Submission pack: `outputs/cspr-guardian-final-submission.zip`
- Submission pack SHA-256: `fed1ce2ee93c72a82967de8860c56d505a56428d789b32fe8a1996dba5508ef4`
- Source archive: `outputs/cspr-guardian-prototype.zip`
- Final seal: `casper-final-submission-seal.json`
- Seal markdown: `casper-final-submission-seal.md`
- Highest-prize unlock: `casper-highest-prize-unlock.json`

The submission zip intentionally does not include `casper-final-submission-seal.*` or `casper-submission-audit.*`; those files sit beside it as external integrity proofs.

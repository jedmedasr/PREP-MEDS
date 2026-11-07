# SPR-001: source-pinned reconciliation

## Latest verified observation

Main: `4157f497e7b0ff37f428a44e5caeb2c815544a87`.
Audited sprint: `b4cbdc651d952c579cef328ac26eb7eaae5e01bd`, PR #37, open.
Audit implementation: `4a7ec7e158223eccea0719c78a2de1ce627cf418`, separate PR #40.

Run https://github.com/jedmedasr/PREP-MEDS/actions/runs/42374711461 passed **39 focused tests in seven files**. It recomputed **436 canonical IDs, 233 provisional ingredient sets, 48 combination entries**, and mapped all 436 IDs without duplicate IDs or missing ingredients. The antithrombotic discovery queue contains **17 IDs / 17 provisional groups**, with zero completed ASGE comparisons or clinically reviewed groups recorded. This is a discovery-queue denominator, not a proof of exhaustive clinical coverage.

Complete manifest, all 48 combination IDs/ingredient arrays, actual review metadata, queue and source archive: https://github.com/jedmedasr/PREP-MEDS/actions/runs/42374711461/artifacts/13575206760.
Manifest SHA256: `c73ef3b597d0c18bc1df9f4c8359ea434108b4db43d24a65ce8c4f844bf768cb`.
ZIP SHA256: `c0ddfd0897cdc8b3bbaaa91e48f9caf62c09cfef261143f24724e6c7e074f56e`.
Artifacts expire after 30 days; the committed pinned workflow/exporter reproduces the inventory, while `latest-observation.json` and the appended evidence ledger preserve the findings.

## Concurrent progress reconciled, not overwritten

The first audit used `5a4b8cb714f1f2aafa8ce34428514a67d9517fd1`, passed 12 tests and verified the same 436/233/48 counts. During this session Stage 2 live reconciliation detected 16 externally authored sprint commits. We re-read the new checklist and manifest and re-pinned the independent audit rather than treating the old report as current. No commits, comments, reruns, automation changes or merge were made to PR #37.

The new manifest now contains per-ID status/date/commit/source/test/remaining-issue fields and a canonical-ID group map. All 436 statuses are NOT_STARTED; populated review dates, review commits, source versions and test evidence are zero. All 436 have remaining issues. All 233 ingredient groups are PENDING formulation adjudication. Zero adjudicated groups or independently clinically approved mappings were confirmed; the final clinically distinct formulation denominator remains unknown. Draft research exists but is not silently promoted into completed review.

Internal assembled rule-to-atom and atom-to-source version references resolved in the audit. That establishes reference integrity, not the correctness of primary-source interpretation or medical recommendations.

## CI distinctions and disposition

Historical sprint run 42345991815 failed TypeScript on 5a4b8cb7. Calendar source fixes and newer research tests exist on b4cbdc6; the independent focused audit now passes them. No PR-triggered **full quality** run was found for b4cbdc6, so full sprint CI remains unverified, not newly failed and not established as successful. PR #40's separate full application quality checks do not certify the sprint branch.

SPR-001 remains `needs_review`: reconciliation artifacts and acceptance mappings are produced, but independent acceptance/integration is pending. Dependent formulation tasks remain blocked until reviewed adoption. Unfinished clinical validation is a later production gate, not a reason to prevent synthetic demo engineering.

`verified-report.json` and the first three SPR evidence records are historical 5a4b8cb7 evidence; their absence-of-metadata observation is superseded by the new scaffold, not rewritten. The latest record EV-SPR001-20261107-004 and `latest-observation.json` are authoritative for the b4cbdc6 audit. Always re-fetch current PR heads before a new session.

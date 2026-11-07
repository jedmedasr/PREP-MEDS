# PREP-MEDS — 12-hour ingredient/formulation validation sprint

Start: 2026-11-06. Target: four 3-hour work blocks, not a guarantee of clinical approval.
Scope: active ingredient × clinically distinct formulation. Brands/aliases inherit validated group guidance; every canonical medication ID must be mapped and tested.

## Block 1 — inventory and safety triage (start now)
- [x] Enumerate `terminologyDataset.medications` into deterministic machine-readable manifest builder (`apps/web/lib/medication-validation-manifest.ts`); static artifact export and clinical metadata enrichment still pending.
- [ ] Deduplicate into ingredient/formulation review groups, preserve combinations and meaningful route/release differences.
- [x] Record exact provisional totals from CI run 42332062649: 436 canonical medications, 233 unique ingredient sets, 48 combination entries; all ingredient references resolved by passing inventory integrity test. Formulation adjudication and complete source manifest still pending.
- [x] Check PR #37 CI and repair regressions. Latest verified passing run: 42332062649 at commit 672d343f93d058648d18a3406c50ae90fb0c7dd2.\n- [x] Add initial medication inventory integrity tests (duplicate IDs, ingredient references, combinations, provisional grouping), commit 672d343.\n- [x] Capture exact inventory denominators from CI output (run 42332062649, job 128280587303).\n- [x] Commit machine-readable manifest builder and mapping tests (5f3d9ec, dc9b98f); fix TypeScript CI regression (0ed104b).\n- [ ] Adjudicate clinically distinct formulations and verify CI after fix.
Acceptance: committed manifest, exact denominators, zero silent unmapped IDs, CI status documented.

## Block 2 — antithrombotics (at +3 hours)
- [ ] FIRST verify Block 1 artifacts/commit and acceptance criteria; complete any unfinished item before advancing.
- [ ] Reconcile ASGE 2016 vs ACG/CAG 2022, BSG/ESGE 2021 and relevant current guidance per distinct antithrombotic group.
- [ ] Cover procedural bleeding risk, renal function, indication/thrombotic risk, interruption, bridging, restart, DAPT and aspirin.
- [ ] Add positive, negative, edge-case tests and source-linked conflict notes.
Acceptance: antithrombotic group-level review ledger and passing tests, or explicitly listed blockers.

## Block 3 — diabetes and other high-risk drugs (at +6 hours)
- [ ] FIRST verify Block 2 artifacts/commit and acceptance criteria; complete any unfinished item before advancing.
- [ ] Review insulin by basal/prandial/pump and clinically distinct formulation, GLP-1 agents, SGLT2 inhibitors, combinations and other high-risk periendoscopic drugs.
- [ ] Cross-check diet/prep/NPO timing and individualized prescriber approval; test type 1 basal and hypoglycemia safeguards.
- [ ] Map every brand/alias to the correct group; test no missing ingredients in combinations.
Acceptance: documented evidence, scenarios, tests, and unresolved cases.

## Block 4 — remainder, integration and final report (at +9 hours)
- [ ] FIRST verify Block 3 artifacts/commit and acceptance criteria; complete any unfinished item before advancing.
- [ ] Complete remaining group-level guideline reviews, mapping and regression coverage, prioritizing clinical risk.
- [ ] Run complete CI and build, check preview, reconcile audit ledger and count coverage.
- [ ] Report exact reviewed/total groups, mapped/total IDs, tests, unresolved discrepancies, clinical sign-off status.
- [ ] Merge only if CI passes AND patient-facing release governance permits; never activate unapproved shadow rules.
Acceptance: auditable completion report; if incomplete, explicit unfinished groups and realistic revised ETA, no fabricated 100%.

## Mandatory handoff protocol for every run
1. Fetch this checklist and the latest GitHub branch/PR head; inspect prior run's commits, tests and evidence.
2. State **previous block: PASS / PARTIAL / FAIL**, with commit hashes and missing acceptance criteria. Do not infer success from prior messages.
3. Finish any incomplete prior-block tasks first. Then execute the next block's work, commit tangible artifacts, run tests and update this file.
4. Send user a concise progress report with actual completed/total review groups and medication IDs mapped, failures, next actions.
5. If clinical guidelines conflict or independent approval is missing, mark NEEDS_REVIEW and keep patient-facing rules fail-closed.

## Immediate run verification — 2026-11-07
- User-requested automation `run_now` returned success and inline execution in this conversation; scheduled-run history had not shown an execution.
- Previous block status: **PARTIAL**. GitHub Actions passed at `672d343`, but inventory manifest and exact denominators remain unverified.
- Continue Block 1 before advancing. No medications clinically signed off by this engineering check.

## Verified inventory denominator (GitHub Actions 42332062649)
- Canonical medication IDs: **436**.
- Unique ingredient-ID sets: **233** (provisional lower bound for review groups; route/release/formulation can increase it).
- Combination medication entries: **48**.
- Inventory integrity suite: 4/4 tests passed. Duplicate IDs and missing ingredient references: none detected by passing tests.
- This is terminology coverage, NOT guideline validation or independent clinical approval.

## 2026-11-07 run: previous block PARTIAL
- Previous CI run **42341646914 FAILED** at TypeScript typecheck: inferred `reviewStatus: string` incompatible with `'NOT_STARTED'` in manifest builder. Root cause identified from job **128310416747** logs.
- Fixed status literal inference with `as const` in commit **0ed104b60a871dd6bff1caa0d0d2a0b536647ceb**; new CI result must be checked before claiming pass.
- Manifest builder and four new mapping tests committed previously; 436 canonical IDs / 233 provisional ingredient sets / 48 combination entries from earlier passing CI. Distinct formulation-group denominator remains unknown until adjudication. Clinical review 0 groups confirmed; 0 patient-facing rules activated.
- Block 2 antithrombotic reconciliation cannot be declared complete. Proceed once CI and formulation grouping are established; source-specific evidence still required.

## 2026-11-07 continuation — previous Block 1 PARTIAL
- Verified PR #37 remains open at prior head 064a05a; PR #36 was merged into main as ec1ee7e1.
- Commit 064a05a has Vercel status SUCCESS (https://vercel.com/prep-meds/prepmeds/CTBjfJXDkUfeGXj4KDwvzqLrkvbA); GitHub Actions test/typecheck result for that commit is NOT established by this status alone.
- Added research-only ASGE 2016 vs newer guideline reconciliation scaffold in docs/antithrombotic-source-reconciliation.md, commit 9a32493. This does not complete agent-level review, per-ID mapping, or clinical sign-off.
- Denominators unchanged: 436 canonical medication IDs; 233 provisional ingredient sets; 48 combination entries. Final formulation group count unknown; clinically reviewed 0 confirmed. Block 1 acceptance remains PARTIAL; no patient-facing rules activated.
- Next: inspect GitHub Actions for current head, complete formulation-level grouping, and enumerate all antithrombotic IDs for individual ASGE comparator mapping.

## 2026-11-07 continuation — CI verified; research UI wired
- Prior block status PARTIAL: formulation adjudication and per-ID clinical source mapping remain incomplete.
- GitHub Actions quality run 42345077523 completed SUCCESS at eeac28f8bf850efe770148983b280f5f5bff8a7a (https://github.com/jedmedasr/PREP-MEDS/actions/runs/42345077523). This verifies engineering checks only, not clinical accuracy.
- Added clinician-only source-specific timing comparison component (e83e3ee) and mounted it in ClinicalWorkspace (c5e1308). Shows ASGE 2016 renal-stratified apixaban high-risk interruption alongside ACG–CAG 2022 evidence limitations. No patient-facing output or automatic pathway selection.
- Latest UI commit CI/deployment remains PENDING verification; no merge.
- Inventory unchanged: 436 canonical medication IDs; 233 provisional ingredient sets; 48 combinations. Final clinically distinct groups NOT established. Clinically reviewed 0 confirmed; mapped IDs to clinically validated groups 0 confirmed.
- Next: verify latest CI; add complete source-specific timing coverage, mapping tests and formulation adjudication. Research UI must not be interpreted as clinical signoff.

## 2026-11-07 scheduled validation block — previous PARTIAL / CI failure corrected
- Inspected PR #37 head 5a4b8cb and quality run 42345991815: **FAIL**, TypeScript errors in calendar research helper (possibly undefined date components) and malformed Vitest `it.each` tuple typing. Fixed in commits f7f56ab and 523721c; new CI not yet verified.
- Added research-only calendar subtraction helper/tests in aa7ead3/a2c0007, mounted in clinician UI at 5a4b8cb. Candidate dates are NOT verified last permissible dose dates/times. No automatic patient instructions.
- Added deterministic antithrombotic canonical-ID discovery and provisional ingredient-set audit queue in 71a5fc3 with regression tests d22777e. Every discovered record has immutable ID, NOT_STARTED status, explicit ASGE 2016 source and NOT_STARTED comparison, and no clinical approval. This is an enumeration scaffold, NOT a completed per-medication comparator.
- Overall inventory: **436 canonical IDs**, **233 provisional ingredient sets**, **48 combinations** (from earlier passing CI). Final distinct ingredient/formulation group count unverified. Clinically reviewed **0 confirmed groups**; clinically validated canonical-ID mappings **0 confirmed**. Antithrombotic queue runtime counts require CI/runtime verification.
- Current block: **PARTIAL**, pending new CI and exhaustive antithrombotic class discovery/formulation review, dated primary source reconciliation, renal threshold verification, patient-safe last-dose calculation. PR #37 remains open; no merge or clinical signoff.

## 2026-11-07 06:56 ET continuation — previous block PARTIAL
- Inspected PR #37 at head 7b1b662 and previous checklist. The prior run corrected failing TypeScript/tests in f7f56ab and 523721c, but GitHub Actions fetch for 7b1b662 returned no associated PR workflow runs; a PASS cannot be asserted. Previous completed failure 42345991815 remains documented. This is an **unverified CI gate**, not evidence of a new failure.
- Finished a missing Block 1 requirement: per-canonical-ID audit metadata (status enum, last-reviewed date, review commit, source versions, test evidence, remaining issues) and deterministic canonical-to-provisional-group map in medication-validation-manifest.ts, commit 6378c1a.
- Extended antithrombotic queue with per-ID review provenance, pending issues and explicit ASGE 2016 reference, commit 117f8fa. Added cross-inventory completeness, inheritance and fail-closed comparator tests, commit adf3ee0.
- Source attachment is NOT a completed source comparison. All records remain NOT_STARTED. No group clinically signed off or patient-facing rule enabled.
- Verified prior inventory denominator: 436 canonical medication IDs, 233 provisional ingredient sets, 48 combination entries. **Mapped in manifest design:** every canonical ID is assigned a provisional ingredient-set key; new mapping tests have not yet passed CI. **Clinically validated:** 0 confirmed groups and 0 confirmed canonical-ID mappings. Final formulation-specific group count still unknown; antithrombotic queue runtime totals not yet measured.
- Block status **PARTIAL**. Latest commit CI and deployment pending; PR #37 remains open. Next: inspect CI, resolve failures, obtain actual antithrombotic queue counts, adjudicate formulations, perform agent-specific primary-source reviews and ASGE comparisons, and implement validated time calculations only in review-only mode.

## 2026-11-07 continuation — prior block PARTIAL, source comparison started
- FIRST inspected PR #37 head 17195e9, the prior checklist and antithrombotic audit queue. PR-triggered workflow lookup for 17195e9 returned **no runs**; therefore the earlier TypeScript correction and newer audit-manifest tests cannot be called PASS. CI remains unverified, not failed.
- Inspected current queue code: it creates deterministic provisional antithrombotic groups but did not emit actual runtime denominator. Added regression test that logs exact antithrombotic ID/group counts and verifies source inheritance (ab2363f); output requires next successful CI log inspection. Do not fabricate counts.
- Started substantive apixaban high-risk source comparison ledger with ASGE 2016, ACG–CAG 2022 and BSG/ESGE 2021, explicit differences and unresolved source validation/clinical dependencies (28ec5ca), plus source-separation/safety tests (63795f4). Status IN_PROGRESS, clinicalApproval=false. The source summary requires independent primary-document confirmation before clinical signoff; no CHEST/ACC/AHA/FDA reconciliation yet.
- Current verified inventory denominator remains 436 canonical medication IDs / 233 provisional ingredient sets / 48 combinations. Antithrombotic ID and provisional-group counts **not yet verified**. Completed clinically distinct review groups **0**; clinically validated ID mappings **0**. No patient-facing rule activated, no merge.
- Next: inspect CI logs and fix failures, capture exact antithrombotic counts, reconcile apixaban against original guideline tables and FDA/CHEST/ACC/AHA, then expand to dabigatran/rivaroxaban/edoxaban without borrowing apixaban renal thresholds.

## 2026-11-07 next block — prior PARTIAL, approval-gate hardening
- FIRST inspected PR #37 at d40381c, previous commits and sprint checklist. Commit-associated PR workflow lookup returned no runs for d40381c or 17195e9. Prior CI remains UNVERIFIED; do not call it PASS. PR #37 open.
- Added explicit ASGE comparator outcome union (NOT_STARTED/IN_PROGRESS/COMPARED/NOT_ADDRESSED) and fail-closed antithrombotic group approval gate, commit 5ef48fb. Requires source section, reviewer and comparison evidence or justified NOT ADDRESSED; also formulation adjudication, newer evidence, tests, distinct canonical IDs and independent approval. Existing queue remains NOT_STARTED.
- Added negative tests for incomplete comparator, missing approvals/tests, duplicate IDs, and NOT ADDRESSED rationale, plus synthetic positive controls (00aa267). No real clinical group is approved by these tests.
- Verified historical inventory denominator remains 436 canonical medication IDs / 233 provisional ingredient sets / 48 combinations. Exact antithrombotic ID/group denominator still awaiting test log or execution. Clinical reviews completed this block 0; cumulative 0; clinically validated mapped IDs 0. No patient-facing activation or merge.
- NEXT: verify latest quality workflow and capture antithrombotic counts, fix any failures, then complete original-source agent-by-agent evidence and formulation-specific mapping.

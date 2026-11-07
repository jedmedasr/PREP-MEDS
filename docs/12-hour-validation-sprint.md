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

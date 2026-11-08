# Lane B: Bucket 02 evidence checkpoint

Authority: `docs/parallel-clinical-buckets-2026-11-08.md` at f2b9aec3aa45811674a69754059eb6d2b37d46d9. Only EVEN buckets belong to this lane. The shared manifest and validator are reused, not regenerated or replaced.

Pipeline: CLAIM -> EXTRACT -> RECONCILE -> MAP -> TEST -> VERIFY -> COMMIT -> NEXT. The initial capture-only attempt was PARTIAL: zero completed evidence groups. PR48 claims Bucket02's heparin, fixed aspirin/ER-dipyridamole and eight insulin groups (34 canonical IDs). Other-lane medication files remain unchanged.

## Evidence

Each allocated group has a JSON package under `docs/medication-evidence/groups`. Source-specific numeric facts, precise locators, dates, grades, renal/hepatic/procedure/anesthesia qualifiers and conflicts are shared once in `docs/medication-evidence/lane-b/bucket02-reference.json`. Alias/brand metadata is copied from existing assembled terminology and checked against the actual application, not inferred from brand names. Product concentrations and fixed mixes do not authorize substitution, conversion, pump compatibility or patient instructions.

Antithrombotics compare ASGE2016, ACG/CAG2022, BSG/ESGE2021, IDEN2024, CHEST2022 and ACC/AHA2024. NOT_ADDRESSED is preserved where an agent-specific schedule is absent. ASGE's duration table is not a universal hold prescription. CHEST therapeutic IV UFH bridging >=4h stop/>=24h restart remains distinct from ASGE's historical selected2-6h restart option. Fixed aspirin/dipyridamole does not inherit P2Y12 or cardiac ASA-monotherapy assumptions.

Insulin comparisons retain ADA2026, CPOC2023 and AoA/JBDS2026 main text. The colonoscopy-specific Chirila2022 review is explicitly author guidance, not a formal CAG guideline. AoA AppendixS3 could not be retrieved: no supplemental percentages are invented. Colonoscopy preparation, NPO EGD, fixed meal dose, carbohydrate-ratio dose, premix, U100/U200/U300/U500, type1 basal continuity and IV/pump transitions remain distinct. Absence of a universal U500 or renal-percentage rule is documented rather than fabricated. FDA label revision reconciliation is not a completion gate or holding-duration authority.

## Verification

`node --test scripts/__tests__/lane-b-*.test.mjs` tests exact source facts, interval edges, applicability and negative inheritance. The first local execution passed114/115: a heparin fixture incorrectly selected a diabetes source. Correcting that fixture retained the source-selection gate;115/115 then passed. `pnpm --filter @prep-meds/web exec vitest run tests/lane-b-bucket02-mapping.test.ts` independently checks all34 IDs/aliases against the assembled terminology.

The new read-only CI job records the actual head and merge checkout, executed counts and evidence hashes. A completion checkpoint will reference an already tested immutable commit; no self-referential SHA or green-CI-alone clinical claim. The shared validator checks completed records. Before tests are verified, packages stay EXTRACTED_PENDING_TEST_VERIFICATION.

## Existing upstream blocker

Initial application run42532780947 failed TypeScript on the inherited shared source BEFORE these clinical files were added: clinical-evidence-review-gate.test.ts:22, antithrombotic-comparison-coverage.ts:11, clinical-review-boundary-regression.test.ts:25 and enoxaparin-evidence-boundaries.test.ts:49. Exact errors were sent to LaneA in comment6728479420 on PR37. No odd-lane test or clinical evidence is edited here, and full application gates are not bypassed. This PR must not be merged while required gates fail.

Clinical source verification/approval belongs to the supervising clinician. A complete tested package may become READY_FOR_CLINICIAN_REVIEW without waiting for that review or another AI. Neither evidence completion nor clinical review alone activates patient-facing instructions.

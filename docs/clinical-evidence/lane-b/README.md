# Lane B: verified Bucket 02 evidence checkpoint

Authority: docs/parallel-clinical-buckets-2026-11-08.md at f2b9aec3aa45811674a69754059eb6d2b37d46d9. Only EVEN buckets belong to this lane. The shared inventory and scripts/validate-medication-evidence.mjs are reused unchanged; no competing queue or bucket allocation is introduced.

## Actual work and checkpoint status

The initial capture-only attempt was PARTIAL, zero completed groups. This execution performed source extraction/comparison, route/regimen assessment, exact mapping, tests and immutable publication for Bucket02: heparin, fixed aspirin/ER-dipyridamole, glargine, lispro, aspart, regular insulin, NPH, degludec, detemir and glulisine. These are ten provisional ingredient groups with distinct formulations assessed inside each packet, not34 separate groups or a count of aliases.

Clinical evidence lives in docs/medication-evidence/groups. Each package references dated primary passages and the shared-once bucket02-reference.json for exact source-specific recommendations, strengths, timing anchors, exceptions and contextual limitations. All34 allocated canonical IDs and their existing raw alias/brand metadata are retained and tested against the assembled application terminology. Generic identities require formulation confirmation; fixed mixtures and U100/U200/U300/U500 must not inherit incompatible regimens.

Evidence implementation commit: 4244f10601cd638c68b7c559be38524b34333d0f. Exact executed test receipt is committed under docs/medication-evidence/lane-b/receipts/42534346780.json. CI checkout was4281a69a971e616424c34e93706ac149f555b280. Run42534346780 passed115 scenario/source/boundary tests plus22 actual-terminology mapping tests. The artifact13638179772 was downloaded and SHA256-verified:86b3ab1468be5d220ca198af29182036646205228caccf71069e80de7bb87959. Exact archived scenario tests reran locally115/115. Artifact expires2026-12-08; durable receipts survive expiry.

Each group has an individual immutable completion-checkpoint commit, indexed in lane-b/audit-manifest.json. These receipts are not another research queue. The canonical group files now include test commands, results, source SHA and evidence hash and are READY_FOR_CLINICIAN_REVIEW. Only receipt metadata changed after the tested clinical extraction. The unchanged shared validator passes each of the ten groups locally. Fourteen additional checkpoint regressions bring the local Node suite to129/129. Final-head remote execution must still be inspected before claiming that new revision passed. The CI receipt exporter checks the clinical hash against git show of the original tested commit and invokes the unchanged shared validator on each READY package.

## Source differences and limitations retained

Antithrombotics compare ASGE2016, ACG/CAG2022, BSG/ESGE2021, IDEN2024, CHEST2022 and ACC/AHA2024. NOT_ADDRESSED remains explicit where a society gives no agent-specific clock. ASGE Table2 is duration of action, not a universal hold order. CHEST therapeutic IV UFH bridging stop>=4h/restart>=24h is distinct from ASGE's historical selected2-6h restart option. Fixed aspirin/dipyridamole does not inherit P2Y12 or cardiac ASA-monotherapy assumptions. Its whole-product GI timing is not silently invented.

Insulin sources retain ADA2026, CPOC2023 and AoA/JBDS2026 main text. Chirila2022 colonoscopy suggestions are an author review, NOT a formal CAG guideline. AoA AppendixS3 was inaccessible; no supplement-specific percentages are asserted. Clear fluids, NPO EGD, fixed meal dose, carbohydrate-ratio dosing, premix, concentrated formulations, type1 basal continuity and pump/IV transitions remain distinct. U500 and unstable organ function require individualized plans; absence of a universal dose rule is reported, not fabricated. FDA label revision reconciliation is not a holding-duration completion gate.

## CI failure and lane isolation

Initial full application run42532780947 failed TypeScript BEFORE the LaneB clinical files. The substantive head's quality run42534346823 also failed. Errors were reported to LaneA in PR37 comment6728479420: clinical-evidence-review-gate.test.ts:22, antithrombotic-comparison-coverage.ts:11, clinical-review-boundary-regression.test.ts:25 and enoxaparin-evidence-boundaries.test.ts:49. No odd-lane medication evidence/test is edited or suppressed here. Required application failures still block merging even though the bounded evidence/mapping tests pass.

Latest shared branch was checked before the audit update:8776da9853d08e0e8ed5749ac1a6387eeb033488. Its14 new commits add LaneA Bucket01 material, with no conflicting LaneB path or inventory/validator change. Those records remain untouched. The original436-ID inventory snapshot retains its clinical-review states; this lane records evidence readiness, not clinician approval. No patient-facing rules, deployment settings, shared schedules or main refs are modified.

## Handoff

Target evidence packages:10/10. LaneB cumulative:10/113 provisional groups. Canonical IDs tested:34/436. Clinician-approved groups:0. Next owned bucket:04. Do not redo Bucket02 unless source/rule/mapping changes, failed verification, or a documented unresolved requirement justifies it. Complete evidence packages do not wait for clinician review or another AI. The supervising clinician verifies primary sources at Mark Reviewed; patient-facing activation always requires separate explicit authorization.

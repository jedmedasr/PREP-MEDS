# Batch 04 beta-blocker source reconciliation

Status: `SOURCE_VERIFIED / ENGINEERING_INTEGRATED / REVIEW_REQUIRED`

This cluster covers eight oral beta-blocker identities. Metoprolol is intentionally split into tartrate standard tablet and succinate extended-release tablet identities. Bare `metoprolol` fails closed as ambiguous; explicit formulation wording resolves to the corresponding verified identity.

| Identity | Direct DailyMed source | SETID | SPL | Effective date | Application | Route / form |
| --- | --- | --- | ---: | --- | --- | --- |
| metoprolol tartrate | Mylan Pharmaceuticals Inc. | `809c6386-0039-42ff-a03e-e42733e229b8` | 31 | 2024-01-31 | ANDA076704 | oral film-coated tablet |
| metoprolol succinate ER | Zydus Pharmaceuticals (USA) Inc. | `bd77ec6e-c58c-440b-81d6-8a462b2fdc9c` | 10 | 2026-05-19 | ANDA203894 | oral extended-release tablet |
| carvedilol | BluePoint Laboratories | `e68c9b18-e7fd-45f7-a8f5-1d815e32680b` | 14 | 2026-03-09 | ANDA077614 | oral film-coated tablet |
| atenolol | Zydus Pharmaceuticals USA Inc. | `db801706-1362-44c7-92ab-f584f96c7e1c` | 13 | 2024-01-11 | ANDA076900 | oral tablet |
| propranolol hydrochloride | Lifestar Pharma LLC | `25f9b9a3-7b0b-48d2-a458-c613bedc7cab` | 7 | 2026-02-02 | ANDA216663 | oral tablet |
| bisoprolol fumarate | Micro Labs Limited | `c3ee566c-74c4-45f4-a947-526a7313e326` | 1 | 2026-03-11 | ANDA218303 | oral film-coated tablet |
| nadolol | Zydus Pharmaceuticals USA Inc. | `a0a38f9b-268d-4463-881d-5bee6cd92e8a` | 6 | 2024-01-02 | ANDA207761 | oral tablet |
| labetalol hydrochloride | BluePoint Laboratories | `e4562c70-f245-4dbe-8fe1-0bb64a91a315` | 5 | 2026-06-04 | ANDA074787 | oral tablet |

The DailyMed records authenticate source-linked generic ingredient, route, dosage form, release distinction where explicit, SETID, SPL, effective date, and application provenance. They do not establish a patient-specific manufacturer/NDC/package/strength, substitution permission, or current commercial availability.

## Peri-procedural governance boundary

The existing 2024 AHA/ACC multisociety evidence supports continuation of stable chronic beta-blocker therapy in noncardiac surgery when clinically appropriate, but PREP-MEDS does not automatically convert that general perioperative recommendation into an autonomous outpatient-endoscopy instruction for every formulation, patient, or anesthesia context.

`RULE-B4-BETA-BLOCKER-PRODUCT-REVIEW-001` therefore requires `MOD-stable-chronic-use`, routes all eight explicit identities to `CLINICIAN_REVIEW_REQUIRED`, and contains no timing rule. The legacy formulation-unspecified metoprolol continuation candidate remains historically preserved but is excluded from assembled shadow review behavior.

No clinical approval, local-policy approval, dose calculation, substitution, formulation conversion, market-availability assertion, autonomous hold/continue/restart interval, deployment, or production activation is created by this cluster.

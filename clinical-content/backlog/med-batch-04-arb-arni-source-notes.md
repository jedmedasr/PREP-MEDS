# Batch 04 ARB / ARNI source reconciliation

Status: `SOURCE_VERIFIED / ENGINEERING_INTEGRATED / REVIEW_REQUIRED`

This cluster covers six standalone ARB identities plus three source/formulation-distinct sacubitril/valsartan whole-product identities. Generic ingredient wording authenticates ingredient/route/form identity only; it does not authenticate the manufacturer, NDC, package, strength, pharmacy inventory, or substitution for a patient-specific product.

## Standalone ARBs

| Identity | Direct source used | DailyMed SETID | SPL | Effective date | Application | Route / form |
| --- | --- | --- | ---: | --- | --- | --- |
| losartan potassium | Zydus Pharmaceuticals USA | `3233c707-70b6-4c29-8210-913eeb2a38ed` | 22 | 2026-07-20 | ANDA078243 | oral film-coated tablet |
| valsartan | Mylan Pharmaceuticals | `73e01dc6-7dd4-421a-a4f6-137e75f69f9a` | 16 | 2026-09-15 | ANDA090866 | oral film-coated tablet |
| irbesartan | Macleods Pharmaceuticals | `e8635a1c-ae06-4e23-99f7-e704f91d6f43` | 13 | 2026-08-06 | ANDA202254 | oral tablet |
| candesartan cilexetil | Viona Pharmaceuticals | `9da86c48-5911-4512-8c71-eca4a6418cf6` | 4 | 2026-09-07 | ANDA091390 | oral tablet |
| olmesartan medoxomil | Aurobindo Pharma | `8c94d403-809b-43b9-834f-3ecd330d2dd9` | 9 | 2025-01-04 | ANDA204798 | oral film-coated tablet |
| telmisartan | Alembic Pharmaceuticals | `c62d424c-7630-413c-be2c-3932831c3f1d` | 11 | 2026-05-29 | ANDA202130 | oral tablet |

For olmesartan, the encoded source is a direct non-repackaged DailyMed record with fully authenticated SETID/SPL/application metadata. Newer repackaged or archive-only entries were not promoted to manufacturer identity when the exact current manufacturer provenance could not be authenticated from the available primary-source record. No market-availability inference is made from the encoded source date.

## Sacubitril / valsartan

Three identities are deliberately preserved:

1. **Generic Novugen sacubitril and valsartan film-coated tablet** — SETID `747eeb5c-ac2f-474f-b6d2-0586d12653a6`, SPL 2, effective 2026-03-17, ANDA213611.
2. **ENTRESTO film-coated tablet** — Novartis SETID `000dc81d-ab91-450c-8eae-8eb74e72296f`, SPL 25, effective 2026-07-06, NDA207620.
3. **ENTRESTO SPRINKLE oral pellets** — the same current Novartis label/SETID/SPL/effective date, but distinct NDA218591 and dosage form `PELLET`.

Bare `Entresto`, `sacubitril and valsartan`, and `sacubitril/valsartan` therefore fail closed as ambiguous. Explicit source/formulation wording such as `ANDA213611`, `Entresto tablet`, `NDA207620`, `Entresto Sprinkle`, or `NDA218591` can resolve only to the corresponding verified identity. All sacubitril/valsartan identities remain indivisible two-ingredient products; component splitting is not authorized.

## Peri-procedural governance boundary

The 2024 AHA/ACC multisociety perioperative guidance is indication- and procedure-risk-dependent. Its hypertension recommendation applies to selected chronic RAAS-inhibitor users undergoing elevated-risk noncardiac surgery; PREP-MEDS does not automatically classify routine outpatient endoscopy as that population. Its HFrEF recommendation supports continuation as reasonable in the perioperative setting, but does not itself establish a universal outpatient-endoscopy rule.

The Stop-or-Not trial is retained only for the ARB policy context because it studied chronic ACE inhibitor/ARB management around major noncardiac surgery; it is not treated as ARNI evidence.

`RULE-B4-ARB-POLICY-REVIEW-001` and `RULE-B4-ARNI-POLICY-REVIEW-001` therefore remain `LOCAL_POLICY_REQUIRED`, require `MOD-raas-indication`, depend on `POLICY-ANESTHESIA-RAAS`, and contain no timing rule.

No clinical approval, local-policy approval, dose calculation, substitution, component conversion, market-availability assertion, autonomous hold/continue/restart interval, deployment, or production activation is created by this cluster.

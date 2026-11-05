# Batch 04 dihydropyridine calcium-channel-blocker source reconciliation

Status: `SOURCE_VERIFIED / ENGINEERING_INTEGRATED / REVIEW_REQUIRED`

This cluster preserves four oral product/formulation identities: amlodipine tablet, nifedipine capsule, nifedipine extended-release tablet, and felodipine extended-release tablet. Bare `nifedipine` fails closed because standard capsule and extended-release tablet identities coexist; explicit formulation wording resolves deterministically.

| Identity | Direct DailyMed source | SETID | SPL | Effective date | Application | Route / form |
| --- | --- | --- | ---: | --- | --- | --- |
| amlodipine besylate | Ascend Laboratories, LLC | `3f4703c0-0b9e-41a0-8b70-da26683d9ed2` | 20 | 2024-06-21 | ANDA078925 | oral tablet |
| nifedipine capsule | Heritage Pharmaceuticals Inc. d/b/a Avet Pharmaceuticals Inc. | `b8b8cfee-ea71-44c2-81af-675efecfdf15` | 17 | 2023-08-03 | ANDA202644 | oral capsule |
| nifedipine ER | Ingenus Pharmaceuticals, LLC | `4d3e11d2-d320-45d3-96c8-48322202b504` | 6 | 2026-03-30 | ANDA210614 | oral film-coated extended-release tablet |
| felodipine ER | Heritage Pharmaceuticals Inc. d/b/a Avet Pharmaceuticals Inc. | `0bef7cf2-012b-4804-ac93-0a8b333035db` | 8 | 2026-08-11 | ANDA201964 | oral extended-release tablet |

The selected DailyMed records authenticate generic ingredient, route, dosage form, release distinction where explicit, SETID, SPL sequence, effective date, and application provenance for medication-reconciliation purposes. They do not establish a patient-specific manufacturer/NDC/package/strength, substitution permission, or current commercial availability.

## Governance boundary

`RULE-B4-DHP-CCB-PRODUCT-REVIEW-001` routes all four explicit identities to `CLINICIAN_REVIEW_REQUIRED` for EGD, colonoscopy, and combined EGD/colonoscopy. The rule contains no timing instruction. Identity-label provenance alone is not converted into an autonomous continue, hold, dose-adjustment, or restart recommendation.

No clinical approval, local-policy approval, dose calculation, substitution, formulation conversion, commercial-availability assertion, autonomous timing interval, deployment, or production activation is created by this cluster.

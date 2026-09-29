# Batch 04 thiazide / thiazide-like diuretic source reconciliation

Status: `SOURCE_VERIFIED / ENGINEERING_INTEGRATED / REVIEW_REQUIRED`

This cluster covers three oral single-ingredient diuretic identities: hydrochlorothiazide, chlorthalidone, and indapamide.

| Identity | Direct DailyMed source | SETID | SPL | Effective date | Application | Route / form |
| --- | --- | --- | ---: | --- | --- | --- |
| hydrochlorothiazide | Teva Pharmaceuticals USA, Inc. | `e2270db4-2930-4ec5-ac96-2b4542aed367` | 18 | 2024-07-01 | ANDA083177 | oral tablet |
| chlorthalidone | Amneal Pharmaceuticals LLC | `c4c1bfe5-b5c8-43c0-9428-62337095b2bd` | 13 | 2026-06-11 | ANDA207204 | oral tablet |
| indapamide | ANI Pharmaceuticals, Inc. | `deb83f97-6c61-4a09-bed6-18dcf1183405` | 4 | 2025-09-12 | ANDA074299 | oral film-coated tablet |

The selected DailyMed records authenticate generic ingredient, route, dosage form, SETID, SPL sequence, effective date, and application provenance for medication reconciliation. They do not authenticate a patient-specific manufacturer, NDC, package, or strength and do not establish current commercial inventory or substitution permission.

## Governance boundary

`RULE-B4-THIAZIDE-DIURETIC-PRODUCT-REVIEW-001` routes all three explicit identities to `CLINICIAN_REVIEW_REQUIRED` for EGD, colonoscopy, and combined EGD/colonoscopy. It contains no timing rule. Identity-label provenance is not converted into an autonomous continue, hold, dose-adjustment, volume-management, electrolyte-management, or restart recommendation.

No clinical approval, local-policy approval, dose calculation, substitution, current market-availability assertion, autonomous timing interval, deployment, or production activation is created by this cluster.

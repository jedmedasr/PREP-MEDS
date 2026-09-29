# Batch 04 ACE inhibitor source reconciliation

Status: `SOURCE_VERIFIED / ENGINEERING_INTEGRATED / REVIEW_REQUIRED`

The first Batch 04 cluster reconciles the oral ACE-inhibitor core as generic ingredient identities using one current direct DailyMed label per ingredient for source provenance. The selected source record is representative of ingredient/route/dosage-form identity only; it does not authenticate a patient-specific manufacturer, NDC, package, strength, or pharmacy availability.

| Generic identity | Direct labeler / packager | DailyMed SETID | SPL | Effective/update date | Application | Route / form |
| --- | --- | --- | ---: | --- | --- | --- |
| lisinopril | Aurobindo Pharma Limited | `0e6364a4-6d66-4151-8197-d45e2a762895` | 27 | 2026-07-21 | ANDA077622 | oral tablet |
| enalapril | Sun Pharmaceutical Industries, Inc. | `f103b9f9-e081-419d-a2d8-b86acda834dd` | 14 | 2026-07-14 | ANDA075657 | oral tablet |
| benazepril | ANI Pharmaceuticals, Inc. | `ff732cfa-9ded-4226-b464-19c90a6865ae` | 2 | 2026-08-19 | ANDA076333 | oral tablet |
| ramipril | Lupin Pharmaceuticals, Inc. | `a8cdec12-81d1-4ef4-82c0-d05d93c37a07` | 21 | 2026-08-24 | ANDA077626 | oral capsule |
| captopril | Solco Healthcare US, LLC | `2d3779b0-83d9-4b6f-a043-f7768cd7fce6` | 2 | 2025-12-25 | ANDA074477 | oral tablet |

## Governance boundary

The existing 2024 AHA/ACC perioperative RAAS evidence is indication- and surgical-risk-dependent: selected chronic RAAS-inhibitor users treated for hypertension and undergoing elevated-risk noncardiac surgery may benefit from omission before surgery, while perioperative continuation is considered reasonable in HFrEF. PREP-MEDS does not equate routine outpatient endoscopy with elevated-risk noncardiac surgery and does not translate those recommendations into a universal endoscopy hold interval.

`RULE-B4-ACE-INHIBITOR-POLICY-REVIEW-001` therefore remains `LOCAL_POLICY_REQUIRED`, requires the existing RAAS-indication modifier, depends on `POLICY-ANESTHESIA-RAAS`, and contains no timing rule. The legacy lisinopril first-release rule remains preserved historically but is excluded from the assembled shadow release to avoid duplicate competing rules.

No dose calculation, substitution, conversion, market-availability claim, clinical approval, local-policy approval, deployment, production activation, or hold/restart interval is created by this cluster.

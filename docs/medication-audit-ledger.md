# PREP-MEDS medication-by-medication audit ledger

Status: IN PROGRESS. This ledger records *verified* progress, not assumed clinical clearance.

## Required inventory
- Canonical inventory source: `terminologyDataset.medications` in `apps/web/lib/content.ts`.
- Before marking coverage complete, generate a machine-readable manifest of **all** medication IDs from that dataset. Never treat the number of rules as the number of medications.
- Every record must contain: immutable medication ID, canonical name, class/ingredients, status (`NOT_STARTED`, `IN_PROGRESS`, `NEEDS_CORRECTION`, `TESTED`, `CLINICALLY_REVIEWED`), last-reviewed date, cited source/version/date, procedure scenarios, tests, PR/commit, reviewer, unresolved questions.
- `TESTED` means automated clinical-scenario and negative-match tests passed; `CLINICALLY_REVIEWED` additionally requires independent clinical approval. Neither means approved patient instructions unless governed release requirements are met.

## Initial engineering audit — 2026-11-06
- Production deployment `ec1ee7e1c00520cc5903e4ab8b0246e9936efa62` was verified READY, but the end-to-end mobile experience and medication API response were **not** verified.
- PR #37 initially failed CI. Two pre-existing governance tests rejected `isShadowContentMode() => true`, which had exposed unapproved candidate decision rules in production. A third failure was a Vitest alias-resolution error in the new research endpoint test. Follow-up commits restore production rule isolation while retaining research visibility and fix the import.
- PR #37 adds apixaban/metformin cross-medication regression tests and invalid-input checks. These are **engineering checks**, not medication clinical approval.
- **Clinical medications independently validated this session: 0.** Inventory denominator not yet enumerated. Do not fabricate a completion percentage.
- Next: verify CI on latest PR head, enumerate complete terminology inventory, validate apixaban against dated primary guidelines, add risk-stratified scenarios, then diabetes/antiplatelets.
- Keep clinician-facing research visible but distinct from active patient-facing decision rules.

## Apixaban — source reconciliation started 2026-11-06
Status: IN_PROGRESS; **not clinically approved**. Medication ID: `MED-apixaban`.
- ACG/CAG 2022 guideline (doi:10.14309/ajg.0000000000001627), statement 13: for elective GI endoscopy, suggests temporary DOAC interruption over continuation; conditional recommendation, very low certainty. Does not provide one universal timing rule for all procedural risks.
- BSG/ESGE 2021 update (doi:10.1136/gutjnl-2021-325184): low-risk diagnostic endoscopy +/- biopsy: omit morning DOAC dose (weak, low-quality); high-risk therapeutic endoscopy (including polypectomy): last apixaban dose 3 days before procedure (strong, low-quality). Post-procedure resumption depends on hemorrhagic and thrombotic risk, often within 2–3 days after high-risk interventions. The guideline distinguishes low-risk diagnostic procedures from anticipated therapeutic interventions.
- Source URLs: https://academic.oup.com/jcag/article/5/2/100/6549718 ; https://gut.bmj.com/content/70/9/1611 .
- **Clinical risk to correct before patient release:** a colonoscopy may include unplanned polypectomy; medication name and procedure code alone are insufficient to decide interruption. Require planned intervention/bleeding-risk classification, anticoagulation indication, recent VTE/stroke or other high-thrombotic-risk features, renal deterioration, and individualized restart plan. Do not copy dabigatran-specific 5-day renal adjustment to apixaban.
- Tests to add: diagnostic EGD versus anticipated polypectomy/EMR, very recent VTE requiring escalation, uncertain procedural risk, renal deterioration, and negative metformin cross-match. Current research endpoint is a dossier, not an approved clinical decision engine.
- FDA label recency and any newer guideline updates still require checking. Clinical review incomplete.

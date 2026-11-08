# PREP-MEDS medication-by-medication audit ledger

Status: IN PROGRESS. This ledger records *verified* progress, not assumed clinical clearance.

## Validation unit: ingredient × clinically distinct formulation (2026-11-06)

- **Primary review denominator:** unique active ingredient and clinically meaningful formulation/route/delivery combination, not brand name or every terminology medication ID. Validate ingredient-level guidance once when pharmacology and periendoscopic handling are equivalent.
- Create separate reviews where route, delivery system, release characteristics, combination ingredients, pharmacokinetics, indication-specific dosing, renal handling, or interruption/resumption strategy materially change the clinical recommendation (e.g., oral vs injectable agents, immediate vs extended release when clinically consequential, insulin basal vs prandial vs pump, fixed-dose combinations, antithrombotic regimens).
- **Terminology coverage remains mandatory:** map every canonical medication ID, generic, brand, strength and alias to its reviewed ingredient/formulation group; verify mapping with automated tests. Brands sharing identical clinically relevant formulation and ingredient(s) inherit the same reviewed recommendation rather than duplicating research.
- **Combination products:** map all active ingredients and apply the most restrictive relevant procedure-specific safety rule; separately review combinations if their delivery or dosing changes recommendations. No ingredient may silently disappear in mapping.
- **Antithrombotic ASGE coverage:** compare ASGE 2016 and newer guidelines once per clinically distinct antithrombotic ingredient/formulation, including combinations; propagate source-linked comparison and explicit NOT_ADDRESSED determinations to every mapped canonical medication ID. Count unmapped IDs and unresolved source conflicts as incomplete.
- **Reporting:** publish both (1) clinically distinct review groups completed/total and (2) canonical medication IDs mapped to approved groups/total. Never claim the latter represents independent guideline reviews. Clinical approval remains separate from automated test passage.

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

### ASGE 2016 antithrombotic guideline — mandatory third comparator
- Primary source: ASGE Standards of Practice Committee, *The management of antithrombotic agents for patients undergoing GI endoscopy*, Gastrointest Endosc. 2016;83(1):3–16, doi:10.1016/j.gie.2015.09.035; https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics .
- ASGE suggests **continuing direct oral anticoagulants for low-risk endoscopic procedures**, whereas ACG/CAG 2022 conditionally suggests temporary interruption for elective endoscopy. This disagreement MUST be displayed as a source-specific conflict, not flattened into one consensus.
- ASGE suggests interruption before **high-risk endoscopic procedures** based on drug-specific intervals and thromboembolic risk. Its **apixaban Table 7** gives discontinuation intervals by creatinine clearance: **>60 mL/min: 1–2 days; 30–59: 3 days; 15–29: 4 days**. Do not apply these older ASGE renal intervals to other direct oral anticoagulants or silently substitute them for newer recommendations.
- ASGE recommends resumption only after adequate hemostasis; high thromboembolic-risk scenarios require individualized specialist planning. The 2016 guideline's bridging language should be reconciled with more recent DOAC-specific evidence and CHEST recommendations before generating advice.
- Audit acceptance criteria: preserve ASGE 2016 publication date, graded recommendation, Table 7 creatinine-clearance brackets, low-risk continuation, and conflict with ACG/CAG 2022 and BSG/ESGE 2021. Do not assert ASGE 2016 is the newest guidance.
- **Status remains IN_PROGRESS** pending current-guideline update search, individual clinical adjudication, and executable scenario tests.

## Mandatory ASGE coverage — ALL anticoagulants and antiplatelets (2026-11-06)
Every anticoagulant/antiplatelet canonical medication ID (including brand/generic, route/formulation, and combination products) must have a distinct ASGE 2016 comparison or an explicit `NOT_ADDRESSED_BY_ASGE_2016` determination. **No antithrombotic clinical sign-off without this field.** Audit the actual inventory rather than treating the examples below as exhaustive.

Reference: ASGE Standards of Practice Committee. *Management of antithrombotic agents for patients undergoing GI endoscopy*. Gastrointest Endosc. 2016;83:3–16. doi:10.1016/j.gie.2015.09.035. Primary: https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics .

Medication families to reconcile:
- Anticoagulants: warfarin; dabigatran; apixaban, rivaroxaban, edoxaban; unfractionated heparin, enoxaparin/dalteparin and other LMWHs; fondaparinux; parenteral direct thrombin inhibitors (argatroban, desirudin, bivalirudin when present); every additional inventory item.
- Antiplatelets: aspirin; clopidogrel, prasugrel, ticagrelor, ticlopidine; dipyridamole, cilostazol, vorapaxar; abciximab, eptifibatide, tirofiban; every combination product and additional inventory item.
- ASGE Tables 2, 3, 7–9, 10, 12 and 13 where applicable: drug-specific duration/interruption, renal-function dependence, endoscopic bleeding-risk strata, thrombotic-risk strata, dual antiplatelet therapy and stent timing, bridging, and restart. Distinguish elective versus urgent bleeding.
- Compare each ASGE entry with ACG/CAG 2022, BSG/ESGE 2021, CHEST 2022, relevant ACC/AHA guidance and current FDA labeling; document discrepancies and guideline vintage rather than selecting a universal hold interval.
- Important: ASGE 2016 suggests continuing warfarin/DOACs during low-risk endoscopy and recommends continuing thienopyridines during low-risk procedures; its older high-thrombotic-risk bridging language is not to be silently treated as current universal DOAC practice.
- Required per-ID fields: `asge_2016_applicability`, `asge_2016_tables`, `asge_2016_recommendation`, `newer_guideline_comparison`, `conflict_notes`, `clinical_approval_status`, `test_evidence`. All remain pending until populated and verified.

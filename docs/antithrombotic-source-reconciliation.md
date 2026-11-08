# Antithrombotic evidence reconciliation — research-only ledger

Status: IN_PROGRESS / NOT CLINICALLY REVIEWED. This document is a source-comparison scaffold, **not** an approved medication instruction. No medication ID may inherit a clinically approved status from this document.

## Source registry

- ASGE Standards of Practice Committee, *The management of antithrombotic agents for patients undergoing GI endoscopy*. Gastrointest Endosc. 2016;83(1):3–16. Published online 2015-11-24. DOI: https://doi.org/10.1016/j.gie.2015.09.035. Original dated comparator; tables on procedure bleeding risk, thromboembolism, antiplatelet duration, renal-dependent DOAC interruption, bridging, and resumption require agent-level abstraction.
- ACG–CAG, *Management of Anticoagulants and Antiplatelets During Acute Gastrointestinal Bleeding and the Periendoscopic Period*. 2022. DOI: https://doi.org/10.14309/ajg.0000000000001627. Reconcile separately for elective versus acute bleeding.
- BSG/ESGE, *Endoscopy in patients on antiplatelet or anticoagulant therapy: guideline update*. 2021. DOI: https://doi.org/10.1055/a-1547-2282. Reconcile separately by endoscopic risk and renal function.
- CHEST, *Perioperative Management of Antithrombotic Therapy*. 2022. DOI: https://doi.org/10.1016/j.chest.2022.07.025. Surgical/procedural comparator; not automatically endoscopy-specific.
- Agent-specific current FDA prescribing information: PENDING source/version capture for each distinct route/formulation and combination.

## Preliminary source conflicts requiring individual adjudication

| Clinical issue | ASGE 2016 comparator | Required newer-source check | Safety disposition |
| --- | --- | --- | --- |
| Diagnostic low-risk endoscopy on direct oral anticoagulants | Suggests continuation | ACG–CAG 2022 suggests temporary interruption for elective endoscopy; BSG/ESGE 2021 omits morning dose for low-risk procedures | CONFLICT: review-only, do not generate a universal hold interval |
| High-risk procedure on warfarin with high thrombotic risk | Suggests bridging in high-thromboembolic-risk patients | ACG–CAG 2022 generally suggests against bridging when warfarin is held, with mechanical-valve exception considerations; CHEST 2022 context differs | CONFLICT: indication and specialist review mandatory |
| Aspirin for secondary prevention | Generally continue low-dose aspirin | Reconcile ACG–CAG 2022 and BSG/ESGE 2021; distinguish primary versus secondary prevention and very-high-risk resection | Review-only |
| P2Y12 inhibitor during dual antiplatelet therapy | High-risk endoscopy: hold thienopyridine 5–7 days, ticagrelor 3–5 days, continue aspirin; defer elective procedures with recent stent/ACS | Check current P2Y12 product label, stent timing, cardiology plan and BSG/ESGE 2021 | Review-only; no automatic interruption |
| Dabigatran and other DOAC interruption | Agent- and renal-function-dependent tables | Check creatinine clearance, procedure bleeding risk, timing of last dose, and current label | Review-only |
| Resumption after endoscopy | Hemostasis-dependent, with different warfarin and DOAC considerations | Check delayed-bleeding risk and newer guideline uncertainty | Review-only |

## Mandatory per-review-group fields (not yet populated)

- Immutable canonical medication IDs, aliases, brand names, active ingredients, strength, route, formulation, release/delivery and combination membership.
- Group identifier and formulation-split rationale; no collapse of clinically distinct routes or regimens.
- Indication, renal function, hepatic function, procedure type and intervention risk, thrombotic risk, concomitant antiplatelet/anticoagulant exposure, last dose, interruption, bridging, restart and institutional policy.
- ASGE 2016 status: ADDRESSED (with relevant table/section and comparison) or NOT ADDRESSED (with explicit rationale); propagated to every mapped canonical ID.
- Newer guideline citations with dates, strength/certainty, disagreements, current prescribing-information revision date.
- Per-group tests, negative cross-medication matching, edge cases, CI links, last review date, reviewer, remaining issues, PR/commit, and status.
- Clinical sign-off gate: block unless source comparisons and scenario tests complete and independently approved.

## Current audit state

Canonical medication IDs: 436 (from previously passing inventory test). Provisional ingredient sets: 233. Combination entries: 48. Final clinically distinct formulation-group denominator: NOT ESTABLISHED. Clinically reviewed groups: 0 confirmed. ASGE comparisons completed and mapped to all antithrombotic IDs: 0 confirmed. This scaffold does not increase reviewed or tested counts.

Next: verify branch CI, enumerate antithrombotic canonical IDs and formulations from terminology dataset, build structured per-ID comparison ledger and automated completeness tests. No patient-facing clinical rule activation.

## Point-of-care product requirement — clinician-selected guideline pathway

Display ASGE 2016 and ACG–CAG 2022 **side by side** (and BSG/ESGE 2021 where relevant), without silently reconciling them into a single directive. For each medication/formulation and scenario show: exact source/year, agent applicability or NOT ADDRESSED, procedural bleeding risk, renal function, thrombotic indication, suggested action, evidence certainty, and specific disagreement. Preserve full citations and source versions.

Clinician workflow: choose a displayed guideline pathway or document an individualized decision; show the selection and rationale in the clinician-facing record. The choice must not silently activate medication rules, create a patient instruction, or imply institutional approval. Before any patient-facing export, require the existing institutional governance and safety gates; missing data or unapproved pathway stays review-only. Never preselect a source or present an unsupported universal hold interval.

Example (research display, not patient-specific advice): low-risk endoscopy with apixaban — ASGE 2016 suggests continuation of DOACs for low-risk procedures; ACG–CAG 2022 conditionally suggests temporary interruption of DOACs for elective endoscopy (very low certainty). Distinguish these broad recommendations from agent-specific high-risk hold timing and from restart timing, which ACG–CAG identifies as an evidence gap.

Implementation status: REQUIREMENT RECORDED ONLY. No UI code, selection persistence, deployment, or clinical signoff is claimed by this entry.

## Mandatory timing engine and point-of-care comparison — 2026-11-07

The central clinical output is **when**, not merely continue/interrupt. For EACH applicable guideline and each reviewed active ingredient × clinically distinct formulation/regimen, independently display:

1. Explicit source-specific interruption interval in hours/days; whether counted from last dose or calendar day; and whether the source provides no precise interval.
2. Calculated last permitted dose **date/time** relative to scheduled procedure date/time, with local time zone, administration frequency and actual last dose. Avoid converting ambiguous guideline day-counting into fabricated clock-time precision.
3. Source-specific restart interval/date/time, conditional on achieved hemostasis, intervention type, delayed bleeding risk, and clinical clearance. When evidence does not support an exact restart interval, state **NOT SPECIFIED — CLINICIAN DECISION**.
4. Modifiers: creatinine clearance and renal function thresholds, hepatic impairment where relevant, indication, thrombotic risk, high- versus low-risk intervention, aspirin/DAPT/triple therapy, bridging, institutional policy and prescriber authorization.
5. Side-by-side ASGE 2016 versus ACG–CAG 2022 versus BSG/ESGE 2021, plus relevant CHEST/ACC/AHA/FDA sources, each with source version, strength, uncertainty, exact section/table and link. Record NOT ADDRESSED where a source does not cover an agent.
6. Display conflicts without merging them. Clinician selects a guideline or records individualized plan; never preselect or silently issue patient instructions.
7. Test date/time calculations across midnight, time zones/DST, procedure rescheduling, morning/evening/BID dosing, impaired renal function, combined procedures and delayed resumption. Missing required data fails closed. No patient-facing activation without governance approval.

**Status:** timing requirements documented; no timing calculation code or deployment completed by this documentation change.

## Mandatory renal-function-dependent timing — 2026-11-07

When a source's agent-specific interruption guidance depends on creatinine clearance, the point-of-care display MUST compute/select the appropriate renal stratum before displaying a specific last-dose interval. Use Cockcroft–Gault CrCl (mL/min) when required by the source; do not silently substitute eGFR. Capture age, weight, serum creatinine, sex coefficient, and weight-basis rationale; flag unstable kidney function, extremes of body composition, and invalid/out-of-range inputs for clinician review.

For each source, retain its **exact** threshold operators and boundary inclusivity, agent, formulation, procedure risk, and table citation. Example ASGE 2016 apixaban high-risk procedure strata: CrCl >60 mL/min -> 1–2 days; 30–59 -> 3 days; 15–29 -> 4 days. Do not extrapolate to CrCl below table coverage, or silently decide a 1–2-day range. Other guidelines may not use these same strata.

The clinical UI must show entered/computed CrCl, matched guideline renal bracket, exact interruption days (or source-provided range), derived last-dose calendar date/time only where supported, and renal-related cautions. A changed CrCl, procedure, medication, dose schedule, or date must immediately invalidate/recompute displayed timing. When required CrCl is missing or out of range, show **RENAL DATA REQUIRED / NO TIMING DETERMINATION**, not a generic interval. Add boundary tests at 15, 29, 30, 59, 60 and >60 mL/min; tests for unstable renal function, missing inputs, and negative cross-agent inheritance.

Status: SPECIFICATION ONLY. No renal-timing engine implementation or clinical signoff is implied.

## Apixaban — focused source comparison, 2026-11-08 (research-only, IN_PROGRESS)

**Scope:** Oral apixaban (including all mapped brand/strength IDs); combination-product inheritance requires separate verification. This is a clinical evidence comparison, not an approved patient instruction. ASGE comparator: Acosta et al., *Gastrointest Endosc* 2016;83:3–16, DOI [10.1016/j.gie.2015.09.035](https://doi.org/10.1016/j.gie.2015.09.035), Tables 3 and 7 and periendoscopic recommendations. ACG/CAG: Abraham et al., *Am J Gastroenterol* 2022, DOI [10.14309/ajg.0000000000001627](https://doi.org/10.14309/ajg.0000000000001627). BSG/ESGE: Veitch et al., *Gut* 2021, DOI [10.1136/gutjnl-2021-325184](https://doi.org/10.1136/gutjnl-2021-325184).

| Scenario | ASGE 2016 | ACG/CAG 2022 | BSG/ESGE 2021 | Disposition |
| --- | --- | --- | --- | --- |
| Diagnostic EGD/colonoscopy ± biopsy (low bleeding risk) | Suggest continuing DOAC for low-risk endoscopy | Suggest temporary DOAC interruption for elective endoscopy; conditional, very low certainty; no universal apixaban-specific last-dose timestamp | Omit morning DOAC dose on procedure day for low-risk procedures; weak recommendation, low-quality evidence | **CONFLICT**: clinician-selectable evidence pathways only; no universal auto-hold |
| High-risk endoscopic intervention, CrCl >60 mL/min | Table 7: stop 1–2 days beforehand | Temporary interruption suggested; high-risk apixaban-specific interval not supplied as a universal rule | Last DOAC dose 3 days before high-risk procedure; strong recommendation, low-quality evidence | **CONFLICT**: ASGE range versus BSG/ESGE 3-day schedule; no silent reconciliation |
| High-risk intervention, CrCl 30–59 mL/min | Table 7: 3 days | No agent-specific renal stratum in elective statement | 3-day DOAC last-dose framework; assess renal instability | Research comparison only |
| High-risk intervention, CrCl 15–29 mL/min | Table 7: 4 days | No agent-specific renal stratum in elective statement | 3-day DOAC last-dose framework; renal deterioration warrants specialist assessment | **CONFLICT**; renal and bleeding risk review mandatory |
| CrCl exactly 60, below 15, unstable renal function | ASGE Table 7 as currently encoded does not resolve exactly 60 or below 15 | No specific resolution | Specialist review where unstable | **UNRESOLVED**: fail closed; do not interpolate |
| Postprocedural resumption | Hemostasis and procedure-dependent; source-specific timing needs adjudication | Could not reach recommendation for same-day vs 1–7-day DOAC resumption | Resume antithrombotic therapy up to 2–3 days after procedure if discontinued, depending on hemorrhagic/thrombotic risk | **NO UNIVERSAL RESTART TIMESTAMP** |
| Bridging | DOAC pharmacokinetics generally obviate routine heparin bridging; thrombotic indication still relevant | Against routine bridging applies principally to warfarin interruption, not permission to bridge apixaban | DOAC bridging not recommended as a routine strategy | Do not infer bridging from warfarin pathway |

**Timing caveat:** A recommendation expressed in calendar days or as a range cannot be converted into a unique clock-time last dose without a guideline-specific counting convention, actual dosing schedule, procedure date/time, renal assessment and clinician pathway selection. Diagnostic versus therapeutic EGD/colonoscopy/combined procedures must be categorized by the **highest anticipated intervention risk**; emergent bleeding and elective endoscopy are different pathways.

**Still required before marking this group TESTED:** Verify exact primary-source wording and current applicable FDA Eliquis label revision (including perioperative 24/48-hour labeled windows, hepatic impairment and pharmacokinetics); reconcile CHEST 2022 and ACC/AHA guidance with applicability/strength; capture all apixaban-containing canonical IDs and clinically distinct regimens, per-ID source propagation, thrombosis scenarios (recent VTE, atrial fibrillation, mechanical valves—not an apixaban indication), aspirin/DAPT, resumption, explicit tests and source retrieval evidence. These pending items prevent complete evidence-review or clinical signoff. No patient-facing activation.


## Apixaban — primary-source CHEST and FDA reconciliation, 2026-11-08

**Evidence review status: IN_PROGRESS / review-only / NOT CLINICALLY REVIEWED.** This addition closes two previously identified *source-capture* gaps, not the complete apixaban audit. Confirmed primary sources:

- **CHEST 2022**, Douketis et al., *Chest* 162:e207–e243, published online **2022-08-11**, DOI [10.1016/j.chest.2022.07.025](https://doi.org/10.1016/j.chest.2022.07.025), executive summary recommendation **22** and implementation considerations ([primary journal text](https://journal.chestnet.org/article/S0012-3692%2822%2901364-2/fulltext)). For apixaban before an elective procedure, **suggest 1–2 days off** rather than continuation (**conditional; very low certainty**); implementation differentiates **one day off** for low/moderate bleeding risk versus **two days off** for high bleeding risk. This is general perioperative guidance, not a mandate to reclassify all diagnostic endoscopy as moderate risk. Applies to AF or VTE indications in guideline implementation; special high-thrombotic-risk situations still require review. CHEST suggests postoperative DOAC resumption approximately **24 hours** after low/moderate-risk procedures or **48–72 hours** after high-risk procedures; only after bleeding/hemostasis evaluation. CHEST recommends against routine perioperative DOAC heparin bridging (see guideline recommendation on DOAC bridging).
- **FDA ELIQUIS (apixaban) US prescribing information, 2025 supplemental label**, [official FDA PDF](https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/202155Orig1s039%2Cs040lbl.pdf), **section 2.4**. For elective invasive procedures with moderate/high risk of clinically significant bleeding, **discontinue at least 48 hours before**; for low risk or easily controlled noncritical bleeding, **at least 24 hours before**. Bridging in the 24–48-hour interval after stopping is **not generally required**. Restart **as soon as adequate hemostasis is established**. These are **minimum elapsed hours**, unlike ASGE's day-based renal strata; do not silently equate a 48-hour minimum with a two-calendar-day omission protocol. Label year verified as 2025; exact label revision day not yet extracted. FDA labeling is not graded as a clinical practice guideline.

| Apixaban clinical scenario | ASGE 2016 comparator | CHEST 2022 | FDA label (2025) | Conflict/decision status |
| --- | --- | --- | --- | --- |
| Low-risk diagnostic EGD/colonoscopy | Suggest continue DOAC | One full day off for low/moderate risk | >=24 h before low-bleed-risk invasive procedure | **CONFLICT**; do not issue an automatic hold |
| High-risk endoscopy, CrCl >60 | Table 7: 1–2 days | Two days off | >=48 h | Different counting conventions; BSG/ESGE 2021 recommends last dose three days before; show each separately |
| High-risk endoscopy, CrCl 30–59 | Table 7: 3 days | Two days off, without an apixaban-specific renal interval in recommendation 22 | >=48 h minimum; assess renal impairment/other risks separately | **CONFLICT**; no silent default |
| High-risk endoscopy, CrCl 15–29 | Table 7: 4 days | Two days off, with special-population clinical judgment | >=48 h minimum; do not infer that minimum is sufficient in severe CKD | **CONFLICT / RENAL SPECIALIST REVIEW** |
| Restart after low/moderate-risk procedure | Hemostasis-dependent | ~24 h | After adequate hemostasis; no universal hour | Do not imply the label prescribes 24 h |
| Restart after high-risk intervention | Hemostasis-dependent | 48–72 h | After adequate hemostasis; no universal hour | Delayed bleeding and therapeutic hemostasis may modify decision |

**Safety flags:** Verify indication and treatment phase (recent acute VTE versus chronic AF), renal stability, hepatic dysfunction, concomitant aspirin/P2Y12 therapy, procedure-specific intervention and delayed bleeding risk, prior stroke/thromboembolism, and institutional/anesthesia policy. Neither the CHEST recommendation nor FDA minimum alone resolves ASGE-versus-BSG/ESGE conflicts. The ACG/CAG 2022 elective-endoscopy recommendation is conditional/very low certainty and does not prescribe a universal apixaban-specific last-dose timestamp. No approved algorithm, calculated dose timestamp, or patient instruction is created by this research.

**Remaining evidence blockers:** Independent exact-text check of ASGE/BSG/ESGE tables and all edge boundaries; ACC/AHA applicable perioperative guidance; FDA label hepatic and renal sections and any newer label version; group-to-all-canonical-ID inheritance tests; complete thrombotic, DAPT and resumption scenarios; reviewer signoff. Status remains **IN_PROGRESS**, and completed clinical review groups remain **0**.

## Apixaban — 2024 AHA/ACC primary-guideline comparison (2026-11-08)

**Status:** IN_PROGRESS, research-only. Primary source independently consulted: Thompson et al., *2024 AHA/ACC/ACS/ASNC/HRS/SCA/SCCT/SCMR/SVM Guideline for Perioperative Cardiovascular Management for Noncardiac Surgery*, *J Am Coll Cardiol*, DOI [10.1016/j.jacc.2024.06.013](https://doi.org/10.1016/j.jacc.2024.06.013), section **7.6**, recommendations 1–4, **Table 13** (DOAC perioperative schedules) and **Table 14** (thromboembolic-risk categories); parallel *Circulation* DOI [10.1161/CIR.0000000000001285](https://doi.org/10.1161/CIR.0000000000001285). Published 2024. **Scope is noncardiac surgery, not an endoscopy-specific guideline**; do not transplant its procedure-risk classification into ASGE without clinician adjudication.

- **Interruption selection:** COR **1**, LOE **B-NR**: team-based time-dependent interruption considering thrombotic risk, bleeding risk, renal clearance and drug factors. Table 13 lists factor Xa inhibitors (apixaban/edoxaban/rivaroxaban) separately for normal versus **CrCl <30 mL/min**, with distinct minimal, low/moderate and high bleeding-risk schedules. This is a separate renal boundary from ASGE 2016 apixaban Table 7 (>60; 30–59; 15–29); **do not reuse ASGE's renal cutoffs as ACC cutoffs**.
- **Bridging:** COR **3: Harm**, LOE **C-LD**: routine periprocedural bridging in most cardiovascular patients undergoing elective noncardiac surgery is not recommended due to increased bleeding. COR **2a**, LOE **C-LD** permits consideration of bridging in selected high-thrombotic-risk patients **receiving vitamin K antagonists**, not an apixaban-specific bridging recommendation.
- **Resumption:** COR **2a**, LOE **C-LD**: reasonable to resume oral anticoagulation once hemostasis achieved. The supporting text cites PAUSE resumption **48–72 hours after high-bleeding-risk procedures**; it also notes pharmacologic DOAC effect returns within hours, so an earlier restart requires individualized assessment. Neither statement supplies a universal postpolypectomy restart time.
- **High thrombotic risk:** Table 14 includes VTE within 1–3 months, recent stroke/TIA, high-risk AF features, and mechanical-valve categories. **Mechanical heart valves are not an apixaban indication**; the table's valve-related bridging discussion must not be mapped to apixaban as an approved therapy.

**Cross-source clinical interpretation:** ASGE 2016 Table 7 provides an apixaban-specific, CrCl-stratified *high-risk endoscopy* hold; BSG/ESGE 2021 provides an endoscopy-specific last-dose schedule; ACG/CAG 2022 gives a conditional elective-endoscopy interruption recommendation without a universal agent-specific high-risk timing; CHEST 2022 and AHA/ACC 2024 provide general perioperative comparators; FDA 2025 labeling provides minimum elapsed-hour interruption intervals. **These sources are not interchangeable**, and their distinct procedural risk categories, day-counting, renal cutoffs, evidence grades and restart qualifications must remain separately visible. This comparison resolves the previously pending AHA/ACC source-capture item but does **not** complete independent ASGE boundary verification, label-currentness review, canonical-ID propagation or scenario tests. No clinical approval, patient-facing rule, or default pathway.

## Clinical review governance clarification — 2026-11-08

**Authorized clinician verification model:** A second independent agent-level primary-source verification is **not a prerequisite** to presenting a completed evidence extraction for clinician review. The clinical evidence agent must provide a **direct link to the relevant primary guideline table, section, recommendation or official label section** whenever technically available; otherwise provide the original full-text/PDF link, DOI, exact table/section identifier and an explicit note that a section-level deep link is unavailable. Each recommendation retains the source title, publication year/version, agent/formulation, scenario, renal cutoffs, recommendation strength/certainty when supplied, conflict flags and source-access limitations.

**Clinician review workflow:** The clinician independently checks the linked passage at the point of clicking **Mark Reviewed**. Record reviewer identity, timestamp, evidence revision/hash, source versions, reviewed medication group and all canonical IDs mapped to it, modifications and unresolved exceptions. Only an affirmative review of the precise evidence version may transition that group to CLINICALLY_REVIEWED, subject to any separate institutional release controls. New evidence or a substantive edit invalidates the previous review for the changed recommendation. **Do not automatically infer review from link availability, passing tests, or a prior approval.**

**Implementation distinction:** This entry records the user's clinical governance decision; it does not claim the review UI, reviewer authentication, per-ID mapping or state-transition gate has been implemented or tested. The agent still must complete extraction, applicable scenarios, source links, conflicts and tests before presenting an item as ready for clinician review. The clinician's explicit approval substitutes for a separate independent evidence-verification agent, not for clinical review itself.

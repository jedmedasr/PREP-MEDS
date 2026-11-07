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

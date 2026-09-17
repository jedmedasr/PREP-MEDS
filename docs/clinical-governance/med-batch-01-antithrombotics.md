# Medication Batch 01 — Antithrombotics

**Status:** clinical review required  
**Intended use:** shadow validation only  
**Production activation:** prohibited until accountable clinical governance review

## Scope

This batch expands PREP-MEDS antithrombotic recognition and review logic for elective outpatient EGD, colonoscopy, and same-day EGD + colonoscopy.

Covered medication identities:

- warfarin
- apixaban, rivaroxaban, edoxaban, dabigatran
- enoxaparin, dalteparin, unfractionated heparin, fondaparinux
- aspirin
- clopidogrel, prasugrel, ticagrelor, ticlopidine
- dipyridamole, cilostazol
- aspirin/extended-release dipyridamole combination product

## Evidence hierarchy represented

1. ACG/CAG 2022 periendoscopic antithrombotic guideline — primary GI source for the current US-oriented evidence layer.
2. CHEST 2022 perioperative antithrombotic guideline — drug-specific perioperative interruption/bridging context.
3. BSG/ESGE 2021 guideline update — secondary international source that explicitly distinguishes low- and high-risk endoscopic procedures.
4. FDA prescribing information — drug-specific discontinuation/bleeding/thrombotic-risk warnings where relevant.

All source documents and EvidenceAtoms remain `DRAFT` pending human source verification/review.

## Preserved evidence conflicts

The batch deliberately does not collapse current guidance into a single hidden timing rule.

Key unresolved operational questions include:

- whether a routine colonoscopy is operationally treated as diagnostic/low-risk or as potential-polypectomy/high-risk;
- exact DOAC interruption intervals across GI-specific versus general perioperative guidance;
- renal-function-sensitive dabigatran timing;
- warfarin continuation versus interruption when polypectomy may occur;
- single-agent P2Y12 interruption, for which ACG/CAG found insufficient evidence;
- postprocedure restart timing, which depends on actual intervention, hemostasis, bleeding risk, and thrombotic risk.

PREP-MEDS therefore stores these sources as a conflict group and requires an approved operational GI/anesthesia/anticoagulation policy before any future routine timing instruction is activated.

## Safety behavior

Shadow rules are intentionally non-actionable except for the already-supported aspirin secondary-prevention monotherapy continuation candidate.

Hard stops explicitly preserve clinician review for:

- recent thrombotic event;
- concomitant anticoagulant/antiplatelet therapy;
- mechanical heart valve in the warfarin pathway;
- recent coronary stent or acute coronary syndrome in P2Y12 pathways.

Dabigatran requires a **verified creatinine-clearance band**. PREP-MEDS does not calculate CrCl with an LLM and does not infer CrCl from serum creatinine alone.

Injectable anticoagulants require treatment intent to be identified as therapeutic, prophylactic, bridging, or unclear before review.

## Combination products / whole-list reasoning

Aspirin/dipyridamole is decomposed into both active ingredients. DAPT and other concurrent antithrombotic combinations are currently represented by explicit modifiers. A later whole-medication-list interaction resolver should replace manual boolean combination capture where the medication list itself can reliably establish the combination.

## Activation checklist

Before any Batch 01 rule can move to `APPROVED` or `ACTIVE`:

1. Physician reviewer confirms every source and EvidenceAtom against the primary publication/current label.
2. GI governance chooses the colonoscopy intervention-risk assumption.
3. Anesthesia/anticoagulation stakeholders approve operational interruption timing where needed.
4. Recent VTE/stroke/TIA, mechanical-valve, ACS, and coronary-stent escalation logic is clinically adjudicated.
5. Restart ownership and actual-hemostasis workflow are approved.
6. Synthetic regression cases are reviewed for false-negative escalation.
7. Shadow-mode cases are compared with usual workflow and physician adjudication.
8. A named approver and approval timestamp are recorded through the clinical governance lifecycle.

No automated task may perform those approval/activation transitions.

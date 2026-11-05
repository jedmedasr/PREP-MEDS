# Stage 8.5 — First Clinical Content Release Candidate

## Status

**Release:** `PREP-MEDS-CLINICAL-RC-001`  
**Intended use:** internal shadow validation only  
**Clinical approval:** not granted  
**Production activation:** prohibited until accountable clinical governance review

This stage converts the Stage 6 medication backlog into the first evidence-linked deterministic rule candidate set. It does **not** make the application a clinically approved production medication-management system.

## Governing boundary

Production continues to load only `ACTIVE` clinical rules. Stage 8.5 candidate rules are `TECHNICALLY_TESTED` and are available only when the server is explicitly configured with:

```text
PREP_MEDS_CONTENT_MODE=shadow
```

Shadow mode:
- executes the deterministic engine in `VALIDATION` mode;
- exposes review-candidate required questions;
- displays an explicit shadow-mode warning;
- never generates patient-facing medication instructions;
- does not alter `activeRules`, which remains empty;
- must not be used as a standing order or autonomous medication-stop protocol.

## Candidate medication set

| Medication | Candidate disposition | Key boundary |
| --- | --- | --- |
| Atorvastatin | `CONTINUE` | only when stable chronic use is confirmed |
| Metoprolol | `CONTINUE` | only when stable chronic use is confirmed |
| Aspirin | `CONTINUE` | only confirmed secondary CV prevention monotherapy; other contexts escalate |
| Empagliflozin | `HOLD_STANDARD` candidate | structured 3-day preprocedure interruption candidate; restart remains clinician-owned |
| Semaglutide | `CONTINUE` only if encoded gastric-risk factors are low | escalation phase, significant GI symptoms, high dose, or other delayed-emptying risk escalates |
| Insulin glargine | `CLINICIAN_REVIEW_REQUIRED` | no patient-specific dose calculation is encoded |
| Lisinopril | `LOCAL_POLICY_REQUIRED` | indication-aware anesthesia/site policy is required |
| Apixaban | `CLINICIAN_REVIEW_REQUIRED` | exact interruption/restart timing not encoded in this release |
| Warfarin | `CLINICIAN_REVIEW_REQUIRED` | procedure intervention assumptions and thrombotic risk require review |
| Clopidogrel | `CLINICIAN_REVIEW_REQUIRED` | DAPT, stent/ACS history, indication, and intervention context require review |

## Evidence sources

The release candidate currently links to versioned source records for:
- 2024 AHA/ACC multisociety perioperative cardiovascular guideline;
- 2022 ACG/CAG periendoscopic antithrombotic guideline;
- ADA Standards of Care in Diabetes—2026, hospital/perioperative section;
- 2024 multisociety GLP-1 perioperative clinical practice guidance;
- 2024 STOP-or-NOT randomized trial of perioperative renin-angiotensin-system inhibitor continuation vs discontinuation.

Each clinical rule references exact `EvidenceAtom` ID/version pairs. Evidence remains `DRAFT` until reviewed through the evidence-governance workflow.

## Deliberately unresolved areas

The release candidate intentionally does **not** encode:
- a universal apixaban interruption interval;
- a universal warfarin interruption/bridging plan;
- an autonomous clopidogrel interruption interval;
- patient-specific basal insulin dose arithmetic;
- a universal ACE inhibitor hold/continue rule for outpatient endoscopy;
- a blanket weekly GLP-1 hold;
- patient-specific calendar-date calculations;
- local anesthesia or GI policy that has not been formally supplied and approved.

## Clinical review checklist

Before any candidate can become `ACTIVE`, governance must document:
1. source document and `EvidenceAtom` review;
2. confirmation that the rule accurately represents the cited recommendation and its population;
3. explicit decision on whether outpatient endoscopy permits direct application of broader perioperative guidance;
4. reconciliation with GI and anesthesia site policies;
5. review of procedure-risk assumptions, especially colonoscopy with potential polypectomy;
6. review of all required modifiers and hard-stop conditions;
7. physician-adjudicated synthetic cases, including false-negative escalation cases;
8. patient-instruction wording review for any future actionable output;
9. rule/evidence version approval and named accountable approver;
10. controlled promotion through `CLINICAL_REVIEW -> APPROVED -> ACTIVE`.

## Shadow validation objectives

The first shadow pilot should measure:
- concordance with physician adjudication;
- false-negative escalation rate;
- false-positive escalation rate;
- missing-data frequency;
- question burden per medication;
- time to disposition;
- evidence/provenance completeness;
- clinician override reasons;
- whether local-policy gaps are detected rather than guessed.

## Stage 9 dependency

Stage 9 RAG/AI should consume this same evidence/rule corpus but may only explain, normalize, retrieve, and identify missing context. It must not alter the deterministic disposition produced by these rules.

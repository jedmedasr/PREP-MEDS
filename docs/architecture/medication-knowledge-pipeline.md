# Medication Knowledge Build-Out and Evidence-Ingestion Pipeline

## Purpose
Stage 6 defines how PREP-MEDS systematically converts a finite medication backlog into governed evidence packets, draft computable rules, and synthetic validation cases without allowing automation to activate clinical recommendations.

## Pipeline

`BACKLOG -> EVIDENCE COLLECTION -> EVIDENCE PACKET -> RULE DRAFT -> TECHNICAL TESTING -> CLINICAL REVIEW -> LOCAL POLICY REVIEW -> VALIDATED`

Any validated medication can move to `NEEDS_UPDATE` when a guideline, label, important study, terminology record, or local policy changes.

## Research-state model
- `NOT_RESEARCHED`: no systematic evidence packet exists.
- `EVIDENCE_COLLECTION`: authoritative sources are being gathered and verified.
- `EVIDENCE_PACKET_READY`: evidence findings are assembled with provenance, conflicts, and limitations.
- `RULE_DRAFTED`: structured rule proposals and required-input/hard-stop drafts exist.
- `TECHNICALLY_TESTED`: synthetic test cases cover routine and safety branches.
- `CLINICAL_REVIEW`: awaiting accountable clinical review.
- `LOCAL_POLICY_REVIEW`: national evidence is insufficient to define the operational rule or local configuration is required.
- `VALIDATED`: clinically approved for the governed scope. Automation cannot create this state.
- `NEEDS_UPDATE`: new information may affect the packet/rule and requires re-review.
- `RETIRED`: medication/content no longer used.

## Evidence collection checklist
Each medication should be reviewed in this order:
1. verify generic identity, ingredients, formulations, brands, and external terminology identifiers;
2. identify current U.S. GI/endoscopy specialty guidance;
3. identify relevant perioperative/anesthesia guidance;
4. identify FDA labeling when the label contains care-changing peri-procedural safety information;
5. identify newer high-quality evidence that may materially affect interpretation;
6. identify procedure-specific differences for EGD, colonoscopy, and combined procedures;
7. identify patient variables that materially alter management;
8. identify hard-stop/escalation scenarios;
9. identify whether preprocedure timing can be protocolized;
10. identify restart ownership and whether actual intervention/hemostasis controls restart;
11. identify local GI/anesthesia/prescriber policy dependencies;
12. document conflicts and evidence limitations explicitly.

## Evidence packet contract
A packet contains:
- medication identity;
- source candidates and source authority metadata;
- atomic evidence findings;
- applicability and qualifiers;
- conflicts and unresolved questions;
- draft decision requirements;
- draft hard stops;
- draft rule summaries by procedure;
- draft restart ownership;
- local-policy dependencies;
- synthetic test scenarios.

A packet is not a clinical recommendation by itself.

## Source hierarchy
Source collection should prioritize current authoritative primary sources over summaries. Background/review literature may identify gaps but must not silently replace the primary guideline, regulator label, or society statement when the exact source is available.

## Automation boundary
Automation may:
- select the next backlog item;
- retrieve and structure candidate sources;
- generate draft evidence findings with provenance;
- identify apparent conflicts and missing questions;
- draft rule/test-case objects;
- run schema, referential-integrity, and regression checks;
- move work through `TECHNICALLY_TESTED`;
- place the medication into the appropriate human review queue.

Automation may not:
- mark a medication `VALIDATED`;
- mark a clinical rule `APPROVED` or `ACTIVE`;
- resolve a clinically material guideline conflict without governance;
- promote a local practice rule to national evidence;
- infer missing high-risk patient variables as negative;
- publish a patient-facing medication hold instruction from an unapproved draft.

## Review queues
Four queues are represented:
- `EVIDENCE_REVIEW`
- `CLINICAL_RULE_REVIEW`
- `LOCAL_POLICY_REVIEW`
- `UPDATE_REVIEW`

The queue is a product primitive and will later feed the clinical-governance console.

## Update surveillance
Each validated medication should eventually carry a source-review schedule. A source change does not automatically alter production behavior. The update path is:

`new source detected -> NEEDS_UPDATE -> evidence collection -> packet diff -> technical regression -> clinical review -> new approved rule version`

Historical rule/evidence versions remain reconstructable for prior DecisionEvents.

## Class-level efficiency, medication-level accountability
Evidence may be researched in class batches to reduce duplication, but each searchable medication retains its own record and validation status. Shared class evidence can be referenced by multiple medication packets; drug-specific label, formulation, renal, interaction, or combination-product differences remain separate.

## Initial Tier 1 architecture set
The initial backlog intentionally spans different reasoning problems rather than representing a complete formulary:
- apixaban;
- warfarin;
- clopidogrel;
- aspirin;
- empagliflozin;
- semaglutide;
- insulin glargine;
- lisinopril;
- metoprolol;
- atorvastatin.

No recommendation is implied by inclusion in this backlog.

## Research reproducibility
Every evidence packet should be reproducible from the exact source set, retrieval date, finding IDs, rule-draft version, and test cases used. Later analytics should be able to distinguish:
- evidence changed;
- local policy changed;
- terminology changed;
- rule implementation changed;
- patient inputs changed.

This separation is required for publishable validation studies and for enterprise change control.

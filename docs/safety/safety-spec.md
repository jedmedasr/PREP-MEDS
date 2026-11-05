# PREP-MEDS Safety Specification

## Purpose
This document defines non-negotiable safety properties for PREP-MEDS. Clinical content remains draft/review-required until approved through accountable clinical governance.

## Safety model
PREP-MEDS is a clinician-governed CDS platform. It must fail closed when material clinical information is missing, contradictory, out of scope, or not covered by an approved rule.

## Hard safety requirements
1. No prescription medication may receive a stop/hold instruction from free-form LLM generation.
2. All care-changing recommendations must originate from a versioned deterministic rule or an explicitly approved organization policy.
3. Any clinical calculation required by a rule must be performed by a validated deterministic calculator module, not by an LLM.
4. Unknown medication identity, unknown indication when material, contradictory medication lists, or missing required inputs must block routine recommendation finalization.
5. Clinical rules must identify when clinician, anesthesia, anticoagulation, endocrinology, or prescribing-clinician review is required.
6. The engine must preserve national evidence separately from organization/site implementation policy.
7. The system must never infer a negative high-risk history from missing documentation.
8. Combination products must be decomposed into active ingredients; the most restrictive applicable safety pathway controls until formally resolved.
9. Post-procedure restart instructions must be explicitly modeled and may be owned by the endoscopist/clinician when dependent on actual intervention or hemostasis.
10. Once a clinical rule version has produced a DecisionEvent, that exact rule/evidence/policy snapshot must remain reconstructable.

## Initial high-risk domains
The following domains require enhanced safeguards and explicit escalation logic:
- anticoagulants;
- P2Y12 inhibitors and other clinically significant antiplatelets;
- insulin;
- SGLT2 inhibitors;
- GLP-1/GIP agents;
- medications with institution-specific anesthesia implications;
- medications where renal/hepatic function materially changes the pathway;
- combination antithrombotic regimens;
- recent thrombotic/cardiovascular events;
- mechanical valves and other high-risk anticoagulation indications.

## Required engine behavior
### Missing information
Return `INSUFFICIENT_INFORMATION` with machine-readable missing fields. Do not guess.

### Out of scope
Return `OUT_OF_SCOPE` and identify the unsupported procedure, medication, formulation, or clinical context.

### High-risk exception
Return `CLINICIAN_REVIEW_REQUIRED` with a specific reason code.

### Local-policy dependency
Return `LOCAL_POLICY_REQUIRED` if evidence alone does not determine the operational instruction and the tenant has no approved policy configured.

### Conflicting evidence
The knowledge layer may store multiple active evidence objects. The deterministic production rule must identify which governance-approved implementation it uses and preserve the disagreement in provenance.

## AI safety boundary
The AI layer is allowed to transform language, not clinical authority.

Allowed:
- normalize `Eliquis` to `apixaban`;
- identify that a stated indication likely maps to atrial fibrillation and request confirmation when uncertain;
- retrieve evidence objects;
- summarize the rationale after the rule engine returns a result;
- generate patient-friendly text constrained to structured output.

Prohibited:
- deciding a hold interval independently;
- overriding a hard stop;
- assuming kidney function is normal;
- converting absence of documentation into `false`;
- marking a new guideline as adopted into production;
- silently substituting one guideline for another.

## Clinical content lifecycle
Every rule follows:

`DRAFT -> EVIDENCE_REVIEWED -> TECHNICALLY_TESTED -> CLINICAL_REVIEW -> APPROVED -> ACTIVE -> SUPERSEDED/RETIRED`

Automation may advance content through `TECHNICALLY_TESTED`. Only accountable human clinical governance may transition a clinical rule to `APPROVED` or `ACTIVE`.

## Decision provenance minimum
Each patient-facing recommendation must be reconstructable from:
- normalized medication and ingredients;
- procedure context;
- relevant patient inputs and provenance;
- calculator outputs, if any, including calculator version;
- rule ID and version;
- evidence IDs and versions;
- organization/site policy ID and version, if used;
- engine version;
- timestamp;
- final disposition;
- reviewer/override metadata when applicable.

## Auditability
Clinical mutations must be append-only or versioned. Do not silently update historical DecisionEvents, rule executions, evidence records, overrides, or approvals.

## Data/privacy constraints
- Do not commit real patient PHI to source control.
- Test fixtures must be synthetic.
- Production PHI must use appropriately secured infrastructure and contracts before deployment.
- Research exports must be separately governed and should use deidentified/pseudonymized datasets as appropriate to the approved research pathway.

## Safety testing expectations
Before a rule can be considered technically tested, coverage must include:
- ordinary applicable case;
- every branch condition;
- each hard stop;
- missing required inputs;
- contradictory inputs;
- combination-product behavior where relevant;
- boundary/timing conditions;
- organization policy override behavior;
- regression test against prior active rule behavior.

## Production release guardrail
No deployment process may automatically activate newly ingested clinical evidence or rules solely because a guideline, label, or paper was retrieved. Evidence ingestion and clinical policy release are separate workflows.

# PREP-MEDS Product Specification

## Product definition
PREP-MEDS is a clinician-governed, evidence-linked clinical decision-support platform for medication management before elective outpatient gastrointestinal endoscopy.

Initial procedural scope:
- EGD
- Colonoscopy
- Combined EGD + colonoscopy

The system is designed for medical assistants, nurses, clinicians, and clinical governance teams. It is not an autonomous prescribing system.

## Core product thesis
PREP-MEDS converts medication identity, procedure context, patient-specific modifiers, authoritative evidence, and organization-specific policy into auditable recommendations and escalation decisions.

The platform is composed of four major product layers:
1. deterministic clinical decision engine;
2. evidence and provenance knowledge base;
3. source-grounded RAG/AI interface;
4. workflow, analytics, research, and enterprise governance platform.

## Primary users
### Medical assistant / nurse
Collects required inputs, resolves routine protocolized cases, communicates approved instructions, and escalates cases when required.

### Clinician
Reviews higher-risk cases, validates exceptions, inspects recommendation basis, and approves non-routine plans.

### Clinical governance reviewer
Approves rules, evidence updates, institutional overlays, and production releases.

### Research / operations user
Uses deidentified or appropriately governed event data to study workflow, safety, implementation, and outcomes.

## Product principles
- Deterministic clinical logic decides; the LLM never invents a clinical action.
- Every recommendation is reproducible from stored inputs plus exact rule, evidence, and policy versions.
- National evidence and local policy are separate data domains.
- Missing material information produces a hard stop or explicit uncertainty state.
- Clinical rules are immutable once used in a patient decision event; updates create new versions.
- High-risk medications and contexts may require clinician review even when a default protocol exists.
- The product must be multi-tenant and support site-specific policy overlays without code forks.
- Medication terminology must support normalized generic ingredients, brand names, combination products, aliases, and future RxNorm interoperability.
- Initial procedure scope is deliberately narrow; additional GI procedures are future extensions.

## Core workflow
1. Select or ingest procedure.
2. Search or ingest medication list.
3. Normalize each medication to ingredient/class representation.
4. Determine required context for each medication.
5. Request only missing material inputs.
6. Apply deterministic clinical rules.
7. Apply organization/site policy overlays.
8. Run safety and escalation checks.
9. Produce staff-facing and patient-facing outputs.
10. Persist an immutable DecisionEvent with provenance.

## Recommendation states
The clinical engine must return one of the following structured dispositions:
- CONTINUE
- HOLD_STANDARD
- CONDITIONAL
- CLINICIAN_REVIEW_REQUIRED
- LOCAL_POLICY_REQUIRED
- INSUFFICIENT_INFORMATION
- OUT_OF_SCOPE

These states are machine-readable. Natural-language wording is generated only from the approved structured result.

## Evidence hierarchy
Default precedence for evidence review:
1. current U.S. specialty-society guidance relevant to GI endoscopy;
2. relevant perioperative/anesthesia guidance;
3. FDA labeling for drug-specific safety facts;
4. newer high-quality evidence that may modify interpretation;
5. organization-specific approved policy.

When sources conflict, the conflict must remain explicit in the knowledge layer. An organization-specific operational rule may resolve the conflict for workflow, but must not overwrite the underlying evidence record.

## Initial medication domains
- anticoagulants;
- antiplatelets;
- insulin and diabetes medications;
- GLP-1/GIP agents;
- antihypertensives;
- lipid-lowering agents;
- acid-suppressive therapy;
- psychiatric medications;
- thyroid medications;
- iron;
- vitamins, supplements, and herbals;
- other common outpatient medications as prioritized by formulary prevalence.

## Commercial architecture requirements
- web-based searchable application;
- independent API access to medication normalization, decision logic, and evidence retrieval;
- multi-tenant organizations and sites;
- configurable organization policy overlays;
- role-based access control;
- audit logging;
- versioned rule/evidence releases;
- research-grade event capture;
- future SMART on FHIR / FHIR integration;
- future CDS Hooks support;
- exportable analytics and research datasets under appropriate governance.

## AI/RAG boundary
AI may:
- normalize medication names and common misspellings;
- extract structured facts from permitted clinical text;
- identify likely missing information;
- retrieve evidence and local policy;
- explain deterministic results;
- generate constrained patient/staff wording.

AI may not:
- calculate clinical derived values unless routed through an approved deterministic calculator module;
- create a new hold interval or treatment directive not returned by the clinical engine;
- silently override hard stops;
- silently resolve conflicting guidelines;
- mark a rule clinically approved;
- infer absent high-risk history as negative.

## Research platform requirements
Every clinical workflow should optionally generate structured events sufficient to study:
- recommendation concordance;
- clinician escalation rate;
- override rate and reason;
- unresolved medication issues;
- time to recommendation;
- procedure-day delays/cancellations;
- medication-related inability to perform planned intervention;
- documentation completeness;
- user adoption and evidence-inspection behavior.

Research use of identifiable data requires appropriate institutional governance. Production clinical data and research datasets must remain logically separated.

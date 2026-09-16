# PREP-MEDS Canonical Clinical Ontology

## Purpose
This ontology is the canonical representation shared by the deterministic decision engine, evidence/RAG layer, APIs, audit trail, research warehouse, and future FHIR/SMART integrations.

Stage 2 deliberately defines domain semantics before application-framework or database-specific models. The canonical machine-readable contract is JSON Schema Draft 2020-12 in `schemas/v1/prep-meds.schema.json`.

## Design rules
1. **Stable identity is distinct from version.** A rule, evidence atom, or policy keeps a stable logical ID while material changes create a new version.
2. **National evidence is not local policy.** `EvidenceAtom` and `OrganizationPolicy` are separate entities and remain separately queryable.
3. **Rules reference evidence; they do not embed authority implicitly.** Every care-changing `ClinicalRule` identifies supporting evidence and/or approved policy references.
4. **Decision events are snapshots.** A `DecisionEvent` stores the resolved input, rule, evidence, policy, calculator, and output versions used at decision time.
5. **Unknown is not false.** Patient modifiers use explicit `KNOWN`, `UNKNOWN`, `NOT_APPLICABLE`, and `CONFLICTING` states.
6. **AI-derived facts retain provenance and confidence.** AI extraction may propose normalized facts; deterministic logic can require human confirmation.
7. **Combination products decompose to ingredients.** Medication identity can include multiple `Ingredient` references; all relevant ingredient pathways are evaluated.
8. **Initial procedure scope is finite.** V1 codes are `EGD`, `COLONOSCOPY`, and `EGD_COLONOSCOPY`.
9. **Clinical approval is explicit.** Automation may create and technically test artifacts but cannot set clinical rules/policies to `APPROVED` or `ACTIVE`.
10. **Historical clinical artifacts are immutable.** Corrections create superseding versions rather than mutating prior provenance.

## Core entities

### Medication
A searchable product/concept presented to the user. It may represent a generic drug, brand, or combination product and references one or more normalized ingredients, drug classes, aliases, and terminology codes.

### Ingredient
A normalized active pharmaceutical ingredient. Clinical rules should prefer ingredient-level applicability unless formulation/product-specific behavior is material.

### DrugClass
A clinically meaningful class used for inheritance, search, evidence linkage, and shared rules.

### Procedure
A bounded procedure context. Initial codes are `EGD`, `COLONOSCOPY`, and `EGD_COLONOSCOPY`. Assumptions such as treating colonoscopy as potential polypectomy belong in `OrganizationPolicy`, not the base procedure entity.

### ModifierDefinition
Defines a variable that may materially change a rule: indication, recent thromboembolism, renal input, diabetes type, GI symptoms, concomitant antithrombotics, etc. A `ModifierValue` records the case-specific value and provenance.

### EvidenceAtom
The smallest curated evidence object supporting or limiting a computable recommendation. It links a source to a concise claim, population/context, applicability, source locator, evidence status, and review metadata. An evidence atom is not itself an operational rule.

### ClinicalRule
A versioned deterministic rule mapping defined inputs to a structured disposition. It declares applicability, required modifiers, conditions, hard stops, output disposition, timing/restart ownership when applicable, evidence references, policy dependencies, and governance status.

### OrganizationPolicy
A tenant/site-specific operational overlay. It may select among evidence-supported options or encode anesthesia/GI workflow assumptions. It cannot rewrite underlying evidence.

### TestCase
A synthetic, versioned scenario with expected structured outputs for regression, edge-case, safety, and rule-validation testing. Real PHI is prohibited.

### DecisionEvent
The immutable audit/research unit created when the system evaluates a medication or medication list for a procedure. It stores exact inputs and provenance, matched artifact versions, structured recommendation, unresolved information, and engine metadata.

### Override
An append-only record of an authorized user changing or declining a recommendation. The original `DecisionEvent` is never altered.

### ProcedureOutcome
A separately governed downstream outcome linked to a decision/case, enabling implementation and outcomes research without changing the original decision record.

## Value provenance
Every case-specific value should preserve source type (`USER_ENTERED`, `PATIENT_REPORTED`, `EHR`, `FHIR`, `AI_EXTRACTED`, `CALCULATED`, `OTHER`), source reference when available, observation/collection time when relevant, record time, confirmation status, AI confidence if applicable, and calculator ID/version when derived deterministically.

## Rule condition model
Rules use a declarative condition AST, not executable code embedded in data. V1 operators:
- `ALL`
- `ANY`
- `NOT`
- `EQUALS`
- `NOT_EQUALS`
- `IN`
- `EXISTS`
- `KNOWN`
- `GREATER_THAN`
- `GREATER_THAN_OR_EQUAL`
- `LESS_THAN`
- `LESS_THAN_OR_EQUAL`

The later engine must implement fixed, tested semantics. Free-form JavaScript/SQL expressions are not allowed as clinical rule logic.

## Structured dispositions
Canonical outputs are `CONTINUE`, `HOLD_STANDARD`, `CONDITIONAL`, `CLINICIAN_REVIEW_REQUIRED`, `LOCAL_POLICY_REQUIRED`, `INSUFFICIENT_INFORMATION`, and `OUT_OF_SCOPE`.

Natural-language wording is downstream presentation and cannot change the structured disposition.

## Clinical lifecycles
`ClinicalRule`: `DRAFT -> EVIDENCE_REVIEWED -> TECHNICALLY_TESTED -> CLINICAL_REVIEW -> APPROVED -> ACTIVE -> SUPERSEDED | RETIRED`

`EvidenceAtom`: `DRAFT -> REVIEWED -> CURRENT -> SUPERSEDED | RETIRED`

`OrganizationPolicy`: `DRAFT -> CLINICAL_REVIEW -> APPROVED -> ACTIVE -> SUPERSEDED | RETIRED`

Only accountable clinical governance may move care-changing rules/policies to `APPROVED` or `ACTIVE`.

## Versioning contract
- IDs are globally unique within entity type.
- Versions are monotonically increasing positive integers.
- `supersedes` references the prior `{id, version}` where applicable.
- Used rule/evidence/policy versions are never deleted from the audit domain.
- `DecisionEvent` references both ID and exact version.

## Multi-tenant policy resolution
Operational resolution is explicit:
1. national evidence remains descriptive evidence;
2. PREP-MEDS default operational rule, when clinically approved;
3. organization overlay;
4. site overlay;
5. case-specific authorized clinician override, recorded separately.

A lower layer never mutates the historical content of a higher layer.

## RAG contract
RAG indexes `EvidenceAtom`, approved policy text, terminology aliases, and explanatory metadata. It retrieves authoritative artifacts by ID/version and returns source-grounded context. It does not execute clinical rules or invent medication instructions.

## Future interoperability mapping
The ontology is designed so adapters can later map medications to RxNorm, patient/procedure data to FHIR, computable logic to CQL/FHIR Clinical Reasoning where practical, EHR launch/context to SMART on FHIR, and workflow-triggered support to CDS Hooks.

These are integration representations; the PREP-MEDS ontology remains the internal source of truth unless deliberately superseded by a later architecture decision.

# PREP-MEDS ID and Version Conventions

## Purpose
IDs must remain stable across application code, RAG indexes, APIs, research exports, audit logs, and future EHR integrations. Versioning must allow exact historical reconstruction of any clinical decision.

## Entity prefixes
- `MED-` medication
- `ING-` ingredient
- `CLS-` drug class
- `MOD-` modifier definition
- `EVD-` evidence atom
- `RULE-` clinical rule
- `POL-` organization/site policy
- `TEST-` synthetic test case
- `DEC-` decision event
- `OVR-` override
- `OUT-` procedure outcome

Identifiers should be opaque after the prefix. Do not encode mutable clinical meaning, dates, tenant names, or guideline years into stable IDs.

Preferred examples:
- `MED-01JABC...`
- `RULE-01JXYZ...`

Human-readable slugs may be stored separately for search/display.

## Versioning
Versioned clinical artifacts (`EvidenceAtom`, `ClinicalRule`, `OrganizationPolicy`, and versioned test artifacts) use:
- stable `id`;
- positive integer `version`;
- optional `supersedes: { id, version }`;
- lifecycle state;
- creation/review/approval metadata.

A material change creates a new version. Historical versions that were used in a `DecisionEvent` are immutable.

## What requires a new version
Examples include:
- changed clinical condition or branch logic;
- changed disposition;
- changed hold/restart timing logic;
- changed hard-stop logic;
- changed evidence claim or applicability interpretation;
- changed organization policy content that may alter a recommendation;
- changed required input set that can alter behavior.

Purely cosmetic UI copy that cannot change meaning may be versioned separately in the presentation layer later.

## Decision events
`DecisionEvent.id` is unique and append-only. A decision event never increments version because it represents a historical occurrence rather than a mutable knowledge artifact.

If a case is re-evaluated, create a new `DecisionEvent` and link both to the same case identifier where appropriate.

## Overrides
An override never edits the source `DecisionEvent`. It creates an `Override` referencing the original event and records actor, reason, time, and final structured disposition.

## Tenant scope
Organization/site identity is separate from policy identity. The same organization policy can be superseded by another version without changing organization/site identifiers.

## External terminology identifiers
RxNorm, SNOMED CT, LOINC, ICD, FHIR identifiers, or other standards are stored in `TerminologyCode` objects and never used as PREP-MEDS primary keys. This prevents external terminology changes from destabilizing internal references.

## Clinical approval invariant
No automated process may populate `approved_by`/`approved_at` or move a care-changing `ClinicalRule`/`OrganizationPolicy` into `APPROVED` or `ACTIVE`. Those transitions require accountable clinical governance.

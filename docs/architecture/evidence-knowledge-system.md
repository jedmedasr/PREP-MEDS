# PREP-MEDS Evidence Knowledge System

## Purpose
The evidence knowledge system converts authoritative external sources into versioned, reviewable, retrieval-ready evidence artifacts that can support deterministic clinical rules and source-grounded AI explanations.

It is intentionally separate from the clinical rule engine. Evidence describes what sources say; clinical governance decides how those sources are operationalized into a production rule.

## Core pipeline

```text
External source
    ↓
SourceDocument
    ↓
Evidence extraction / curation
    ↓
EvidenceAtom(s)
    ↓
Technical validation
    ↓
Evidence review
    ↓
CURRENT evidence set
    ├── deterministic rule authoring
    ├── RAG retrieval index
    └── governance / update monitoring
```

## SourceDocument
A `SourceDocument` represents one exact version of an external source such as a guideline, FDA label, consensus statement, peer-reviewed study, or regulatory document.

Required provenance includes:
- stable internal source ID;
- exact version;
- source type;
- title;
- retrieval timestamp;
- lifecycle state;
- optional publication/effective date;
- publisher/society/regulator;
- canonical URL or external identifier;
- optional checksum;
- supersession reference.

The raw source and the curated interpretation are not the same object.

## EvidenceAtom
An `EvidenceAtom` is the smallest reviewable claim that PREP-MEDS can safely reuse across clinical rules and RAG responses.

Each atom stores:
- exact source version;
- concise claim;
- normalized topic;
- stance;
- evidence strength when available;
- applicability to medication/ingredient/class/procedure/population/context;
- source locator (section/page/table/anchor);
- limitations;
- conflict group when relevant;
- retrieval metadata;
- lifecycle/reviewer metadata;
- supersession lineage.

Evidence atoms should be narrowly scoped. One atom should not combine multiple materially different recommendations merely because they appear in the same paragraph.

## Evidence lifecycle

`DRAFT -> REVIEWED -> CURRENT -> SUPERSEDED | RETIRED`

Automation may ingest and structure material in `DRAFT` and perform technical checks. Automation cannot promote evidence to `REVIEWED` or `CURRENT`. `CURRENT` means the evidence object is approved for use by the production knowledge/rule system; it does **not** mean a specific clinical action has been approved.

## Evidence vs. policy
Institutional policy does not belong in national evidence records. A local policy may cite evidence atoms, but remains an `OrganizationPolicy` artifact with its own version and governance lifecycle.

Example conceptual separation:

```text
National society guideline -> EvidenceAtom
FDA label -> EvidenceAtom
Recent trial -> EvidenceAtom

Clinical governance interpretation -> ClinicalRule
Site-specific implementation -> OrganizationPolicy
```

## Conflicting evidence
Conflicts are preserved, not silently resolved.

Atoms that address the same operational question may share a `conflictGroup`. The package can detect clear opposing/conditional disagreement and create an `EvidenceConflict` object. The conflict remains visible even when an approved clinical rule or organization policy chooses an operational approach.

The system does not infer conflict merely because two sources differ in wording; conflict grouping is curated and explicit.

## Retrieval/RAG design
The RAG index should not be a raw dump of every PDF chunk. `buildRetrievalDocuments()` generates retrieval units from reviewed/current EvidenceAtoms while retaining exact source/version references.

Each retrieval document includes:
- evidence ID/version;
- source ID/version;
- title;
- grounded body text;
- keywords/concepts;
- authority rank;
- lifecycle.

Hybrid retrieval can later combine:
- structured filters from applicability;
- lexical search;
- vector search;
- graph relationships;
- reranking.

The retrieved evidence informs explanation and evidence navigation. It does not execute the clinical recommendation.

## Authority rank
`sourceAuthorityRank` is a deterministic retrieval-prioritization field, not an assertion that one source is universally clinically superior. Smaller numbers rank earlier. The ranking policy should eventually be centrally configured and versioned rather than scattered through content files.

## Exact-version reconstruction
Every rule and DecisionEvent must refer to evidence by `{id, version}`. The repository API therefore supports exact historical lookup separately from `getLatest*()` convenience methods.

No source or atom that has been used in a clinical DecisionEvent may be hard-deleted from the audit domain.

## Update workflow
When a source changes:
1. ingest the new source as a new source version;
2. create or revise affected EvidenceAtoms as new versions;
3. mark changed relationships with `supersedes`;
4. run technical validation and conflict detection;
5. route to evidence/clinical review;
6. evaluate affected clinical rules;
7. run rule regression tests;
8. only after approval, publish new production rule/evidence versions.

New evidence never automatically changes a patient-facing instruction.

## Licensing implications
Separating evidence from rules allows PREP-MEDS to license multiple products from the same knowledge substrate:
- evidence/reference search;
- deterministic medication CDS;
- source-grounded AI assistant;
- institution-specific policy overlays;
- evidence-update monitoring;
- API access;
- research/analytics.

The curated atomization, applicability mapping, conflict graph, rule linkage, and version history are core reusable platform assets.

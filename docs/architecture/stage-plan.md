# PREP-MEDS Full Product Build Plan

The platform is built in twelve cumulative stages. Each stage must leave durable artifacts that later stages consume.

## Stage 1 — Product and safety specification
Defines users, intended use, procedure scope, recommendation states, AI boundaries, safety properties, evidence hierarchy, governance, commercial requirements, and research requirements.

## Stage 2 — Canonical clinical ontology
Defines the domain model and schemas for Medication, Ingredient, DrugClass, Procedure, Indication, Modifier, Question, ClinicalRule, HardStop, EvidenceAtom, OrganizationPolicy, TestCase, DecisionEvent, Override, and ProcedureOutcome.

## Stage 3 — Medication terminology and search layer
Implements generic/brand/ingredient/combination representation, aliases and misspellings, normalization, search, and future RxNorm mapping.

## Stage 4 — Evidence knowledge system
Implements guideline/evidence storage, provenance, source versions, supersession, recommendation atoms, conflict representation, citation metadata, and retrieval-ready text representations.

## Stage 5 — Deterministic clinical engine
Implements rule evaluation, required-input resolution, hard stops, procedure logic, policy overlays, precedence, reason codes, and reproducible structured outputs.

## Stage 6 — Medication knowledge build-out framework
Implements systematic evidence acquisition and content authoring workflow for each medication domain. Clinical content remains review-required until approved by clinical governance.

## Stage 7 — Automated testing framework
Implements synthetic scenario fixtures, rule branch tests, safety tests, regression tests, evidence/version tests, and validation reporting.

## Stage 8 — Clinical web application
Implements searchable medication workflow, dynamic questions, MA and clinician views, evidence display, constrained patient instructions, case completion, and usability-oriented interaction design.

## Stage 9 — RAG / AI platform
Implements hybrid retrieval, evidence graph access, medication normalization, source-grounded explanations, missing-data questioning, and constrained generation that cannot bypass deterministic results.

## Stage 10 — Enterprise and data platform
Implements multi-tenancy, organizations/sites, RBAC, policy configuration, immutable event ledger, outcomes, analytics, research schemas, and governance console.

## Stage 11 — Security, compliance, and interoperability
Implements deployment security architecture, authentication/authorization controls, audit controls, PHI boundaries, FHIR/SMART integration adapters, CDS Hooks/API interfaces, and operational safeguards.

## Stage 12 — Validation, commercialization, and production hardening
Implements benchmark harnesses, shadow-mode support, monitoring, release/change-control workflows, production reliability, licensing/billing scaffolding, enterprise packaging, research exports, and validation documentation.

## Stage completion rule
A stage is complete only when:
- its required files/code exist;
- major assumptions are documented;
- interfaces to later stages are explicit;
- no known safety requirement is silently deferred;
- tests are included where executable code exists;
- the pull request documents limitations and the next stage.

## Clinical approval rule
Automated development may create, research, encode, and technically test clinical content. It must not mark care-changing content `APPROVED` or `ACTIVE` without accountable clinical governance.

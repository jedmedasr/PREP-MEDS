# PREP-MEDS Testing and Quality Gates

## Purpose
Stage 7 turns PREP-MEDS safety requirements into executable release gates. Clinical behavior must be reproducible, reviewable, and regression-tested before later application and integration layers can depend on it.

## Repository quality command
`pnpm quality` runs, in order:
1. JSON Schema validation of governed fixtures;
2. strict TypeScript typechecking across workspace packages;
3. package unit/integration/regression tests.

The GitHub Actions `quality` workflow runs the same gates on pull requests and pushes to `main`.

## Test layers
### Unit tests
Each domain package owns tests for local semantics, including terminology normalization, evidence validation, rule evaluation, policy resolution, governance transitions, and knowledge-pipeline state changes.

### Schema/fixture validation
Machine-readable fixtures are checked against their published JSON Schema contracts. Invalid fixtures must block CI.

### Golden synthetic cases
Golden cases are deterministic input/output fixtures. They must contain synthetic data only. Replaying a case must produce the exact expected structured result, independent of UI or LLM wording.

### Deterministic replay
Historical clinical decisions should eventually be reproducible from stored inputs plus exact engine, rule, evidence, policy, terminology, and calculator versions. Stage 7 provides the generic replay harness; production event-store replay is added with persistence.

### Rule-behavior diffing
Any rule/policy release should be evaluated against the approved synthetic corpus before promotion. Changes to disposition, escalation reasons, or case presence are safety-relevant and require explicit review. Merely changing prose must not be allowed to mask structured behavior changes.

### Integration tests
Later stages must add integration coverage across terminology -> rule selection -> policy -> decision event -> evidence provenance -> API/UI boundaries.

## Release-blocking expectations
A production candidate must not proceed when any of the following are present:
- schema validation failure;
- typechecking failure;
- failing unit/integration/regression test;
- unexplained golden-case drift;
- unreviewed safety-relevant rule diff;
- clinical content marked `ACTIVE` without required governance state;
- unresolved evidence/rule/policy references;
- nondeterministic engine output for the same versioned input bundle.

## Clinical safety asymmetry
Testing must prioritize dangerous false negatives, especially cases where the correct system behavior is escalation but the system would otherwise return a routine instruction. The test suite should separately track failure-to-escalate cases as the medication corpus grows.

## Required scenario classes for each care-changing rule
- standard applicable case;
- every branch condition;
- every hard stop;
- missing required input;
- conflicting input;
- unknown hard-stop status;
- out-of-scope scenario;
- tenant policy absent;
- tenant policy conflict;
- combination-product behavior when applicable;
- boundary/timing behavior when applicable;
- evidence/rule version replay;
- prior-version regression comparison.

## Change-control model
Rule changes should generate a before/after behavior snapshot over the approved corpus. Safety-relevant changes are not automatically failures if intentional, but they are release blockers until explicitly reviewed and associated with the relevant evidence/governance change.

## CI limitations at Stage 7
The workflow now exists in the repository and will execute in GitHub Actions when triggered. Stage 7 does not yet provide environment-specific security scanning, deployment smoke tests, E2E browser tests, database migration tests, FHIR conformance tests, or load/performance testing; those arrive with the relevant later stages.

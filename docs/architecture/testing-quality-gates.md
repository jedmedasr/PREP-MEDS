# PREP-MEDS Automated Testing and Quality Gates

## Purpose
Stage 7 establishes repository-wide verification so changes to PREP-MEDS clinical logic, schemas, terminology, evidence structures, and research-pipeline artifacts cannot merge without deterministic checks.

The quality system is intentionally layered:

1. static type safety;
2. package unit tests;
3. cross-package integration tests;
4. JSON Schema validation;
5. deterministic decision replay;
6. golden synthetic cases;
7. clinical rule-diff detection;
8. clinical-governance metadata gates;
9. CI enforcement on pull requests and stage/main pushes.

## Root command

`pnpm quality`

runs the release-gating suite:

- `pnpm typecheck`
- `pnpm test`
- `pnpm schema:validate`
- `pnpm governance:check`

A non-zero result from any step blocks the CI job.

## Continuous integration
`.github/workflows/quality.yml` runs on:
- every pull request;
- pushes to `main`;
- pushes to `stage-*` branches.

The workflow uses Node 22 and the repository-pinned pnpm version through Corepack. Dependency installation currently uses `--no-frozen-lockfile` because the repository does not yet maintain a committed lockfile. Once dependency stabilization is reached, a committed lockfile plus frozen installation should replace this behavior.

## Unit tests
Each executable package owns its local tests:
- terminology;
- evidence;
- clinical engine;
- knowledge pipeline;
- testing utilities.

Local unit tests should validate the smallest deterministic behavior possible and avoid network access.

## Integration and golden tests
`@prep-meds/testing` owns cross-package safety tests.

Golden cases in `clinical-content/testing/golden-decisions.json` are:
- synthetic only;
- explicitly non-clinical;
- stable regression expectations;
- used to ensure that engine behavior does not drift unexpectedly.

Future clinically adjudicated cases should be stored separately and require governance approval before becoming a production validation corpus.

## Deterministic replay
The replay harness executes the same `EngineRequest` multiple times and creates a SHA-256 fingerprint from a canonical JSON representation of the complete decision execution.

A deterministic request must produce the same:
- disposition;
- reason codes;
- missing inputs;
- exact rule/evidence/policy refs;
- timing/restart snapshot;
- execution trace;
- fingerprint.

Any replay divergence is treated as a defect.

## Rule-diff safety gate
`diffClinicalRules()` compares the latest version of each rule ID across two rule sets.

The following are explicitly detected:
- rule addition/removal;
- lifecycle status change;
- scope change;
- applicability change;
- required-input change;
- hard-stop change;
- disposition change;
- timing change;
- restart-owner change;
- evidence-reference change;
- policy-dependency change;
- priority change.

These are care-relevant and therefore release-blocking until explicitly reviewed.

This utility does **not** approve a change. It only makes the change mechanically visible and prevents silent semantic drift.

## Schema validation
`tools/quality/validate-schemas.mjs` validates canonical synthetic fixtures against the JSON Schema Draft 2020-12 contracts.

Current validated fixture families:
- canonical PREP-MEDS knowledge bundle;
- evidence bundle.

As additional persistent bundle types are added, each must add at least one valid fixture and preferably invalid fixtures at the package/unit-test level.

## Governance gate
`tools/quality/check-clinical-governance.mjs` inspects JSON clinical-rule/policy content.

Any source artifact marked `APPROVED` or `ACTIVE` must contain explicit approval metadata. This gate is intentionally independent of the application UI or database so source-controlled content cannot be promoted silently by an automated ingestion process.

The governance gate is necessary but not sufficient for clinical approval. Presence of approval metadata does not independently establish that approval was legitimate; later enterprise stages must enforce authenticated reviewer identity, role, and append-only approval records.

## Coverage expectations
Until a dedicated coverage reporter is added, PR review should require tests for every changed branch of care-changing logic.

Minimum expectations for each clinical rule family remain:
- ordinary applicable case;
- each applicability branch;
- each required-input state (`KNOWN`, `UNKNOWN`, `CONFLICTING`, `NOT_APPLICABLE`) where relevant;
- every hard stop;
- unknown hard-stop status;
- relevant policy resolution;
- policy conflict;
- rule ambiguity;
- out-of-scope behavior;
- deterministic replay;
- previous-version regression behavior.

A future coverage threshold may supplement these requirements but must not replace scenario-based safety coverage.

## No-network test principle
Clinical unit/regression tests should not depend on live web APIs, RxNorm endpoints, guideline sites, vector databases, or LLM providers. External integrations require contract tests with recorded/synthetic fixtures and separate integration environments.

## Release policy
A future production release must satisfy all automated gates **and** the clinical-governance lifecycle. Passing CI does not mean a medication recommendation is clinically approved.

Automated tests establish software correctness relative to encoded expectations. They do not determine whether those expectations are medically appropriate.

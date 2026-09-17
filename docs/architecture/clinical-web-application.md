# PREP-MEDS Clinical Web Application

## Purpose
Stage 8 adds the clinician/staff-facing web workflow around the existing terminology and deterministic decision-engine packages. The application is an orchestration and presentation layer; it is not a new source of clinical authority.

## Technology
- Next.js App Router
- React
- TypeScript
- existing `@prep-meds/terminology` package for medication search
- existing `@prep-meds/clinical-engine` package for care-changing decisions
- repository-wide Stage 7 quality gates, now extended to require a production web build

## Runtime architecture

```text
Browser
  |
  |-- GET /api/medications?q=...
  |       -> TerminologyIndex
  |
  |-- POST /api/questions
  |       -> ACTIVE rule scope inspection
  |       -> required modifier definitions only
  |
  `-- POST /api/decision
          -> normalized medication record
          -> Stage 5 engine in PRODUCTION mode
          -> ACTIVE rules + ACTIVE tenant policies only
          -> immutable structured DecisionEvent + trace
          -> constrained patient-instruction renderer
```

The browser never invents a disposition, timing interval, restart plan, or evidence citation.

## Workflow
1. Select `EGD`, `COLONOSCOPY`, or `EGD_COLONOSCOPY`.
2. Search the governed terminology index.
3. Select one normalized medication identity.
4. Fetch only rule-required questions for that medication/procedure context.
5. Submit explicit modifier values and provenance.
6. Execute the deterministic engine on the server.
7. Display separate staff, clinician, evidence, and patient views.

## View contracts

### Staff view
Optimized for the operational disposition, reason codes, missing information, medication, and procedure.

### Clinician view
Shows exact DecisionEvent ID, engine version, rule/policy references, timestamp, and the deterministic execution trace.

### Evidence view
Shows exact evidence artifact IDs/versions attached to the DecisionEvent. Full evidence text retrieval remains the responsibility of the evidence subsystem/RAG stages.

### Patient view
Patient text is generated only from a structured DecisionEvent. Non-actionable dispositions (`OUT_OF_SCOPE`, `INSUFFICIENT_INFORMATION`, `CLINICIAN_REVIEW_REQUIRED`, `LOCAL_POLICY_REQUIRED`) suppress patient instructions. `HOLD_STANDARD` also requires an approved structured timing instruction code before patient text is allowed.

## Current clinical-content state
Stage 8 intentionally seeds medication identity/search records from the Stage 6 Tier 1 backlog but loads **zero ACTIVE clinical rules and zero ACTIVE policies**. Therefore the application demonstrates the production workflow while failing closed rather than presenting unreviewed medication instructions.

When approved clinical content is later released, the UI does not require a new decision algorithm: it consumes the same active rules/policies used by the Stage 5 engine.

## Safety boundaries
- medication search is identity resolution, not clinical advice;
- ambiguous/unknown medication identity must not be converted into a decision request;
- clinical evaluation occurs server-side in `PRODUCTION` mode;
- production mode only executes `ACTIVE` rules/policies;
- UI prose cannot override the structured engine event;
- no patient instruction is rendered for non-actionable outcomes;
- no real PHI is committed to the repository;
- the current default organization identifier is a non-production placeholder and must be replaced by authenticated tenant context in the enterprise stage.

## Quality gates
Stage 8 adds `pnpm build:web` to the root `quality` command and GitHub Actions workflow. A pull request must therefore satisfy schema validation, strict typechecking, tests, and a production Next.js build.

## Known limitations
- no authentication/RBAC yet;
- no persistence or immutable database event ledger yet;
- no tenant resolver; placeholder organization context is used;
- no browser E2E suite yet;
- no full evidence-document viewer yet;
- no approved clinical rules are activated yet;
- numeric modifier normalization remains intentionally conservative and must be validated against typed modifier definitions before real clinical rules requiring numeric comparisons are released;
- no FHIR/EHR context ingestion yet.

These are addressed by later enterprise, interoperability, and production-hardening stages.

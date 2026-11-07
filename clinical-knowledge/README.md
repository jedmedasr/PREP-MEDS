# Clinical knowledge graph: recent-VTE reference slice

This directory is clinical knowledge, not the engineering task graph. The initial implementation is a real-document, synthetic-case reference workspace. It is NOT a clinically verified pathway or production medication-management protocol.

## Executable interface

- `pnpm knowledge:status`: graph structure and honest coverage counts.
- `pnpm knowledge:test`: deterministic and adversarial regressions.
- `pnpm knowledge:demo`: reproduce the explicitly dated synthetic recent-VTE case using committed authentic-source receipts. The fixture chooses BSG explicitly; the application has no default source choice.
- `pnpm knowledge:impact <observation.json>`: consume the existing PR #42 source-surveillance format; emit affected claims, pathways, canonical IDs and deduplicated engineering maintenance requests. It does not mutate the engineering graph or invoke an agent.
- `python scripts/clinical-knowledge/acquire.py`: retrieve registered editions, enforce raw SHA-256 pins, and repeat exact page/region passage checks with pypdf and Poppler. Capture mode is for deliberate acquisition, not a way to bypass failed verification.

The reference UI is `/knowledge-library`, with API `/api/knowledge-library`. Both `PREP_MEDS_CONTENT_MODE=shadow` and `PREP_MEDS_KNOWLEDGE_MODE=reference` must be explicitly set. Production/unset modes return 404. No deployment configuration was changed. Only synthetic cases are supported; the role selector simulates workflows and is not authentication.

## Data and reuse

`catalog.json` holds four existing canonical DOAC IDs, two society-specific claims, one parameterized recent-VTE pathway and nine prioritized scenario specifications. Generic canonical identity does not establish formulation: the case must explicitly confirm the supported oral tablet/capsule. Eight specifications have no executable pathway and return a research gap, never generated guidance. Frequency is UNKNOWN, not an invented prevalence measurement.

`source-register.json` holds society/title/version, raw hashes, bounded excerpts, PDF page/section/table/footnote links, certainty/strength fields and currency limitations. `verification-receipts.json` preserves executed mechanical-reader receipts and their GitHub run/artifact provenance. Clinical source context is linked rather than redistributing full copyrighted documents. Commercial source reuse/licensing needs its own assessment.

The two readers independently parse original PDF bytes. They are NOT Agent A and Agent B clinical reasoning systems. Their agreement establishes only located passage integrity. Every claim remains `SEMANTIC_VERIFICATION_PENDING`, and the strongest available source label is `PRIMARY_PASSAGE_CHECKED_NOT_SEMANTICALLY_VERIFIED`. The absence of separately graded certainty is recorded rather than borrowing a nearby recommendation's grade.

## Bounded decision behavior

The slice distinguishes VTE-event date from anticoagulation-start date, uses three calendar months rather than 90 days, preserves source-specific low-risk exceptions, and never treats a boundary date as procedural clearance. It generates no hold/resumption, bridging, or aspirin-substitution instructions. Unknown or positive high-risk histories, prior stents, mechanical valves, multiple antithrombotics, unstable/severe renal disease, pregnancy and urgent bleeding block routine output. Medical assistants cannot select complex-case management. Physician selection records a synthetic reference choice only.

Runtime evaluation is deterministic and performs no network/model calls. Content changes, source unavailability, stale observations, or changed discovery indexes invalidate applicable reference choices. Discovery warnings persist through subsequent unchanged checks; an explicit verified resolution mechanism is still needed before clearing them. Historical versions remain in Git and immutable receipts; reverting data must not erase source supersession or restore authority.

The existing monthly surveillance workflow is reused, with the 2024 BSG addendum registered and clinical-graph impact output added. No second schedule or continuous worker is introduced. Scheduled execution is not active until the workflow is adopted on main. An observation run is not a comprehensive clinical evidence review. The research UI now reads a server-controlled observation artifact on every request. Artifact delivery into the deployment is not configured by this change; clinical deployment still requires authenticated delivery and monitored freshness.

## What remains incomplete

Independent source-only clinical extraction/semantic verification, complete source context and current-guideline adjudication, verified new-scenario research, authorized institutional-policy execution, authenticated clinician identity, compliant durable DecisionEvent storage and actual privacy-reviewed usage telemetry are not implemented. Aggregate/deduplication helpers are tested but no real clinical usage collection is enabled. The source registry includes unadjudicated 2026 discovery candidates; they are not asserted to supersede the registered editions.

No per-extraction physician endorsement is required by the revised model. The missing independent semantic check must be supplied by a genuine source-verification pipeline, not a second label on this session or a new human-signoff queue. Ordinary engineering review of this implementation remains separate from clinical selection and institutional authorization. Expand only after the first pathway meets those acceptance criteria.

## Integration and maintenance

PR #43 is stacked on #42. Do not merge or modify #37. When reconciling #40 and #41, preserve SPR-001 evidence/status and ENG-003 scripts/task. CKG-001 is needs_review; CKG-002 is blocked on implementation adoption and EVD-002. Preserve historical ledger records and failures. Re-run application quality, engineering graph, clinical-evidence and clinical-knowledge checks on the exact integrated head. Browser interaction and real-world clinical validation were not performed.

## Runtime source observations

Set `PREP_MEDS_KNOWLEDGE_OBSERVATIONS` on the server to the absolute path of the existing surveillance workflow's `evidence-observation.json`. This is a deployment-controlled file, never a request-body field. Publish it by atomic replacement after checking its originating workflow/commit. This change does not configure artifact delivery, start a schedule, or give clients file-system access.

The API re-reads the bounded regular file on every request and selection. It requires the existing observation schema, full history, matching URL keys and registered source identities, fresh timestamps, and available primary documents **and** discovery indexes. Missing, unreadable, malformed, oversized, future-dated, or over-31-day-old input disables all reference selection. A changed document or unresolved discovery warning invalidates dependent references. There is no committed-receipt or last-good fallback. Request bodies cannot override observation state or the file path.

Comparisons remain visible with an explicit surveillance reason; the API also returns the observation timestamp and digest. An unconfigured deployment cannot record a reference choice. The separately labeled `pnpm knowledge:demo` remains a dated, committed-fixture demonstration, not a live-currentness assertion. Successful runtime checks still leave every claim `SEMANTIC_VERIFICATION_PENDING` and all patient instructions disabled. A digest identifies artifact bytes; it does not authenticate the publisher or prove clinical interpretation. The server-side artifact delivery and history-retention boundary must be trusted; intentionally truncated but structurally valid history cannot be authenticated by this file adapter alone.

The adapter adds no model calls, source-network requests, paid services, write permissions, or production activation. Authenticated artifact delivery, persistent anti-rollback protection, semantic verification, institutional policy authorization, and clinical decision persistence remain unfinished work.

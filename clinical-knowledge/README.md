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

The existing monthly surveillance workflow is reused, with the 2024 BSG addendum registered and clinical-graph impact output added. No second schedule or continuous worker is introduced. Scheduled execution is not active until the workflow is adopted on main. An observation run is not a comprehensive clinical evidence review. The research UI currently consumes committed capture state, not live scheduled-state storage; clinical deployment must integrate current surveillance state before activation.

## What remains incomplete

Independent source-only clinical extraction/semantic verification, complete source context and current-guideline adjudication, verified new-scenario research, authorized institutional-policy execution, authenticated clinician identity, compliant durable DecisionEvent storage and actual privacy-reviewed usage telemetry are not implemented. Aggregate/deduplication helpers are tested but no real clinical usage collection is enabled. The source registry includes unadjudicated 2026 discovery candidates; they are not asserted to supersede the registered editions.

No per-extraction physician endorsement is required by the revised model. The missing independent semantic check must be supplied by a genuine source-verification pipeline, not a second label on this session or a new human-signoff queue. Ordinary engineering review of this implementation remains separate from clinical selection and institutional authorization. Expand only after the first pathway meets those acceptance criteria.

## Integration and maintenance

PR #43 is stacked on #42. Do not merge or modify #37. When reconciling #40 and #41, preserve SPR-001 evidence/status and ENG-003 scripts/task. CKG-001 is needs_review; CKG-002 is blocked on implementation adoption and EVD-002. Preserve historical ledger records and failures. Re-run application quality, engineering graph, clinical-evidence and clinical-knowledge checks on the exact integrated head. Browser interaction and real-world clinical validation were not performed.

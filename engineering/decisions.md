# Engineering decision log

## ENG-DEC-0001 — Independent graph governance (2026-11-07)
**Decision:** Build Stage 1 on a new branch from `main`, with no medication-rule or active-sprint modifications. Store a typed JSON dependency graph, append-only evidence ledger, deterministic Node.js validation and a separate read-only CI workflow.

**Rationale:** `main` already has a clinical quality pipeline. The active PR #37 contains in-progress medication validation and cannot be treated as approved. A separate governance PR makes the new mechanism reviewable without altering the validation sprint.

**Alternatives deferred:** Graph database, multi-agent execution service, automatic clinical adjudication and autonomous merge/deployment. These would introduce complexity and risk before a reliable evidence model exists.

**Controls:** Clinical and release tasks require separately verified human approval records; the structural validator does not authenticate approvers. A passing CI result is never equivalent to clinical sign-off.

**Follow-up:** After independent review and a successful workflow run, adopt the graph as a coordination artifact; a repository admin must separately configure required status checks or branch rules.

## ENG-DEC-0002 — Executable, read-only-by-default Stage 2 (2026-11-07)
**Decision:** Add a Node.js stdlib CLI, pure graph/evidence logic, bounded GitHub REST adapter, explicit create-only Git-ref claims, structured handoffs and regression/live-read CI. Keep SPR-001 reconciliation separately reviewable in PR #40. No clinical or runtime application modifications.

**Rationale:** Deterministic selection and GitHub evidence reduce duplicated work without needing a database, paid agent service, distributed queue or six agent deployments. Atomic per-task refs prevent competing claims; optimistic main/digest checks detect concurrent state changes. Logical role contracts allow future independent agents without changing the data model.

**Failure policy:** Incomplete API access, stale state, failed CI, unmerged PRs, unsupported completion receipts, overlapping work and interrupted mutations do not authorize new execution. Preserve claims and evidence for explicit recovery. Never hide failures with retries or rewrite historical records.

**Evidence migration:** Stage 1 completion flags lack the new receipt fields. Retain them historically, report effective unresolved verification, and request independently reviewed appended evidence. Do not manufacture review provenance or rewrite prior records to obtain green task status. This migration is separate from clinical approval and does not prohibit explicitly authorized demo/bootstrap PR development.

**Trade-offs:** Claims are atomic per task, not a global distributed file lock. Workflow artifacts expire; reviewed ledger/handoff records must preserve durable provenance. A passing verifier establishes evidence mechanics, not medical correctness. Stage 2 does not enforce GitHub protection by itself or schedule an autonomous coding loop.

**Adoption gate:** Full quality/graph/orchestrator CI and a non-contributing independent reviewer are required before Stage 2 integration. Task completion follows in an evidence PR referencing the reviewed immutable implementation head; no self-referential completion SHA or agent-only sign-off.

**Measurement:** Report per-observation evidence coverage, stale states, duplicate candidates blocked, unsupported completion claims, failed handoffs, and API request count. Measure selection against deterministic fixtures. Time/cost remain unknown until measured; no invented savings or blanket zero-cost claim. Escalate infrastructure only when these measures justify it.

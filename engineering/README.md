# Stage 1 — PREP-MEDS Engineering Graph

This directory is a version-controlled orchestration contract, **not** an autonomous agent runner or a live source of medication guidance. Its purpose is to make dependencies, provenance, outstanding verification and human approval gates explicit across ChatGPT/Codex/GitHub work.

## Files

- `task-graph.json` — task nodes, dependencies, human clinical gates and acceptance criteria. Status is a **manually reconciled snapshot**, not a live GitHub feed.
- `evidence-ledger.json` — append-only records of verifiable engineering evidence. A recorded URL or approver field is a claim to independently verify, not a substitute for checking it.
- `decisions.md` — design decisions, unresolved trade-offs and release boundaries.
- `../AGENTS.md` — durable agent instructions used before every engineering run.
- `../scripts/verify-engineering-graph.mjs` — dependency/approval/evidence invariant checker.
- `../.github/workflows/engineering-graph.yml` — isolated PR gate; does not change the existing application quality workflow.

## Status semantics

- `not_started`: eligible once prerequisites are complete, but no implementation is claimed.
- `in_progress`: work started, with all dependency tasks complete.
- `blocked`: at least one dependency remains incomplete.
- `needs_review`: needs human examination; do not infer an approval.
- `complete`: all dependencies complete and at least one passing, task-linked evidence record exists.

All status changes require a review of the latest source branch, checks and substantive evidence. `needs_review` is not a synonym for `complete`. The validator enforces structural consistency and the presence of approval-shaped records, but **cannot** independently establish that clinical guidance is safe or a human approval is genuine.

## Operating procedure

1. At the start of a session, fetch the latest `main`, PR #37, its current head and CI. Read `docs/12-hour-validation-sprint.md` **from the sprint branch**; it is not on `main` at this baseline.
2. Reconcile the sprint checklist against actual commits, tests, group-level coverage and approvals. Never copy progress counters from historical chat or from the dated `snapshot` field.
3. Work on an isolated branch; do not push commits to PR #37 as part of this graph setup.
4. Attach evidence by task ID and exact git SHA. Record any unresolved guideline conflicts as blockers, not quietly accepted recommendations.
5. Run `node scripts/verify-engineering-graph.mjs` and `node --test scripts/__tests__/verify-engineering-graph.test.mjs`. CI repeats these checks.
6. Obtain independent clinical approval **outside** automation before considering a clinical release complete; verify deployment and privacy gates separately.

## Baseline evidence (2026-11-07)

- Main: `ec1ee7e1c00520cc5903e4ab8b0246e9936efa62`.
- Active sprint: `https://github.com/jedmedasr/PREP-MEDS/pull/37`, observed head `eeac28f8bf850efe770148983b280f5f5bff8a7a`.
- Observed passing quality workflow: https://github.com/jedmedasr/PREP-MEDS/actions/runs/42345077523.
- Sprint work and clinical validation are **not** advanced by creating this governance branch. A new CI run or commit may supersede the snapshot at any time.

## Limits and follow-on work

This is an intentionally lightweight stage. It does not dispatch agents, auto-merge PRs, validate medical source quality, authenticate approvals, or enforce GitHub branch protection by itself. Make `engineering-graph` and the existing `quality` checks required in branch protection using a repository administrator after the workflow is established. Add external scheduling, independent evidence review, and dynamic task synchronization only after this stable foundation proves useful.

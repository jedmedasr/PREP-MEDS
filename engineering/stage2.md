# Stage 2: deterministic graph orchestration

Stage 2 is executable Node.js 22 tooling, not a continuously running AI service. It uses the existing JSON graph and append-only ledger, the GitHub API, and read-only GitHub Actions. There is no database, queue, external subscription, LLM API call, automatic clinical approval, automatic merge, or deployment. No schedule is installed.

## Commands

```sh
pnpm graph status
pnpm graph improve
pnpm graph next --offline
pnpm graph verify
GH_TOKEN=... pnpm graph reconcile
GH_TOKEN=... pnpm graph next
GH_TOKEN=... pnpm graph verify --base-ref <exact-base-sha> --live
pnpm graph handoff --input engineering/stage2-handoff-input.json --live --output <new-report-path>
pnpm test:graph-orchestrator
```

`status` and `verify` default to local structural checks. `next` and `reconcile` require live GitHub and never silently fall back when credentials, pagination, or API calls fail. `--offline` is planning only and cannot authorize execution. JSON output separates declared status, effective unresolved status, structurally eligible tasks, and actually eligible tasks. Exit 1 means invalid input/history/operation; exit 2 means live reconciliation was incomplete. A valid report with unresolved tasks can exit 0: that certifies the report ran, NOT that those tasks are complete.

Read access needs repository Contents, Pull requests, and Actions permissions. Use `GH_TOKEN` or `GITHUB_TOKEN`; do not place credentials in files or command logs. The CI workflow uses its ephemeral read-only token, no production secrets, and no patient data. Tokens are never returned in reports. The API adapter has a 180-request ceiling, a 20-second request timeout, and ten 100-item pages per collection. A limit stops dispatch rather than silently truncating evidence.

## Deterministic selection

Ascending integer priority in `orchestrator-policy.json` (default 100), then task ID. Only `not_started` tasks with verified completed dependencies, fresh live state (15 minutes), successful current-main quality/graph workflows, matching committed graph/ledger, no overlapping open PR, no existing claim, and no unfinished handoff for that task can be selected. Clinical gates are never automatically dispatched. Demo engineering tasks must not depend on unrelated clinical approval; explicit shadow mode remains the separate runtime content boundary.

An immutable historical SHA does not become invalid merely because main advanced. Missing commits, changed PR heads, failed/pending/retried CI, dismissed/superseded reviews, expired evidence artifacts, and incomplete receipts do invalidate the associated verification. Unresolved dependency evidence propagates to dependent tasks. Path scopes use directory boundaries, not ambiguous string prefixes.

## Evidence and completion

Every new transition to `complete` is checked against live GitHub. A `task_verification` receipt includes:

- stable unique ID, task ID, exact implementation **PR head SHA**, PR number, result, date/timestamp and summary;
- exact acceptance strings, empty completion blockers, actual workflow run IDs and artifact/run URLs;
- `commands`: objects with `command`, `run_id`, exact successful step name in `step`, and `outcome: success`;
- `implemented_by` and `verified_by`. In `independent_human` mode, `verified_by` must map to an approved exact-SHA review by a non-author/non-contributor. In `ci_single_maintainer` mode, technical verification is supplied by exact-head required CI plus immutable evidence; a second human code reviewer is not required.

All configured baseline workflow paths must succeed for that SHA. A task may add workflows but cannot remove baseline requirements. Tests must map to successful steps in the cited runs; a receipt alone is not proof. Artifact references are checked for their run, SHA and expiry. Technical CI can establish engineering checks, not medical correctness or product acceptance. Clinical-gated tasks still require authenticated human clinical approval under the separate clinical governance path, and user-facing/product acceptance remains a separate owner decision.

Completion is deliberately two-phase: merge the reviewed implementation PR after successful CI, then submit an evidence/state PR referencing that immutable reviewed head and its runs. This avoids self-referential commit hashes and unmerged completion claims. The state PR goes through the same checks. Do not put fake SHAs, reviewer identities, or workflow IDs in receipts.

Existing Stage 1 records remain byte-for-byte equivalent as JSON records. They are **not silently upgraded** into Stage 2 verification receipts. At adoption, ENG-001/ENG-002 can therefore be structurally complete but effectively unresolved until their missing provenance/review is independently reconciled and appended. This is an engineering-evidence migration issue, not a requirement to finish clinical validation before demo development. Explicitly authorized bootstrap work can be proposed in isolated PRs without falsely advancing these old tasks.

## Claims, concurrency and interrupted runs

A mutation is explicit:

```sh
pnpm graph claim --task ENG-123 --owner <authenticated-login> --key <stable-session-key> --expect-main <exact-sha> --write
```

Run from a clean checkout of current main. A user token with Contents:write is needed; CI never gets this permission. The authenticated login must match `owner`. The claim uses atomic, create-only `refs/heads/engineering/claims/<TASK-ID>` pointing to an auditable commit with the unchanged parent tree. Two contenders for the same task cannot both create that ref. The claimed main SHA and graph/ledger digests are compared to live contents; main is rechecked before and after the write. No force update, lock stealing, automatic expiry, or hidden mutation retry exists.

Repeating the same owner/key/base resumes ownership but returns `execution_authorized: false`; inspect the previous work branch, checks and handoff before resuming. A different owner/key is a conflict. A network interruption may leave an orphan commit or a successfully created ref; inspect both before any retry. A main move after claim creation retains the claim and stops execution.

Recovery: record the incident in a new handoff/evidence record; verify the current claim's owner, key, base and exact ref SHA; reconcile or abandon the prior work explicitly. A repository owner may then delete **only that reviewed claim ref**, never main or another agent's work branch, and record the recovery in a PR. Do not push implementation commits onto claim refs. Work on a separate feature branch, with task IDs in PR titles/bodies so other sessions detect overlap.

The atomic guarantee is per task ID. Cross-task scope checks are conservative open-PR observations, not a distributed transaction across all file paths. Future agents must honor claims/scopes; repository protection is the enforcement boundary against bypassing the CLI. This tool does not replace GitHub branch rules.

## Handoffs and roles

`handoff` validates a structured input and emits a stable session/task-derived report ID, PASS/PARTIAL/FAIL, observed main SHA and graph/ledger digests, executed tests, satisfied criteria, blockers, next task and recommended action. PASS is rejected without remotely verified completion. PARTIAL/FAIL preserves unfinished work instead of advancing. Output is create-only and identical-content idempotent; a conflicting or interrupted output file is never overwritten.

Commit reviewed handoffs under `engineering/handoffs/` through a PR. Live reconciliation reads those reports from current main and requires independent re-verification. CI also uploads the observation and generated handoff as 30-day artifacts; artifacts are not permanent storage. Preserve durable evidence in the ledger/PR before expiry. The CI input is a conservative Stage 2 bootstrap handoff, not a declaration that future sessions are complete.

`roles.json` specifies logical interfaces for planner, implementer, verifier, researcher, reviewer and coordinator. Existing ChatGPT/Codex sessions may execute these roles. Different role names in the same session do not create independent review. Independent agents can later exchange the same task/SHA/evidence/handoff contracts without new infrastructure now.

## CI and metrics

`graph-orchestrator` runs on PRs, main pushes and explicit dispatch. `test-orchestrator` runs dependency-free regression/adversarial tests, existing graph tests and offline CLI smoke tests. `reconcile-live` validates append-only history/transitions against the exact base, retrieves GitHub state, verifies any new completion, and uploads a structured observation/handoff. Existing `quality` and `engineering-graph` workflows are unchanged. PR #37 is observed read-only, never rerun or modified.

Each reconciliation reports evidence-supported completion percentage, unresolved/stale completions, duplicate work candidates blocked, unsupported completion claims, failed handoffs, and API request count. These are **per-observation**, not inflated lifetime counters. Aggregate immutable run artifacts to measure trends. Task-selection accuracy is expected task ID versus actual result across deterministic test fixtures; the regression suite fails on disagreement. Engineering time and monetary cost remain null until actually measured from run timestamps/billing; no invented zero-cost claim. LLM calls are zero. GitHub Actions usage may count toward the account's allowance.

Success measures: no unsupported completion accepted by adversarial fixtures, deterministic task choices, bounded GitHub requests, and fewer repeated/stale tasks across observed sessions. Retain this stdlib design until measured shortcomings justify anything larger.

## Adoption and owner actions

SPR-001 reconciliation is independently reviewable in PR #40. Stage 2 must pass full application CI, graph CI, and orchestrator tests/live reconciliation before merging. When `technical_review_mode` is `independent_human`, an independent code review is also required; when it is `ci_single_maintainer`, exact-head CI is the technical gate. Its implementation task remains `needs_review`, not complete by assertion.

Configure main protections at https://github.com/jedmedasr/PREP-MEDS/settings/branches: PR required, successful `quality`, `validate-graph`, `test-orchestrator` and `reconcile-live` checks, no force pushes/deletion or routine bypass. Require an approving code review only when the repository has an actually available independent technical reviewer; do not substitute product/clinical acceptance for code review. Check actual job names in GitHub before selecting them. The connected GitHub App cannot administer branch protection, and private-repository protection may require an owner plan upgrade. Do not make the repository public as a workaround.


## Bounded self-improvement loop

Graph engineering now includes a deterministic learning pass over durable incident records in `engineering/incidents/*.json`. The loop groups stable failure codes, counts recurrence and unrecovered observations, and emits deterministic `engineering_reliability` improvement candidates with regression-test and exact-head verification criteria.

This is deliberately bounded self-improvement:

- it may propose engineering reliability work from observed operational failures;
- it does not edit the task graph, ledger, code, clinical evidence, medication rules, approvals or deployment state by itself;
- malformed incident evidence blocks the learning report instead of being silently discarded;
- candidate IDs are content-derived and stable, so repeated runs do not create duplicate pseudo-work;
- recurrent failures must have a corresponding candidate, and CI archives the improvement observation with reconciliation artifacts;
- a candidate is not a completed repair. Reviewed implementation, applicable tests, exact-head CI and later non-recurrence evidence are still required.

This keeps the feedback cycle explicit: **observe failure -> persist incident -> derive candidate -> implement under normal graph controls -> verify exact head -> observe recurrence/non-recurrence**. Clinical-content mutation remains governed separately by the safety and clinical-governance controls.


## Single-maintainer technical review mode

This repository currently has no independent technical reviewer. In `ci_single_maintainer` mode, engineering completion is therefore gated by deterministic exact-head CI, immutable evidence, merged-PR/SHA binding, required workflow success, command/step verification, and artifact provenance. The owner is not expected to pretend to perform code review.

This does **not** weaken clinical governance. Any task with `clinical_gate: true` still requires authenticated human clinical approval from the configured clinical-reviewer path before it can be treated as complete or active. Product/front-end acceptance by the owner is a separate acceptance layer and should evaluate visible behavior, usability, and intended workflow rather than source code.

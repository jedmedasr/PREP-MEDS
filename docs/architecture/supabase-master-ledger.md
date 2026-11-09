# Supabase operational master ledger

## Authority and current delivery boundary

The owner's database-first Agent A -> independent Agent B instruction supersedes the earlier no-second-AI completion rule for this workflow. Supabase is the operational source of truth. GitHub stores versioned code and evidence. Evidence completion is separate from clinician review and patient-facing release; the agent API never updates those two authorizations.

**PARTIAL / NOT ACTIVATED.** No existing Supabase project reference, database connection, or hosted SQL action was available in this session. The Supabase plugin was not installed and the owner declined it; do not suggest or install it again. Existing Vercel project environment metadata showed no Supabase/database variables and its integration lookup was empty. This does not establish that the user's database does not exist. No project was created, no hosted schema was inspected, and no hosted data was changed.

The available alternative is a securely configured direct connection to the already-existing project in an authorized runner, or an already-deployed authenticated backend. Do not paste service keys/passwords into chat, repository files, issue comments, command arguments, or artifacts. Project identification and read-only catalog inspection must precede hosted migration.

## Baseline review and non-destructive reuse

Baseline authority: `f6f28735b45273486b443f04bab6d6b49466b112`, migration `20261108234000_agent_custody_ledger.sql`, left unchanged. It proposes `review_groups`, `canonical_mapping`, `agent_runs`, and `custody_events` in `prepmeds_audit`.

Its raw replay is not safe: duplicate ADD CONSTRAINT statements fail. Its unique(group,agent,revision) prevents a new attempt after lease expiry. UPDATE/DELETE custody triggers alone do not protect TRUNCATE. It contains no atomic dispatcher, authenticated actor binding, immutable evidence versions, idempotency receipts, or formulation-unit membership. The three additive migrations retain original rows, replace the retry-blocking constraint with per-attempt/live-run uniqueness, add group-consistent foreign keys and indexes, and implement the missing workflow. A real catalog may differ: do not assume the proposed four tables are the deployed four tables.

The added tables are runtime_config, agent_principals, review_unit_members, evidence_revisions, import_receipts, and dispatch_requests. Provisional parent groups are distinct from formulation-specific children; the 436 canonical master rows are not duplicated when a generic ID needs multiple confirmed formulation scopes.

## State, claims and independence

The dispatcher implements QUEUED -> AGENT_A_CLAIMED -> AWAITING_B -> AGENT_B_CLAIMED -> EVIDENCE_COMPLETE or DISPUTED. Incomplete A submissions retain their payload and deficiencies and return to A; B failure records discrepancies and requires a new revision after correction. Historical revisions and verdicts are retained.

Each ownership lane has its own A extractor and B verifier. Odd/even ownership lanes are not the same thing as A/B execution roles. Principal credentials bind a fixed lane, role and independence identity. B must have a different registered independence identity from the corresponding A. Database-generated execution/context IDs and UTC clocks bind work. B verifies the exact current A revision/hash, all supplied source passages, formulation mapping and test-commit receipts.

Atomic claims use group row locks and SKIP LOCKED, unique live-run indexes, principal serialization and persisted idempotency responses. Eligible B is prioritized. Expired A and B claims recover to their prior actionable states, with old attempts/progress retained. Replaying a claim never authorizes another worker launch. The original worker can resume explicitly with the owned context while its lease remains valid. Failed and ambiguous persistence is checkpointed rather than retried silently.

## Scope of verification

PostgreSQL enforces state, identity, mapping, receipt structure, source/revision correspondence and append-only history. It does not download guidelines or interrogate GitHub itself. Independently provisioned workers must actually retrieve the original documents and verify the source statements and test results before submitting their authenticated verdicts. Two declared identities or matching hashes alone do not prove clinical-semantic verification. No such real workers or primary-source end-to-end execution were configured in this session.

Antithrombotic evidence requires ASGE 2016, BSG/ESGE 2021, ACG/CAG 2022 and applicable CHEST 2022/AHA-ACC 2024 comparisons. Nonapplicability requires a rationale; unspecified intervals remain NOT_SPECIFIED. FDA-label reconciliation is not a guideline-interval completion prerequisite. Recommendations retain source-specific intervals/units/anchors, renal/hepatic and bleeding/thrombotic/indication details, exceptions, certainty and conflicts. Nothing chooses a universal shortest/longest interval.

## Import and history

`python3 scripts/supabase-ledger/prepare_import.py --output <controlled-path>/import.json` reads the existing manifest and allocation without regenerating or reassigning them. It checks canonical uniqueness, exact group membership, allocation parity and the declared 436/233/48 baseline. Evidence files are included unmodified as preliminary Agent A work; source links and historical review fields are preserved. The SQL import adds an immutable receipt with the exact repository snapshot SHA and does not fabricate an agent execution or PASS.

The isolated import found all ten Bucket 01 packages incomplete. Each retained its specific missing authenticated execution, formulation adjudication, executed test receipts, exact hashed primary passages and package commit metadata. None entered AWAITING_B. A future execution may finish and resubmit those records; imported chat/commit/READY labels cannot produce verification by themselves. Preserve old review history but do not equate it with the new independent B result.

## Restricted backend and scheduling

`POST /api/agent-ledger` is server-to-server, disabled unless PREP_MEDS_LEDGER_ENABLED=true. It rejects browser Origin headers, missing credentials, unknown actions, oversized bodies and project mismatches. It never accepts a client-selected database URL. `public.prepmeds_agent_dispatch` is callable only by the service role and requires a separate registered agent token; public/anon/authenticated roles have no access. Service-role direct table writes are revoked. Runtime credentials are server-only.

The bounded `scripts/supabase-ledger/schedule.mjs` adapter first queries both registered principals and database status, reconciles expired leases, selects B before A, and claims atomically. It invokes a separately configured worker endpoint and persists the result before returning. Missing workers fail before a claim. Replays do not launch a second worker. The adapter is tested with mocked HTTP; it is not a deployed worker or a successful scheduled Supabase invocation.

Configuration names (no values are committed):
- PREP_MEDS_LEDGER_ENABLED, PREP_MEDS_SUPABASE_PROJECT_REF, PREP_MEDS_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (server only)
- PREP_MEDS_AGENT_A_TOKEN, PREP_MEDS_AGENT_B_TOKEN (separate, fixed-lane principals)
- PREP_MEDS_WORKER_A_URL, PREP_MEDS_WORKER_B_URL and their corresponding _TOKEN credentials
- PREP_MEDS_LANE and PREP_MEDS_RUN_KEY for a scheduled invocation

The existing hourly Lane B ChatGPT task was updated to require a successful database-first query/claim and to report BLOCKED_DATABASE_ACCESS without researching when access is missing. The other account's tasks were not visible and were not changed. No new recurring task was created. A changed prompt is not proof of scheduler integration: **zero real scheduled database invocations were verified**.

## Hosted application and rollback acceptance

1. Securely identify/connect the existing project; run `supabase/ops/inspect-existing.sql` read-only and review actual tables, columns, relationships, indexes, policies, grants and existing records. Reconcile any existing medication/evidence master instead of blindly duplicating it. Record project reference and schema fingerprint.
2. With runtime disabled, take the appropriate existing-project recovery snapshot and review migrations. Apply the baseline only if absent and compatible; do not rerun its ADD CONSTRAINT operations. Apply additive migrations transactionally and inspect results before enabling writes. Existing duplicate active runs must be reconciled, not deleted to satisfy a unique index.
3. Use the exact snapshot SHA with the prepared catalog through owner-only import_catalog; compare every canonical ID, group, combination and lane count, and verify prior history retained. Never run the disposable test harness against a hosted project; it explicitly requires loopback isolated CI and creates/drops only its temporary test databases.
4. Provision independent A/B principals and source-verifying workers for each lane, bind the inspected project and verify RLS/RPC permissions and credential custody. A service credential alone is not a research worker. Registering multiple labels for the same agent is not independent verification.
5. In a controlled nonclinical acceptance scope, execute the real HTTP/database A->B flow, a disputed correction, expiry recovery, collision and replay tests. Inspect actual UTC custody events and exact source/test receipts. Verify the real scheduler invocation separately. Only then set operational enabled and report activation. Clinical review/release flags remain unchanged.

Non-destructive rollback is to stop dispatch, set runtime_config.enabled=false through the authorized administrator, retain evidence/runs/events, and use a reviewed forward fix. No automatic DROP/TRUNCATE/down migration is shipped. CI demonstrated transaction rollback and replay without losing history; it did not demonstrate a hosted backup restore or point-in-time recovery.

Database owners and credential custodians remain trusted. Hash-linked history is not independent notarization and does not protect against a database superuser rewriting the entire store. Require project-level access, backups, key custody and administrative audit controls during hosted acceptance.

## Executed evidence and known blockers

At `3d27946fbb5e2ee67cb44125bda3b11a7bfa0a5c`, workflow 42539556833 passed 26 real PostgreSQL 17 tests and 16 mocked backend/schedule tests. It exercised complete/failed/corrected transitions, stale revision rejection, simultaneous claims, row-lock skipping, expired A/B recovery, replay, identity/lane restrictions, immutable history, RLS/privileges, formulation splits, source invalidation, import reconciliation and transactional rollback. Actual SQL query outputs and the synthetic A/B custody sequence are retained in artifact 13640402752; SHA256 fdb8b447ff45dfc3b8904f8a2ce0661692e100db6619dc94c41de309f4fbd6ce. This is **not the existing Supabase project**, and the fixture source is not clinical guidance.

Initial run 42537559619 failed on an ambiguous PL/pgSQL revision variable. The repair names and qualifies it explicitly and adds context/replay guards; no gate was weakened. Full application run 42539556868 still fails on inherited `apps/web/tests/bucket01-evidence-release-gate.test.ts` parse errors at lines 27-28 and 36; full application tests/build were skipped. The odd-lane file was not changed. PR #50 remains unmerged; live acceptance and application-wide CI are not complete.

# PREP-MEDS - Agent Engineering Contract

## Source of truth and current clinical governance
The repository is authoritative. Before changes read README.md, docs/safety/safety-spec.md, relevant architecture/governance documents, engineering/README.md, the live task graph and append-only evidence ledger. Reconcile live main, relevant branch heads, PRs, CI and prior handoffs; do not infer completion from conversation history.

The owner decision at `54ba41ff7c68232fb92bb8886a0e73fbfb165a54` supersedes earlier mandatory independent-AI source-verification requirements. Read `docs/clinical-governance/clinician-mark-reviewed.md`. The clinical evidence agent owns medication-specific primary-source extraction and comparison. It must preserve formulation, procedure/risk scope, renal boundaries, interruption/resumption semantics, strength/certainty, exceptions and society conflicts. Supply direct primary section/table/FDA-label links where available, or a precise locator with an honest deep-link limitation. Never invent passages, timing or verification.

A complete package becomes `READY_FOR_CLINICIAN_REVIEW`; then continue extracting the next medication. Neither another AI verification nor the preceding clinician review is an extraction prerequisite. The authorized clinician independently checks the primary source when explicitly clicking **Mark Reviewed**. Only that authenticated, affirmative action may create a `CLINICALLY_REVIEWED` record for the exact group, evidence revision and mapping scope. Passing tests, source accessibility, repository membership, agent agreement and repeated answers are not approval.

Evidence approval, patient-specific source selection, institutional policy and patient-facing activation are separate. Material recommendation/source/formulation/mapping changes invalidate prior evidence approval without deleting history. Group review propagates only to explicitly mapped canonical identities within the reviewed formulation; do not infer a formulation from a generic name or inherit single-ingredient approval into combinations. Never automatically select the shortest/longest interruption or resolve source conflicts.

## Engineering cycle
1. Inspect current main, relevant PRs/branches/checks and the preceding task's actual evidence.
2. Select dependency-eligible bounded work; use an isolated branch and exact-head non-force updates. Direct owner-authorized demo/bootstrap engineering may proceed without unrelated production-clinical approval.
3. Execute relevant unit, schema, TypeScript and build checks. Record failed tests and unresolved evidence as well as successes; never change clinical recommendations merely to satisfy CI.
4. Append verifiable evidence with exact source/implementation SHAs and workflow references. Preserve historical records, decisions and failure artifacts. Update task state only when acceptance criteria are genuinely met.
5. Request independent engineering review for implementation integration. A renamed role in one session is not an independent reviewer. Owner-directed exceptions must remain explicit and must not be fabricated as review receipts.
6. Report actual PASS/PARTIAL/FAIL, exact heads and CI, delivered scope, blockers and next work. Do not describe configured schedules, fixtures or tests as observed unattended execution or clinical validation.

## Stage 2 orchestration and handoff
Read engineering/stage2.md, engineering/roles.json, engineering/decisions-stage2.md and engineering/integration.md. Run `pnpm graph verify`, then authenticated `pnpm graph reconcile` and `pnpm graph next`. Offline eligibility is planning only. Use the deterministic priority policy and explicit `graph claim ... --write` ownership for eligible tasks; never steal, expire, delete or force-update a claim. Reconcile interrupted runs before resuming. Generate a structured handoff and preserve evidence in a reviewed PR.

Historical ENG-001/ENG-002 completion records are not automatically upgraded to stronger independent-review receipts. These engineering-evidence limitations are distinct from clinical source review. Historical two-AI pipeline examples remain tests of those examples, not a mandatory gate for the revised clinician-review queue.

## Safety and coordination
- Do not activate unapproved medication instructions or migrate legacy clinical rules by changing an approval flag. Existing APPROVED/ACTIVE, institutional policy and deployment safeguards remain effective.
- No real patient data in source, fixtures, PRs, notes or audit logs. Clinical review records describe evidence groups only; GitHub is not a patient-decision/EHR store.
- All missing identity, formulation, applicability, evidence, authentication or authorization conditions fail closed. Never infer absence of a high-risk condition from missing data.
- The clinical evidence agent continues on its existing source branch. Coordinate via its PR discussion and immutable commit references; do not duplicate its completed research or commit to `test/medication-research-regression-20261106`. PR #37 was merged previously; its source agent may continue on that branch.
- Do not modify concurrent agents' PRs or deployment settings without scope-specific authorization. No new paid infrastructure, graph database, continuous worker or redundant model call without measured justification.
- Keep clinician allowlists, OAuth/session credentials and audit-write credentials server-only. The UI must not accept a client-provided reviewer identity, approval authority, timestamp or trusted source hash.

## Required checks
Run `pnpm review:test` for clinician-review changes, `pnpm evidence:test` for evidence-framework changes, and full application quality checks. After graph/ledger changes run `node scripts/verify-engineering-graph.mjs` and `node --test scripts/__tests__/verify-engineering-graph.test.mjs`. Preserve source/version history with `node scripts/clinician-review/validate-history.mjs` and its base-ref CI gate.

Old decisions and task reports remain historical. The current policy above and the owner-linked governance amendment govern new source-review work; they do not certify unfinished evidence packages or authorize clinical deployment.

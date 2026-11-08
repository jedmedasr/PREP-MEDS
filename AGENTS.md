# PREP-MEDS — Agent Engineering Contract

## Mission and source of truth
Build auditable, evidence-linked clinical decision-support software for elective outpatient upper endoscopy and colonoscopy. The version-controlled repository is authoritative. This file governs code agents and human-guided AI work; the task graph is in `engineering/task-graph.json`.

Read `README.md`, `docs/safety/safety-spec.md`, the applicable `docs/architecture/` and `docs/clinical-governance/` documents, and `engineering/README.md` before changing behavior. Follow the most restrictive applicable safety/clinical-governance rule. The source-reproduction amendment below explicitly distinguishes source fidelity from clinical endorsement; it does not migrate legacy production rules.

## Before each engineering run
1. Fetch current `main`, relevant feature/validation branch, open PRs and their head SHAs, status checks and workflow results. Do not rely on prior chat messages or a stale graph snapshot.
2. Inspect the preceding run's commits, test results, acceptance evidence and blockers. Distinguish code/build success from medical correctness and clinical approval.
3. Select an eligible task whose dependencies are complete. Work in an isolated feature branch and bound the change to its acceptance criteria.
4. Run relevant tests and record exact commands, results, commit/PR references and gaps. Do not mark a task complete without passing, traceable evidence.
5. Append evidence records in `engineering/evidence-ledger.json` and update the graph only after checking prerequisites. Record material architectural decisions in `engineering/decisions.md`.

## Safety and release boundaries
- Never introduce or activate patient-facing medication rules solely from an agent's judgment, automated test, or guideline summary. Existing production activation remains governed; the source-reproduction amendment defines a separately verified comparison pathway without per-extraction clinical re-endorsement.
- Never convert provisional inventory counts, a passing CI check, or a green deployment into claims of clinical validation.
- Keep unsupported, missing, or unapproved patient instructions fail-closed. Different societies' independently source-verified recommendations may be displayed together without forcing consensus. Do not silently choose between them.
- Preserve ingredient, clinically distinct formulation, procedure risk, renal function, indication, diet/NPO schedule, and precise hold/resume time-frame distinctions where relevant.
- No real patient data in code, fixtures, prompts, issue descriptions, logs, or PRs without an approved compliant data pathway. Use synthetic test cases.
- Never merge, deploy, change production configuration, or alter protected clinical logic merely to satisfy a task graph or automated evaluation.
- Do not disrupt `test/medication-research-regression-20261106` or PR #37; its live checklist and GitHub artifacts are authoritative for ongoing sprint work.

## Required handoff
Report: current task and dependent blockers; previous task PASS/PARTIAL/FAIL; exact git head and CI links; test/evidence counts; source-verification versus local-policy/deployment authorization status; remaining work. A graph validator checks structure, not whether a human approval is authentic.

Run `node scripts/verify-engineering-graph.mjs` and `node --test scripts/__tests__/verify-engineering-graph.test.mjs` after modifying the graph or ledger.

## Source-verification amendment
Read `docs/clinical-governance/source-verification-amendment.md`. Society recommendations may be reproduced in clinician-facing comparison after independent source-anchored extraction and deterministic verification; do not add clinician endorsement to each extraction. Treating clinicians explicitly select the applicable source. Keep differences visible; do not auto-select the shortest or longest interruption.

Keep source fidelity, applicability, episode selection, institutional policy authorization and production deployment separate. Preserve explicit human authority for locally authored recommendations and institutional policy changes. Do not relabel legacy draft rules or bypass their controls during migration. The evidence lab is synthetic only; real adapters, authenticated clinical decisions and durable clinical audit storage remain unimplemented. Missing evidence is a source-verification blocker, not an invitation to invent approval.

Run `pnpm evidence:test` and existing application quality checks for evidence-pathway changes. Monthly/six-month source observations do not mean a comprehensive clinical evidence review is complete. Reuse intact content-addressed artifacts; never invoke models for unchanged verified evidence. Never describe fixture workers as independent live clinical AI agents. Preserve the separate graph changes in PRs #40/#41 when integrating this amendment.

## Stage 2 executable orchestration
Read `engineering/stage2.md`, `engineering/roles.json`, `engineering/decisions-stage2.md` and `engineering/integration.md`. Run `pnpm graph verify`, then authenticated `pnpm graph reconcile` and `pnpm graph next`. Offline eligibility is planning only. Reconcile structured reports in `engineering/handoffs/` and current GitHub evidence before accepting any prior session's claims.

Use the deterministic priority policy, not an agent's subjective importance ranking. Claim eligible work with explicit `graph claim ... --write` from clean current main, then use an isolated feature branch. Resume or recover an interrupted claim explicitly; never steal locks, force-update refs, overwrite ledger records, or push work onto a claim ref. Include the task ID in PR metadata.

Run relevant application checks, graph checks and orchestrator tests. Record failed tests and unresolved evidence, not only success. Request a genuinely independent review; switching role names inside one session is not independent verification. New completion transitions require an immutable merged implementation PR, exact-head successful CI and authenticated review evidence. Legacy Stage 1 evidence is retained but must be reconciled before stricter Stage 2 verification can certify it.

Generate a structured `pnpm graph handoff --input <report-input> --live --output <new-file>` and commit it through a reviewed PR with appended evidence. Report the actual next eligible task, including `none` when unresolved engineering evidence prevents execution. Do not infer that a green reconciliation workflow means every task is complete.

Synthetic-data demo development may proceed on explicitly authorized isolated branches without unrelated production clinical approval. Preserve explicit `PREP_MEDS_CONTENT_MODE=shadow` for draft demonstrations; never activate unapproved rules for live clinical use. No autonomous continuous worker or schedule is installed by Stage 2.

PR #37 was independently merged before this integration checkpoint. Historical handoffs remain historical; do not recreate or modify its branch. The original Stage 2 decision log is retained verbatim in `engineering/decisions-stage2.md`; subsequent evidence/clinical-knowledge decisions remain in `engineering/decisions.md`.

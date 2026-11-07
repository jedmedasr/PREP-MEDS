# PREP-MEDS — Agent Engineering Contract

## Mission and source of truth
Build auditable, evidence-linked clinical decision-support software for elective outpatient upper endoscopy and colonoscopy. The version-controlled repository is authoritative. This file governs code agents and human-guided AI work; the task graph is in `engineering/task-graph.json`.

Read `README.md`, `docs/safety/safety-spec.md`, the applicable `docs/architecture/` and `docs/clinical-governance/` documents, and `engineering/README.md` before changing behavior. Follow the most restrictive applicable safety/clinical-governance rule.

## Before each engineering run
1. Fetch current `main`, relevant feature/validation branch, open PRs and their head SHAs, status checks and workflow results. Do not rely on prior chat messages or a stale graph snapshot.
2. Inspect the preceding run's commits, test results, acceptance evidence and blockers. Distinguish code/build success from medical correctness and clinical approval.
3. Select an eligible task whose dependencies are complete. Work in an isolated feature branch and bound the change to its acceptance criteria.
4. Run relevant tests and record exact commands, results, commit/PR references and gaps. Do not mark a task complete without passing, traceable evidence.
5. Append evidence records in `engineering/evidence-ledger.json` and update the graph only after checking prerequisites. Record material architectural decisions in `engineering/decisions.md`.

## Safety and release boundaries
- Never introduce or activate patient-facing medication rules solely from an agent's judgment, automated test, or guideline summary. Require independent, documented clinical approval under the designated governance process.
- Never convert provisional inventory counts, a passing CI check, or a green deployment into claims of clinical validation.
- Keep conflicting, missing, or unapproved clinical recommendations fail-closed; surface `NEEDS_REVIEW` instead of silently choosing guidance.
- Preserve ingredient, clinically distinct formulation, procedure risk, renal function, indication, diet/NPO schedule, and precise hold/resume time-frame distinctions where relevant.
- No real patient data in code, fixtures, prompts, issue descriptions, logs, or PRs without an approved compliant data pathway. Use synthetic test cases.
- Never merge, deploy, change production configuration, or alter protected clinical logic merely to satisfy a task graph or automated evaluation.
- Do not disrupt `test/medication-research-regression-20261106` or PR #37; its live checklist and GitHub artifacts are authoritative for ongoing sprint work.

## Required handoff
Report: current task and dependent blockers; previous task PASS/PARTIAL/FAIL; exact git head and CI links; test/evidence counts; clinical sign-off status; remaining work. A graph validator checks structure, not whether a human approval is authentic.

Run `node scripts/verify-engineering-graph.mjs` and `node --test scripts/__tests__/verify-engineering-graph.test.mjs` after modifying the graph or ledger.

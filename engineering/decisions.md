# Engineering decision log

## ENG-DEC-0001 — Independent graph governance (2026-11-07)
**Decision:** Build Stage 1 on a new branch from `main`, with no medication-rule or active-sprint modifications. Store a typed JSON dependency graph, append-only evidence ledger, deterministic Node.js validation and a separate read-only CI workflow.

**Rationale:** `main` already has a clinical quality pipeline. The active PR #37 contains in-progress medication validation and cannot be treated as approved. A separate governance PR makes the new mechanism reviewable without altering the validation sprint.

**Alternatives deferred:** Graph database, multi-agent execution service, automatic clinical adjudication and autonomous merge/deployment. These would introduce complexity and risk before a reliable evidence model exists.

**Controls:** Clinical and release tasks require separately verified human approval records; the structural validator does not authenticate approvers. A passing CI result is never equivalent to clinical sign-off.

**Follow-up:** After independent review and a successful workflow run, adopt the graph as a coordination artifact; a repository admin must separately configure required status checks or branch rules.

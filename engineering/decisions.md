# Engineering decision log

## ENG-DEC-0001 — Independent graph governance (2026-11-07)
**Decision:** Build Stage 1 on a new branch from `main`, with no medication-rule or active-sprint modifications. Store a typed JSON dependency graph, append-only evidence ledger, deterministic Node.js validation and a separate read-only CI workflow.

**Rationale:** `main` already has a clinical quality pipeline. The active PR #37 contains in-progress medication validation and cannot be treated as approved. A separate governance PR makes the new mechanism reviewable without altering the validation sprint.

**Alternatives deferred:** Graph database, multi-agent execution service, automatic clinical adjudication and autonomous merge/deployment. These would introduce complexity and risk before a reliable evidence model exists.

**Controls:** Clinical and release tasks require separately verified human approval records; the structural validator does not authenticate approvers. A passing CI result is never equivalent to clinical sign-off.

**Follow-up:** After independent review and a successful workflow run, adopt the graph as a coordination artifact; a repository admin must separately configure required status checks or branch rules.

## EVD-DEC-0001 — Source fidelity is not a second clinical endorsement (2026-11-07)
**Decision:** Implement the user-directed society-guideline reproduction pathway with independent extraction, passage/provenance binding and deterministic validation. No per-extraction clinician re-endorsement is required. The treating clinician selects a source; conflicts are not flattened into consensus. Institutional policies and locally authored/derived recommendations retain explicit human authorization.

**Rollout:** Isolated feature branch, new evidence checks and a doubly gated synthetic comparison lab. Existing production activation, PR #37, and unmerged Stage 2 work remain unchanged. EVD-001 remains needs_review; real adapter/system-integration tasks remain incomplete. Synthetic verification is SYNTHETIC_VERIFIED, never SOURCE_VERIFIED.

**Limits:** Separate worker processes receive source-and-scope-only inputs. The supplied workers are synthetic parsers, not live clinical AI agents. Real document/layout acquisition and separately configured live agents must be validated before real society extractions are verified. Process isolation is not an OS sandbox; exact passages do not alone prove semantic entailment.

**Cost:** Node standard library, bounded HTTPS checks, GitHub Actions, immutable artifacts and an isolated persistent state branch. Monthly observation incorporates the May/November comprehensive source audit. No paid infrastructure, enabled model budget or continuous agent. Inaccessible sources and incomplete verification remain explicit.

**Integration:** Preserve SPR-001 evidence/status from PR #40 and ENG-003 from PR #41. Do not add per-recommendation clinical endorsement nodes. Legacy clinical/release gates are retained until deliberate adoption, not silently weakened. Review of implementation is an engineering control, not routine guideline re-endorsement.

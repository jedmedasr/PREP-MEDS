# PREP-MEDS medication-by-medication audit ledger

Status: IN PROGRESS. This ledger records *verified* progress, not assumed clinical clearance.

## Required inventory
- Canonical inventory source: `terminologyDataset.medications` in `apps/web/lib/content.ts`.
- Before marking coverage complete, generate a machine-readable manifest of **all** medication IDs from that dataset. Never treat the number of rules as the number of medications.
- Every record must contain: immutable medication ID, canonical name, class/ingredients, status (`NOT_STARTED`, `IN_PROGRESS`, `NEEDS_CORRECTION`, `TESTED`, `CLINICALLY_REVIEWED`), last-reviewed date, cited source/version/date, procedure scenarios, tests, PR/commit, reviewer, unresolved questions.
- `TESTED` means automated clinical-scenario and negative-match tests passed; `CLINICALLY_REVIEWED` additionally requires independent clinical approval. Neither means approved patient instructions unless governed release requirements are met.

## Initial engineering audit — 2026-11-06
- Production deployment `ec1ee7e1c00520cc5903e4ab8b0246e9936efa62` was verified READY, but the end-to-end mobile experience and medication API response were **not** verified.
- PR #37 initially failed CI. Two pre-existing governance tests rejected `isShadowContentMode() => true`, which had exposed unapproved candidate decision rules in production. A third failure was a Vitest alias-resolution error in the new research endpoint test. Follow-up commits restore production rule isolation while retaining research visibility and fix the import.
- PR #37 adds apixaban/metformin cross-medication regression tests and invalid-input checks. These are **engineering checks**, not medication clinical approval.
- **Clinical medications independently validated this session: 0.** Inventory denominator not yet enumerated. Do not fabricate a completion percentage.
- Next: verify CI on latest PR head, enumerate complete terminology inventory, validate apixaban against dated primary guidelines, add risk-stratified scenarios, then diabetes/antiplatelets.
- Keep clinician-facing research visible but distinct from active patient-facing decision rules.

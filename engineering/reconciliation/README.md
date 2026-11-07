# SPR-001: read-only sprint reconciliation

Inspected main: `4157f497e7b0ff37f428a44e5caeb2c815544a87`.
Pinned sprint source: `5a4b8cb714f1f2aafa8ce34428514a67d9517fd1`, PR #37, still open.

This independent PR recomputes the inventory from the actual sprint manifest builder. The isolated workflow checks out that exact immutable source, runs the existing inventory/mapping tests plus four export checks, and retains the JSON manifest, combination list, unresolved milestones, and source archive as a 30-day GitHub Actions artifact. No branch or file in PR #37 is modified. The temporary export test is not committed to the sprint.

Do not reuse the historical 436/233/48 counts until the new workflow has completed. A follow-up evidence record will link the actual run, checksum, and results. SPR-001 remains `not_started` in the authoritative graph until its acceptance evidence has been collected and reviewed.

## Observed unresolved work

- Latest sprint quality run: https://github.com/jedmedasr/PREP-MEDS/actions/runs/42345991815. It failed TypeScript in `apps/web/lib/antithrombotic-calendar-research.test.ts:18-19` and `antithrombotic-calendar-research.ts:13` before tests/build. This is not the repaired main shadow-mode failure.
- The builder marks every ingredient-set group `formulationAdjudication: PENDING` and `clinicalStatus: NOT_STARTED`.
- Final clinically distinct formulation denominator, per-ID guideline review, and independent clinical approval remain unverified.
- Inventory coverage, automated testing, guideline research, and clinical approval are separate milestones.

The focused audit can pass while full sprint CI remains failed. That does not authorize merging #37 or activating clinical rules.

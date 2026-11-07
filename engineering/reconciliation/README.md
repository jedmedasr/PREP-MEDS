# SPR-001: pinned sprint reconciliation

Reverified main: `4157f497e7b0ff37f428a44e5caeb2c815544a87`.
Sprint source: `5a4b8cb714f1f2aafa8ce34428514a67d9517fd1`, PR #37, still open and unchanged.

## Freshly verified audit

Run https://github.com/jedmedasr/PREP-MEDS/actions/runs/42373567531 executed the actual manifest builder on the pinned sprint source: **436 canonical medication IDs, 233 provisional ingredient sets, 48 combination entries**. All **12 tests passed** across the original inventory suite, original manifest suite and independent export suite.

The complete manifest and all combination IDs/ingredients are in https://github.com/jedmedasr/PREP-MEDS/actions/runs/42373567531/artifacts/13574578653. ZIP SHA256: `e1595a8e2a25da335dc3d0e0f25c0dc5ffaa3be6d4fb79d971a951405fa32894`. This is the archive digest, not the manifest digest. Artifacts expire after 30 days; the committed pinned workflow/exporter is the reproduction recipe, and `verified-report.json` plus the appended evidence ledger preserve the findings.

The audit checked duplicate IDs, complete ingredient preservation/group mapping, existing assembled rule evidence references and atom/source versions. Internal reference integrity does not certify guideline interpretation or source quality.

## Reconciled incomplete work

Every group in the manifest is still `formulationAdjudication: PENDING` and `clinicalStatus: NOT_STARTED`. **Zero adjudicated groups are documented in that manifest; the final clinically distinct formulation denominator remains unknown. Zero independently clinically reviewed groups or approved medication mappings were confirmed.** This does not deny the existence of draft research elsewhere; it distinguishes draft work from verified completion.

The manifest lacks the required per-ID source/version/date, scenario/test, reviewer, approval and unresolved-question metadata. These fields cannot be inferred from passing inventory tests. The audit report maps all three SPR-001 acceptance criteria to source/CI evidence and explicitly lists unresolved clinical work.

Latest observed full sprint quality run https://github.com/jedmedasr/PREP-MEDS/actions/runs/42345991815 failed TypeScript in `apps/web/lib/antithrombotic-calendar-research.test.ts:18-19` and `antithrombotic-calendar-research.ts:13`; tests/build did not run. This is not the repaired main shadow-mode failure. Separate PR #40 quality and graph runs 42373567184 and 42373567178 passed on audit implementation `9f4590268e5e9e3f68ffb4e400b1b30509e946a1`.

## Disposition

SPR-001 is `needs_review`: audit/reconciliation artifacts are produced and verified, but acceptance/integration is not asserted from the author's own work. Dependent formulation/clinical tasks remain blocked. No commits, comments, automation changes, reruns, or merge were made to PR #37. Inventory coverage, automated testing, guideline review, and clinical approval remain distinct milestones.

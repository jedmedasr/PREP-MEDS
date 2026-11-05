# Batch 02: human-insulin identity increment

Status: engineering candidate; shadow review only. This is a bounded checkpoint-B work item, not completion or clinical approval of Batch 02.

## Scope

Seven manufacturer-linked product/concentration records: Humulin N U-100, Novolin N U-100, Humulin R U-100, Novolin R U-100, Humulin R U-500, Humulin 70/30 U-100 and Novolin 70/30 U-100. The assembled diabetes catalog contains 52 concepts and 24 source-linked identities. These counts are not 52 fully verified medication products or 24 approved medication instructions.

Seven draft source records and seven descriptive evidence atoms are appended in `packages/clinical-content/src/diabetes-human-insulin-evidence.ts`. Source metadata pins SETID, SPL version, effective date, literature revision and exact sections. Selected Humulin R U-100 metadata uses SPL 35 effective 2026-06-16, not the older SPL 34 returned by an index. No date of market availability or clinical review has been invented.

## Identity and search boundaries

- Preserve the earlier 45-concept catalog and evidence snapshots. Unspecified NPH, regular human insulin, U-500 and human 70/30 records are retained separately from named products.
- Humulin R alone is ambiguous between U-100 and U-500. Broad concentrated-insulin and ReliOn names do not select one drug.
- An unqualified 70/30 ratio cannot select human NPH/regular instead of the aspart analog mixture. Human component fractions remain descriptive metadata, never independently calculated patient doses.
- U-500 stays in the concentrated-insulin review class. It does not inherit a routine U-100 prandial action.
- Exact supported product aliases can resolve; unsupported numeric details retain the existing fail-closed resolver behavior.

## Validation

The dedicated human-insulin test suite covers explicit product aliases, shared names with display limit 1, unsupported concentrations/ratios, preparation identity, fixed-mixture components, source versions and historical immutability. Each of the seven products is exercised across EGD, colonoscopy and combined procedures for review-only, type-1 basal coverage, pump review and unknown/conflicting formulation inputs. Existing whole-catalog required-question and production-isolation tests cover all 52 entries. Exact-head CI results must be recorded only after execution.

## Remaining work

Next bounded item: Afrezza/inhaled-insulin product and presentation verification, followed by the remaining glulisine, detemir and NovoLog product records, oral release variants, and final rule/whole-regimen/malformed-input audits. A newer Humalog manufacturer label was also identified during searching: SETID c8ecbd7a-0e22-4fc7-a503-faa58c1b6f3f, SPL 86, effective 2026-01-09. Record its source-refresh reconciliation as remaining work rather than silently overwriting the earlier version. No new clinical timing claims are based on that discovery in this increment.

## Governance

No rule, policy or evidence is promoted to ACTIVE, APPROVED, CURRENT or CLINICALLY_APPROVED. Workflow version 4 is unchanged. No hold intervals, insulin adjustments, conversions, pump settings, substitution permissions or final patient instructions are added. Named clinical review, local-policy reconciliation and clinician-adjudicated validation remain required.

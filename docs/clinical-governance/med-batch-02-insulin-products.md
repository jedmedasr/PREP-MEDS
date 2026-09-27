# Batch 02: named insulin product identity increment

Date: 2026-09-18. Scope: engineering and source-linked terminology only. No clinical activation, prescription verification or complete-batch claim.

## Implemented scope

Six product/concentration entries extend the prior 39-concept release to 45: Lyumjev U-100 and U-200, Admelog U-100, Fiasp U-100, Basaglar U-100 and Semglee U-100. The source-linked identity count rises from 11 to 17. The five additional labels/atoms are appended; all prior evidence objects, versions and retrieval timestamps remain unchanged.

| Family | DailyMed SETID | SPL version | Date recorded |
| --- | --- | --- | --- |
| Lyumjev | c5a056e2-b568-4ca6-9ed8-79c010942d00 | 11 | Effective 2025-12-30 |
| Admelog | 0691def8-4a7b-4de3-866f-a280989f47f1 | 14 | Effective 2025-06-04 |
| Fiasp | 834e7efc-393f-4c55-9125-628562a8a5cf | 18 | Registry posting 2023-07-25; effective date not inferred |
| Basaglar | 0ad21db3-2b1c-4ed9-a687-bdd6a74d0aae | 35 | Effective 2026-06-16 |
| Semglee | 8cf5544f-87d6-468b-f6ae-898b1fdb5d80 | 14 | Effective 2025-03-03 |

Exact source URLs, selected section locators and limitations are stored in `packages/clinical-content/src/diabetes-insulin-product-evidence.ts`. A pinned version is not a claim of complete global label coverage or current commercial availability. USPI revisions and SPL metadata dates are kept distinct.

## Identity boundaries

The labelled names insulin lispro-aabc and insulin glargine-yfgn are retained. Local lispro/glargine ingredient IDs represent active-moiety grouping, not product substitution permission. Treprostinil in Lyumjev and niacinamide in Fiasp are not treated as independently prescribed medications. Product-plus-concentration does not confirm a vial, pen, cartridge, patient prescription, insulin regimen or compatible pump.

Old generic records no longer own the newly verified brand aliases. Lyumjev and Lyumjev KwikPen remain ambiguous without concentration. Generic ingredient/strength queries cannot uniquely select a labelled manufacturer merely because the catalog contains a matching product.

## Safety-relevant resolver change

Previously a strong prefix match could discard numeric details, for example accepting a brand despite an unmatched concentration or extra dose text. Non-exact numeric queries now retain search suggestions but cannot automatically resolve to a medication. Exact supported aliases and external identifiers still resolve. This is a deliberate engineering safety change and requires reviewer attention; it is not clinical-rule approval.

## Verification and remaining work

The added suites cover source immutability, exact product/label links, concentration recognition, shared-brand ambiguity with one-result display limits, unsupported numeric details, and all three procedures with type-1 basal-coverage, pump-review and unknown/conflicting-confirmation cases. The existing progressive-question and production-isolation suites cover the expanded catalog. CI results must be checked for the exact committed head; no prior run proves this increment passes.

Checkpoint B remains in progress. Next bounded item after this increment is verified: original human NPH and regular-insulin product identity. U-500, inhaled insulin, remaining analog identities, oral release variants and full rule/whole-regimen audits remain open. No restart of the completed evidence audit or Batch 01 is needed.

All new sources/atoms remain DRAFT. Existing clinical workflow dispositions are unchanged; insulin remains review-only without doses, conversions, infusion settings or autonomous patient instructions. Production rules and policies remain untouched.

# Medication Batch 02: Diabetes core and insulin

## Release boundary

This is an **in-progress shadow-review batch**, not a completed formulary or approved clinical protocol. Passing engineering tests does not close the evidence, formulation or clinical-governance work below. No production rules/policies were activated and shadow results cannot generate final patient instructions.

The recovery preserved the five pre-existing diabetes files and merged the audited Batch 01 dependency without rewriting either history. PR #12 targets `med-batch-01-antithrombotics` from `med-batch-02-diabetes-core`; neither PR is automatically merged.

## Implemented in this continuation

- Fixed the optional `timingRule.instructionCode` TypeScript failure without weakening strict settings.
- Added an immutable shadow transformation with regression protection.
- Connected 31 drug/formulation concepts to medication search and the three procedure contexts. The legacy standalone pump fixture is excluded from the medication catalog, not given a fabricated ingredient.
- Replaced the old glargine seed candidate only in the assembled shadow release, preserving its historical record.
- Added eight question definitions covering indication, phase, documented plan, insulin formulation, intake and delivery method.
- Added guarded workflow rule IDs distinct from the initial candidates. Version 2 links to the revised exact evidence versions.
- Procedure-day oral candidates cannot silently govern prep-day or recovery questions. Missing phase/plan information fails closed; other phases route to review.
- All insulin workflow results remain review-only. Pump/AID use is captured on the actual insulin and escalated for device, local-policy and backup-plan review; no compatibility clearance, infusion setting or dose is generated.
- Fixed medication identity resolution so multiple exact aliases remain ambiguous, including when the requested display limit is one.
- Added regression coverage for catalog integrity, all required questions across the three procedures, phase guards, basal-insulin safety, pump review, reference integrity and production isolation.

## Evidence revisions and source boundaries

`packages/clinical-content/src/diabetes-evidence-provenance.ts` retains original versions and adds eight DRAFT evidence revisions with exact section locators and four source revisions. It does not mark sources CURRENT or reviewed by a clinician.

1. ADA, *Diabetes Care in the Hospital: Standards of Care in Diabetes—2026*. DOI: https://doi.org/10.2337/dc26-S016. Relevant locators: Perioperative Care medication-management discussion; Type 1 Diabetes; Insulin Pump Use in the Hospital (recommendation 16.7); Noncritical Care Setting. Narrative passages are not assigned an invented GRADE level. ADA grade C is retained in the pump limitation rather than automatically mapped to GRADE LOW.
2. Metformin extended-release label, Granules Pharmaceuticals: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=a5980bc8-8de8-c456-e053-2a95a90a792e. SPL version 4, effective 2024-07-03. Boxed Warning, section 5.1 and Patient Information support the recorded risk context. This is ER labeling; it is not independent verification of every metformin formulation or a universal restart instruction.
3. Repaglinide label, Bryant Ranch Prepack/Macleods source: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=d85abce4-16da-4231-b28a-6afca04ebf68. The retrieved archive identifies version 1, published 2025-06-09, with a June 2025 label revision. Sections 2.1 and 5.1 provide the meal-linked statement. This does not independently establish nateglinide guidance.
4. SYMLINPEN: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=4aea30ff-eb0d-45c1-b114-3127966328ff. SPL version 18 has effective date 2019-12-18 and a registry posting of 2024-08-20. These are intentionally separate fields. Boxed Warning, sections 1, 2.1, 2.4 and 4 are the recorded locators.
5. US Multi-Society Task Force bowel-preparation guidance (2025), AJG DOI https://doi.org/10.14309/ajg.0000000000003287; jointly published GIE DOI https://doi.org/10.1016/j.gie.2025.02.010. Its medication-history/preparation context is not a complete drug-specific diabetes interruption protocol. The exact computable atom locator still needs completion.

## Remaining bounded work items

### A: Evidence completion

- Identify and pin the glipizide source label/version and its exact claim locator; do not treat an unidentified label as verified.
- Complete the USMSTF atom locator and applicability.
- Review each class-level inheritance explicitly. One drug's label is not independent evidence for every class member.
- Confirm which prep-day and recovery decisions have direct support versus needing local policy or clinician review.

### B: Terminology/formulation completion

- Split clinically material concentrations/forms rather than treating Toujeo, other glargine products and all degludec concentrations as interchangeable dosing entities.
- Preserve protamine/formulation components of premixed analog insulins at the appropriate concept level.
- Resolve bromocriptine formulation and non-diabetes indications without inferring Cycloset from every bromocriptine mention.
- Verify product aliases and legacy-market metadata. No RxNorm identifier is asserted merely because a product was found by name.
- Keep device and medication identities separate; do not reinsert the empty-ingredient pump fixture into the catalog.

### C-D: Rule and scenario completion

- Reconcile the final rule applicability with the completed evidence/formulation audit and add drug-specific exceptions where justified.
- Expand malformed-input, conflicting-context, individual label-applicability and clinically adjudicated scenario coverage.
- Do not implement insulin dose arithmetic or imply that a confirmed ingredient equals a confirmed regimen.

### E-G: Integration, CI and handoff

The bounded shadow integration is implemented. Verify the exact latest head after any further change. PR #12 remains draft until the unresolved engineering/content audit items are closed. No human clinical approval may be inferred from a green workflow or this document.

## Resume contract

Read `clinical-content/backlog/med-batch-02-checkpoints.json`. Repair a failing current-head CI run first. Otherwise resume the named incomplete evidence/terminology item, not Batch 01 or the already-fixed optional-field bug. Do not advance to Batch 03 while Batch 02 is still incomplete.

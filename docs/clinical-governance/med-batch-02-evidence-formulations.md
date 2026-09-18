# Batch 02: scoped evidence audit and formulation-aware shadow release

This report extends `med-batch-02-diabetes-core.md`. It is an engineering/evidence preparation record, not clinical approval or a medication protocol. The historical content and earlier audit reports are retained.

## Completed evidence audit scope

Checkpoint A is complete for the existing **bounded shadow workflow**: the ADA procedure-day oral-agent candidate and clinician-review-only insulin/pramlintide pathways. It is not completion of a full preparation-day, recovery, insulin dosing, contraindication or drug-interaction protocol.

- Pin the descriptive sulfonylurea hypoglycemia claim to GLUCOTROL XL, DailyMed SETID `eed99b60-d043-4249-9b2a-f05e46fb588d`, SPL 27, effective 2025-04-02, section 5.1. Preserve the distinct 2023-08 prescribing-information revision. No registry publication date is inferred.
- Pin the bowel-preparation recommendation to the GIE publication, DOI `10.1016/j.gie.2025.02.010`, Recommendations Before Colonoscopy / Choice of Bowel Preparation Purgative, question concerning medical-history-informed regimen selection. This publication is a separate source identity from the earlier AJG record. The strong recommendation/moderate-quality evidence concerns regimen selection, not drug-specific hold or restart timing.
- Restrict the repaglinide label claim to repaglinide; it is not direct labeling evidence for nateglinide. The generic meglitinide procedure-day candidate references the independently located ADA statement instead.
- Restrict the identified metformin extended-release label to its formulation context. The generic metformin procedure-day candidate references the ADA passage, not unverified inheritance from one extended-release product.
- Preserve all prior source and atom versions. Four new evidence revisions and two source records extend the earlier corpus. No lifecycle is promoted above DRAFT.

Primary source locations:

- https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=eed99b60-d043-4249-9b2a-f05e46fb588d
- https://www.giejournal.org/article/S0016-5107(25)00080-X/fulltext
- https://doi.org/10.2337/dc26-S016

## Phase boundaries

| Phase or task | Implemented boundary |
| --- | --- |
| Procedure-day oral-agent question | Requires diabetes indication, correct phase and a documented clinician plan; candidate remains shadow-only. |
| Preparation day / reduced intake | Review-only; no automatic extension of a procedure-day action. |
| Recovery / restart | Review-only; no autonomous restart directive. |
| Insulin doses and device settings | Not calculated. Formulation, individualized plan, monitoring, local policy and backup therapy require clinical review. |
| Clinical approval | Not granted by source retrieval, successful CI, a search match or a plan-confirmation checkbox. |

## Formulation identity changes

The assembled diabetes catalog expands from 31 to **39 medication/formulation concepts**. Historical ingredient records remain unchanged. The eight additions are six explicit insulin concentration/product entries and two bromocriptine reconciliation entries.

| Family | Explicit distinction | Pinned identity source |
| --- | --- | --- |
| Glargine | U-100/Lantus and U-300/Toujeo; unspecified ingredient entry retained | TOUJEO SPL 25, SETID `c9561d96-124d-48ca-982f-0aa1575bff36`; comparator passage identifies LANTUS U-100, not every Lantus presentation. |
| Degludec | U-100 and U-200; Tresiba alone is ambiguous | Manufacturer degludec/Tresiba SPL 2, SETID `c1be283d-4b1d-4996-b2a7-4488dbff3037`. |
| Humalog lispro | U-100 and U-200; Humalog alone is ambiguous | Identified repackaged source label SPL 24, SETID `c6b8ff07-d3e2-457f-8a38-b60de60adf75`. |
| Lispro premixes | 75/25 and 50/50 fixed protamine-associated/soluble fractions, U-100 | Lilly SPL 53, SETID `c73da51a-1899-45ad-b6cf-9c52c36a25dd`; SPL 54, SETID `b34cd3ff-d0af-4852-b4ef-2a8b4a93aeae`. |
| Aspart premix | 70/30 fixed protamine-associated/soluble fractions, U-100; distinct from human NPH/regular mixture | Novo Nordisk SPL 24, SETID `1861fcee-7673-4afe-a206-08fa05c0add2`. |
| Bromocriptine | Cycloset/QR, Parlodel and unspecified product/indication | Cycloset SPL 7, SETID `e42ba916-16b9-4d1c-8d09-9d2fbb1b6c20`; Parlodel SPL 11, SETID `fc2a08dd-4fb6-4ac4-9082-f99552fae25c`. |

Eight new DRAFT source records and eight descriptive DRAFT evidence atoms support **11 source-linked identity records**: six new insulin strengths, three premix identities, Cycloset and Parlodel. Other catalog records explicitly remain unspecified or product-detail-unverified. Source-linked identity is not proof of interchangeability, an authenticated patient prescription, current availability, pump compatibility or clinical approval.

Premix fractions are composition metadata. Protamine sulfate is not introduced as a separately prescribed active drug. No patient dose is multiplied by a fraction or converted using concentration metadata.

Legacy `active: false` flags are not carried into this assembled release as unsupported market-availability assertions. Their historical records remain preserved. No RxNorm identifiers are fabricated.

## Rule and web integration

Workflow version 4 uses the exact draft evidence versions. Cycloset requires an additional independent `MOD-bromocriptine-formulation` confirmation. Generic or Parlodel bromocriptine cannot enter the diabetes hold pathway even if a caller supplies a diabetes indication or a Cycloset confirmation on that record.

The nine diabetes-specific question definitions are integrated into progressive discovery. All 39 entries have required-question coverage across EGD, colonoscopy and combined procedures. Production rules/policies remain unchanged and empty; shadow patient instructions remain disabled.

## Regression coverage

The added suites test exact evidence/source versions, source-date distinctions, class-inheritance limits, explicit concentration recognition, shared brand ambiguity even with a one-result limit, premix composition, historical-record immutability, insulin type-1 safeguards, unknown/conflicting confirmation values, and the bromocriptine product/indication boundary. Structural reference checks are not a substitute for physician adjudication of clinical applicability.

CI must validate schema checks, strict TypeScript checking, unit/regression tests and the web build against the **actual current head**. Exact final-head receipts are recorded in PR #12 rather than creating an endless series of receipt-only commits.

## Remaining checkpoint B work

1. Independently verify remaining product/formulation aliases and strengths: Admelog, Lyumjev, Fiasp, Basaglar, Semglee, other legacy insulin records, and oral immediate-/extended-release variants. Do not infer a specific manufacturer/product merely from a generic ingredient-plus-strength query; reconcile generic strength and named-brand identities during this audit.
2. Complete product-level verification for the remaining original catalog entries, including human NPH/regular, U-500 and inhaled insulin. Existing entries remain review-only and are not declared product-verified by this report.
3. Verify or explicitly exclude legacy-market metadata and product presentations. Do not interpret a label posting or retrieval date as current commercial availability.
4. Reconcile any new formulation findings with rule applicability and tests. A broader drug-interaction or whole-regimen protocol remains separate work, not an implied feature.

Checkpoint A must not be restarted merely because product-specific checkpoint B work remains. Reopen A only when a later finding changes an existing claim's support or applicability, and document that reason. Do not advance to Batch 03 while Batch 02 remains incomplete.

Accountable clinical approval, GI/anesthesia/diabetes policy reconciliation and physician-adjudicated validation remain mandatory before production promotion.

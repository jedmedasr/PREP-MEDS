# MED-BATCH-02 — Apidra / insulin glulisine identity increment

Status: **engineering candidate; clinical review required**

## Scope
This bounded increment adds a source-linked identity for APIDRA (insulin glulisine) U-100 while preserving the existing generic insulin-glulisine record as product/manufacturer unspecified. It does not create a periendoscopic medication action.

## Authoritative source
- Sanofi-aventis U.S. LLC APIDRA / APIDRA SoloStar manufacturer labeling via DailyMed.
- SETID: `e7af6a7a-8046-4fb4-9979-4ec4230b23aa`
- SPL version: `28`
- SPL effective date: `2025-11-25`
- Document ID: `6be54063-6912-4810-b1c7-dfca969224d8`
- BLA: `021629`
- Prescribing-information revision displayed in the label: May 2025.

The SPL effective date and the prescribing-information revision are recorded separately.

## Encoded identity
The source identifies APIDRA as insulin glulisine injection, U-100. Selected sections describe a 10 mL multiple-dose vial and a 3 mL single-patient-use APIDRA SoloStar prefilled pen. These facts are recorded only as descriptive product/formulation evidence.

The current assembled terminology therefore:
- keeps bare `insulin glulisine` as a non-branded unspecified product identity;
- recognizes explicit APIDRA U-100/SoloStar wording as the source-linked product family;
- refuses to use generic ingredient-plus-concentration wording to authenticate the APIDRA manufacturer identity;
- rejects unsupported APIDRA concentrations rather than silently dropping numeric detail.

## Safety / governance boundaries
- No insulin dose, conversion, cartridge/presentation selection, substitution, hold or restart instruction is encoded.
- No pump or other device compatibility is authorized by this product record.
- No current commercial availability or patient prescription is asserted.
- Evidence remains `DRAFT` / descriptive and is not referenced by medication-action rules.
- Production clinical rules and policies remain unchanged.
- Existing type-1, pump/AID, missing-input, and clinician-review safeguards remain applicable.
- Clinical/local-policy review and activation remain separate human-controlled gates.

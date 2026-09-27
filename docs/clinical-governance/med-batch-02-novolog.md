# MED-BATCH-02 — NovoLog / insulin aspart identity and presentation-status increment

Status: **engineering candidate; clinical review required**

## Scope
This increment adds a source-linked NOVOLOG insulin aspart U-100 product identity while separating generic insulin aspart from branded manufacturer identity. FDA Purple Book status is stored per product-number presentation because the current record is mixed rather than product-wide.

## Authoritative sources
1. Novo Nordisk NOVOLOG manufacturer labeling via DailyMed:
   - SETID `3a1e73a2-3009-40d0-876c-b4cb2be56fc5`
   - SPL version 34
   - current archive published 2025-01-22
   - effective time / label revision: 2023-02-28 / February 2023
   - BLA `020986`
2. FDA Purple Book product details for NOVOLOG / insulin aspart, BLA `020986`, database updated 2026-09-11:
   - product 001: multi-dose vial — `Rx`
   - product 002: multi-dose cartridge — `Rx`
   - product 003: autoinjector — `Rx`
   - products 004 and 005: autoinjector — `Disc`

## Encoded interpretation
- Branded product identity: NOVOLOG = insulin aspart U-100.
- Manufacturer label presentation terms include vial, PenFill, FlexPen and FlexTouch for reconciliation/search.
- Generic insulin aspart remains a separate non-branded, product-unspecified concept; it is not silently treated as NOVOLOG.
- Purple Book status remains attached to FDA product-number presentation rows and is not mapped by inference to FlexPen vs FlexTouch where the regulatory record does not directly provide that name.
- Mixed `Rx`/`Disc` rows are not collapsed into a single available/discontinued flag.

## Safety / governance boundaries
- Regulatory marketing status is not a pharmacy inventory lookup.
- No device compatibility, pump setting, dose, insulin conversion, therapeutic substitution, transition, hold or restart instruction is encoded.
- No patient prescription/presentation is authenticated from catalog search alone.
- Evidence atoms remain `DRAFT`, descriptive, and outside medication-action rules.
- Existing type-1, pump/AID, missing-input and clinician-review safeguards remain unchanged.
- Production activation and clinical/local-policy approval remain human-controlled gates.

# MED-BATCH-02 — Levemir / insulin detemir identity and US marketing-status increment

Status: **engineering candidate; clinical review required**

## Scope
This increment preserves LEVEMIR as a historical source-linked insulin detemir U-100 product identity while recording current FDA Purple Book marketing status separately. It does not create a medication action, transition plan, substitution instruction or inventory claim.

## Authoritative sources
1. Novo Nordisk LEVEMIR manufacturer labeling via DailyMed:
   - SETID: `d38d65c1-25bf-401d-9c7e-a2c3222da8af`
   - current archive version: SPL 30
   - current archive publication: 2025-12-29
   - label effective time / PI revision metadata: 2022-12-08 / December 2022
   - BLA: `021536`
2. FDA Purple Book product details for LEVEMIR / insulin detemir, BLA `021536`:
   - database last updated 2026-09-11 at verification
   - product numbers 001-005 each list marketing status `Disc`.

## Encoded interpretation
- Historical branded identity: LEVEMIR = insulin detemir U-100.
- Label presentation history is retained for medication reconciliation, including vial and branded pen terminology.
- Generic insulin detemir remains a separate non-branded, product-unspecified concept.
- FDA Purple Book `Disc` is encoded as a distinct US regulatory marketing-status field on the branded identity.
- `Disc` is not treated as proof that no residual pharmacy, patient, or repackaged inventory exists.

## Safety / governance boundaries
- No dose, dose conversion, therapeutic substitution, cartridge/presentation selection, device setting, hold, restart or transition instruction is encoded.
- Market status cannot trigger a medication change.
- No patient prescription or presentation is authenticated from catalog identity.
- Evidence atoms remain `DRAFT`, descriptive, and outside medication-action rules.
- Existing type-1, pump/AID, missing-input and clinician-review safeguards remain unchanged.
- Production activation and clinical/local-policy approval remain human-controlled gates.

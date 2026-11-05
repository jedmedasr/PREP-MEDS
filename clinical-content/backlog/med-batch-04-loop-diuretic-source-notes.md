# MED-BATCH-04 loop-diuretic source reconciliation

Status: DRAFT / REVIEW_REQUIRED  
Retrieved: 2026-09-29T09:41:00Z

## Scope

This cluster preserves ten route/formulation/device identities for furosemide, torsemide, and bumetanide. It is medication-reconciliation content only. It does not authorize continuation, withholding, dose adjustment, restart timing, substitution, route conversion, or any commercial-availability conclusion.

## Direct DailyMed provenance

- Furosemide oral tablet and oral solution: Hikma SETID `9e493331-dddd-496e-abf8-61747fb67aba`, SPL 19.
- Furosemide intravenous injection: Baxter SETID `c71371a7-75c5-45b8-b762-8d782d4c71bc`, SPL 19.
- FUROSCIX subcutaneous ReadyFlow autoinjector and on-body infusor: SETID `eac958dd-8d43-e44e-e053-2995a90a4d5e`, SPL 18, NDA209988.
- Torsemide oral tablet: Teva SETID `8a95cbdb-0601-47a5-9b3a-0c3b0629ceb9`, SPL 11, ANDA076346.
- Historical DEMADEX intravenous injection: Roche SETID `cf288ad5-d4e7-4b0b-bfd0-41c5327e6984`, SPL 1. The page exposes inactivated NDC records but no application number; none was inferred.
- Bumetanide oral tablet: Sandoz SETID `05cb961d-ac33-4bcf-b04e-411e496c43c1`, SPL 21, ANDA074700.
- Bumetanide intravenous/intramuscular injection: Hikma SETID `681b5e9d-e2c7-4f29-aaad-e06d4a528c11`, SPL 6, ANDA079196.
- ENBUMYST nasal spray: Corstasis SETID `d6f752c5-d2bd-4f77-9611-ca2110066d1f`, SPL 4, NDA219500.

## Fail-closed decisions

Bare ingredient wording is deliberately ambiguous. Explicit route/form/device wording resolves to a distinct identity and routes only to `CLINICIAN_REVIEW_REQUIRED`. All sources and atoms remain `DRAFT`; `activeRules` remains empty. Historical labeling is preserved separately from current availability, which is not asserted.

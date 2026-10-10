# MED-BATCH-05 class I antiarrhythmic source notes

Status: DRAFT / REVIEW_REQUIRED  
Researched: 2026-09-29  
Scope: release/form/salt identity and review-only routing; no clinical timing, dosing, substitution, availability, or local-policy approval.

## Direct DailyMed label receipts

- Flecainide acetate tablet — SETID `14e89448-3a18-42e3-8537-2589be1ef94e`, SPL 5, ANDA202821.
- Propafenone hydrochloride film-coated tablet — SETID `0c887381-42fe-4f37-858a-d9ffb218dd1c`, SPL 4, ANDA202445.
- Propafenone hydrochloride extended-release capsule — SETID `bc1d2548-15a3-4986-92b1-c3ddfb35343a`, SPL 3, ANDA210339.
- Mexiletine hydrochloride capsule — SETID `1b3a807f-368a-42dc-8266-ddf8347a8826`, SPL 4, ANDA074450.
- Quinidine sulfate tablet — SETID `a10b6ded-4fe0-4059-bd77-c45acc3c876d`, SPL 8, ANDA088072; the label lists marketing end 2025-05-31, retained only as historical metadata.
- Quinidine gluconate extended-release tablet — SETID `ad2ad985-cca2-25b5-e053-2995a90a402f`, SPL 2, ANDA089338.

## Fail-closed controls

- Bare `propafenone` remains ambiguous between film-coated tablet and extended-release capsule.
- Bare `quinidine` remains ambiguous across sulfate conventional tablet and gluconate extended-release tablet identities.
- All six explicit identities route only to `CLINICIAN_REVIEW_REQUIRED`.
- Production rules remain empty; no release conversion, salt substitution, timing, or availability inference is authorized.

# MED-BATCH-05 class III antiarrhythmic source notes

Status: DRAFT / REVIEW_REQUIRED  
Researched: 2026-09-29  
Scope: route/form identity and review-only routing; no clinical timing, dosing, substitution, availability, or local-policy approval.

## Direct DailyMed label receipts

- Amiodarone oral tablet — SETID `7ccd3733-c3af-4a11-8500-0f99194c1472`, SPL 19, ANDA075424/ANDA076362.
- Amiodarone injection — SETID `66700f8b-3f76-3749-e053-2a91aa0adfdb`, SPL 5, ANDA077234.
- MULTAQ (dronedarone) tablet — SETID `236d4549-f44b-4677-b857-acedd10b9920`, SPL 2, NDA022425. The displayed NDC is inactivated; this receipt is identity-only and makes no availability assertion.
- Standard sotalol tablet — SETID `3c24cdf0-4648-4e5d-993c-1f428ce56a65`, SPL 4, ANDA207428.
- Sotalol hydrochloride AF tablet — SETID `2577dd8d-ab1b-4a55-990a-18c69395edfe`, SPL 2, ANDA207429. The label states standard sotalol tablets must not be substituted for sotalol AF tablets because labeling differs.
- SOTYLIZE oral solution — SETID `1f33f900-0777-4a92-a7f7-00cf3d57d95c`, SPL 6, NDA205108.
- Sotalol injection — SETID `ff3061ab-d930-4318-a5be-684e38be229e`, SPL 15, NDA022306.
- TIKOSYN (dofetilide) capsule — SETID `02438044-d6a3-49e9-a1ac-3aad21ef2c8c`, SPL 30, NDA020931.

## Fail-closed controls

- Bare `amiodarone` remains ambiguous between oral tablet and intravenous injection.
- Bare `sotalol` remains ambiguous among standard tablet, AF-labeled tablet, SOTYLIZE oral solution, and intravenous injection.
- All eight explicit products route only to `CLINICIAN_REVIEW_REQUIRED`.
- Production rules remain empty; no route conversion, formulation substitution, timing, or availability inference is authorized.

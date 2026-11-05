# MED-BATCH-05 other-cardiac source notes

Status: DRAFT / REVIEW_REQUIRED  
Researched: 2026-09-29  
Scope: route/form/release identity and review-only routing; no clinical timing, dosing, substitution, availability, or local-policy approval.

## Direct DailyMed label receipts

- Digoxin: oral tablet SETID `ca595f0c-5bf0-4feb-8183-47832ee8c820` SPL 1; oral solution SETID `1b7e5c6e-e052-41b0-a4ce-05dfe62faaaf` SPL 18; LANOXIN injection solution SETID `9ec84cac-6ecc-43dc-8006-6ccc029e2707` SPL 10.
- CORLANOR tablet and oral solution: shared SETID `92018a65-38f6-45f7-91d4-a34921b81d0d` SPL 33; distinct NDA206143 and NDA209964 product entries.
- Nitroglycerin: NITROSTAT sublingual tablet SETID `5265648f-3062-48a2-a4e3-fea1207807a8` SPL 2; lingual spray SETID `e7bbeff1-e4f1-43a6-a1b3-a8c3dcae817d` SPL 8; transdermal patch SETID `e98a2692-1cb9-4994-98d8-1d8d9ef1a256` SPL 9; NITRO-BID topical ointment SETID `e464e9bb-48e8-4b9f-9fff-e220cfbac0c5` SPL 15.
- Isosorbides: dinitrate oral tablet SETID `b166eb5b-bad8-4663-9c05-1c43539dab2c` SPL 3; dinitrate sublingual tablet SETID `44ede034-1fa1-4993-9aa5-49e04fada541` SPL 6; mononitrate extended-release tablet SETID `a707727c-819f-43ea-89f3-2a2ae1cb9edf` SPL 3.
- Ranolazine extended-release film-coated tablet: SETID `0cf58732-c242-49b0-8e3f-248778b4458d` SPL 5.

## Fail-closed controls

- Bare `digoxin`, `ivabradine`/`Corlanor`, `nitroglycerin`, and `isosorbide dinitrate`/`ISDN` remain ambiguous across route/form identities.
- Explicit ER wording is retained for isosorbide mononitrate and ranolazine.
- All thirteen explicit identities route only to `CLINICIAN_REVIEW_REQUIRED`.
- Production rules remain empty; no route/form conversion, substitution, timing, dosing, or availability inference is authorized.

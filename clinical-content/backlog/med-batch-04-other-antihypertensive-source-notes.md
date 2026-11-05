# Batch 04 remaining antihypertensive source reconciliation

Status: DRAFT / REVIEW_REQUIRED  
Retrieved: 2026-09-29

This cluster adds six route/form-specific medication-reconciliation identities using direct DailyMed labeling:

- clonidine hydrochloride oral tablet — SETID `df62817d-2f50-4c27-aaa8-a22f0290c94f`, SPL 6, ANDA070974/ANDA070975;
- CATAPRES-TTS clonidine transdermal system — SETID `d4a55825-7041-42f4-b3b2-dd7a25dbe793`, SPL 4, NDA018891;
- hydralazine hydrochloride oral tablet — SETID `f9f56326-6d72-47d3-89ac-3625b8a6d713`, SPL 1, ANDA211010;
- minoxidil oral tablet — SETID `0354a7f5-5917-44dc-9963-411104008cb5`, SPL 5, ANDA072709;
- doxazosin mesylate oral tablet — SETID `a7f589b0-eebb-48cb-912f-a4bd956e4dcb`, SPL 1, ANDA075646;
- prazosin hydrochloride oral capsule — SETID `cd52f022-ca29-4f87-8684-da63e05b3c1f`, SPL 11, ANDA072575.

Safety boundaries:

- bare clonidine fails closed across oral and transdermal identities;
- bare minoxidil fails closed because systemic oral and topical products are clinically distinct; only explicit systemic oral-tablet wording resolves in this Batch 04 cluster;
- the CATAPRES-TTS label-listed marketing-end date is recorded as source metadata only and is not interpreted as current availability;
- no route conversion, substitution, dosing, timing, market availability, patient-specific manufacturer/NDC, or clinical approval is asserted;
- all rules remain timing-free `CLINICIAN_REVIEW_REQUIRED`; production `activeRules` remains empty.

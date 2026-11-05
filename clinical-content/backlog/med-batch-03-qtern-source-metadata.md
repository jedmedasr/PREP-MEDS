# Batch 03 QTERN / dapagliflozin + saxagliptin source reconciliation

Status: INTEGRATED / REVIEW_REQUIRED

## Historical branded QTERN

- Product: QTERN (dapagliflozin + saxagliptin), oral film-coated tablet.
- Manufacturer/labeler: AstraZeneca Pharmaceuticals LP.
- Application: NDA209091.
- DailyMed SETID: 423c489c-085b-4320-b892-7868ebd6dc6b.
- Current searchable SPL version: 32.
- Effective date: 2026-06-03.
- Prescribing-information revision: 06/2026.
- Current label product/application rows retain marketing-end metadata; the latest listed end date is 2026-02-28.

PREP-MEDS preserves QTERN as a historical branded identity and source-provenance record. The later label revision does not erase the marketing-end metadata, and neither state is converted into a real-time pharmacy-inventory claim.

## Generic dapagliflozin + saxagliptin — ANDA211533

- Packager/labeler: Novadoz Pharmaceuticals LLC.
- Establishment/manufacturer recorded by DailyMed: MSN LABORATORIES PRIVATE LIMITED.
- Application: ANDA211533.
- DailyMed SETID: 1cfa51fd-8406-404c-b2a8-0fc1068675fb.
- Current searchable SPL version: 1.
- DailyMed updated: 2026-04-08; version published 2026-04-10.
- Application marketing start: 2026-04-06; package marketing start: 2026-04-09.
- No marketing-end date is listed in the authenticated DailyMed rows used for this reconciliation.

The absence of a listed marketing-end date is source metadata only. PREP-MEDS does not infer real-time commercial availability or pharmacy inventory.

## Generic dapagliflozin + saxagliptin — ANDA211537

- Applicant: Torrent Pharmaceuticals Limited.
- Application: ANDA211537.
- FDA approval date: 2026-04-06.
- Reference listed drug: QTERN.
- FDA first-generic/Orange Book records authenticate the application-level generic product identity.
- No current manufacturer DailyMed SPL was authenticated for ANDA211537 in this reconciliation.

No SETID, SPL version, manufacturer label revision, or commercial-availability state is invented for ANDA211537. It is modeled as an FDA-approved application identity with an explicit source gap.

## Historical QTERNMET XR

- Product: QTERNMET XR (dapagliflozin + saxagliptin + metformin hydrochloride extended-release), oral extended-release tablet.
- Manufacturer/labeler: AstraZeneca Pharmaceuticals LP.
- Application: NDA210874.
- Historical DailyMed SETID: cfffcbfe-dcd9-4001-963e-a99e67390116.
- Historical label revision: 01/2020.
- DailyMed application marketing start: 2020-06-01.
- Latest listed DailyMed marketing-end date: 2020-06-01.
- A searchable SPL sequence number was not authenticated from the source surface used for this reconciliation and is intentionally not asserted.
- FDA Orange Book 46th Edition (2026) lists all four NDA210874 product presentations (001-004) on the Discontinued Drug Product List.

PREP-MEDS therefore models QTERNMET XR only as a historical/discontinued extended-release triple-combination identity. Orange Book discontinued status does not establish the reason marketing stopped, does not imply a safety/efficacy withdrawal determination, and does not establish real-time residual inventory.

## Terminology behavior

Four source-distinct whole-product/application identities are encoded:

1. historical branded QTERN / NDA209091;
2. dapagliflozin+saxagliptin / ANDA211533;
3. dapagliflozin+saxagliptin / ANDA211537;
4. historical/discontinued QTERNMET XR / NDA210874.

The first three preserve dapagliflozin + saxagliptin component identity; QTERNMET XR preserves dapagliflozin + saxagliptin + metformin and the extended-release formulation. Bare `dapagliflozin and saxagliptin` remains ambiguous across the branded/generic application identities. Explicit QTERNMET XR/formulation wording may resolve to the historical triple-product identity, while release-unspecified triple-combination wording fails closed. No RxNorm identifier, substitution, or commercial-availability inference is created.

## Procedure-routing boundary

The authenticated QTERN and ANDA211533 labels contain temporary-interruption language for surgery or procedures associated with prolonged fasting. PREP-MEDS retains that language only as source provenance; it is not converted into a universal endoscopy timing instruction. ANDA211537 has no authenticated manufacturer SPL in this reconciliation, so no label-derived timing language is inferred for it.

The historical QTERNMET XR label identifies surgery/other procedures, reduced oral intake, and temporary discontinuation in relevant risk contexts. That historical language is retained only as review provenance. QTERNMET XR routes through a separate whole-product review rule with no `timingRule`.

All four identities route to `CLINICIAN_REVIEW_REQUIRED`. Production `activeRules` remain empty.

## Engineering state

QTERN/dapagliflozin+saxagliptin implementation commit: `3025bbcbe948a4f6902317d4f6d87453f66d85ea` (`feat(batch03): reconcile qtern and dapagliflozin saxagliptin`). Exact-head quality run #195 (`36511812039`), job `109225385173`, passed.

QTERNMET XR implementation commit: `27dc0ba73d26afdaf1c5362d9ed3f321382fe0d4` (`feat(batch03): add historical qternmet xr reconciliation`). Exact-head quality run #197 (`36512423069`), job `109227279949`, passed: schema validation, strict TypeScript checking, CI source identity, isolated inhaled-insulin regression, full unit/regression tests, and production web build.

No clinical approval, local-policy approval, merge, deployment, or production activation is implied.

## Next executable research

Audit remaining standalone GLP-1/GIP/metabolic product identities not represented in the current Batch 03 incretin module, beginning with lixisenatide/ADLYXIN. Verify FDA/DailyMed/Orange Book source and marketing status before deciding whether to encode a current or historical identity. Group adjacent historical GLP-1 products only when the same provenance/terminology/review model applies.

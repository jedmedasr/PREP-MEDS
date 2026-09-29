# Batch 03 INVOKAMET / INVOKAMET XR source reconciliation

Status: INTEGRATED / REVIEW_REQUIRED

## Current primary source

- Manufacturer/packager: Janssen Pharmaceuticals, Inc.
- DailyMed SETID: 6868666b-c25e-40d1-9d1f-306bbe9390c1
- SPL version: 32
- Effective date: 2026-08-24
- Approval identifiers: NDA204353 and NDA205879
- INVOKAMET: canagliflozin + metformin hydrochloride, oral film-coated tablet, immediate-release product identity.
- INVOKAMET XR: canagliflozin + metformin hydrochloride, oral film-coated extended-release tablet, distinct extended-release product identity.
- Source: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6868666b-c25e-40d1-9d1f-306bbe9390c1

The previously staged SPL 31 versus newer 08/2026 prescribing-information mismatch is no longer current: the searchable DailyMed record now carries SPL version 32 with effective time 2026-08-24. No SPL version was inferred for a source lacking one.

## Safety boundary

The integrated records preserve source identity, component identity, release-form identity, and review provenance only. They do not authorize substitution, component splitting, patient-specific dosing, a hold interval, restart timing, market-availability claims, clinical approval, local-policy approval, deployment, or production activation.

The current label contains temporary-interruption language for surgery or procedures associated with prolonged fasting. PREP-MEDS retains that only as source provenance and routes both whole-product identities to clinician review; no autonomous endoscopy timing rule is encoded.

Generic release-unspecified `canagliflozin and metformin hydrochloride` remains ambiguous between INVOKAMET immediate-release and INVOKAMET XR extended-release. Explicit product/formulation wording may resolve to its verified identity.

## Engineering state

Implementation commit: `94f7d0651b00d1f5c1e5eeac6362417d6de80db0` (`feat(batch03): add invokamet IR XR product reconciliation`).

Exact-head quality run #193 (`36510891727`), job `109222525226`, passed at that implementation head: schema validation, strict TypeScript checking, CI source identity, isolated inhaled-insulin regression, full unit/regression tests, and production web build.

Next executable work: reconcile historical branded QTERN and current generic dapagliflozin+saxagliptin identities, preserving application/source provenance and market-status uncertainty without inferring commercial availability.

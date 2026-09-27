# Batch 03 INVOKAMET / INVOKAMET XR source reconciliation

Status: SOURCE_VERIFIED / NOT_INTEGRATED / REVIEW_REQUIRED

## Current primary source

- Manufacturer/packager: Janssen Pharmaceuticals, Inc.
- DailyMed SETID: 6868666b-c25e-40d1-9d1f-306bbe9390c1
- SPL version: 32
- Effective date: 2026-08-24
- Approval identifiers: NDA204353 and NDA205879
- INVOKAMET: canagliflozin + metformin hydrochloride, oral film-coated tablet, immediate-release product identity.
- INVOKAMET XR: canagliflozin + metformin hydrochloride, oral film-coated extended-release tablet, distinct extended-release product identity.
- Source: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=6868666b-c25e-40d1-9d1f-306bbe9390c1

## Safety boundary

This record stages source identity only. It does not authorize substitution, component splitting, patient-specific dosing, a hold interval, restart timing, market-availability claims, clinical approval, local-policy approval, deployment, or production activation.

The current label contains temporary-interruption language for surgery or procedures associated with prolonged fasting. PREP-MEDS must retain that only as source provenance until product-specific endoscopy management is clinically adjudicated; no autonomous endoscopy timing rule is inferred here.

## Engineering state

An attempted atomic integration of the two product identities was not retained because the required review-rule and regression-test writes were rejected by the supported platform write control. Partial evidence/terminology changes were reverted at commit f92c38a336b8c24956b7d362e08a5bf0080a70aa.

Exact-head quality run 36323034927, job 108630417398, passed at that restored head: schema validation, strict TypeScript checking, CI source identity, isolated inhaled-insulin regression, full unit/regression tests, and production web build.

Next executable work: retry INVOKAMET / INVOKAMET XR as one atomic evidence + terminology + review-rule + regression-test cluster from live state. Do not retain a partial integration and do not bypass platform controls.

# Tacrolimus route/form/release hardening source notes

Status: DRAFT / REVIEW_REQUIRED  
Retrieved: 2026-09-30  
Scope: medication-reconciliation identity and review-only routing; no autonomous continuation, interruption, missed-dose instruction, conversion, substitution, monitoring target, or restart timing.

## Direct authoritative labels

- PROGRAF immediate-release oral capsules: DailyMed SETID `7f667de1-9dfa-4bd6-8ba0-15ee2d78873b`, NDA050708, current label published 2025-03-21.
- PROGRAF granules for oral suspension: same direct label, NDA210115.
- PROGRAF intravenous injection: same direct label, NDA050709.
- ASTAGRAF XL extended-release oral capsules: DailyMed SETID `550a5cd4-fbf2-4c09-b577-6bde8fcbdf6e`, NDA204096, current label published 2026-02-06.
- ENVARSUS XR extended-release oral tablets: DailyMed SETID `de2315b0-6344-43ac-9aea-3e3b68d828e7`, NDA206406, current label published 2025-03-03.

## Fail-closed boundaries

- PROGRAF capsule, oral-suspension granules, and intravenous injection remain distinct.
- ASTAGRAF XL extended-release capsules and ENVARSUS XR extended-release tablets remain distinct from each other and from immediate-release tacrolimus.
- Bare tacrolimus is intentionally ambiguous across modeled release, form, and route identities.
- Transplanted organ, time since transplant, rejection history, current multidrug regimen, last dose, trough concentration, renal/hepatic function, interactions, infection status, and oral tolerance require transplant-team and clinician review.
- Evidence does not assert a patient-specific product, dose, regimen, manufacturer, NDC, package, current availability, or interchangeability.

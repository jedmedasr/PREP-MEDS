# Carbamazepine direct-label source notes

Status: DRAFT / REVIEW_REQUIRED  
Retrieved: 2026-10-03

## Engineering scope

This cluster adds medication-reconciliation identities only for carbamazepine forms with material route, formulation, release, or whole-product ambiguity:

- TEGRETOL conventional oral tablet
- TEGRETOL oral suspension
- representative generic carbamazepine chewable tablet
- TEGRETOL XR extended-release oral tablet
- CARBATROL extended-release oral capsule
- EQUETRO extended-release oral capsule

Bare carbamazepine, bare TEGRETOL, and generic extended-release capsule wording remain ambiguous. CARBATROL and EQUETRO remain distinct branded whole-product identities even though both are extended-release oral capsules.

## Direct authoritative provenance

- TEGRETOL / TEGRETOL XR, Novartis, DailyMed SETID `8d409411-aa9f-4f3a-a52c-fbcb0c3ec053`, label version 39, effective 2026-08-20. The consolidated label identifies conventional tablet, suspension, and extended-release tablet; application provenance is preserved per form.
- Carbamazepine chewable tablet, Sun Pharmaceutical Industries, DailyMed SETID `0526a054-3eda-49b4-b390-7d5d16e30af8`, label version 12, effective 2026-08-30. The SETID is recorded without assigning one of the label's multiple ANDAs to the chewable form.
- CARBATROL, Takeda, DailyMed SETID `bc03e499-5bac-4293-bff4-6864153a624d`, NDA020712, label version 41, effective 2026-08-17.
- EQUETRO, Validus, DailyMed SETID `be478f3c-40f6-47cc-8ab9-f420a9372b1c`, NDA021710, label version 10, effective 2025-08-19.

## Fail-closed boundary

Identity evidence does not determine indication, seizure control, last dose or adherence, sodium or blood-count status, hepatic or renal function, ancestry/HLA context, hypersensitivity, interacting drugs or autoinduction, oral feasibility, withdrawal risk, procedure risk, or anesthesia plan.

No autonomous continuation, interruption, taper, timing, restart, dose equivalence, substitution, formulation conversion, or release conversion is authorized. Every explicit identity routes to `CLINICIAN_REVIEW_REQUIRED`; production rules remain empty.

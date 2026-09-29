# Batch 01 oral anticoagulant direct-label hardening

Status: DRAFT / REVIEW_REQUIRED  
Reconciled: 2026-09-29

This reconciliation adds direct DailyMed label provenance to the existing review-only pathways for dabigatran, edoxaban, and warfarin. It does not create interruption, bridging, restart, dosing, substitution, or availability instructions.

## Authoritative label identities

- Dabigatran etexilate capsules: DailyMed SETID `dd47a015-ff90-d7a7-8dcb-4e6e31a68071`, ANDA208070, revised July 2026. The evidence is capsule-specific and preserves the label's warning that dabigatran dosage forms are not milligram-for-milligram substitutable.
- SAVAYSA (edoxaban tosylate) film-coated tablets: DailyMed SETID `e77d3400-56ad-11e3-949a-0800200c9a66`, revised October 2023. Renal-function and indication distinctions remain required review context.
- Warfarin sodium tablets: DailyMed SETID `558b7a0d-5490-4c1b-802e-3ab3f1efe760`, ANDA202202, revised November 2022. VTE, atrial-fibrillation, post-MI, and cardiac-valve contexts are not collapsed.

## Governance boundary

All sources and atoms remain `DRAFT`; all three candidate rules remain `CLINICAL_REVIEW` / `CLINICIAN_REVIEW_REQUIRED`. Procedure risk, recent thrombosis, concomitant antithrombotic therapy, renal function, mechanical-valve status, bridging, and postprocedure restart remain clinician/local-policy decisions. No production rule is activated.

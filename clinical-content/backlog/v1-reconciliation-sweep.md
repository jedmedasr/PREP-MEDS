# V1 cross-batch reconciliation sweep

Status: `IN_PROGRESS_ENGINEERING_VERIFICATION`  
Governance: `DRAFT / REVIEW_REQUIRED`  
Production activation: disabled

## Freeze scope

The V1 medication universe is bounded to anesthesia-critical and GI-procedure-critical identities already recorded in the batch checkpoints: antithrombotics; diabetes/insulin/SGLT2/GLP-1/GIP; cardiovascular/hemodynamic and antiarrhythmic agents; OUD/pain; systemic steroids and major transplant immunosuppression; weight-management agents; Parkinson/dopaminergic therapies; withdrawal-sensitive neurologic/antiepileptic therapies; pulmonary/airway and pulmonary-hypertension therapies; high-impact psychotropic agents; bounded herbal supplements; and cannabinoids.

## Reconciliation assertions

- Canonical ingredient and medication identifiers are schema-valid and duplicate-free.
- Nonspecific names spanning route, dosage form, release, salt/prodrug, or whole-product identities fail closed rather than selecting a patient instruction.
- Whole-product identities remain intact; component ingredients do not authorize splitting, substitution, or conversion.
- Each evidence atom resolves to a source in its assembled bundle; each review-rule evidence reference resolves to an assembled atom.
- Candidate rules remain unavailable in production mode. Shadow mode is explicit and exposes review candidates only.
- Passing engineering tests does not grant clinical approval, local-policy approval, merge, deployment, or production activation.

## Deferred beyond MVP

Broad lower-impact expansion is frozen unless reconciliation identifies a critical defect. Deferred classes include statins, gout therapies, bone-health therapies, broad DMARD expansion, routine allergy medications, low-impact chronic medications, and unrelated GI/anti-infective/oncology breadth.

## Human-review boundary

Medication-specific continuation, interruption, taper, restart, bridging, substitution, dose or route conversion, procedural timing, anesthesia planning, and local operational policy remain unresolved until accountable GI, anesthesia, pharmacy, and institutional reviewers approve them.

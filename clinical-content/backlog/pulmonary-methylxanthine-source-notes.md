# Pulmonary methylxanthine source notes

Status: DRAFT / REVIEW_REQUIRED  
Engineering scope: ingredient, route, dosage-form, release-form, branded-product identity, fail-closed terminology, and review-only routing.

## Bounded cluster

- theophylline anhydrous oral solution
- theophylline anhydrous extended-release oral tablet
- THEO-24 theophylline anhydrous extended-release oral capsule
- aminophylline dihydrate intravenous injection

## Authoritative provenance

Direct FDA-submitted SPL labeling was reconciled through the DailyMed SETIDs recorded in `pulmonary-methylxanthine-evidence.ts`. The labels establish ingredient, route, dosage form, release form, and branded-product identity. They also provide safety context supporting accountable review of serum concentrations, toxicity symptoms, interacting medicines, smoking-status change, fever/sepsis, hepatic or cardiac disease, and seizure or arrhythmia risk. They do not establish current market availability, interchangeability, preferred manufacturer, or patient-specific suitability.

## Safety boundaries

- Oral solution, extended-release tablet, THEO-24 extended-release capsule, and intravenous aminophylline remain distinct identities.
- Bare theophylline wording fails closed across non-extended-release solution and extended-release solid oral forms.
- Aminophylline dihydrate injection is not treated as an automatic route, ingredient, salt/complex, or dose conversion from oral theophylline.
- Airway diagnosis/control, acute symptoms, serum-theophylline concentration, toxicity symptoms, interacting medicines, smoking-status change, fever/sepsis, hepatic/cardiac disease, seizure/arrhythmia risk, oral feasibility, procedure/sedation context, and anesthesia plan remain accountable clinician/local-policy questions.
- No continuation, interruption, substitution, route or release conversion, dose arithmetic, monitoring target, administration timing, infusion instruction, anesthesia plan, or restart rule is authorized.

## Governance

All sources and atoms remain `DRAFT`. Explicit identities route only to `CLINICIAN_REVIEW_REQUIRED`; production rules remain disabled. Passing engineering gates must not be interpreted as clinical or local-policy approval.

# Pulmonary controller-combination source notes

Status: DRAFT / REVIEW_REQUIRED  
Engineering scope: whole-product identity, ingredient composition, inhaled form, delivery-device context, fail-closed terminology, and review-only routing.

## Bounded cluster

- SYMBICORT budesonide/formoterol pressurized metered-dose aerosol
- ADVAIR HFA fluticasone propionate/salmeterol metered-dose aerosol
- ADVAIR DISKUS fluticasone propionate/salmeterol dry powder
- BREO ELLIPTA fluticasone furoate/vilanterol dry powder
- DULERA mometasone/formoterol pressurized metered-dose aerosol
- TRELEGY ELLIPTA fluticasone furoate/umeclidinium/vilanterol triple dry powder
- BREZTRI AEROSPHERE budesonide/glycopyrrolate/formoterol triple metered-dose aerosol

## Authoritative provenance

Direct FDA-submitted SPL labeling was reconciled through the DailyMed SETIDs recorded in `pulmonary-controller-combination-evidence.ts`. The labels establish ingredient composition, inhaled dosage form, branded device context, and dual-versus-triple whole-product boundaries. They do not establish current market availability, interchangeability, preferred manufacturer, or patient-specific suitability.

## Safety boundaries

- ICS/LABA and ICS/LAMA/LABA products remain whole medication identities and are not split into independent component instructions.
- ADVAIR HFA and ADVAIR DISKUS remain distinct; bare ADVAIR or non-device-specific fluticasone-propionate/salmeterol wording fails closed.
- Metered aerosols, DISKUS dry powder, ELLIPTA dry powder, and AEROSPHERE aerosol remain distinct device/form contexts.
- Asthma/COPD diagnosis and control, recent exacerbation, systemic-steroid exposure, rescue use, oxygen/current symptoms, infection, device availability/technique, rhythm/hemodynamic context, anticholinergic precautions, procedure/sedation context, and anesthesia plan remain accountable clinician/local-policy questions.
- No continuation, interruption, component splitting, strength/ingredient/device conversion, substitution, administration timing, dose arithmetic, or restart rule is authorized.

## Governance

All sources and atoms remain `DRAFT`. Explicit identities route only to `CLINICIAN_REVIEW_REQUIRED`; production rules remain disabled. Passing engineering gates must not be interpreted as clinical or local-policy approval.

# Pulmonary rescue / short-acting bronchodilator source notes

Status: DRAFT / REVIEW_REQUIRED  
Engineering scope: medication identity, inhaled route, dosage form, delivery-device context, whole-combination identity, fail-closed terminology, and review-only routing.

## Bounded cluster

- VENTOLIN HFA albuterol sulfate metered inhalation aerosol
- representative albuterol sulfate nebulizer solution concentrate
- XOPENEX HFA levalbuterol tartrate metered inhalation aerosol
- XOPENEX levalbuterol hydrochloride nebulizer solution concentrate
- ATROVENT HFA ipratropium bromide metered inhalation aerosol
- representative ipratropium bromide nebulizer solution
- COMBIVENT RESPIMAT ipratropium/albuterol metered spray as a whole product
- representative ipratropium/albuterol nebulizer solution as a whole product

## Authoritative provenance

Direct FDA-submitted SPL labeling was reconciled through DailyMed SETIDs recorded in `pulmonary-rescue-evidence.ts`. The labels directly establish ingredient, inhaled form, MDI/Respimat/nebulizer delivery context, and combination-product boundaries. Representative generic/repackaged SPLs authenticate the scoped generic identities only; they do not establish market availability, preferred manufacturer, interchangeability, or substitution.

## Safety boundaries

- Metered aerosol, Respimat spray, and nebulizer solution identities remain distinct.
- Albuterol and levalbuterol remain distinct; no racemate/enantiomer conversion is authorized.
- COMBIVENT RESPIMAT and ipratropium/albuterol nebulizer solution remain whole combination products and are not split into component instructions.
- Bare ingredient or brand wording that spans multiple forms/devices fails closed.
- Airway diagnosis/control, recent exacerbation, rescue-use frequency, oxygen requirement, current symptoms, device availability/technique, rhythm/hemodynamic context, anticholinergic precautions, procedure/sedation context, and anesthesia plan remain accountable clinician/local-policy questions.
- No continuation, interruption, mixing, dilution, substitution, dose/device conversion, component splitting, administration timing, or restart rule is authorized.

## Governance

All sources and atoms remain `DRAFT`. Explicit identities route only to `CLINICIAN_REVIEW_REQUIRED`; production rules remain disabled. Passing engineering gates must not be interpreted as clinical or local-policy approval.

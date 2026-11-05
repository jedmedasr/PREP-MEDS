# Remaining pulmonary-hypertension therapy source notes

Status: DRAFT / REVIEW_REQUIRED  
Engineering scope: pulmonary-vascular therapy ingredient, route, dosage-form, fixed-combination, device, and indication identity; hemodynamic/interaction context; fail-closed terminology; review-only routing.

## Bounded cluster

- REVATIO sildenafil oral tablet, oral suspension, and intravenous injection
- ADCIRCA tadalafil oral tablet
- TRACLEER bosentan oral tablet and tablet for oral suspension
- LETAIRIS ambrisentan oral tablet
- OPSUMIT macitentan oral tablet
- OPSYNVI macitentan/tadalafil fixed-combination oral tablet
- ADEMPAS riociguat oral tablet
- WINREVAIR sotatercept-csrk subcutaneous injection kit
- VENTAVIS iloprost inhalation solution
- AURLUMYN intravenous iloprost as a non-PAH route/indication collision guard

## Authoritative provenance

Direct FDA-submitted SPL labeling was reconciled through the DailyMed SETIDs recorded in `pulmonary-hypertension-vasodilator-evidence.ts`. The labels establish route, dosage form, branded-product, fixed-combination, device, and indication identity. They provide hemodynamic, contraindication/interaction, hepatic/renal, hemoglobin/platelet/bleeding, pregnancy/REMS, airway, and monitoring context for accountable review. They do not establish current availability, interchangeability, preferred manufacturer, or patient-specific suitability.

## Safety boundaries

- REVATIO tablet, suspension, and IV injection remain distinct; bare sildenafil/Revatio fails closed.
- TRACLEER film-coated tablet and tablet for oral suspension remain distinct; bare bosentan/Tracleer fails closed.
- OPSYNVI remains a whole macitentan/tadalafil product and is not decomposed into component instructions; bare macitentan or tadalafil fails closed across single-agent and combination products.
- VENTAVIS inhaled iloprost is distinct from AURLUMYN intravenous iloprost with a non-PAH indication; bare iloprost fails closed across route/indication.
- PAH/CTEPH diagnosis and severity, decompensation/right-heart failure, hemodynamics, oxygen/ventilation, systemic blood pressure, nitrate/PDE5/sGC/antihypertensive interactions, hepatic/renal function, hemoglobin/platelets/bleeding, pregnancy/REMS, oral feasibility, device access, procedure/sedation context, and anesthesia plan remain clinician reviewed.
- No continuation, interruption, substitution, component splitting, route/form conversion, dose arithmetic, monitoring target, administration timing, anesthesia plan, or restart timing is encoded.
- Passing engineering tests does not grant clinical or local-policy approval.

## Governance

All sources and evidence atoms remain DRAFT. Rules route only to `CLINICIAN_REVIEW_REQUIRED`; production `activeRules` remains empty.

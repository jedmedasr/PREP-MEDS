# Pulmonary-hypertension prostacyclin-pathway source notes

Status: DRAFT / REVIEW_REQUIRED  
Engineering scope: ingredient, route, dosage-form, release-form, device/delivery, whole-product identity, infusion-continuity context, fail-closed terminology, and review-only routing.

## Bounded cluster

- VELETRI epoprostenol continuous intravenous infusion
- REMODULIN treprostinil continuous subcutaneous or intravenous infusion
- TYVASO treprostinil inhalation solution
- TYVASO DPI treprostinil inhalation powder
- ORENITRAM treprostinil extended-release oral tablet
- UPTRAVI selexipag oral tablet
- UPTRAVI selexipag intravenous injection

## Authoritative provenance

Direct FDA-submitted SPL labeling was reconciled through the DailyMed SETIDs recorded in `pulmonary-hypertension-prostacyclin-evidence.ts`. The labels establish ingredient, route, dosage form, release form, device/delivery context, and whole-product identity. VELETRI and REMODULIN labeling supplies high-impact infusion-continuity and abrupt-interruption safety context. The labels do not establish current market availability, interchangeability, preferred manufacturer, or patient-specific suitability.

## Safety boundaries

- Continuous VELETRI and REMODULIN infusion identities remain distinct from inhaled treprostinil, oral extended-release treprostinil, and selexipag products.
- Bare treprostinil fails closed across REMODULIN, TYVASO solution, TYVASO DPI, and ORENITRAM; bare Tyvaso fails closed across solution and DPI.
- Bare selexipag and Uptravi fail closed across oral tablet and intravenous injection.
- PAH diagnosis/severity, current symptoms or decompensation, right-heart failure/hemodynamics, oxygen/ventilation, hypotension, bleeding/platelet context, hepatic function/interactions, oral feasibility, pump/catheter/device availability, infusion continuity and backup planning, procedure/sedation context, and anesthesia plan remain clinician reviewed.
- No continuation, interruption, transition equation, substitution, route/device conversion, dose arithmetic, infusion rate, administration timing, anesthesia plan, or restart timing is encoded.
- Passing engineering tests does not grant clinical or local-policy approval.

## Governance

All sources and evidence atoms remain DRAFT. The only assembled rule is `CLINICIAN_REVIEW_REQUIRED`; production `activeRules` remains empty.

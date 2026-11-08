# Apixaban — FDA application and formulation provenance reconciliation (2026-11-08)

**Status: IN_PROGRESS; research only; no patient-facing instructions.** This supplements, rather than replaces, the prior ASGE/ACG-CAG/BSG-ESGE/CHEST/ACC-AHA/IDEN comparisons and scenario ledger.

## Resolution of previously documented FDA application-number discrepancy

The two FDA application numbers in the existing apixaban ledger are **not necessarily conflicting labels**. FDA's **April 2025 Orange Book** independently identifies:
- **NDA 202155:** ELIQUIS film-coated oral tablets (adult 2.5 mg and 5 mg); **0.5 mg tablet for oral suspension** added April 17, 2025.
- **NDA 220073:** ELIQUIS SPRINKLE **0.15 mg for oral suspension**; new application dated April 17, 2025.

Primary regulatory locator: FDA Orange Book April 2025, apixaban entries: https://www.fda.gov/media/186374/download .

Two contemporaneous FDA-approved April 2025 labels both describe the broader ELIQUIS family, so **application provenance must be attached at the presentation level rather than assuming each label PDF is exclusive to one presentation**:
- NDA 202155 supplements s039/s040, FDA label revised **04/2025**, https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/202155s039s040lbl.pdf .
- NDA 220073 original approval, FDA label revised **04/2025**, https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/220073s000lbl.pdf .

**ASGE 2016 comparator:** Acosta et al., *Gastrointest Endosc* 2016;83:3–16, Table 7, https://doi.org/10.1016/j.gie.2015.09.035 . Its renal-stratified apixaban interruption table concerns the drug for high-risk endoscopy; **pediatric 0.5 mg suspension tablets, 0.15 mg sprinkle preparation, weight-based pediatric VTE regimens, and feeding-tube preparation are NOT ADDRESSED** as formulation-specific pathways. Do not inherit an adult AF timing rule for pediatric VTE.

## Clinically distinct group decisions (provisional, not approved)

| Group | Presentation/clinical use | FDA evidence locator | Review disposition |
| --- | --- | --- | --- |
| APIX-ADULT-ORAL-TAB | 2.5 mg / 5 mg swallowed tablets, adult AF, VTE, prophylaxis; distinguish acute VTE loading from maintenance | NDA 202155, label §§2.1, 2.4, 3 | IN_PROGRESS; different indication/thrombotic-risk regimens must be scenario-tested |
| APIX-CRUSHED-ENTERAL | Crushed adult tablets administered orally or via permitted feeding-tube route | FDA label §2.7 | IN_PROGRESS; route/preparation and enteral feeding applicability must be checked |
| APIX-PEDS-0.5-SUSP-TAB | 0.5 mg tablets for oral suspension, pediatric weight-based VTE | NDA 202155, label §§2.2, 2.7, 3 | IN_PROGRESS; NOT ADDRESSED by ASGE 2016 as pediatric presentation |
| APIX-PEDS-0.15-SPRINKLE | 0.15 mg sprinkle for oral suspension, pediatric weight-based VTE | NDA 220073, label §§2.2, 2.7, 3 | IN_PROGRESS; NOT ADDRESSED by ASGE 2016 as pediatric presentation |

## Source comparisons and negative safety assertions

- **FDA §2.4 (04/2025):** elective low-bleeding-risk intervention interruption **at least 24 hours**; moderate/high-bleeding-risk intervention **at least 48 hours**; resume after adequate hemostasis. This is a general procedural label minimum, **not** an endoscopy-specific consensus.
- **ASGE 2016 Table 7:** adult high-risk apixaban renal strata **CrCl >60: 1–2 days; 30–59: 3 days; 15–29: 4 days**. Retain exact boundary ambiguity at CrCl 60 and fractional gaps. Do not replace the ASGE interval with FDA's general 48-hour minimum.
- **BSG/ESGE 2021:** high-risk last DOAC dose 3 days before; low-risk omit morning dose; https://doi.org/10.1136/gutjnl-2021-325184 . **ACG/CAG 2022:** elective temporary DOAC interruption suggested, but restart timing insufficiently determined; https://doi.org/10.14309/ajg.0000000000001627 .
- **FDA §2.2:** pediatric VTE treatment begins after **at least 5 days of initial anticoagulant treatment**, with weight-based dosing; do not apply adult AF dose-reduction or interruption rules automatically.
- **FDA §§5.3, 8.7, 7:** neuraxial anesthesia, severe hepatic impairment, and combined P-gp/CYP3A4 inhibitors/inducers require separate review. General endoscopy sedation is not automatically neuraxial anesthesia.
- **Cross-application negative case:** NDA 220073 is not proof that the 2.5/5-mg adult film-coated tablet has a different active ingredient; NDA 202155 is not proof that 0.15-mg sprinkle is the same delivery formulation as 0.5-mg tablet for suspension.

## Remaining verification and mapping blockers

1. Check for any **post-April-2025 approved labeling revisions** before claiming current-label completeness; the Orange Book and April labels establish historical regulatory provenance, not necessarily the latest label in November 2026.
2. Reconcile each canonical ID/brand/strength/route to these groups with tested inheritance; do not infer a pediatric formulation from an unspecified `MED-apixaban` ID.
3. Run actual evidence and renal/timing tests; do not mark TESTED merely because comparison text exists.
4. Record evidence revision/hash and mapped IDs for authenticated clinician **Mark Reviewed**; no separate agent verification approval required. No CLINICALLY_REVIEWED status or patient activation without clinician action.

**Evidence reviewed:** 2026-11-08. **Clinical group completed:** 0. **Research comparison updated:** apixaban FDA application/presentation provenance.

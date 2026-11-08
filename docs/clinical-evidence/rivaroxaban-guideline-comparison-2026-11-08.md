# Rivaroxaban — guideline comparison and renal-boundary evidence (2026-11-08)

**Ownership:** Lane A, bucket 01, `ING-rivaroxaban` / `MED-rivaroxaban`. **Research status:** IN_PROGRESS, not TESTED, not clinician approved. **Scope:** adult oral rivaroxaban for AF/VTE; other indications, pediatric regimens, gastric-tube delivery and vascular-dose combination therapy must be separately adjudicated before inheritance. Generic canonical ID does not encode these distinctions.

## Dated primary sources and exact passages

**ASGE Standards of Practice Committee, January 2016**, *Management of antithrombotic agents for patients undergoing GI endoscopy*, *Gastrointestinal Endoscopy* 83:3–16, DOI [10.1016/j.gie.2015.09.035](https://doi.org/10.1016/j.gie.2015.09.035), [ASGE official guideline](https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics), **Table 8 (rivaroxaban), Table 3 (procedure bleeding risk)**. For high-risk endoscopy, Table 8 lists **CrCl >90: ≥1 day; 60–90: 2 days; 30–59: 3 days; 15–29: 4 days**. ASGE Table 8 does **not** assign an interval for CrCl <15; neither does it unambiguously classify every fractional boundary between integer row labels (e.g. 59.5), so these must not be silently rounded. Historical recommendation, not an automatic current policy. ASGE 2016 does not provide pediatric-specific interruption or a separate 2.5-mg vascular-dose-plus-aspirin interruption table: **NOT ADDRESSED**.

**BSG/ESGE, Veitch et al., August 2021**, *Endoscopy in patients on antiplatelet or anticoagulant therapy: guideline update*, *Gut* 70:1611–1628, DOI [10.1136/gutjnl-2021-325184](https://doi.org/10.1136/gutjnl-2021-325184), [full primary text](https://pmc.ncbi.nlm.nih.gov/articles/PMC8355884/), **Direct oral anticoagulants; Low-risk; High-risk; Post-elective procedures**. Low-risk endoscopy: **omit morning DOAC dose** (weak, low quality). High-risk endoscopy: **last dose 3 days before** (strong, low quality), without the apixaban/rivaroxaban-specific CrCl 15–29 extension present in historical ASGE. The 5-day renal exception is **dabigatran only**; never apply it to rivaroxaban. Resume up to **2–3 days after** depending on bleeding/thrombotic risks (strong, moderate quality); no unconditional restart if hemostasis insecure.

**ACG/CAG, Abraham et al., March 2022**, *American Journal of Gastroenterology* 117:542–558, DOI [10.14309/ajg.0000000000001627](https://doi.org/10.14309/ajg.0000000000001627), [official guideline PDF](https://gi.org/wp-content/uploads/2022/03/ACG-CAG-Guideline.pdf), **Elective endoscopy, Statement 13**: suggest temporary DOAC interruption rather than continuation (conditional, very-low certainty); does **not** specify a universally applicable rivaroxaban/CrCl-stratified high-risk interval. **Statement 17**: insufficient evidence to recommend same-day versus 1–7-day DOAC resumption; do not invent a firm restart day from this source.

**IDEN 2024**, *International Digestive Endoscopy Network consensus on the management of antithrombotic agents in patients undergoing gastrointestinal endoscopy*, [primary full text](https://pmc.ncbi.nlm.nih.gov/articles/PMC11391130/), **Statements 11–14**: low-risk omit morning DOAC dose (conditional, very low); high-risk **withhold >48 hours** (strong, low); resume within **2–3 days** after high-risk endoscopy once hemostasis secured (conditional, very low). `>48h` is not equivalent to `≥48h` and cannot be directly translated to the BSG/ESGE 'last dose 3 days before' calendar-day convention without actual last-dose time.

**CHEST 2022**, Douketis et al., *Chest*, DOI [10.1016/j.chest.2022.07.025](https://doi.org/10.1016/j.chest.2022.07.025), **perioperative DOAC interruption**: generally suggests stopping rivaroxaban **1–2 days** before elective procedures (conditional, very-low certainty), with restart approximately **24h** after low/moderate-bleeding-risk and **48–72h** after high-risk procedures. This is a broader perioperative guideline, not a rivaroxaban-specific endoscopy bleeding-risk classification; never override endoscopy-specific guidance without clinician choice.

## Scenarios and unresolved conflicts

| Scenario | Comparative conclusion | Gate |
| --- | --- | --- |
| Diagnostic EGD or colonoscopy ± mucosal biopsy | BSG/ESGE low-risk omit morning dose vs ACG/CAG conditional interruption; ASGE historically generally low-risk continuation | Display source-specific options, not a universal hold |
| Polypectomy, EMR/ESD, sphincterotomy, EUS sampling | ASGE 2016 Table 8 renal-specific 1–4-day ranges vs BSG/ESGE 2021 last dose 3 days prior vs IDEN 2024 >48h vs CHEST 2022 1–2 days | Preserve disagreements and actual last-dose clock time |
| Colonoscopy with uncertain possible polypectomy | Diagnostic-only low-risk assumption is unsafe if therapy anticipated | Clinician must select intended procedural risk |
| CrCl 90, >90, 60, 59.5, 59, 30, 29.5, 29, 15, <15 | Historical ASGE row boundaries are not universally inclusive; BSG/ESGE does not assign a rivaroxaban-specific 5-day renal extension | Explicit unresolved boundary, no interpolation or rounding |
| AF vs recent VTE vs vascular-dose rivaroxaban with aspirin | Thrombotic indication, regimen, DAPT/triple therapy change management; 2.5-mg-plus-aspirin pathway is not equivalent to AF/VTE dosing | Separate scenario/formulation review; assess aspirin independently |
| Severe hepatic dysfunction, acute renal deterioration, pediatric use, enteral administration | No universal interval established by these passages for each circumstance | Refer for individualized review; do not inherit adult default |
| Postprocedure bleeding or insecure hemostasis | BSG/ESGE/IDEN condition restart on risk/hemostasis; ACG/CAG has insufficient evidence for exact restart day | No automatic restart |
| Combined EGD + colonoscopy | Use highest planned intervention risk | Do not default to diagnostic risk |

## Canonical mapping and tests needed

Current manifest contains only `MED-rivaroxaban` (formulation-unspecified), mapped to `ING-rivaroxaban`; this is **ingredient mapping**, not formulation adjudication. Do not inherit from apixaban, dabigatran, edoxaban, aspirin or combination products. Regression scenarios: exact `>48h` boundary; CrCl row edges and fractional gaps; low/high/unknown risk; AF/VTE/vascular-dose plus aspirin; last-dose timestamp versus calendar-day convention; restart hemostasis; pediatric/enteral/unknown formulation; negative cross-medication matching.

**Evidence state:** source comparisons committed, executable tests **not run**; no claim of completed review, clinical signoff, or patient-facing activation.

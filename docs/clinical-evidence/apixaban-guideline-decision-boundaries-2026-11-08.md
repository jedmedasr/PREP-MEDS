# Apixaban — guideline decision boundaries and clinician evidence packet (2026-11-08)

**Lane A / Bucket 01 / ING-apixaban.** Research-only, **IN_PROGRESS**. This is an evidence decision table, not a patient instruction or clinician approval. No FDA label revision is required for the hold-duration evidence gate.

## Source-specific primary passages

| Primary source, dated version, location | Low-risk diagnostic EGD/colonoscopy ± biopsy | Higher-risk endoscopy (polypectomy, EMR/ESD, sphincterotomy, EUS sampling) | Strength / boundary |
|---|---|---|---|
| [ASGE 2016, DOI 10.1016/j.gie.2015.09.035](https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics), Tables 3 and **7** | Historical low-risk continuation approach | Table 7 apixaban CrCl **>60**: 1–2 days; **30–59**: 3 days; **15–29**: 4 days | Historical comparator. **Exactly 60, fractional 59–60 and 29–30, and <15 are not assigned by these printed bins.** Do not interpolate or silently round. |
| [ACG/CAG 2022, Statement 13](https://pmc.ncbi.nlm.nih.gov/articles/PMC8972207/) | Suggest temporary DOAC interruption for elective GI endoscopy; procedure-specific duration not established by the recommendation | Same recommendation; discussion describes favorable observed 1–2 preprocedure days excluding procedure day, **not** a universal apixaban-specific high-risk directive | **Conditional, very-low certainty**; insufficient evidence to select same-day vs 1–7-day resumption (Statement 17). |
| [BSG/ESGE 2021, Direct oral anticoagulants and Figure 2](https://doi.org/10.1136/gutjnl-2021-325184) | **Omit morning dose on procedure day** | **Last dose 3 days before procedure**; restart individualized, up to **2–3 days** postprocedure according to bleeding/thrombotic risk | Low risk: **weak, low quality**; high risk: **strong, low quality**. The 5-day renal exception applies to **dabigatran**, not apixaban. |
| [CHEST 2022, Perioperative Management, DOI 10.1016/j.chest.2022.07.025](https://doi.org/10.1016/j.chest.2022.07.025) | General perioperative (not GI-endoscopy-specific) DOAC interruption framework | General 1–2-day apixaban interruption; postoperative restart conditional on bleeding risk | **Conditional, very-low certainty**; do not substitute generic surgery categories for endoscopic therapeutic risk. |
| [ACC/AHA/ACCP/HRS 2023 AF guideline, Table 18](https://doi.org/10.1016/j.jacc.2023.08.017) | AF-specific **one full day** without apixaban before low-risk procedure, plus no dose procedure day | AF-specific **two full days** before high-risk procedure, plus no dose procedure day | Applies to AF with **CrCl >25 mL/min** in the table; **exactly 25** and non-AF indications are outside this table's stated scope. |
| [IDEN 2024, Statements 11–14](https://pmc.ncbi.nlm.nih.gov/articles/PMC11391130/) | Omit morning DOAC dose | Withhold DOAC **more than 48 hours**; resume **2–3 days** afterward once hemostasis is secured | Low-risk omission: conditional/very-low certainty; high-risk hold: strong/low certainty; restart: conditional/very-low certainty. Strictly **>48 h**, not >=48 h. |

## Explicit discordance and non-inheritance

- **Low-risk:** ASGE historical continuation, BSG/ESGE morning-dose omission, ACG/CAG general interruption, and ACC AF full-day omission differ; display all to clinician, not a fabricated universal instruction.
- **High-risk:** ASGE renal-stratified 1–4 days, BSG/ESGE calendar last dose 3 days prior, IDEN strict >48 h, and ACC AF two *full* days are distinct semantics. Do not equate calendar dates, 48 hours, and full medication-free days without a clinician-selected scheduling rule.
- **Restart:** ACG/CAG explicitly cannot recommend same-day vs 1–7 days; BSG/ESGE and IDEN offer conditional clinical timing requiring adequate hemostasis. Do not automate restart with unknown hemostasis or anticipated delayed post-EMR/ESD bleeding.
- **Indication:** AF Table 18 does not apply to acute VTE, pediatric VTE, mechanical valves or other non-AF contexts. Assess recent VTE/stroke, interacting drugs, liver dysfunction, changing renal function, and anesthetic/neuraxial requirements separately.
- **Formulation:** Current canonical `MED-apixaban` is formulation-unspecified. Adult tablet, crushed/enteral, and pediatric suspension/sprinkle pathways cannot inherit a single pediatric or adult hold instruction; ASGE pediatric formulation-specific timing **NOT ADDRESSED**.
- **Bridging:** No routine LMWH bridging for apixaban; exceptional high-thrombotic-risk cases require prescriber decision. Combined EGD/colonoscopy uses the **highest planned intervention risk**; unknown polypectomy plans require explicit clinical choice.

## Executable evidence acceptance matrix (not yet executed)

1. CrCl: 61, 60, 59.5, 59, 30, 29.5, 29, 25, 24.9, 15, 14.9; historical ASGE bins must fail closed at uncovered values.
2. Endoscopy: diagnostic EGD, biopsy, diagnostic colonoscopy, polypectomy, EMR, ESD, EUS-FNA, ERCP sphincterotomy, combined diagnostic/therapeutic and uncertain intervention.
3. Time semantics: IDEN 48 h exactly is **insufficient** for strictly >48 h; ACC one/two full days are not interchangeable with elapsed-hour thresholds; BID last-dose times must be preserved.
4. Patient: AF versus recent VTE, renal deterioration, liver dysfunction, high thrombotic risk, hemostasis uncertain, neuraxial anesthesia, pediatric/enteral route.
5. Mapping: `MED-apixaban` maps to `ING-apixaban` only provisionally; negative assertions reject rivaroxaban/dabigatran/edoxaban and combination inheritance.

**Execution evidence:** 0 tests run in this clinical research commit; no CI result asserted. **Disposition:** IN_PROGRESS, not TESTED or CLINICALLY_REVIEWED. Clinician decides approval using the linked primary passages; no patient-facing activation without clinician authorization.

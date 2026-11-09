# Edoxaban — primary-source endoscopy comparison (2026-11-08)

**Owner:** Lane A, Bucket 01, `ING-edoxaban`. **Status:** IN_PROGRESS, clinician review pending. This is an evidence packet, not an executable patient hold instruction. FDA labeling is not used to determine holding duration.

## Verified guideline passages

| Source and recommendation | Exact applicability | Strength / limitations |
|---|---|---|
| [ASGE Standards of Practice Committee 2016, DOI 10.1016/j.gie.2015.09.035, Table 9](https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics) | **High-risk endoscopy**: CrCl **>60**, **30–60**, and **15–30 mL/min** each specify discontinuation **at least 24 hours** before procedure. CrCl **≤15**: **NO DATA**. Historical ASGE 2016 drug-specific table; onset 1–2 h, half-life 8.6/9.4/16.9 h in listed renal bands. | Historical table; does not assign a distinct hold duration to the 15–30 vs 30–60 boundary overlaps, and does not establish guidance at CrCl ≤15. Do not infer safety for severe renal dysfunction. |
| [BSG/ESGE Veitch et al. 2021, DOI 10.1136/gutjnl-2021-325184, DOAC section](https://pmc.ncbi.nlm.nih.gov/articles/PMC8355884/) | **Low-risk** endoscopy: omit morning DOAC dose; **high-risk**: last edoxaban dose **3 days before** procedure. The 5-day renal exception is for *dabigatran*, **not edoxaban**. | Low risk: **weak, low-quality**; high risk: **strong, low-quality**. Explicit disagreement with ASGE Table 9 ≥24 h. |
| [APAGE/APSDE 2018, DOI 10.1136/gutjnl-2017-315131, DOAC section/Table 3](https://doi.org/10.1136/gutjnl-2017-315131) | Low-risk diagnostic endoscopy: do **not** routinely omit DOAC; high-risk: edoxaban last dose **48 hours before** if CrCl **>15 mL/min**; no heparin bridging; early resumption after hemostasis. | Distinct regional guidance; not equivalent to BSG/ESGE 3 calendar days or IDEN >48 h. |
| [ACG/CAG 2022, elective endoscopy DOAC Statement 13](https://gi.org/wp-content/uploads/2022/03/ACG-CAG-Guideline.pdf) | Suggest **temporary interruption** of DOACs rather than continuation for elective endoscopy; does not provide edoxaban-specific renal-stratified high-risk interval. | **Conditional, very-low certainty**; duration **NOT ADDRESSED** at edoxaban-agent level. |
| [IDEN 2024, Statements 11–14](https://pmc.ncbi.nlm.nih.gov/articles/PMC11391130/) | Low-risk: omit morning dose; high-risk: withhold DOAC **more than 48 hours**; high-risk restart within **2–3 days once adequate hemostasis secured**. | Source-specific strength/quality must be retained; **>48 h** cannot be silently converted to **≥48 h**. |
| [CHEST 2022, DOI 10.1016/j.chest.2022.07.025](https://doi.org/10.1016/j.chest.2022.07.025) | General perioperative DOAC guidance rather than edoxaban-specific endoscopic therapeutic procedure algorithm; 1–2 days interruption for factor Xa inhibitors in elective surgery/procedures and resumption based on bleeding risk. | Do not override GI-specific therapeutic endoscopy recommendations or extrapolate to renal failure/complex thrombotic indications. |

## Explicit scenario decisions to show clinician

1. **Diagnostic EGD/colonoscopy ± biopsy:** ASGE 2016 low-risk DOAC continuation; BSG/ESGE 2021 omit morning dose; APAGE/APSDE continuation; ACG/CAG 2022 suggests temporary interruption. Display discordance; do not select automatically.
2. **Therapeutic colonoscopy/polypectomy, EMR/ESD, ERCP sphincterotomy, EUS sampling:** assess actual planned high-risk intervention; ASGE Table 9 ≥24 h versus BSG/ESGE last dose 3 days prior versus IDEN >48 h. Exact clock times must reflect once-daily administration and procedure schedule.
3. **Combined EGD + colonoscopy:** use highest anticipated intervention risk; diagnostic-only status cannot be presumed when therapeutic intervention is planned or possible.
4. **CrCl 60, 30, 15 and ≤15:** ASGE Table 9 has overlapping printed intervals at exactly 60 and 30, but both rows specify same ≥24 h. At 15 the 15–30 row and ≤15 row conflict; **fail closed at exactly 15**, requiring clinician interpretation. CrCl below 15 = no data. Do not invent a new renal adjustment.
5. **AF versus VTE, high thrombosis, liver disease, altered absorption, interacting drugs, pregnancy/pediatrics:** source tables do not supply a universal safe plan; require indication-specific clinical assessment. No routine DOAC bridging; do not extrapolate warfarin LMWH bridge pathway.
6. **Resumption:** confirm hemostasis and procedural bleeding risk; BSG/ESGE 2021 discusses restart up to 2–3 days after interruption, individualized; IDEN high-risk 2–3 days after hemostasis. Do not restart on an unconditional fixed clock.
7. **Dual/triple therapy or concomitant aspirin/P2Y12:** do not treat edoxaban monotherapy as equivalent; review each antiplatelet and stent/ACS indication separately.
8. **Anesthesia/institution:** local fasting policy and sedation considerations do not replace society antithrombotic hold recommendations; any neuraxial-specific requirements are separate.

## Mapping and acceptance
Canonical `MED-edoxaban` belongs to `ING-edoxaban` (verify any aliases/combinations from current manifest). Source comparison inheritance must remain ingredient-specific; do not inherit apixaban/rivaroxaban/dabigatran intervals. Required tests: exactly 15/30/60, <15; low/high/unknown-risk; EGD/colonoscopy/combined; once-daily clock boundaries; 24h vs >48h vs three calendar days; negative cross-ingredient inheritance; combination therapy; hemostasis-gated restart.

**This commit does not execute tests.** Keep IN_PROGRESS and do not mark CLINICALLY_REVIEWED or activate patient-facing instructions. Clinician chooses interpretation using linked source passages.

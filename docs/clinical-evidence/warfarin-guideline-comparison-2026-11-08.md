# Warfarin — periendoscopic guideline evidence comparison (2026-11-08)

**Lane A / Bucket 01 / `ING-warfarin` / `MED-warfarin`. Status: IN_PROGRESS; research evidence, not clinician approval or patient-facing hold instructions.**

## Primary-source comparisons

| Source / recommendation strength | Diagnostic low-risk EGD/colonoscopy ± biopsy | High-risk therapeutic endoscopy (e.g., polypectomy, EMR/ESD, sphincterotomy) | Restart / bridging |
|---|---|---|---|
| **ASGE 2016**, DOI [10.1016/j.gie.2015.09.035](https://doi.org/10.1016/j.gie.2015.09.035), **Tables 2, 3, 5, 11, 13; elective anticoagulant recommendations 2–5** | Suggest **continue warfarin** (⊕⊕○○) | Low thrombotic risk: stop **5 days** (Table 2); high thrombotic risk: historical bridging suggestion (⊕⊕○○) | Suggest same-day restart absent ongoing bleeding (⊕⊕○○); historical high-risk bridge suggestion is not a universal current rule. |
| **BSG/ESGE 2021**, DOI [10.1136/gutjnl-2021-325184](https://doi.org/10.1136/gutjnl-2021-325184), *Warfarin and heparin* and **Figure 2** | Continue, provided INR does not exceed therapeutic range (moderate recommendation, low-quality evidence); INR checked within preceding week | Low thrombotic risk: stop **5 days**, check INR **<1.5** before procedure (strong recommendation; high-quality evidence for interruption, low-quality for INR check). High thrombotic risk: stop 5 days and bridge with therapeutic LMWH under guideline pathway (strong recommendation, moderate-quality evidence). | Resume usual warfarin dose on procedure evening; if bridging, final LMWH ≥24 h before procedure, restart LMWH following day until therapeutic INR. |
| **ACG/CAG 2022**, DOI [10.14309/ajg.0000000000001627](https://doi.org/10.14309/ajg.0000000000001627), **elective statements 9–11, 16** | Suggest **continuing warfarin** rather than 1–7 day interruption (conditional; very-low certainty) | Does not establish one mandatory warfarin hold duration for every high-risk intervention; individualize when interruption is chosen | Suggest **against routine bridging** if warfarin interrupted (conditional, low certainty), with possible exception for mechanical heart valves; **insufficient evidence** to recommend same-day vs 1–7-day restart. |
| **CHEST 2022**, DOI [10.1016/j.chest.2022.07.025](https://doi.org/10.1016/j.chest.2022.07.025), perioperative VKA recommendations | Not an endoscopy-specific bleeding-risk classification | General elective-procedure VKA interruption framework; avoid automatically overriding GI-specific guidance | Suggest against heparin bridging in AF patients requiring VKA interruption; assess mechanical valves and VTE indication separately. |

## Clinically material disagreement

**Continuing warfarin vs holding it:** ASGE 2016 and BSG/ESGE 2021 continue for low-risk diagnostic procedures. ACG/CAG 2022 suggests continuation for elective endoscopy more generally, but acknowledges very-low certainty; this does **not** mean every high-risk intervention must proceed at therapeutic INR.

**Bridging:** ASGE 2016 and BSG/ESGE 2021 describe/select bridging in high-thrombotic-risk scenarios; ACG/CAG 2022 generally discourages routine bridging (possible mechanical-valve exception). Show both source-specific paths, with indication, valve type, recent VTE, stroke history and thrombotic-risk rationale. Do not default to bridging or automatically label all AF patients high risk.

**Restart:** ASGE 2016 suggests same-day absent bleeding; BSG/ESGE 2021 provides evening restart; ACG/CAG 2022 reports insufficient evidence to select same-day versus 1–7 days. Do not silently present same-day as unanimous consensus.

## Scenario-specific evidence gates

1. **EGD or colonoscopy with diagnostic biopsy only:** low bleeding risk; verify INR therapeutic and no anticipated high-risk intervention. 
2. **Colonoscopy with possible polypectomy, EMR/ESD, therapeutic EGD, EUS-guided sampling, ERCP with sphincterotomy:** distinguish intervention and bleeding risk before choosing continuation versus interruption. Combined EGD/colonoscopy inherits highest *planned* intervention risk.
3. **Recent VTE / mechanical heart valve / high-risk AF:** thrombotic risk and bridging require prescriber and clinician assessment; the ASGE and BSG/ESGE historical bridge pathway conflicts with ACG/CAG and CHEST routine-bridging discouragement.
4. **INR:** BSG/ESGE low-risk continuation assumes INR within therapeutic range; for high-risk interrupted warfarin, verify **INR <1.5**. Exactly 1.5 does not satisfy the strict threshold. An elevated INR requires assessment, not silent dose conversion.
5. **Renal impairment:** no CrCl-stratified warfarin hold-day table in ASGE 2016; renal function is relevant to any LMWH bridging regimen, not an automatic warfarin day adjustment.
6. **Hepatic impairment, coagulopathy, concomitant aspirin/P2Y12, recent stent/ACS, pregnancy, anesthesia/site policy:** no universal source-derived warfarin clock-time schedule. Document individualized review; preserve antiplatelet and anesthesia requirements as separate inputs.
7. **Resumption:** require postprocedure bleeding/hemostasis evaluation, with source-specific restart comparison; do not assume all patients receive bridging.

## Canonical mapping and test plan

- Provisional inventory currently maps `MED-warfarin` → `ING-warfarin`. Verify that no new warfarin brand, combination, strength or distinct route was added before declaring inheritance complete.
- Required executable tests: low-risk diagnostic continuation; high-risk 5-day pathway; INR 1.49/1.50/1.51; high vs low thrombotic risk; mechanical-valve exception; no routine AF bridge; restart source discordance; renal impairment with and without LMWH; combined EGD/colonoscopy; negative mapping to heparin/DOACs.
- **No tests executed in this evidence commit; do not mark TESTED.** Current status IN_PROGRESS. No patient-facing clinical rules altered.

**Primary source URLs:** [ASGE full guideline](https://www.asge.org/home/resources/publications/guidelines/2016_antithrombotics); [BSG/ESGE 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8390296/); [ACG/CAG 2022](https://gi.org/wp-content/uploads/2022/03/ACG-CAG-Guideline.pdf); [CHEST 2022 DOI](https://doi.org/10.1016/j.chest.2022.07.025).

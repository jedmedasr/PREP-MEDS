# Apixaban — source-specific time semantics and unresolved decision cases (2026-11-08)

**Research-only, IN_PROGRESS.** This supplement records implementation-ready *non-equivalence* assertions. It does not authorize patient instructions or clinician approval. Earlier scenario matrix: `docs/clinical-evidence/apixaban-scenario-adjudication-2026-11-08.md`. Do not replace the existing evidence ledger.

## Source-specific interpretation (do not collapse into a consensus interval)

| Source and exact locator | Source rule | Time semantics | Validation assertion |
| --- | --- | --- | --- |
| ASGE 2016, Acosta et al., *GIE* 83:3–16, DOI https://doi.org/10.1016/j.gie.2015.09.035, Table 7 | Apixaban high-risk: CrCl >60: 1–2 days; 30–59: 3 days; 15–29: 4 days | Table ranges in days; no unique clock time specified | At CrCl exactly 60 or fractional gaps 59–60 / 29–30, report UNASSIGNED rather than interpolate; do not convert 1–2 days into one timestamp. |
| ACG/CAG 2022, Abraham et al., DOI https://doi.org/10.14309/ajg.0000000000001627, elective Statement 13 and Statement 17 | Suggest temporary DOAC interruption; cannot recommend same-day versus 1–7-day restart | No apixaban-specific fixed last-dose or restart time | Display NOT SPECIFIED rather than borrowing another guideline's hours. |
| BSG/ESGE 2021, Veitch et al., DOI https://doi.org/10.1136/gutjnl-2021-325184, DOAC section | Low-risk: omit morning dose; high-risk: last dose 3 days before; restart up to 2–3 days individualized | Calendar-day last-dose instruction; not automatically 72 elapsed hours | Require procedure date, usual dosing time, and pathway selection; do not silently calculate 72 hours. |
| IDEN 2024, https://pmc.ncbi.nlm.nih.gov/articles/PMC11391130/, Statements 11–14 | High-risk: withhold >48 h; restart within 2–3 days after hemostasis | Strictly greater than 48 elapsed hours | A candidate exactly 48 h prior does NOT satisfy >48 h. |
| CHEST 2022, Douketis et al., DOI https://doi.org/10.1016/j.chest.2022.07.025, Recommendation 22 | Apixaban 1–2-day interruption suggested (conditional, very-low certainty); procedural risk modifies | Day-off framework; not interchangeable with exact elapsed-hour label minimum | Preserve recommendation strength and distinguish perioperative from endoscopy-specific evidence. |
| 2023 ACC/AHA/ACCP/HRS AF guideline, DOI https://doi.org/10.1016/j.jacc.2023.08.017, Table 18 | For apixaban AF and CrCl >25: 1 full day before low risk, 2 full days before high risk, plus omit procedure-day dose | Full days without doses, not elapsed 24/48 h | Exactly CrCl 25 is outside Table 18 applicability; do not apply to pediatric VTE. |
| FDA ELIQUIS US label, 2025, https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/202155Orig1s039%2Cs040lbl.pdf, §2.4 | At least 24 h before low-risk and at least 48 h before moderate/high-risk elective invasive procedures; restart once adequate hemostasis established | Inclusive minimum elapsed hours | Exactly 48 h meets the *label minimum* but not IDEN's >48 h. Label minimum does not establish endoscopy-specific optimal interruption. |

**Label provenance discrepancy requiring resolution:** the companion matrix also cites https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/220073s000lbl.pdf (April 2025), a different application number. Confirm which application/presentation and label revision governs each adult tablet, pediatric sprinkle, oral suspension, and crushed/NG scenario before setting TESTED. A matching drug name or year alone does not establish identical formulation labeling or the latest revision. Capture the FDA section and application number for every formulation group. **This is a blocker, not a license to choose one label silently.**

## Negative clinical cases for regression and clinician review

1. Adult apixaban BID, diagnostic EGD ± biopsy, no planned therapy: ASGE continuation versus BSG/ESGE omit morning dose versus ACG/CAG temporary interruption; output must show **CONFLICT**, not an automatically selected hold.
2. Colonoscopy scheduled for 08:00 with possible high-risk polypectomy: do not infer low-risk from the word 'colonoscopy'; require anticipated intervention risk.
3. Combined EGD/colonoscopy with unspecified intervention: **RISK_UNSPECIFIED**, no last-dose timestamp.
4. High-risk intervention with CrCl 60.0, 59.5, 29.5 or <15 mL/min: **ASGE_UNASSIGNED**, no interpolation; CrCl 59 and 29 are distinct explicitly printed rows.
5. AF patient CrCl 25.0 mL/min: **ACC_TABLE18_NOT_APPLICABLE**; no extrapolation from >25.
6. Candidate last dose exactly 48 h before high-risk procedure: FDA 2025 label minimum met, IDEN 2024 >48 h not met. Record discordance, not a common PASS.
7. Unknown hemostasis or delayed post-EMR bleeding: **RESTART_UNDETERMINED**, regardless of time elapsed.
8. Pediatric oral suspension or sprinkle, tube administration, severe hepatic impairment, strong CYP3A4/P-gp interactions, recent VTE, or concomitant DAPT: require regimen-specific clinical review; no adult uncomplicated AF inheritance.

## Review-state and mapping disposition

- Clinical ingredient: `ING-apixaban`; known canonical `MED-apixaban` remains **formulation unspecified**. Ingredient membership is not proof of route/strength/formulation equivalence.
- ASGE 2016 pediatric formulation/tube-specific guidance: **NOT ADDRESSED** (not a finding that all pediatric patients follow adult hold intervals).
- Group status: **IN_PROGRESS**, not TESTED. All mapped IDs remain provisional until a complete deterministic mapping and source-linked inheritance tests pass.
- Open blockers: label application/formulation reconciliation; exact source passage verification; clinical evidence tests execution; last-dose calendar/clock semantics; renal fractional boundaries; clinical risk/indication exceptions. Clinician must verify the exact primary passage when selecting authenticated **Mark Reviewed** on a specific evidence revision; links alone do not approve or activate rules.

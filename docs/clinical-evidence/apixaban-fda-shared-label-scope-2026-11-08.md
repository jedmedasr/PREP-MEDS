# Apixaban — FDA 2025 cross-application label-content correction (2026-11-08)

**Status IN_PROGRESS; research-only; no patient-facing rules.** This corrects a potentially misleading inference in prior provenance notes: an FDA application number on the PDF URL does **not** mean the PDF text covers only that application's dosage form.

## Directly inspected primary source PDFs (2026-11-08)
1. FDA April 2025 labeling, URL under NDA 220073: https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/220073s000lbl.pdf — **PDF page 1, Highlights; §§1.1–1.6, 2.1–2.7, 3**. The document explicitly lists **ELIQUIS tablets**, **ELIQUIS tablets for oral suspension**, **ELIQUIS SPRINKLE for oral suspension**, including strengths 2.5/5 mg, 0.5 mg and 0.15 mg respectively. Reference ID 5574261.
2. FDA April 2025 labeling, URL under NDA 202155: https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/202155Orig1s039,s040lbl.pdf — **PDF page 1, Highlights; §§1.1–1.6, 2.1–2.7, 3**. This **also explicitly lists all three presentations** with the same strengths and adult/pediatric indications. Reference ID 5574235.

**Correction to earlier inference:** The 220073 PDF is *not* pediatric-only in its text, and the 202155 PDF is *not* adult-only in its text. Application-level approval provenance and *scope of the prescribing-information document* are distinct dimensions. The different reference IDs are not proof of different perioperative recommendations. Do not fail a source-coverage test merely because a 220073 PDF supplies the shared §2.4 text; equally, do not infer regulatory equivalence of separate dosage forms from the shared text.

## Evidence comparison and risk boundary
- **FDA April 2025, §2.4:** The same shared label describes temporary interruption before surgery/other interventions; distinguish the label's >=24 h low-risk and >=48 h moderate/high-risk minimums from **IDEN 2024 Statement 13 >48 h** and **ASGE 2016 Table 7** CrCl-dependent historical high-risk intervals. These are distinct clinical source rules, not interchangeable defaults.
- **ASGE 2016**, DOI https://doi.org/10.1016/j.gie.2015.09.035, Table 7: adult-era high-risk apixaban CrCl >60 = 1–2 days; 30–59 = 3 days; 15–29 = 4 days; no pediatric VTE/formulation-specific recommendation (**NOT ADDRESSED**). Historical table is not a pediatric dosing authorization.
- **FDA April 2025, §1.6 and §2.2:** Pediatric VTE treatment/recurrent VTE prevention begins after at least five days of initial anticoagulant treatment; weight-based pediatric dosing must not inherit adult AF regimen. §2.7 addresses administration options, not an endoscopic interruption algorithm.
- **FDA April 2025, boxed warning/§5.3:** Neuraxial hematoma precautions are distinct from routine sedated EGD/colonoscopy; do not apply neuraxial timing automatically to standard endoscopy.
- **ACG/CAG 2022 Statement 13** suggests interruption, conditional/very-low certainty, but does not resolve pediatric formulation-specific endoscopy timing.

## Corrected mapping assertions for future executable tests
1. Source document coverage: **both** April 2025 PDF texts mention all three dosage presentations; URL NDA number alone must not determine text coverage.
2. Regulatory provenance: retain NDA 202155 versus 220073 association separately from label-document scope; no inferred approval interchangeability.
3. Adult tablets, crushed/tube administration, pediatric tablet for suspension and pediatric sprinkle require separately adjudicated *clinical* delivery groups even when they share a label document.
4. For each group, retain ASGE historical comparator or explicit pediatric **NOT ADDRESSED** determination; no automatic adult AF-to-pediatric VTE inheritance.
5. Reject cross-agent apixaban-to-rivaroxaban/dabigatran inheritance and any automatic hold/restart when procedure bleeding risk or hemostasis is unknown.

**Unresolved:** FDA label revisions later than April 2025 not exhaustively excluded; complete canonical-ID formulation mapping and executed evidence tests outstanding. This is source-extraction evidence only, not TESTED or CLINICALLY_REVIEWED. Clinician verifies linked primary passages when marking the exact evidence revision reviewed.

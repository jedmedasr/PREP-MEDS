# Terminology content

This directory will hold versioned, reviewed medication terminology datasets used by PREP-MEDS.

## Rules
- No real patient data belongs here.
- Do not invent RxNorm/RxCUI, NDC, or other external terminology identifiers.
- External terminology data must record its authoritative source and source version.
- PREP-MEDS medication and ingredient IDs remain stable internal identifiers.
- Brand names, aliases, abbreviations, and misspellings are search metadata; they do not replace normalized ingredient identity.
- Combination products must list every active ingredient represented by the product record.
- A newly discovered external product must be ingested and validated before clinical rules can depend on it.
- Terminology updates are versioned; prior datasets used by historical DecisionEvents must remain reconstructable.

Stage 3 does not include a production formulary. Medication examples in unit tests exist solely to validate identity/search behavior and contain no clinical management recommendations.

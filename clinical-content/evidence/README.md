# Clinical Evidence Content

This directory is reserved for governed PREP-MEDS evidence artifacts.

## Rules
- Do not commit real patient PHI.
- Do not add a medication-management recommendation without an exact supporting source/version.
- Do not treat a retrieved guideline/PDF as clinically adopted merely because it exists in this repository.
- New evidence enters as `DRAFT` and requires accountable review before becoming `CURRENT`.
- National evidence, local policy, and clinical rules are separate artifacts.
- Source documents should be referenced by stable metadata and permitted storage/linking strategy; do not duplicate copyrighted full text unless licensing/permissions allow it.
- EvidenceAtoms should contain concise paraphrased claims, exact provenance/locators, limitations, and applicability metadata.
- Material evidence conflicts must remain explicit.

## Planned structure

```text
clinical-content/evidence/
├── sources/            # source metadata records; raw-document storage strategy defined separately
├── atoms/              # curated evidence atoms
├── conflicts/          # explicit reviewed conflict records
├── examples/           # synthetic fixtures only
└── README.md
```

Medication-specific evidence population occurs in the Stage 6 knowledge build-out workflow. Stage 4 establishes the data model and governance machinery only.

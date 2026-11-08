# Lane B: even-bucket evidence delivery

Authoritative allocation: docs/parallel-clinical-buckets-2026-11-08.md at f2b9aec3aa45811674a69754059eb6d2b37d46d9. Own buckets 02,04,...,24 only (113 provisional ingredient groups). Begin Bucket 02, then numerical order. Target ten distinct completed groups per execution; never count aliases or documents.

Pipeline: CLAIM -> EXTRACT -> RECONCILE -> MAP -> TEST -> VERIFY -> COMMIT -> NEXT. A source package is ready for clinician review only after source-linked recommendation completeness, exact formulation/canonical mapping, actual scenario tests and committed revision verification. No patient activation; the supervising clinician alone approves clinical evidence. FDA labeling is not the hold-duration authority or a prerequisite.

Reuse the shared scripts/validate-medication-evidence.mjs acceptance gate added by Lane A at c159c82859fc174b958e100db91a2ce435bb0e47. Lane B will publish packages at docs/medication-evidence/groups/<ingredient-set>.json using that contract. Do not create a competing shared queue. Lane-specific tests/workflow and checkpoint receipts are supplementary evidence, not an alternative assignment system.

Previous Lane B execution: PARTIAL. Allocation read; an unreferenced tree was prepared but no clinical group was committed or tested. Resume CLAIM/EXTRACT for Bucket 02. Initial capture workflow is not clinical completion.

# Clinical knowledge graph: bounded, reusable complex-case pathways

## Design recorded before implementation (2026-11-07)

Live inspection: main `4157f497e7b0ff37f428a44e5caeb2c815544a87`; PR #42 `513adb6ac36a768b64f33e03f42cc27abf82ba6a`; PR #40 `6f4e47a955563ba0f95eca802efff98b747998f8`; PR #41 `33eef042389e623f9eb1d2b0b1ca179edd5f9110`. All three feature PRs remain open. PR #37 was observed read-only at `2b645eb8011e552ff626312e03af770d98bd5f69` and may continue changing externally. This work must not modify its branch, automation or medication recommendations.

## Reuse versus gaps

Reuse existing SourceDocument/EvidenceAtom and immutable references, canonical terminology, the deterministic clinical engine and its unknown-input semantics, application quality workflow, Stage 1 engineering graph, and PR #42 hash/version/source-observation utilities. Stack this branch on #42 rather than copy or merge its work. PR #41 remains an independent orchestration proposal; clinical lookup must not depend on its live GitHub polling.

Missing: versioned complex scenarios, exact passage-to-claim-to-branch relationships, explicit completeness/currency state, reverse impact indexes, a bounded deterministic scenario evaluator, role-specific comparison, privacy-preserving gap prioritization, and authentic-source execution evidence. No independent live clinical AI verifier is available through the currently connected tools; mechanical source extraction must not be mislabeled as independent clinical semantic verification.

## Minimal schema

Use versioned JSON and typed code, not a graph database. Nodes are SourceRevision (society, title, publication, URL, raw hash, currency), Passage (source revision, page/table/section, bounded quotation, context hash), Claim (structured action, eligibility, time anchor/unit, strength/certainty, exceptions, passage references, verification level), Pathway (scenario variables and branch references), MedicationMapping (existing canonical IDs, ingredients, formulation and terminology revision), and VerificationReceipt (executed method, artifact/input/output hashes and limitations). Edges support claim, use claim, map identity, supersede version and maintain via engineering task. InstitutionalPolicy and EpisodeDecision are separate artifacts, never implicit authority on a source claim. PHI and real decisions never enter GitHub.

The engineering graph manages implementation, validation and maintenance. It does not contain patient decisions or confer clinical verification. A source change deterministically emits affected claim/pathway/medication IDs and a deduplicated engineering work proposal; it does not mark work complete or silently activate guidance.

## First vertical slice

Recent DVT/PE in a DOAC-treated adult referred for elective EGD/colonoscopy. Compare BSG/ESGE 2021 with ACG/CAG 2022 at precise primary-source locations. Preserve the distinction between the VTE event date and the start of anticoagulant treatment. Calculate three calendar months, not 90 days, and treat the exact boundary as requiring physician interpretation. This is a deferral/escalation comparison, not a medication-withholding or bridging prescription. Urgent bleeding, unclear procedure risk, unknown dates, interrupted treatment, combinations and unsupported formulations must not reach a routine instruction.

References to inspect: https://www.esge.com/assets/downloads/pdfs/guidelines/2021_a_1547_2282.pdf and https://gi.org/wp-content/uploads/2022/03/ACG-CAG-Guideline.pdf . Exact versions, pages and extraction evidence must be recorded after retrieval. Check society indexes for possible updates; a successful fetch is not proof of currentness.

## Initial library priority

Seed nine parameterized scenario specifications, but implement only the selected slice. Priorities are engineering planning judgments, not measured prevalence estimates. P0: recent VTE (first: clear bounded applicability), coronary stent/DAPT, severe renal impairment with anticoagulation, multiple antithrombotics. P1: mechanical valves, recent stroke/TIA, high-risk AF, insulin during bowel preparation, GLP-1 aspiration risk. Frequency starts UNKNOWN until governed aggregate observations exist. Each specification includes variables, contraindication/eligibility questions, coordination and evidence gaps; a specification is not a verified recommendation.

## Acceptance and expansion gate

1. Separate clinical and engineering graph schemas; unique immutable IDs, no dangling references/cycles, exact canonical mappings.
2. Acquire authentic primary PDFs; reproduce located source passages with two independently implemented readers; record method and limits. Do not call these readers independent clinical AI agents.
3. Preserve source-specific scope and conflicts; fail closed on missing or stale evidence and unsupported inputs.
4. Deterministic date boundaries, negative tests, identity/formulation tests and no AI/network calls during case evaluation.
5. Medical-assistant view never selects complex antithrombotic management; physician view exposes exact sources and explicit selection. Real institutional-policy authorization and identity remain separate.
6. Unknown cases produce de-identified, deduplicated research requests, not generated trusted rules. Repetition never promotes evidence.
7. Source revisions invalidate dependent current guidance without deleting history; rollback cannot relabel a superseded source as current.
8. Full application, graph, schema, source-check and focused regression CI pass. Preserve exact SHAs and executed receipts. No production activation and no merges of existing PRs.
9. Expand only after an independent source-semantic verification interface and the selected pathway's acceptance conditions are genuinely satisfied. Missing clinical AI execution must remain an explicit blocker, not fabricated Agent B evidence.

## Failure modes and cost controls

Key hazards: two agreeing agents sharing an error; copied text without entailment; detached footnotes; class-to-formulation extrapolation; calendar-month/day confusion; treating a recent-VTE exception as a generic hold rule; client-supplied role becoming authorization; stale evidence after a changed guideline; telemetry leaking dates or patient details; repeated research on unchanged sources; treating an old guideline as superseded solely because it is old.

Use strict schemas, precise source locations, bounded quotes, separate verification levels, server-side gates, explicit unknowns, immutable manifests, digest-bound receipts and enumerated aggregate counters. Reuse monthly/six-month surveillance rather than add another continuous job. No model service, new subscription, graph database, vector store or queue. First version is a synthetic-case research workspace grounded in real documents, not a clinically deployed protocol.

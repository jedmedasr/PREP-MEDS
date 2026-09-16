# Medication Terminology and Search Architecture

## Purpose
Stage 3 implements a deterministic medication identity layer between raw user/EHR text and the clinical ontology. The clinical engine must never consume an unnormalized free-text medication string when a PREP-MEDS medication identity is required.

## Responsibilities
The terminology layer:
- normalizes punctuation, case, accents, and whitespace;
- searches canonical names, generic names, brands, aliases, and external terminology codes;
- supports minor misspellings through deterministic edit-distance matching;
- returns ranked candidates with match provenance;
- distinguishes `RESOLVED`, `AMBIGUOUS`, and `NOT_FOUND` states;
- decomposes combination products into all normalized active ingredient IDs;
- validates terminology datasets before indexing;
- provides a transport-neutral RxNorm integration seam;
- preserves PREP-MEDS IDs separately from external terminology identifiers.

It does **not**:
- decide medication holds/continuation;
- infer indication or clinical history;
- retrieve clinical evidence;
- promote an externally discovered medication directly into production identity;
- silently convert ambiguity into a resolved medication.

## Deterministic ranking
Current ranking priority:
1. exact external code;
2. exact canonical/generic/brand/alias text;
3. prefix match;
4. complete token match;
5. bounded Levenshtein fuzzy match.

Ranking is stable: score descending, then canonical name, then medication ID. Search behavior must remain regression tested when scoring changes.

## Resolution behavior
An exact match can resolve automatically. A strong non-exact match can resolve only when it meets the configured confidence threshold and has a sufficient margin over the next candidate. Otherwise the result is `AMBIGUOUS`.

The terminology layer never assumes that the absence of a second candidate proves correctness; confidence rules are explicit and testable.

## Combination products
`MedicationRecord.ingredientIds` is authoritative for decomposition. A combination product is not treated as a single opaque clinical entity. Future clinical logic can therefore evaluate each ingredient's relevant pathway and resolve conflicts using the clinical engine's safety rules.

## RxNorm integration
`RxNormClient` defines the production integration seam, but Stage 3 intentionally makes no network calls and does not hard-code or fabricate RxCUIs.

Future ingestion should:
1. retrieve authoritative RxNorm release data or use an approved NLM service;
2. map normalized concepts to PREP-MEDS medication/ingredient IDs;
3. preserve RxCUI plus source/version metadata;
4. validate mappings;
5. version the terminology dataset;
6. require review before previously unknown products become clinically usable.

External terminology identifiers remain attributes, not PREP-MEDS primary keys.

## Data provenance
Each production terminology dataset should record:
- dataset version;
- generation timestamp;
- upstream terminology source and version;
- mapping method;
- validation status;
- superseded dataset version when applicable.

Stage 3's TypeScript dataset interface contains version/timestamp now; the richer ingestion manifest belongs in a later data-ingestion implementation.

## Clinical-engine contract
Downstream clinical logic should receive:
- PREP-MEDS `medicationId`;
- normalized `ingredientIds[]`;
- external identifiers when relevant;
- resolution status and match provenance.

If medication resolution is `AMBIGUOUS` or `NOT_FOUND`, the clinical engine must not issue a routine care-changing recommendation.

## Search/RAG separation
Medication terminology search is deterministic identity resolution. RAG is semantic evidence retrieval. They may share aliases and terminology metadata, but RAG retrieval must not be used as the authoritative medication identity resolver for care-changing rules.

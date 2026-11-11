# PREP-MEDS data formats

Three JSON formats cross the database boundary: the evidence package a worker submits, the
inventory payload CI syncs, and the payloads the owner uses to define domains and assign groups.

## 1. Evidence package (schema_version 1)

One package covers one review group. It is submitted with `submit_package` (or the relay op
`submit`). The database either stores it as the next revision or returns every deficiency.

```
{
  "schema_version": 1,
  "group_id": "<the claimed group>",
  "based_on_revision_no": <from the brief; 0 for a first package>,
  "medication_ids": ["<exactly the canonical IDs mapped to the group>"],
  "formulation": {"decision": "single_unit", "rationale": "..."},
  "sources": [{"source_id": "...", "kind": "...", "society": "...", "title": "...",
               "publication_date": "YYYY-MM-DD", "version_label": "...", "doi": "...", "url": "https://..."}],
  "passages": [{"key": "p1", "source_id": "...", "locator": "...", "page": "...",
                "deep_link": "https://...", "quote": "..."}],
  "comparisons": [{"source_id": "...", "status": "...", "checked_locators": "...", "note": "..."}],
  "recommendations": [{"source_id": "...", "passage": "p1", "scenario_key": "...", "qualifier": "",
                       "renal": null, "action": "...", "hold": {"min": 0, "max": 0, "unit": "days"},
                       "timing_text": "...", "resume": {"min": 0, "max": 0, "unit": "hours"},
                       "resume_text": "...", "bridging": "not_specified", "strength": "...",
                       "certainty": "...", "applicability": "...", "exceptions": "...", "summary": "..."}],
  "scenario_coverage": [{"scenario_key": "...", "status": "...", "reason": "..."}],
  "conflicts": [{"scenario_key": "...", "source_ids": ["...", "..."], "description": "..."}],
  "boundary_notes": [{"source_id": "...", "scenario_key": "...", "qualifier": "", "note": "..."}],
  "components": [{"group_id": "...", "revision_no": 1}],
  "ingredient_coverage": [{"ingredient_id": "...", "covered_by": "own_recommendations"}],
  "open_questions": [{"text": "...", "blocking": false}],
  "editorial": {"notes": "..."}
}
```

A package the test suite accepts is in `example_package_synthetic.json` (synthetic content).

### Field rules

| Field | Rule |
| --- | --- |
| `medication_ids` | Exactly the active canonical IDs mapped to the group. One missing or extra ID rejects the package. |
| `formulation.decision` | `single_unit` or `split_required`. `split_required` is never accepted: call `propose_split`. |
| `formulation.rationale` | 40 or more characters when the group has more than one product and the products differ in route, dose form or release, or the inventory does not record those fields. |
| `sources[]` | Only sources the database does not have. `source_id` in capitals, 4 or more characters. `kind`: `society_guideline`, `consensus_statement`, `regulatory_label`, `review`, `institutional_policy`. `url` starts with `https://`. A DOI can be registered once. Sources and passages are kept even when the package is rejected. |
| `passages[]` | `quote` is verbatim, 12 to 600 characters after whitespace is collapsed. `deep_link` starts with `https://`. An identical passage (same source, locator and quote) is reused, not duplicated. |
| `comparisons[]` | One per required source and per other source cited. `status`: `COMPARED`, `NOT_ADDRESSED`, `NOT_SPECIFIED`. The last two need `checked_locators` of 10 or more characters. |
| `recommendations[].passage` | A key from `passages[]`, or the number of an existing `passage_id`. The passage must belong to the same source. |
| `recommendations[].action` | `continue`, `hold`, `adjust_dose`, `switch`, `individualize`, `no_specific_recommendation`. `hold` needs `hold {min, max, unit}` or `timing_text` of 5 or more characters. |
| `hold`, `resume` | `min`, `max` and `unit` together; `max >= min >= 0`; `unit`: `hours`, `days`, `weeks`, `doses`. |
| `renal` | `null`, or `{"measure": "crcl_ml_min" or "egfr_ml_min_1_73m2", "min", "max", "min_inclusive" (default true), "max_inclusive" (default false)}`. Omit `min` or `max` for an open end. Bands of one source, scenario and qualifier may not overlap. A gap needs a `boundary_notes` entry. |
| `bridging` | `recommended`, `not_recommended`, `conditional`, `not_specified` (default), `not_applicable`. |
| `strength`, `certainty` | Free text as the source states it. Default `not_stated`. |
| `summary` | 10 or more characters. |
| `scenario_coverage[]` | One per required scenario and per scenario used. `status`: `ADDRESSED`, `NOT_APPLICABLE`, `NO_SOURCE_GUIDANCE`. The last two need a `reason` of 10 or more characters. |
| `conflicts[]` | Needed when sources give different recommendations for one scenario. `source_ids` has two or more entries and the entries for a scenario must together name every source involved. `description` 10 or more characters. |
| `components[]` | Combination groups only. Pins the current revision of a standalone group for each ingredient that has one. |
| `ingredient_coverage[]` | Combination groups only. Lists each ingredient that has no standalone group and is covered in this package. |
| `open_questions[]` | `blocking: true` keeps the group from being ready for clinician review. |
| `editorial` | Not part of the content hash. |

### What the content hash covers

The hash identifies a revision for testing, review and release. It is computed by the database
from the stored rows: group, formulation decision and rationale, medication IDs, comparisons,
recommendations (with each passage's locator and quote hash), scenario coverage, conflicts,
boundary notes, pinned components, ingredient coverage and blocking questions. Editorial notes
and non-blocking questions are not part of it.

### Deficiency codes

`MAPPING_MISMATCH`, `FORMULATION_DECISION_MISSING`, `FORMULATION_RATIONALE_REQUIRED`,
`SPLIT_REQUIRED`, `MISSING_COMPARISON`, `COMPARED_WITHOUT_RECOMMENDATION`,
`COMPARISON_CONTRADICTION`, `NO_SOCIETY_SOURCE_CHECKED`, `ABSENCE_NEEDS_TWO_SOCIETY_SOURCES`,
`MISSING_SCENARIO`, `ADDRESSED_WITHOUT_RECOMMENDATION`, `SCENARIO_CONTRADICTION`,
`SCENARIO_COVERAGE_MISSING`, `UNDECLARED_CONFLICT`, `CONFLICT_WITHOUT_RECOMMENDATION`,
`RENAL_BAND_OVERLAP`, `RENAL_BAND_GAP`, `RENAL_MIXED`, `COMPONENT_NOT_PINNED`, `COMPONENT_STALE`,
`INGREDIENT_UNACCOUNTED`, `COMPONENTS_NOT_ALLOWED`, `PASSAGE_FAILED_VERIFICATION`, and
row-level messages prefixed `SOURCE[...]`, `PASSAGE[...]`, `MEDICATION[...]`, `COMPARISON[...]`,
`RECOMMENDATION[n]`, `SCENARIO[...]`, `CONFLICT[...]`, `BOUNDARY_NOTE[...]`, `COMPONENT[...]`,
`INGREDIENT_COVERAGE[...]`.

Errors raised instead of a deficiency list: `PREPMEDS_BAD_PACKAGE`, `PREPMEDS_STALE_BASE`,
`PREPMEDS_NOT_CLAIM_HOLDER`, `PREPMEDS_SESSION_NOT_CURRENT`, `PREPMEDS_LANE_VIOLATION`,
`PREPMEDS_BAD_WORKER_TOKEN`.

### Splitting a group

`propose_split(p_token, p_session_id, p_task_id, p_claim_token, p_parts, p_rationale)` with

```
p_parts = [{"suffix": "oral", "medication_ids": ["..."]}, {"suffix": "injection", "medication_ids": ["..."]}]
```

At least two parts; every mapped canonical ID exactly once; `suffix` of 2 to 30 lowercase
letters, digits or hyphens; rationale of 40 or more characters. Child groups are named
`<parent>|<suffix>`, stay in the parent's bucket and lane, and each get a task. The parent is
retired.

### Saved progress

`save_progress` takes any JSON object. Suggested shape:

```
{"sources_read": [{"source_id": "...", "status": "..."}],
 "passages": [{"source_id": "...", "locator": "...", "quote": "..."}],
 "decisions": ["..."], "remaining": ["..."]}
```

## 2. Inventory payload (`ci_sync_inventory`)

```
{"medications": [{"medicationId": "MED-...", "canonicalName": "...", "genericName": "...",
                  "route": "...", "dosageForm": "...", "releaseType": "...",
                  "strengths": ["..."], "brandNames": ["..."], "aliases": ["..."],
                  "ingredientIds": ["ING-..."], "ingredientSetKey": "ING-a+ING-b"}],
 "ingredients": [{"ingredientId": "ING-...", "name": "..."}]}
```

- `medicationId` unique; `ingredientIds` not empty.
- `ingredientSetKey` is optional. If present it must equal the ingredient IDs sorted in byte
  order and joined with `+`; that string is the review group ID.
- The payload is the complete inventory. A medication absent from it is deactivated.
- The call is idempotent per commit SHA and payload.
- A medication whose ingredient set matches a retired (split) group is reported under
  `needs_placement` and is not placed automatically.

## 3. Owner payloads

```
select prepmeds.admin_register_source('{"source_id": "SOCIETY-YEAR-TOPIC", "kind": "society_guideline",
  "society": "...", "title": "...", "publication_date": "YYYY-MM-DD", "version_label": "...",
  "doi": "...", "url": "https://..."}'::jsonb);

select prepmeds.admin_upsert_domain('{"domain_key": "antithrombotic", "label": "...",
  "scenarios": [{"scenario_key": "...", "label": "...", "description": "...", "required": true}],
  "required_sources": ["SOCIETY-YEAR-TOPIC"]}'::jsonb);

select prepmeds.admin_assign_groups('[{"group_id": "ING-...", "bucket": 1,
  "domain_key": "antithrombotic", "class_key": "doac"}]'::jsonb, '<reason, needed to move a bucket>');
```

A source of kind `regulatory_label` cannot be a required source. Giving `required_sources`
pins the domain's comparators; without it, a package needs at least one society source compared,
or two checked when none addresses the drug.

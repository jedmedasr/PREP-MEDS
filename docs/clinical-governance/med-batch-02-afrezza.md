# Batch 02: Afrezza identity increment

Status: implemented for shadow review; engineering verification is recorded against the exact commit in the checkpoint file and PR #12. This document does not grant clinical approval.

## Scope

Add four searchable concepts: Afrezza with unspecified cartridge strength and its 4-, 8- and 12-unit cartridge label strengths. The previous generic inhaled-human-insulin concept remains unspecified and no longer carries the Afrezza brand alias. The assembled catalog has 56 concepts and 28 source-linked identities, not 56 fully verified products or approved medication instructions.

Cartridge label strength is represented as `AFREZZA_LABEL_UNITS_PER_CARTRIDGE`, never `units/mL`. The medication-name resolver requires explicit cartridge wording. A bare numeric dose such as `Afrezza 16 units` is not a single-product identity; declining automatic resolution does not assert that the prescribed dose is invalid. A titration-pack query identifies only the product family and cannot choose a cartridge or dose. No pack is decomposed into independently prescribed medications.

## Verified provenance

Manufacturer: MannKind Corporation, DailyMed SETID `29f4637b-e204-425b-b89c-7238008d8c10`, SPL version 17, effective 2026-05-30; document `51ca8d95-025a-6342-e063-6294a90a94ee`, prescribing information revised May 2026. Source: https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=29f4637b-e204-425b-b89c-7238008d8c10

Selected locators: sections 3, 11.1 and 16 for cartridge identity; sections 2.2 and 11.2 for route/device; boxed warning, sections 1, 2.3, 4 and 5.1, and Medication Guide for safety-review context. One DRAFT source and three DESCRIPTIVE, NOT_GRADED atoms are appended to the earlier bundle without rewriting it. Older indexed labels and unrelated Sanofi/legacy records were not used in place of the verified manufacturer version.

The selected label includes pediatric labeling introduced in May 2026. This is recorded as provenance context, not authorization to expand the endoscopy workflow to children. No efficacy claim, starting dose, dose-conversion table or clinical prescribing instruction is encoded.

## Boundaries

- Four concepts still contain one route-specific ingredient, `ING-inhaled-human-insulin`. This local identifier is not a fabricated RxNorm identifier.
- Oral inhalation is descriptive product metadata, not a swallowed tablet, injectable concentration or pump compatibility assertion.
- The label's chronic-lung-disease contraindication, smoking limitation and type-1 basal-insulin requirement are retained for clinical review. Complete contraindication screening is not implemented by this identity increment.
- Human confirmation of product, cartridge strength, prescription and regimen remains necessary. Brand or strength recognition never authenticates a patient's prescription.
- Insulin workflow version 4 remains unchanged and review-only. No hold, restart, dose, cartridge-selection, substitution or device-setting instructions are generated.
- Production rule/policy arrays and the finalized shadow patient-output block are unchanged. No main merge or clinical activation is authorized.

## Verification and continuation

The new tests cover explicit cartridge aliases, missing strengths, generic/brand ambiguity at display limits 1 and 10, dose-vs-cartridge and units/mL mismatches, extra numeric/route text, immutable historical bundles, exact source/version references, all three procedure contexts, type-1 safeguards and unknown/conflicting inputs. The existing full-catalog question and production-isolation tests now cover 56 concepts.

After the exact-head quality workflow succeeds, record `B_AFREZZA_PRODUCT_IDENTITY_01` COMPLETE and resume the remaining Apidra/glulisine, NovoLog/aspart and Levemir/detemir identity work. Humalog SPL 86 refresh, oral release variants and final whole-regimen/malformed-input audits remain open. Do not restart completed human-insulin, named-product or Afrezza work without a documented invalidating finding.

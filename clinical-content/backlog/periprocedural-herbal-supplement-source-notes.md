# Bounded periprocedural herbal-supplement source notes

Status: `DRAFT` / `REVIEW_REQUIRED`. This inventory provides ingredient-level recognition and review routing only. It does not authenticate brands, extracts, plant parts, purity, potency, mixtures, doses, availability, or substitution and does not encode interruption or restart timing.

## Included bounded set

- Garlic and ginkgo: NCCIH bleeding and anticoagulant/antiplatelet interaction context.
- Asian ginseng: NCCIH clotting, glucose, and medication-interaction context.
- St. John's wort: NCCIH documents numerous clinically important drug interactions and serious serotonin-related interaction potential.
- Valerian: NCCIH sedation, sedative/alcohol interaction, and possible abrupt-cessation symptoms after chronic use.
- Kava: NCCIH sedative interactions and rare serious hepatic-injury context.

## Deliberate exclusions

- Proprietary blends and nonspecific `herbal supplement` inputs remain unresolved because ingredient composition cannot be inferred.
- Routine allergy products and broad low-impact supplement expansion remain outside MVP.
- Fish-oil supplements were not added to this special-handling cluster: randomized-trial meta-analysis did not show increased overall bleeding with omega-3 PUFAs, while high-dose purified EPA had a small signal that cannot be generalized to unspecified fish-oil products. This distinction remains outside an ingredient-level herbal rule and should not be converted into autonomous instructions.

## Governance boundary

All six identities route to `CLINICIAN_REVIEW_REQUIRED` for EGD, colonoscopy, and combined procedures. Bleeding risk, sedation burden, chronic-use or withdrawal context, hepatic status, glucose context, interacting medicines, procedure risk, and local policy require accountable clinician, pharmacy, anesthesia, and procedural-team review. No continuation, interruption, taper, restart, hold interval, substitution, dosing, anesthesia, or procedural instruction is authorized.

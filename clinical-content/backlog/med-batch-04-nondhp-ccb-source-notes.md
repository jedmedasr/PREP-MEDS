# Batch 04 non-dihydropyridine calcium-channel-blocker source reconciliation

Status: `SOURCE_VERIFIED / ENGINEERING_INTEGRATED / REVIEW_REQUIRED`

This cluster preserves seven source/formulation-distinct oral diltiazem/verapamil identities. Generic diltiazem and verapamil wording fails closed when the release form or product profile is not explicit. Extended-release products are not treated as automatically interchangeable.

| Identity | Direct DailyMed source | SETID | SPL | Effective date | Application | Route / form / profile |
| --- | --- | --- | ---: | --- | --- | --- |
| diltiazem hydrochloride tablet | Zydus Lifesciences Limited | `8329d0ac-d68c-48d2-9cbc-e1a1b60192d9` | 1 | 2026-05-01 | ANDA219253 | oral tablet / standard |
| diltiazem hydrochloride ER capsule | Mylan Pharmaceuticals Inc. | `ec7e93b8-666c-4d2f-8d08-07931e09f748` | 13 | 2025-11-27 | ANDA074910 | oral ER capsule / twice-daily profile |
| Cartia XT diltiazem ER capsule | Actavis Pharma, Inc. | `2dc2b889-8443-4f7f-83be-86c68e179804` | 21 | 2026-04-30 | ANDA074752 | oral ER capsule / once-daily profile |
| diltiazem hydrochloride ER tablet | Slate Run Pharmaceuticals, LLC | `f7137458-0db3-7ecd-e053-6394a90a5f95` | 10 | 2026-08-05 | ANDA216439 | oral ER tablet / once-daily profile |
| verapamil hydrochloride tablet | Actavis Pharma, Inc. | `a0343397-897b-46d6-943f-a87e07e1de10` | 16 | 2024-01-30 | ANDA072924; ANDA070995; ANDA070994 | oral film-coated tablet / standard |
| verapamil hydrochloride ER tablet | Glenmark Pharmaceuticals Inc., USA | `ba1bf1ae-9347-4d17-998b-14bf7b5984ce` | 11 | 2025-12-02 | ANDA090700; ANDA078906 | oral film-coated ER tablet |
| Verelan PM verapamil ER capsule | Lannett Company, Inc. | `fd1b433f-1895-4af0-9d1f-3901c6d34c20` | 12 | 2026-06-01 | NDA020943 | oral controlled-onset ER capsule / bedtime profile |

## Historical marketing-status provenance

The current Verelan PM SPL records a listed marketing end date of `2026-05-31` for its presentations while the SPL itself is effective `2026-06-01`. PREP-MEDS preserves that date as historical regulatory-label provenance only. It does not infer that no product remains in circulation, pharmacy inventory, or patient possession, and it does not assert current commercial availability.

## Terminology boundary

- Bare `diltiazem`, `diltiazem ER`, and `diltiazem extended release` remain ambiguous across standard tablet and multiple ER release/formulation profiles.
- `Cartia XT` resolves only to the verified once-daily ER capsule identity.
- Explicit `diltiazem ER twice daily capsule` and `diltiazem ER tablet` wording resolves only to the corresponding verified formulation.
- Bare `verapamil`, `verapamil ER`, and `verapamil extended release` remain ambiguous across standard tablet, generic ER tablet, and Verelan PM ER capsule identities.
- Explicit `verapamil tablet`, `verapamil ER tablet`, and `Verelan PM` wording resolves only to the corresponding verified identity.
- No ER product is automatically converted or substituted for another.

## Governance boundary

`RULE-B4-NONDHP-CCB-PRODUCT-REVIEW-001` routes all seven explicit identities to `CLINICIAN_REVIEW_REQUIRED` for EGD, colonoscopy, and combined EGD/colonoscopy. It contains no timing rule. Product-label identity evidence is not converted into an autonomous continue, hold, dose-adjustment, or restart recommendation.

No clinical approval, local-policy approval, dose calculation, substitution, formulation conversion, current market-availability assertion, autonomous timing interval, deployment, or production activation is created by this cluster.

# TCA and bupropion review source notes

Status: `DRAFT` / `REVIEW_REQUIRED` only. These notes authenticate bounded identity, release/form, and labeled safety context; they do not authorize medication instructions, timing, substitution, conversion, or production activation.

## Bounded inventory

- Tricyclic antidepressants: amitriptyline tablet, nortriptyline capsule, imipramine tablet, and clomipramine capsule.
- Bupropion hydrochloride: immediate-release tablet, WELLBUTRIN SR sustained-release tablet, and XL extended-release tablet.
- Bare `bupropion` and `Wellbutrin` intentionally fail closed across IR/SR/XL identities. Explicit release wording is required.

## Direct DailyMed provenance

- Amitriptyline hydrochloride tablet — SETID `16364b31-4b8b-481a-a553-e8974c0e557c` (updated 2026-06-29).
- Nortriptyline hydrochloride capsule — SETID `dbe85bdc-17a1-4201-bf48-a52e35d69b68` (updated 2024-03-27).
- Imipramine hydrochloride tablet — SETID `a5f60cf1-6f14-40a3-a794-9d69b28088d8` (updated 2026-02-17).
- Clomipramine hydrochloride capsule — SETID `fa0d4de8-c96e-429d-a65c-928afbf46863` (updated 2025-12-26).
- Bupropion hydrochloride immediate-release tablet — SETID `88c980c8-aaa8-4378-9ac2-24d588640caa` (label effective 2026-04).
- WELLBUTRIN SR — SETID `cbc8c074-f080-4489-a5ae-207b5fadeba3` (effective 2025-11-05).
- Bupropion hydrochloride XL — SETID `1af14d2e-c64d-44b7-a402-8869e8e30661` (updated 2025-11-25).

## Review boundary

TCA cardiac-conduction/arrhythmia, hemodynamic, anticholinergic, CNS, seizure, psychiatric, and interacting-medication context and bupropion seizure, blood-pressure/hemodynamic, psychiatric, interaction, and release-specific context require accountable clinician, psychiatry, pharmacy, anesthesia, and local-policy review. No autonomous continuation, interruption, taper, restart, substitution, release conversion, dose conversion, administration, anesthesia, or timing decision is encoded.

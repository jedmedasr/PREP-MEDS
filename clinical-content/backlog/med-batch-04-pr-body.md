## Current state

Draft, in progress, review-required engineering only. This PR starts Batch 04 from the exact-head-green Batch 03 checkpoint and covers cardiovascular blood-pressure / RAAS / diuretic medication engineering.

### Initial cluster
- Lisinopril, enalapril, benazepril, ramipril, and captopril generic ACE-inhibitor identities.
- Current direct DailyMed provenance with SETID/SPL/application/route/form metadata.
- One class-scoped `LOCAL_POLICY_REQUIRED` shadow guard using the existing RAAS indication modifier and existing AHA/ACC/STOP-or-NOT evidence.
- Legacy lisinopril shadow rule preserved historically but excluded from the assembled shadow release to prevent duplicate competing rules.
- Regression coverage across EGD, colonoscopy, and combined procedures.

### Governance
All new content remains DRAFT/review-required. `activeRules` remains empty. No clinical approval, local-policy approval, deployment, production activation, dose arithmetic, substitution, market-availability inference, or autonomous hold/restart timing is introduced.

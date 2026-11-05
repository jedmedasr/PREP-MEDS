# Clinical rules

This directory is reserved for versioned PREP-MEDS clinical rule artifacts.

## Governance boundary
Automated workflows may create draft rules, evidence links, and synthetic test cases, and may advance them through technical testing. They must not mark care-changing content `APPROVED` or `ACTIVE` without accountable clinical governance.

## Production requirements
A production rule must have:
- stable rule ID and explicit version;
- bounded medication/ingredient/class and procedure scope;
- explicit required modifiers;
- declarative applicability conditions;
- explicit hard stops where applicable;
- one structured disposition;
- exact versioned evidence references;
- explicit policy dependencies when local implementation is required;
- timing/restart metadata where applicable;
- synthetic regression tests covering normal, missing-data, conflicting-data, hard-stop, and policy paths;
- clinical approval metadata.

## Stage 5 status
No medication-specific clinical rule is activated here. Stage 5 implements only the generic deterministic engine and synthetic software-test scenarios.

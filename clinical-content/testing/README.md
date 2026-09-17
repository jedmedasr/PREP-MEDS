# Clinical Testing Content

This directory contains regression fixtures used to verify PREP-MEDS behavior.

Current fixtures are synthetic software-only scenarios and are not clinical recommendations.

Rules:
- never include real patient PHI;
- synthetic fixtures may be generated automatically;
- clinically adjudicated fixtures, when added later, must retain reviewer/provenance metadata;
- a changed expected clinical outcome must be treated as a care-relevant rule change and reviewed explicitly;
- golden fixtures are version-controlled so historical behavior can be reconstructed.

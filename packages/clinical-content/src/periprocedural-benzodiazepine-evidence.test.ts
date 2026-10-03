import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralBenzodiazepineIdentityDefinitions as definitions, periproceduralBenzodiazepineIdentityEvidence as evidence, periproceduralBenzodiazepineIdentitySources as sources, periproceduralBenzodiazepineReviewRules as rules } from './periprocedural-benzodiazepine-evidence.js';
describe('periprocedural benzodiazepine evidence', () => {
  it('validates eight route/form/release identities', () => { expect(validateEvidenceBundle(evidence)).toEqual([]); expect(definitions).toHaveLength(8); expect(sources).toHaveLength(8); });
  it('preserves release, route, and ODT distinctions', () => {
    expect(definitions.find((x) => x.medicationId.includes('xanax-xr'))?.releaseContext).toBe('EXTENDED_RELEASE');
    expect(definitions.find((x) => x.medicationId.includes('ativan-lorazepam-intramuscular'))?.routeContext).toBe('INTRAMUSCULAR_INTRAVENOUS');
    expect(definitions.find((x) => x.medicationId.includes('orally-disintegrating'))?.dosageForm).toBe('TABLET_ORALLY_DISINTEGRATING');
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) { expect(source.lifecycle).toBe('DRAFT'); expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false }); }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rules[0]?.timingRule).toBeUndefined();
  });
});

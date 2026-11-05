import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralAripiprazoleHaloperidolIdentityDefinitions as definitions, periproceduralAripiprazoleHaloperidolIdentityEvidence as evidence, periproceduralAripiprazoleHaloperidolIdentitySources as sources, periproceduralAripiprazoleHaloperidolReviewRules as rules } from './periprocedural-aripiprazole-haloperidol-evidence.js';

describe('periprocedural aripiprazole and haloperidol evidence', () => {
  it('validates ten identities from ten direct-label sources', () => { expect(validateEvidenceBundle(evidence)).toEqual([]); expect(definitions).toHaveLength(10); expect(sources).toHaveLength(10); });
  it('preserves oral, immediate-release IM, long-acting IM, prodrug, salt, and ester distinctions', () => {
    expect(definitions.filter((x) => x.medicationId.includes('aripiprazole'))).toHaveLength(6);
    expect(definitions.filter((x) => x.medicationId.includes('haloperidol'))).toHaveLength(4);
    expect(definitions.filter((x) => x.releaseContext === 'EXTENDED_RELEASE')).toHaveLength(5);
    expect(definitions.filter((x) => x.routeContext === 'INTRAMUSCULAR')).toHaveLength(6);
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) { expect(source.lifecycle).toBe('DRAFT'); expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, saltConversionAuthorized: false, prodrugConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false }); }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rules[0]?.timingRule).toBeUndefined();
  });
});

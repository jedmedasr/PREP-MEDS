import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralRisperidoneIdentityDefinitions as definitions, periproceduralRisperidoneIdentityEvidence as evidence, periproceduralRisperidoneIdentitySources as sources, periproceduralRisperidoneReviewRules as rules } from './periprocedural-risperidone-evidence.js';

describe('periprocedural risperidone evidence', () => {
  it('validates six route/form/release identities from four direct-label sources', () => { expect(validateEvidenceBundle(evidence)).toEqual([]); expect(definitions).toHaveLength(6); expect(sources).toHaveLength(4); });
  it('preserves oral, intramuscular, subcutaneous, and long-acting identities', () => {
    expect(definitions.filter((x) => x.routeContext === 'ORAL')).toHaveLength(3);
    expect(definitions.filter((x) => x.routeContext === 'INTRAMUSCULAR')).toHaveLength(1);
    expect(definitions.filter((x) => x.routeContext === 'SUBCUTANEOUS')).toHaveLength(2);
    expect(definitions.filter((x) => x.releaseContext === 'EXTENDED_RELEASE')).toHaveLength(3);
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) { expect(source.lifecycle).toBe('DRAFT'); expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false }); }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rules[0]?.timingRule).toBeUndefined();
  });
});

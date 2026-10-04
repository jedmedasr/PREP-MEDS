import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { periproceduralQuetiapineOlanzapineIdentityDefinitions as definitions, periproceduralQuetiapineOlanzapineIdentityEvidence as evidence, periproceduralQuetiapineOlanzapineIdentitySources as sources, periproceduralQuetiapineOlanzapineReviewRules as rules } from './periprocedural-quetiapine-olanzapine-evidence.js';

describe('periprocedural quetiapine and olanzapine evidence', () => {
  it('validates six route/form/release identities from four direct-label sources', () => { expect(validateEvidenceBundle(evidence)).toEqual([]); expect(definitions).toHaveLength(6); expect(sources).toHaveLength(4); });
  it('preserves conventional/XR quetiapine and oral/ODT/non-ER IM/ER IM olanzapine distinctions', () => {
    expect(definitions.filter((x) => x.ingredientId === 'ING-quetiapine')).toHaveLength(2);
    expect(definitions.filter((x) => x.ingredientId === 'ING-olanzapine')).toHaveLength(4);
    expect(definitions.filter((x) => x.routeContext === 'INTRAMUSCULAR')).toHaveLength(2);
    expect(definitions.filter((x) => x.releaseContext === 'EXTENDED_RELEASE')).toHaveLength(2);
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) { expect(source.lifecycle).toBe('DRAFT'); expect(source.metadata).toMatchObject({ marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, releaseConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false }); }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED'); expect(rules[0]?.timingRule).toBeUndefined();
  });
});

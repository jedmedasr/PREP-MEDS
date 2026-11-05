import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antiepilepticPhenytoinIdentityDefinitions as definitions, antiepilepticPhenytoinIdentityEvidence as evidence, antiepilepticPhenytoinIdentitySources as sources, antiepilepticPhenytoinReviewRules as rules } from './antiepileptic-phenytoin-evidence.js';

describe('antiepileptic phenytoin/fosphenytoin evidence', () => {
  it('validates five direct-label identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(5);
    expect(sources).toHaveLength(5);
  });
  it('preserves free-acid, sodium-salt, prodrug, route, and release context', () => {
    expect(new Set(definitions.map((item) => item.chemicalContext))).toEqual(new Set(['PHENYTOIN_SODIUM', 'PHENYTOIN_FREE_ACID', 'FOSPHENYTOIN_SODIUM']));
    expect(definitions.filter((item) => item.route === 'INTRAVENOUS_OR_INTRAMUSCULAR')).toHaveLength(2);
    expect(definitions.filter((item) => item.releaseContext === 'EXTENDED_RELEASE')).toHaveLength(1);
  });
  it('keeps sources draft and routing timing-free', () => {
    expect(sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(sources.every((source) => source.metadata?.clinicalApprovalGranted === false)).toBe(true);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});

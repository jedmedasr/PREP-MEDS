import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antiepilepticPhenobarbitalIdentityDefinitions as definitions, antiepilepticPhenobarbitalIdentityEvidence as evidence, antiepilepticPhenobarbitalIdentitySources as sources, antiepilepticPhenobarbitalReviewRules as rules } from './antiepileptic-phenobarbital-evidence.js';

describe('antiepileptic phenobarbital evidence', () => {
  it('validates three direct DailyMed SPL identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(3);
    expect(sources).toHaveLength(3);
  });
  it('preserves oral tablet, oral solution, and parenteral sodium distinctions', () => {
    expect(new Set(definitions.map((item) => item.route))).toEqual(new Set(['ORAL', 'INTRAVENOUS_OR_INTRAMUSCULAR']));
    expect(new Set(definitions.map((item) => item.chemicalContext))).toEqual(new Set(['PHENOBARBITAL', 'PHENOBARBITAL_SODIUM']));
  });
  it('records unapproved marketing context without granting approval or timing', () => {
    expect(definitions.every((item) => item.marketingContext === 'UNAPPROVED_DRUG_OTHER')).toBe(true);
    expect(sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(sources.every((source) => source.metadata?.fdaApprovalNotAsserted === true)).toBe(true);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});

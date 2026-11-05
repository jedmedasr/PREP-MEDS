import { describe, expect, it } from 'vitest';
import {
  antiepilepticCarbamazepineIdentityAtoms,
  antiepilepticCarbamazepineIdentityDefinitions,
  antiepilepticCarbamazepineIdentityEvidence,
  antiepilepticCarbamazepineIdentitySources,
  antiepilepticCarbamazepineReviewRules,
} from './antiepileptic-carbamazepine-evidence.js';

describe('antiepileptic carbamazepine evidence', () => {
  it('keeps direct sources, atoms, and identities one-to-one and draft', () => {
    expect(antiepilepticCarbamazepineIdentityDefinitions).toHaveLength(6);
    expect(antiepilepticCarbamazepineIdentitySources).toHaveLength(6);
    expect(antiepilepticCarbamazepineIdentityAtoms).toHaveLength(6);
    expect(antiepilepticCarbamazepineIdentityEvidence.sources).toEqual(antiepilepticCarbamazepineIdentitySources);
    expect(antiepilepticCarbamazepineIdentityEvidence.atoms).toEqual(antiepilepticCarbamazepineIdentityAtoms);
    expect(antiepilepticCarbamazepineIdentitySources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(antiepilepticCarbamazepineIdentityAtoms.every((atom) => atom.lifecycle === 'DRAFT')).toBe(true);
  });

  it('preserves form, release, and whole-product distinctions without timing authority', () => {
    expect(new Set(antiepilepticCarbamazepineIdentityDefinitions.map((item) => item.medicationId)).size).toBe(6);
    expect(antiepilepticCarbamazepineIdentityDefinitions.map((item) => item.dosageForm)).toEqual(expect.arrayContaining([
      'TABLET', 'TABLET, CHEWABLE', 'SUSPENSION', 'TABLET, EXTENDED RELEASE', 'CAPSULE, EXTENDED RELEASE',
    ]));
    expect(antiepilepticCarbamazepineReviewRules).toHaveLength(1);
    expect(antiepilepticCarbamazepineReviewRules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(antiepilepticCarbamazepineReviewRules[0]?.timingRule).toBeUndefined();
    expect(antiepilepticCarbamazepineIdentitySources.every((source) => source.metadata?.clinicalApprovalGranted === false)).toBe(true);
    expect(antiepilepticCarbamazepineIdentitySources.every((source) => source.metadata?.timingRuleAuthorized === false)).toBe(true);
  });

  it('does not invent an application number for the representative chewable label', () => {
    const source = antiepilepticCarbamazepineIdentitySources.find((item) => item.id === 'SRC-CARBAMAZEPINE-CHEWABLE-SUN-SETID0526A054');
    expect(source?.externalIdentifier).toBe('DailyMed SETID 0526a054-3eda-49b4-b390-7d5d16e30af8');
    expect(source?.metadata?.applicationNumber).toBeUndefined();
  });
});

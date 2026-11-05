import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { antiepilepticValproateIdentityDefinitions as definitions, antiepilepticValproateIdentityEvidence as evidence, antiepilepticValproateIdentitySources as sources, antiepilepticValproateReviewRules as rules } from './antiepileptic-valproate-evidence.js';

describe('antiepileptic valproate and divalproex evidence', () => {
  it('validates six direct DailyMed SPL identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(6);
    expect(sources).toHaveLength(6);
  });
  it('preserves acid, sodium salt, divalproex, route, form, and release distinctions', () => {
    expect(new Set(definitions.map((item) => item.medicationId)).size).toBe(6);
    expect(new Set(definitions.map((item) => item.chemicalContext))).toEqual(new Set(['VALPROIC_ACID', 'VALPROATE_SODIUM', 'DIVALPROEX_SODIUM']));
    expect(new Set(definitions.map((item) => item.releaseContext))).toEqual(new Set(['IMMEDIATE_RELEASE', 'DELAYED_RELEASE', 'EXTENDED_RELEASE', 'NOT_APPLICABLE']));
    expect(definitions.find((item) => item.medicationId.includes('intravenous'))?.route).toBe('INTRAVENOUS');
  });
  it('keeps every rule review-only and timing-free', () => {
    expect(rules).toHaveLength(1);
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
    expect(rules[0]?.scope.medicationIds).toEqual(definitions.map((item) => item.medicationId));
  });
  it('records only draft evidence without approval or conversion authority', () => {
    expect(evidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    for (const source of evidence.sources) {
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
    }
  });
});

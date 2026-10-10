import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { mtorInhibitorIdentityDefinitions as definitions, mtorInhibitorIdentityEvidence as evidence, mtorInhibitorIdentitySources as sources, mtorInhibitorReviewRules as rules } from './mtor-inhibitor-evidence.js';

describe('mTOR inhibitor evidence', () => {
  it('validates five form/indication-context identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(5);
    expect(sources).toHaveLength(5);
  });
  it('preserves sirolimus form and everolimus brand/indication distinctions', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-SIROLIMUS-TABLET-MYLAN-NDA021110')?.metadata).toMatchObject({ dosageForm: 'TABLET, SUGAR COATED', applicationNumber: 'NDA021110', tabletSolutionEquivalenceNotGeneralized: true });
    expect(byId.get('SRC-SIROLIMUS-SOLUTION-MYLAN-NDA021083')?.metadata).toMatchObject({ dosageForm: 'SOLUTION', applicationNumber: 'NDA021083', tabletSolutionEquivalenceNotGeneralized: true });
    expect(byId.get('SRC-ZORTRESS-TABLET-NOVARTIS-NDA021560')?.metadata).toMatchObject({ indicationContext: 'TRANSPLANT', applicationNumber: 'NDA021560' });
    expect(byId.get('SRC-AFINITOR-TABLET-NOVARTIS-NDA022334')?.metadata).toMatchObject({ indicationContext: 'ONCOLOGY_OR_TSC', dosageForm: 'TABLET', applicationNumber: 'NDA022334' });
    expect(byId.get('SRC-AFINITOR-DISPERZ-NOVARTIS-NDA203985')?.metadata).toMatchObject({ indicationContext: 'ONCOLOGY_OR_TSC', dosageForm: 'TABLET, FOR SUSPENSION', applicationNumber: 'NDA203985' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ indicationNotInferred: true, regimenNotInferred: true, concentrationMonitoringNotInferred: true, woundHealingDecisionReviewOnly: true, interactionDecisionReviewOnly: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});

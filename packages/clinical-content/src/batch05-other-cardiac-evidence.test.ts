import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch05OtherCardiacIdentityAtoms,
  batch05OtherCardiacIdentityDefinitions,
  batch05OtherCardiacIdentityEvidence,
  batch05OtherCardiacIdentitySources,
  batch05OtherCardiacReviewRules,
} from './batch05-other-cardiac-evidence.js';

describe('Batch 05 other-cardiac evidence', () => {
  it('validates thirteen route/form-specific source-linked identities', () => {
    expect(validateEvidenceBundle(batch05OtherCardiacIdentityEvidence)).toEqual([]);
    expect(batch05OtherCardiacIdentityDefinitions).toHaveLength(13);
    expect(batch05OtherCardiacIdentitySources).toHaveLength(13);
    expect(batch05OtherCardiacIdentityAtoms).toHaveLength(13);
    expect(batch05OtherCardiacReviewRules).toHaveLength(1);
  });

  it('pins representative route/form provenance without asserting conversion or availability', () => {
    const byId = new Map(batch05OtherCardiacIdentitySources.map((source) => [source.id, source]));
    expect(byId.get('SRC-B5-LANOXIN-COVIS-SPL10')?.metadata).toMatchObject({ route: 'INTRAVENOUS OR INTRAMUSCULAR', dosageForm: 'INJECTION, SOLUTION', applicationNumber: 'NDA009330' });
    expect(byId.get('SRC-B5-CORLANOR-SOLUTION-AMGEN-SPL33')?.metadata).toMatchObject({ route: 'ORAL', dosageForm: 'SOLUTION', applicationNumber: 'NDA209964' });
    expect(byId.get('SRC-B5-NITROGLYCERIN-PATCH-MYLAN-SPL9')?.metadata).toMatchObject({ route: 'TRANSDERMAL', applicationNumber: 'ANDA074559', routeConversionAuthorized: false });
    expect(byId.get('SRC-B5-RANOLAZINE-GLENMARK-SPL5')?.metadata).toMatchObject({ dosageForm: 'TABLET, FILM COATED, EXTENDED RELEASE', marketAvailabilityAsserted: false });
  });

  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of batch05OtherCardiacIdentitySources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source.metadata?.substitutionAuthorized).toBe(false);
      expect(source.metadata?.routeConversionAuthorized).toBe(false);
      expect(source.metadata?.formulationConversionAuthorized).toBe(false);
      expect(source.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source.metadata?.timingRuleAuthorized).toBe(false);
    }
    const rule = batch05OtherCardiacReviewRules[0];
    expect(rule?.scope.medicationIds).toHaveLength(13);
    expect(rule?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rule?.timingRule).toBeUndefined();
  });
});

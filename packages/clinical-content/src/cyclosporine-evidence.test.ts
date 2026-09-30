import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { cyclosporineIdentityDefinitions as definitions, cyclosporineIdentityEvidence as evidence, cyclosporineIdentitySources as sources, cyclosporineReviewRules as rules } from './cyclosporine-evidence.js';

describe('cyclosporine evidence', () => {
  it('validates four route/form/modified-status identities', () => {
    expect(validateEvidenceBundle(evidence)).toEqual([]);
    expect(definitions).toHaveLength(4);
    expect(sources).toHaveLength(4);
  });
  it('preserves modified/nonmodified and oral/intravenous distinctions', () => {
    const byId = new Map(sources.map((source) => [source.id, source]));
    expect(byId.get('SRC-SANDIMMUNE-CAPSULE-NOVARTIS-NDA050625')?.metadata).toMatchObject({ route: 'ORAL', formulationContext: 'NON_MODIFIED', applicationNumber: 'NDA050625' });
    expect(byId.get('SRC-SANDIMMUNE-INJECTION-NOVARTIS-NDA050573')?.metadata).toMatchObject({ route: 'INTRAVENOUS', formulationContext: 'PARENTERAL', applicationNumber: 'NDA050573' });
    expect(byId.get('SRC-NEORAL-CAPSULE-NOVARTIS-NDA050715')?.metadata).toMatchObject({ dosageForm: 'CAPSULE, LIQUID FILLED', formulationContext: 'MODIFIED', applicationNumber: 'NDA050715' });
    expect(byId.get('SRC-NEORAL-SOLUTION-NOVARTIS-NDA050716')?.metadata).toMatchObject({ dosageForm: 'SOLUTION', formulationContext: 'MODIFIED', applicationNumber: 'NDA050716' });
  });
  it('keeps evidence DRAFT/non-authorizing and routing timing-free', () => {
    for (const source of sources) {
      expect(source.lifecycle).toBe('DRAFT');
      expect(source.metadata).toMatchObject({ nonBioequivalencePreserved: true, transplantOrganNotInferred: true, regimenNotInferred: true, concentrationMonitoringNotInferred: true, marketAvailabilityAsserted: false, substitutionAuthorized: false, routeConversionAuthorized: false, formulationConversionAuthorized: false, clinicalApprovalGranted: false, timingRuleAuthorized: false });
    }
    expect(rules[0]?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(rules[0]?.timingRule).toBeUndefined();
  });
});

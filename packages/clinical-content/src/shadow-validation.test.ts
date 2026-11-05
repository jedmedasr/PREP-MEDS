import { describe, expect, it } from 'vitest';
import {
  buildShadowAudit,
  shadowReviewPackets,
  syntheticShadowCases,
  type ShadowCandidatePathway,
  type ShadowReviewDomain,
} from './shadow-validation.js';

const domains: ShadowReviewDomain[] = [
  'ANTITHROMBOTICS',
  'DIABETES_GLP1',
  'CARDIOVASCULAR_HEMODYNAMIC',
  'NEURO_WITHDRAWAL',
  'OUD_PAIN',
  'STEROIDS_IMMUNOSUPPRESSION',
  'PULMONARY_AIRWAY',
  'OTC_HERBAL',
];

describe('shadow review packets', () => {
  it('defines one DRAFT review packet for every required clinical domain', () => {
    expect(shadowReviewPackets.map((packet) => packet.domain).sort()).toEqual([...domains].sort());
    expect(new Set(shadowReviewPackets.map((packet) => packet.id)).size).toBe(shadowReviewPackets.length);
    for (const packet of shadowReviewPackets) {
      expect(packet.status).toBe('DRAFT_REVIEW_REQUIRED');
      expect(packet.reviewerRoles).toContain('LOCAL_GOVERNANCE');
      expect(packet.evidenceProvenanceRequirements.length).toBeGreaterThan(0);
      expect(packet.unresolvedLocalPolicyQuestions.length).toBeGreaterThan(0);
      expect(packet.patientInstructionsEnabled).toBe(false);
    }
  });
});

describe('synthetic shadow case matrix', () => {
  it('covers EGD, colonoscopy, combined procedures, and low/high bleeding-risk contexts', () => {
    expect(new Set(syntheticShadowCases.map((item) => item.procedureCode))).toEqual(
      new Set(['EGD', 'COLONOSCOPY', 'EGD_COLONOSCOPY']),
    );
    expect(new Set(syntheticShadowCases.map((item) => item.procedureBleedingRisk))).toEqual(
      new Set(['LOW', 'HIGH']),
    );
    expect(new Set(syntheticShadowCases.map((item) => item.domain))).toEqual(new Set(domains));
  });

  it.each([
    'VERIFIED_RENAL_FUNCTION_REQUIRED',
    'RECENT_ACS',
    'RECENT_STENT',
    'RECENT_THROMBOTIC_EVENT_UNKNOWN',
    'MECHANICAL_VALVE',
    'TYPE_1_DIABETES',
    'GLP1_ESCALATION',
    'SGLT2',
    'OUD_INDICATION_NOT_INFERRED',
    'SEIZURE_WITHDRAWAL_RISK',
    'ADRENAL_RISK_REVIEW',
    'TRANSPLANT_TEAM_REVIEW',
    'FAIL_CLOSED',
  ])('includes required modifier or ambiguity context %s', (tag) => {
    expect(syntheticShadowCases.some((item) => item.scenarioTags.includes(tag))).toBe(true);
  });

  it('contains no PHI and routes every unresolved decision to accountable review', () => {
    expect(new Set(syntheticShadowCases.map((item) => item.id)).size).toBe(syntheticShadowCases.length);
    for (const item of syntheticShadowCases) {
      expect(item.synthetic).toBe(true);
      expect(item.containsPhi).toBe(false);
      expect(['CLINICIAN_REVIEW_REQUIRED', 'LOCAL_POLICY_REQUIRED']).toContain(item.expectedReviewDisposition);
      expect(item.medicationInputs.length).toBeGreaterThan(0);
    }
  });
});

describe('shadow audit output', () => {
  const candidatePathway: ShadowCandidatePathway = {
    medicationId: 'MED-SYNTHETIC',
    candidateDisposition: 'HOLD_STANDARD',
    ruleRefs: [{ id: 'RULE-SYNTHETIC', version: 1 }],
    evidenceRefs: [{ id: 'EVD-SYNTHETIC', version: 1 }],
    missingModifierIds: ['MOD-SYNTHETIC'],
    reasonCodes: ['SYNTHETIC_CANDIDATE_ONLY'],
  };

  it.each(syntheticShadowCases)('hard-disables instructions and approval for $id', (caseDefinition) => {
    const output = buildShadowAudit(caseDefinition, [candidatePathway]);
    expect(output.auditMode).toBe('SHADOW_VALIDATION_ONLY');
    expect(output.reviewDisposition).toBe(caseDefinition.expectedReviewDisposition);
    expect(output.patientInstructions).toBeNull();
    expect(output.approvals).toEqual({
      clinicalApprovalGranted: false,
      localPolicyApprovalGranted: false,
      productionActivationGranted: false,
    });
    expect(output.candidatePathways[0]?.candidateDisposition).toBe('HOLD_STANDARD');
    expect(['CLINICIAN_REVIEW_REQUIRED', 'LOCAL_POLICY_REQUIRED']).toContain(output.reviewDisposition);
  });
});

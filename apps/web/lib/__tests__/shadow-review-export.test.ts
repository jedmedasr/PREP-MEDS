import { describe, expect, it } from 'vitest';
import { shadowReviewPackets, syntheticShadowCases } from '@prep-meds/clinical-content';
import {
  generateDomainReviewExports,
  generateHumanDecisionRegister,
  generateShadowReviewHandoff,
  serializeShadowReviewHandoff,
} from '../shadow-review-export';

describe('accountable shadow reviewer exports', () => {
  const exports = generateDomainReviewExports();

  it('emits one deterministic export per review domain and includes every synthetic case exactly once', () => {
    expect(exports).toHaveLength(shadowReviewPackets.length);
    expect(exports.map((item) => item.domain)).toEqual(
      [...exports.map((item) => item.domain)].sort((a, b) => a.localeCompare(b)),
    );
    const exportedCaseIds = exports.flatMap((item) => item.cases.map((caseItem) => caseItem.caseId));
    expect(exportedCaseIds.sort()).toEqual(syntheticShadowCases.map((item) => item.id).sort());
    expect(new Set(exportedCaseIds).size).toBe(syntheticShadowCases.length);
  });

  it('preserves evidence-linked traces and unresolved inputs without issuing instructions', () => {
    for (const packet of exports) {
      expect(packet.exportMode).toBe('ACCOUNTABLE_HUMAN_REVIEW_ONLY');
      expect(packet.status).toBe('DRAFT_REVIEW_REQUIRED');
      expect(packet.reviewerRoles).toContain('LOCAL_GOVERNANCE');
      expect(packet.unresolvedLocalPolicyQuestions.length).toBeGreaterThan(0);
      expect(packet.governance).toEqual({
        patientInstructionsEnabled: false,
        clinicalApprovalGranted: false,
        localPolicyApprovalGranted: false,
        productionActivationGranted: false,
      });
      for (const caseItem of packet.cases) {
        expect(caseItem.patientInstructions).toBeNull();
        expect(['CLINICIAN_REVIEW_REQUIRED', 'LOCAL_POLICY_REQUIRED']).toContain(caseItem.reviewDisposition);
        for (const link of caseItem.evidenceLinks) {
          expect(link.evidenceRef.id).toBeTruthy();
          expect(link.sourceRef.id).toBeTruthy();
          expect(link.sourceLifecycle).toBe('DRAFT');
        }
      }
    }
  });

  it('creates an exact activation-blocking entry for every unresolved human decision', () => {
    const register = generateHumanDecisionRegister();
    const expectedCount = shadowReviewPackets.reduce(
      (count, packet) => count + packet.unresolvedLocalPolicyQuestions.length,
      0,
    );
    expect(register).toHaveLength(expectedCount);
    expect(new Set(register.map((entry) => entry.id)).size).toBe(register.length);
    for (const entry of register) {
      expect(entry.status).toBe('PENDING_HUMAN_DECISION');
      expect(entry.activationBlocking).toBe(true);
      expect(entry.engineeringInferenceProhibited).toBe(true);
      expect(entry.accountableReviewerRoles).toContain('LOCAL_GOVERNANCE');
      expect(entry.question.length).toBeGreaterThan(10);
    }
  });

  it('serializes reproducibly and cannot imply production readiness', () => {
    const first = serializeShadowReviewHandoff();
    const second = serializeShadowReviewHandoff();
    expect(first).toBe(second);
    const handoff = generateShadowReviewHandoff();
    expect(handoff.status).toBe('ENGINEERING_COMPLETE_HUMAN_REVIEW_REQUIRED');
    expect(handoff.productionActivationStatus).toBe('NOT_ACTIVE');
    expect(handoff.patientInstructionsEnabled).toBe(false);
    expect(first).not.toContain('"clinicalApprovalGranted": true');
    expect(first).not.toContain('"localPolicyApprovalGranted": true');
    expect(first).not.toContain('"productionActivationGranted": true');
  });
});

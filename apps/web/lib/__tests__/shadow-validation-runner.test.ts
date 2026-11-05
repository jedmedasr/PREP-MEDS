import { describe, expect, it } from 'vitest';
import { syntheticShadowCases } from '@prep-meds/clinical-content';
import { executeAllSyntheticShadowCases, executeSyntheticShadowCase } from '../shadow-validation-runner';

describe('synthetic shadow execution', () => {
  const executions = executeAllSyntheticShadowCases(syntheticShadowCases);

  it('runs every synthetic case through terminology and validation-mode engine binding', () => {
    expect(executions).toHaveLength(syntheticShadowCases.length);
    for (const [index, execution] of executions.entries()) {
      const definition = syntheticShadowCases[index]!;
      expect(execution.caseId).toBe(definition.id);
      expect(execution.resolutions).toHaveLength(definition.medicationInputs.length);
      expect(execution.decisionTraces).toHaveLength(definition.medicationInputs.length);
      expect(execution.audit.candidatePathways).toHaveLength(definition.medicationInputs.length);
    }
  });

  it('keeps every externally consumable audit routed to accountable review with no instructions or approval', () => {
    for (const [index, execution] of executions.entries()) {
      const definition = syntheticShadowCases[index]!;
      expect(execution.audit.auditMode).toBe('SHADOW_VALIDATION_ONLY');
      expect(execution.audit.reviewDisposition).toBe(definition.expectedReviewDisposition);
      expect(['CLINICIAN_REVIEW_REQUIRED', 'LOCAL_POLICY_REQUIRED']).toContain(execution.audit.reviewDisposition);
      expect(execution.audit.patientInstructions).toBeNull();
      expect(execution.audit.approvals).toEqual({
        clinicalApprovalGranted: false,
        localPolicyApprovalGranted: false,
        productionActivationGranted: false,
      });
    }
  });

  it('resolves every emitted evidence reference to a DRAFT source through an assembled evidence atom', () => {
    for (const execution of executions) {
      for (const decision of execution.decisionTraces) {
        for (const provenance of decision.evidenceProvenance) {
          expect(provenance.atomFound, provenance.evidenceRef.id).toBe(true);
          expect(provenance.sourceFound, provenance.evidenceRef.id).toBe(true);
          expect(provenance.sourceLifecycle, provenance.evidenceRef.id).toBe('DRAFT');
        }
      }
    }
  });

  it.each([
    'SHADOW-CASE-COLONOSCOPY-ANTIEPILEPTIC-AMBIGUITY',
    'SHADOW-CASE-COMBINED-PSYCH-AMBIGUITY',
    'SHADOW-CASE-EGD-CANNABIS-ROUTE-AMBIGUITY',
  ])('fails the intentionally ambiguous medication input closed for %s', (caseId) => {
    const definition = syntheticShadowCases.find((item) => item.id === caseId);
    expect(definition).toBeDefined();
    const execution = executeSyntheticShadowCase(definition!);
    expect(execution.resolutions[0]?.status).not.toBe('RESOLVED');
    expect(execution.decisionTraces[0]?.trace).toBeNull();
    expect(execution.audit.candidatePathways[0]).toMatchObject({
      candidateDisposition: 'INSUFFICIENT_INFORMATION',
      ruleRefs: [],
      evidenceRefs: [],
    });
    expect(execution.audit.candidatePathways[0]?.reasonCodes[0]).toContain('FAIL_CLOSED');
  });

  it('retains engine candidate dispositions only as audit context, never as patient instructions', () => {
    const candidateDispositions = new Set(
      executions.flatMap((execution) =>
        execution.audit.candidatePathways.map((pathway) => pathway.candidateDisposition),
      ),
    );
    expect(candidateDispositions.size).toBeGreaterThan(0);
    for (const execution of executions) {
      expect(execution.audit.patientInstructions).toBeNull();
      expect(execution.audit.reviewDisposition).not.toBe('CONTINUE');
      expect(execution.audit.reviewDisposition).not.toBe('HOLD_STANDARD');
    }
  });
});

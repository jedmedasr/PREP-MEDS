import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { diabetesWorkflowEvidence as historical } from '../diabetes-evidence-provenance.js';
import { diabetesAuditedEvidence, diabetesAuditedEvidenceRef, diabetesScopedEvidenceAudit } from '../diabetes-evidence-audit.js';
import { diabetesFormulationEvidence as currentRelease } from '../diabetes-formulation-evidence.js';
import { diabetesWorkflowRules } from '../diabetes-workflow.js';

function atom(id: string, version: number) {
  const found = currentRelease.atoms.find((item) => item.id === id && item.version === version);
  if (!found) throw new Error(`Missing evidence ${id}@${version}`);
  return found;
}

describe('scoped diabetes evidence audit', () => {
  it('is append-only and retains every historical source and claim version', () => {
    for (const source of historical.sources) {
      expect(diabetesAuditedEvidence.sources.find((item) => item.id === source.id && item.version === source.version)).toEqual(source);
    }
    for (const claim of historical.atoms) expect(atom(claim.id, claim.version)).toEqual(claim);
    expect(diabetesAuditedEvidence.atoms).toHaveLength(historical.atoms.length + 4);
    expect(diabetesAuditedEvidence.sources).toHaveLength(historical.sources.length + 2);
    expect(validateEvidenceBundle(diabetesAuditedEvidence)).toEqual([]);
    expect(validateEvidenceBundle(currentRelease)).toEqual([]);
  });
  it('pins the glipizide label and distinguishes effective and USPI revision dates', () => {
    const claim = atom('EVD-B2-FDA-SULFONYLUREA-HYPOGLYCEMIA', 2);
    const source = currentRelease.sources.find((item) => item.id === claim.source.id && item.version === claim.source.version);
    expect(source?.metadata?.setId).toBe('eed99b60-d043-4249-9b2a-f05e46fb588d');
    expect(source?.metadata?.splVersion).toBe(27);
    expect(source?.effectiveDate).toBe('2025-04-02');
    expect(source?.metadata?.labelRevision).toBe('2023-08');
    expect(source?.publicationDate).toBeUndefined();
    expect(claim.locator.section).toBe('5.1 Hypoglycemia');
    expect(claim.evidenceStrength).toBe('NOT_GRADED');
  });
  it('uses a separate GIE identity for the exact bowel-preparation locator', () => {
    const claim = atom('EVD-B2-USMSTF-MEDICATIONS-IN-BOWEL-PREP', 2);
    const source = currentRelease.sources.find((item) => item.id === claim.source.id && item.version === claim.source.version);
    expect(source?.externalIdentifier).toBe('doi:10.1016/j.gie.2025.02.010');
    expect(claim.locator.section).toContain('Choice of Bowel Preparation Purgative');
    expect(claim.evidenceStrength).toBe('MODERATE');
    expect(claim.applicability.procedureCodes).toEqual(['COLONOSCOPY', 'EGD_COLONOSCOPY']);
    expect(claim.applicability.procedureCodes).not.toContain('EGD');
  });
  it('does not treat repaglinide labeling as nateglinide or class-wide label evidence', () => {
    const claim = atom('EVD-B2-FDA-MEGLITINIDE-MEAL-LINKED', 3);
    expect(claim.applicability.medicationIds).toEqual(['MED-repaglinide']);
    expect(claim.applicability.drugClassIds).toBeUndefined();
    const rule = diabetesWorkflowRules.find((item) => item.scope.drugClassIds?.includes('CLS-meglitinide'));
    expect(rule?.evidenceRefs).toEqual([{ id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 2 }]);
  });
  it('does not use a single ER label for a generic metformin formulation-wide action', () => {
    const claim = atom('EVD-B2-FDA-METFORMIN-LACTIC-ACIDOSIS', 3);
    expect(claim.applicability.contextTags).toContain('extended-release-formulation');
    const rule = diabetesWorkflowRules.find((item) => item.scope.drugClassIds?.includes('CLS-metformin'));
    expect(rule?.evidenceRefs).toEqual([{ id: 'EVD-B2-ADA-ORAL-AGENTS-PROCEDURE-DAY', version: 2 }]);
  });
  it('locates every evidence reference used by the assembled workflow', () => {
    for (const rule of diabetesWorkflowRules) for (const ref of rule.evidenceRefs) {
      const claim = atom(ref.id, ref.version);
      expect(claim.locator.section?.length).toBeGreaterThan(0);
      const source = currentRelease.sources.find((item) => item.id === claim.source.id && item.version === claim.source.version);
      expect(source?.sourceUrl?.startsWith('https://')).toBe(true);
      expect(source?.externalIdentifier?.length).toBeGreaterThan(0);
    }
  });
  it('does not silently downgrade an unknown future evidence version', () => {
    const ref = { id: 'EVD-B2-FDA-MEGLITINIDE-MEAL-LINKED', version: 99 };
    expect(diabetesAuditedEvidenceRef(ref)).toEqual(ref);
    expect(diabetesAuditedEvidenceRef({ id: 'EVD-UNKNOWN', version: 1 })).toEqual({ id: 'EVD-UNKNOWN', version: 1 });
  });
  it('marks prep, recovery and insulin dosing as scoped review-only exclusions', () => {
    expect(diabetesScopedEvidenceAudit.phaseCoverage.preparation).toBe('REVIEW_ONLY_NO_AUTONOMOUS_INSTRUCTION');
    expect(diabetesScopedEvidenceAudit.phaseCoverage.recovery).toBe('REVIEW_ONLY_NO_AUTONOMOUS_RESTART');
    expect(diabetesScopedEvidenceAudit.phaseCoverage.insulin).toBe('REVIEW_ONLY_NO_DOSE_OR_DEVICE_SETTINGS');
    expect(diabetesScopedEvidenceAudit.clinicalApprovalGranted).toBe(false);
  });
  it('does not promote any source, atom or rule to approved production content', () => {
    expect(currentRelease.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
    expect(currentRelease.atoms.every((claim) => claim.lifecycle === 'DRAFT')).toBe(true);
    expect(diabetesWorkflowRules.every((rule) => rule.status === 'CLINICAL_REVIEW')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import { diabetesCoreEvidence } from '../diabetes-core.js';
import { diabetesWorkflowEvidence, diabetesEvidenceAuditStatus } from '../diabetes-evidence-provenance.js';
import { diabetesWorkflowRules } from '../diabetes-workflow.js';

describe('diabetes source verification boundaries', () => {
  it('retains all original source and evidence versions without modification', () => {
    for (const source of diabetesCoreEvidence.sources) {
      expect(diabetesWorkflowEvidence.sources.find((item) => item.id === source.id && item.version === 1)).toEqual(source);
    }
    for (const atom of diabetesCoreEvidence.atoms) {
      expect(diabetesWorkflowEvidence.atoms.find((item) => item.id === atom.id && item.version === 1)).toEqual(atom);
    }
  });
  it('validates the combined bundle and exact revised-source references', () => {
    expect(validateEvidenceBundle(diabetesWorkflowEvidence)).toEqual([]);
    const refs = new Set(diabetesWorkflowEvidence.sources.map((item) => `${item.id}@${item.version}`));
    for (const atom of diabetesWorkflowEvidence.atoms) expect(refs.has(`${atom.source.id}@${atom.source.version}`)).toBe(true);
  });
  it('adds eight located draft revisions without inferring GRADE certainty', () => {
    const revisions = diabetesWorkflowEvidence.atoms.filter((atom) => atom.version === 2);
    expect(revisions).toHaveLength(8);
    for (const atom of revisions) {
      expect(atom.locator.section?.length).toBeGreaterThan(0);
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.supersedes).toEqual({ id: atom.id, version: 1 });
    }
  });
  it('distinguishes the Symlin SPL effective date from the registry posting date', () => {
    const source = diabetesWorkflowEvidence.sources.find((item) => item.id === 'SRC-FDA-PRAMLINTIDE-LABEL-B2' && item.version === 2);
    expect(source?.effectiveDate).toBe('2019-12-18');
    expect(source?.publicationDate).toBe('2024-08-20');
    expect(source?.metadata?.splVersion).toBe(18);
  });
  it('points guarded workflows at the revised exact evidence versions', () => {
    const versions = new Map(diabetesWorkflowEvidence.atoms.filter((atom) => atom.version === 2).map((atom) => [atom.id, 2]));
    for (const rule of diabetesWorkflowRules) {
      expect(rule.version).toBe(2);
      for (const ref of rule.evidenceRefs) if (versions.has(ref.id)) expect(ref.version).toBe(2);
    }
  });
  it('does not claim the remaining label and class-inheritance audits are complete', () => {
    expect(diabetesEvidenceAuditStatus.status).toBe('PARTIAL_REVIEW_REQUIRED');
    expect(diabetesEvidenceAuditStatus.unresolved.length).toBeGreaterThan(0);
    expect(diabetesWorkflowEvidence.sources.every((source) => source.lifecycle === 'DRAFT')).toBe(true);
  });
});

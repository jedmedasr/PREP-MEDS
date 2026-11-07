import { describe, expect, it } from 'vitest';
import { buildAntithromboticAuditQueue as queue } from './antithrombotic-audit-queue';
describe('antithrombotic audit discovery', () => {
  it('preserves canonical IDs and does not double count', () => {
    const items = queue().medications;
    expect(new Set(items.map(m=>m.medicationId)).size).toBe(items.length);
  });
  it('includes major agents and combination antiplatelet', () => {
    const ids = new Set(queue().medications.map(m=>m.medicationId));
    for (const id of ['MED-rivaroxaban','MED-dabigatran','MED-aspirin-dipyridamole','MED-heparin']) expect(ids.has(id)).toBe(true);
  });
  it('does not confer ASGE review or clinical approval by inventory mapping', () => {
    for (const m of queue().medications) {
      expect(m.asge2016.comparisonStatus).toBe('NOT_STARTED');
      expect(m.clinicalApproval).toBe(false);
      expect(m.auditStatus).toBe('NOT_STARTED');
    }
  });
  it('maps all discovered IDs to provisional groups without claiming formulation adjudication', () => {
    const result=queue();
    expect(result.medications.length).toBeGreaterThanOrEqual(result.groups.length);
    for (const m of result.medications) expect(result.groups).toContain(m.provisionalGroupKey);
  });
});

describe('antithrombotic audit coverage accounting', () => {
  it('prints exact auditable denominator and checks every mapped ID', () => {
    const result = queue();
    console.info('ANTITHROMBOTIC_AUDIT_COUNTS', JSON.stringify(result.counts));
    expect(Object.keys(result.canonicalIdToProvisionalGroup)).toHaveLength(result.counts.canonicalMedicationIds);
    expect(result.groups).toHaveLength(result.counts.provisionalIngredientGroups);
    for (const medication of result.medications) {
      expect(result.canonicalIdToProvisionalGroup[medication.medicationId]).toBe(medication.provisionalGroupKey);
      expect(medication.asge2016.source.doi).toBe('10.1016/j.gie.2015.09.035');
      expect(medication.asge2016.comparisonStatus).toBe('NOT_STARTED');
      expect(medication.sourceVersions[0].year).toBe(2016);
      expect(medication.unresolvedIssues.length).toBeGreaterThan(0);
    }
  });
  it('does not omit any canonical medication carrying an explicit antithrombotic ingredient', async () => {
    const { terminologyDataset } = await import('./content');
    const mapped = new Set(queue().medications.map(m => m.medicationId));
    const antithromboticIngredients = /apixaban|rivaroxaban|edoxaban|dabigatran|warfarin|heparin|enoxaparin|dalteparin|fondaparinux|aspirin|clopidogrel|prasugrel|ticagrelor|ticlopidine|dipyridamole|cilostazol/i;
    for (const medication of terminologyDataset.medications) {
      if (medication.ingredientIds.some(id => antithromboticIngredients.test(id))) {
        expect(mapped.has(medication.id), 'Missing antithrombotic medication: ' + medication.id).toBe(true);
      }
    }
  });
});

describe('clinical approval gate — negative and positive controls', () => {
  const base = {
    groupKey: 'ING-apixaban',
    canonicalMedicationIds: ['MED-apixaban'],
    formulationAdjudicated: true,
    guidelineComparator: {
      status: 'COMPARED' as const,
      sourceSection: 'ASGE 2016 Table 4',
      sourceVersion: 'ASGE_2016' as const,
      comparisonEvidence: ['Verified source comparison'],
      reviewerId: 'independent-reviewer',
    },
    newerGuidelineEvidence: ['Newer source comparison'],
    testEvidence: ['passing regression'],
    independentClinicalApproval: true,
  };
  it('rejects a source-link placeholder and in-progress comparison', async () => {
    const { canApproveAntithromboticGroup: approve } = await import('./antithrombotic-audit-queue');
    expect(approve({...base,guidelineComparator:{status:'NOT_STARTED'}})).toBe(false);
    expect(approve({...base,guidelineComparator:{status:'IN_PROGRESS',sourceSection:'Table 4',issues:['Pending']}})).toBe(false);
  });
  it('rejects missing formulation review, tests, independent approval or duplicate ID', async () => {
    const { canApproveAntithromboticGroup: approve } = await import('./antithrombotic-audit-queue');
    expect(approve({...base,formulationAdjudicated:false})).toBe(false);
    expect(approve({...base,independentClinicalApproval:false})).toBe(false);
    expect(approve({...base,testEvidence:[]})).toBe(false);
    expect(approve({...base,canonicalMedicationIds:['MED-apixaban','MED-apixaban']})).toBe(false);
    expect(approve({...base,guidelineComparator:{...base.guidelineComparator,comparisonEvidence:[]}})).toBe(false);
  });
  it('requires an explicit source-backed NOT ADDRESSED determination', async () => {
    const { canApproveAntithromboticGroup: approve } = await import('./antithrombotic-audit-queue');
    const comparator = {status:'NOT_ADDRESSED' as const,sourceSection:'Source scope review',sourceVersion:'ASGE_2016' as const,rationale:'',reviewerId:'reviewer'};
    expect(approve({...base,guidelineComparator:comparator})).toBe(false);
    expect(approve({...base,guidelineComparator:{...comparator,rationale:'Agent not discussed in original guideline'}})).toBe(true);
  });
  it('accepts only a complete synthetic gate fixture; does not confer real-world signoff', async () => {
    const { canApproveAntithromboticGroup: approve } = await import('./antithrombotic-audit-queue');
    expect(approve(base)).toBe(true);
    expect(queue().counts.clinicallyReviewedGroups).toBe(0);
  });
});

describe('pinned SPR-001 antithrombotic baseline', () => {
  it('retains the 17-ID/17-provisional-group independently audited baseline', () => {
    // Baseline: SPR-001 pinned audit, GitHub Actions run 42374711461.
    // This is discovery coverage, not exhaustive clinical adjudication.
    const result = queue();
    expect(result.counts.canonicalMedicationIds).toBe(17);
    expect(result.counts.provisionalIngredientGroups).toBe(17);
    expect(result.counts.completedAsgeComparisons).toBe(0);
    expect(result.counts.clinicallyReviewedGroups).toBe(0);
    expect(result.medications.every(m => m.formulationAdjudication === 'PENDING')).toBe(true);
  });
});

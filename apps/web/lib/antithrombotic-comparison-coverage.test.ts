import { describe, expect, it } from 'vitest';
import { buildAntithromboticAuditQueue } from './antithrombotic-audit-queue';
import { buildAntithromboticComparisonCoverage } from './antithrombotic-comparison-coverage';

describe('ASGE research comparison canonical-ID coverage', () => {
  it('maps every discovered antithrombotic ID exactly once without clinical approval', () => {
    const queue = buildAntithromboticAuditQueue();
    const coverage = buildAntithromboticComparisonCoverage();
    expect(coverage.canonicalMedicationIds).toBe(queue.medications.length);
    expect(coverage.medications.map(m => m.medicationId)).toEqual(queue.medications.map(m => m.medicationId));
    expect(new Set(coverage.medications.map(m => m.medicationId)).size).toBe(queue.medications.length);
    expect(coverage.completedAsgeCanonicalIds).toBe(0);
    expect(coverage.clinicallyApprovedCanonicalIds).toBe(0);
    for (const record of coverage.medications) {
      expect(record.clinicalApproval).toBe(false);
      expect(record.asgeCoverageComplete).toBe(false);
      expect(record.constituentComparisons.length).toBeGreaterThan(0);
    }
  });
  it('never promotes partially compared combination products or unrelated ingredients', () => {
    const coverage = buildAntithromboticComparisonCoverage();
    for (const record of coverage.medications) {
      if (record.constituentComparisons.some(c => c.comparisonStatus === 'NOT_STARTED')) {
        expect(record.asgeCoverageComplete).toBe(false);
      }
      for (const constituent of record.constituentComparisons) {
        if (constituent.comparisonStatus === 'IN_PROGRESS') {
          expect(['ING-apixaban', 'ING-rivaroxaban']).toContain(constituent.ingredientId);
          expect(constituent.asge2016Doi).toBe('10.1016/j.gie.2015.09.035');
        } else {
          expect(constituent.asge2016Doi).toBeNull();
          expect(constituent.sourceTable).toBeNull();
        }
      }
    }
  });
});

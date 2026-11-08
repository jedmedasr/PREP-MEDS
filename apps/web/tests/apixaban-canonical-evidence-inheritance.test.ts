import { describe, expect, it } from 'vitest';
import manifest from '../../../docs/medication-audit-manifest.json';

/** Research-only coverage contract: no clinical signoff or dose instructions. */
describe('apixaban canonical evidence inheritance boundaries', () => {
  const records = manifest.medications.filter(m => m.ingredientIds.includes('ING-apixaban'));
  it('has an immutable canonical apixaban mapping without assuming brand/formulation coverage', () => {
    expect(records.map(m => m.medicationId)).toContain('MED-apixaban');
    expect(records.every(m => m.ingredientIds.includes('ING-apixaban'))).toBe(true);
  });
  it('does not claim tested or clinician-approved evidence from provisional mapping', () => {
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(record.reviewStatus).not.toBe('CLINICALLY_REVIEWED');
      expect(record.reviewStatus).not.toBe('TESTED');
    }
  });
  it('never transfers apixaban-only research to rivaroxaban or dabigatran', () => {
    for (const record of manifest.medications.filter(m =>
      m.ingredientIds.includes('ING-rivaroxaban') || m.ingredientIds.includes('ING-dabigatran'))) {
      expect(record.ingredientIds).not.toContain('ING-apixaban');
    }
  });
});

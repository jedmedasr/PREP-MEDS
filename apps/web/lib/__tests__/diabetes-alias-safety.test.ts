import { describe, expect, it } from 'vitest';
import { TerminologyIndex } from '@prep-meds/terminology';
import { terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);

describe('medication identity collision safety', () => {
  it.each(['basal insulin', 'rapid acting insulin', 'premixed insulin', 'blood thinner'])(
    'requires a specific drug when %s matches multiple exact aliases', (query) => {
      const result = index.resolve(query);
      expect(result.status).toBe('AMBIGUOUS');
      expect(result.medication).toBeUndefined();
      expect(result.ingredientIds).toEqual([]);
      expect(result.candidates.filter((hit) => hit.matchKind === 'EXACT').length).toBeGreaterThan(1);
    },
  );
  it('does not confuse a one-row display limit with a unique identity', () => {
    const result = index.resolve('basal insulin', { limit: 1 });
    expect(result.candidates).toHaveLength(1);
    expect(result.status).toBe('AMBIGUOUS');
    expect(result.medication).toBeUndefined();
  });
  it('still resolves a unique brand or ingredient identity', () => {
    expect(index.resolve('Januvia').medication?.id).toBe('MED-sitagliptin');
    expect(index.resolve('metformin').medication?.id).toBe('MED-metformin');
  });
});

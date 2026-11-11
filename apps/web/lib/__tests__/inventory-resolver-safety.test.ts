import { describe, expect, it } from 'vitest';
import { normalizeMedicationText } from '@prep-meds/terminology';
import { terminologyDataset } from '../content';

function ingredientSetKey(ingredientIds: readonly string[]): string {
  return [...ingredientIds].sort((left, right) => Buffer.from(left).compare(Buffer.from(right))).join('+');
}

describe('canonical terminology resolver safety', () => {
  it('has no exact canonical, generic, brand, or alias term shared across review groups', () => {
    const groupsByTerm = new Map<string, Set<string>>();

    for (const medication of terminologyDataset.medications) {
      const group = ingredientSetKey(medication.ingredientIds);
      const terms = [
        medication.canonicalName,
        medication.genericName,
        ...(medication.brandNames ?? []),
        ...(medication.aliases ?? []),
      ].filter((value): value is string => Boolean(value));

      for (const term of terms) {
        const normalized = normalizeMedicationText(term);
        if (!normalized) continue;
        const groups = groupsByTerm.get(normalized) ?? new Set<string>();
        groups.add(group);
        groupsByTerm.set(normalized, groups);
      }
    }

    const collisions = [...groupsByTerm.entries()]
      .filter(([, groups]) => groups.size > 1)
      .map(([term, groups]) => ({ term, groups: [...groups].sort() }))
      .sort((left, right) => left.term.localeCompare(right.term));

    expect(collisions).toEqual([]);
  });
});

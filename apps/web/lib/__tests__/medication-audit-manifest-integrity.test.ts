import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { terminologyDataset } from '../content';

function manifest() {
  let directory = resolve(process.cwd());
  while (!existsSync(join(directory, 'pnpm-workspace.yaml'))) {
    const parent = dirname(directory);
    if (parent === directory) throw new Error('PREP-MEDS workspace root not found');
    directory = parent;
  }
  return JSON.parse(readFileSync(join(directory, 'docs/medication-audit-manifest.json'), 'utf8'));
}

describe('canonical medication audit manifest safety', () => {
  const audit = manifest();
  const medicationIds = terminologyDataset.medications.map((m) => m.id);
  const rows = audit.medications as Array<{ medicationId: string; ingredientSetKey: string; reviewStatus: string; lastReviewedDate: string | null; sourceVersions: unknown[]; testEvidence: unknown[] }>;
  const groups = audit.groups as Array<{ ingredientSetKey: string; medicationIds: string[]; formulationAdjudication: string; clinicalStatus: string }>;

  it('maps every canonical medication exactly once without invented identifiers', () => {
    expect(new Set(medicationIds).size).toBe(medicationIds.length);
    expect(rows.map((r) => r.medicationId).sort()).toEqual([...medicationIds].sort());
    expect(new Set(rows.map((r) => r.medicationId)).size).toBe(rows.length);
    expect(audit.counts.canonicalMedications).toBe(rows.length);
  });

  it('preserves group membership and exact one-to-one canonical ID inheritance', () => {
    const assigned = groups.flatMap((g) => g.medicationIds.map((id) => ({ id, key: g.ingredientSetKey })));
    expect(assigned.length).toBe(rows.length);
    expect(new Set(assigned.map((a) => a.id)).size).toBe(rows.length);
    const assignments = new Map(assigned.map((a) => [a.id, a.key]));
    for (const row of rows) {
      expect(assignments.get(row.medicationId)).toBe(row.ingredientSetKey);
      expect(audit.canonicalIdToProvisionalGroup[row.medicationId]).toBe(row.ingredientSetKey);
    }
    expect(audit.counts.provisionalIngredientSets).toBe(groups.length);
  });

  it('does not silently promote provisional mapping to clinical signoff', () => {
    const allowed = new Set(['NOT_STARTED', 'IN_PROGRESS', 'NEEDS_CORRECTION', 'TESTED', 'CLINICALLY_REVIEWED']);
    for (const row of rows) {
      expect(allowed.has(row.reviewStatus)).toBe(true);
      if (row.reviewStatus === 'NOT_STARTED') {
        expect(row.lastReviewedDate).toBeNull();
        expect(row.sourceVersions).toEqual([]);
        expect(row.testEvidence).toEqual([]);
      }
    }
    for (const group of groups) {
      if (group.formulationAdjudication === 'PENDING') {
        expect(group.clinicalStatus).not.toBe('CLINICALLY_REVIEWED');
      }
    }
  });
});

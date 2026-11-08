import { describe, expect, it } from 'vitest';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { buildMedicationValidationManifest } from './medication-validation-manifest';

const snapshotPath = resolve(process.cwd(), '../../docs/medication-audit-manifest.json');

describe('canonical static medication audit snapshot', () => {
  it('is complete and is either reproducible or explicitly absent', () => {
    const manifest = buildMedicationValidationManifest();
    expect(manifest.medications.length).toBe(manifest.counts.canonicalMedications);
    expect(Object.keys(manifest.canonicalIdToProvisionalGroup)).toHaveLength(manifest.medications.length);
    expect(manifest.groups.flatMap(g => g.medicationIds)).toHaveLength(manifest.medications.length);
    expect(manifest.medications.every(m => m.reviewStatus === 'NOT_STARTED')).toBe(true);
    const canonical = JSON.stringify(manifest, null, 2) + '\n';
    if (existsSync(snapshotPath)) {
      expect(readFileSync(snapshotPath, 'utf8')).toBe(canonical);
    } else if (process.env.EXPORT_MEDICATION_AUDIT === '1') {
      mkdirSync(dirname(snapshotPath), { recursive: true });
      writeFileSync(snapshotPath, canonical, { flag: 'wx' });
    } else {
      throw new Error('STATIC_MEDICATION_AUDIT_SNAPSHOT_MISSING: run explicit export workflow and commit its output');
    }
  });
});

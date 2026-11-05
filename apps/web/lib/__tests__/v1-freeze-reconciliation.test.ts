import { afterEach, describe, expect, it } from 'vitest';
import { TerminologyIndex, validateTerminologyDataset } from '@prep-meds/terminology';
import { activeRules, clinicalReviewEvidenceBundles, clinicalReviewRules, decisionRules, terminologyDataset } from '../content';

const index = new TerminologyIndex(terminologyDataset);
const originalMode = process.env.PREP_MEDS_CONTENT_MODE;

afterEach(() => {
  if (originalMode === undefined) delete process.env.PREP_MEDS_CONTENT_MODE;
  else process.env.PREP_MEDS_CONTENT_MODE = originalMode;
});

function duplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) (seen.has(value) ? repeated : seen).add(value);
  return [...repeated].sort();
}

describe('V1 cross-batch terminology reconciliation', () => {
  it('has schema-valid, duplicate-free canonical ingredient and medication identities', () => {
    expect(validateTerminologyDataset(terminologyDataset)).toEqual([]);
    expect(duplicates(terminologyDataset.ingredients.map((item) => item.id))).toEqual([]);
    expect(duplicates(terminologyDataset.medications.map((item) => item.id))).toEqual([]);
  });

  it.each([
    'bupropion', 'Wellbutrin', 'venlafaxine', 'risperidone', 'quetiapine', 'olanzapine',
    'aripiprazole', 'haloperidol', 'clozapine', 'ziprasidone', 'carbamazepine',
    'lacosamide', 'levetiracetam', 'phenytoin', 'phenobarbital', 'valproate',
    'gabapentin', 'pregabalin', 'cannabis', 'marijuana', 'dronabinol',
  ])('fails nonspecific cross-form/route/release identity %s closed', (query) => {
    const result = index.resolve(query);
    expect(result.status).not.toBe('RESOLVED');
    expect(result.medication).toBeUndefined();
  });
});

describe('V1 cross-batch evidence provenance', () => {
  it('keeps source and atom keys unique inside every assembled evidence bundle', () => {
    for (const bundle of clinicalReviewEvidenceBundles) {
      expect(bundle.sources.length).toBeGreaterThan(0);
      expect(bundle.atoms.length).toBeGreaterThan(0);
      expect(duplicates(bundle.sources.map((source) => `${source.id}@${source.version}`))).toEqual([]);
      expect(duplicates(bundle.atoms.map((atom) => `${atom.id}@${atom.version}`))).toEqual([]);
      const sourceKeys = new Set(bundle.sources.map((source) => `${source.id}@${source.version}`));
      for (const atom of bundle.atoms) expect(sourceKeys.has(`${atom.source.id}@${atom.source.version}`)).toBe(true);
    }
  });

  it('backs every assembled review rule evidence reference with an assembled atom', () => {
    const atomKeys = new Set(clinicalReviewEvidenceBundles.flatMap((bundle) => bundle.atoms.map((atom) => `${atom.id}@${atom.version}`)));
    for (const rule of clinicalReviewRules) for (const ref of rule.evidenceRefs) expect(atomKeys.has(`${ref.id}@${ref.version}`), `${rule.id} -> ${ref.id}@${ref.version}`).toBe(true);
  });
});

describe('V1 freeze governance boundary', () => {
  it('keeps canonical review rules unique and never active in production', () => {
    expect(duplicates(clinicalReviewRules.map((rule) => `${rule.id}@${rule.version}`))).toEqual([]);
    expect(clinicalReviewRules.every((rule) => String(rule.status) !== 'ACTIVE')).toBe(true);
    expect(activeRules).toEqual([]);
  });

  it('requires explicit shadow mode before candidate rules are exposed', () => {
    delete process.env.PREP_MEDS_CONTENT_MODE;
    expect(decisionRules()).toEqual([]);
    process.env.PREP_MEDS_CONTENT_MODE = 'shadow';
    expect(decisionRules()).toBe(clinicalReviewRules);
  });
});

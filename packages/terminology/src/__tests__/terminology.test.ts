import { describe, expect, it } from 'vitest';
import {
  TerminologyIndex,
  assertTerminologyDataset,
  decomposeMedication,
  editDistance,
  normalizeMedicationText,
  type TerminologyDataset,
} from '../index.js';

const dataset: TerminologyDataset = {
  version: 'test-1',
  generatedAt: '2026-09-16T00:00:00Z',
  ingredients: [
    { id: 'ing_apixaban', canonicalName: 'apixaban' },
    { id: 'ing_empagliflozin', canonicalName: 'empagliflozin' },
    { id: 'ing_metformin', canonicalName: 'metformin' },
  ],
  medications: [
    {
      id: 'med_apixaban',
      canonicalName: 'apixaban',
      genericName: 'apixaban',
      brandNames: ['Eliquis'],
      aliases: ['apix'],
      ingredientIds: ['ing_apixaban'],
    },
    {
      id: 'med_empagliflozin',
      canonicalName: 'empagliflozin',
      genericName: 'empagliflozin',
      brandNames: ['Jardiance'],
      ingredientIds: ['ing_empagliflozin'],
    },
    {
      id: 'med_synjardy',
      canonicalName: 'empagliflozin / metformin',
      brandNames: ['Synjardy'],
      ingredientIds: ['ing_empagliflozin', 'ing_metformin'],
    },
  ],
};

const index = new TerminologyIndex(assertTerminologyDataset(dataset));

describe('normalizeMedicationText', () => {
  it('normalizes case, punctuation, whitespace and accents deterministically', () => {
    expect(normalizeMedicationText('  ÉLIQUIS®  ')).toBe('eliquis');
  });
});

describe('editDistance', () => {
  it('returns deterministic Levenshtein distance', () => {
    expect(editDistance('eliqis', 'eliquis')).toBe(1);
  });
});

describe('TerminologyIndex', () => {
  it('resolves a brand name to the normalized medication', () => {
    const result = index.resolve('Eliquis');
    expect(result.status).toBe('RESOLVED');
    expect(result.medication?.id).toBe('med_apixaban');
    expect(result.ingredientIds).toEqual(['ing_apixaban']);
  });

  it('supports deterministic fuzzy matching for a minor misspelling', () => {
    const result = index.search('Eliqis');
    expect(result[0]?.medicationId).toBe('med_apixaban');
    expect(result[0]?.matchKind).toBe('FUZZY');
  });

  it('decomposes combination products into all active ingredients', () => {
    const medication = index.resolve('Synjardy').medication!;
    expect(decomposeMedication(medication)).toEqual(['ing_empagliflozin', 'ing_metformin']);
  });

  it('does not silently resolve an empty or unknown query', () => {
    expect(index.resolve('')).toMatchObject({ status: 'NOT_FOUND', reason: 'NO_MATCH' });
    expect(index.resolve('totally unknown medicine')).toMatchObject({ status: 'NOT_FOUND', reason: 'NO_MATCH' });
  });

  it('returns stable ranking order for repeated searches', () => {
    expect(index.search('empagliflozin')).toEqual(index.search('empagliflozin'));
  });
});

describe('dataset validation', () => {
  it('rejects medication records that reference missing ingredients', () => {
    const invalid: TerminologyDataset = {
      ...dataset,
      medications: [
        {
          id: 'med_invalid',
          canonicalName: 'invalid',
          ingredientIds: ['ing_missing'],
        },
      ],
    };
    expect(() => assertTerminologyDataset(invalid)).toThrow('Unknown ingredient reference');
  });
});

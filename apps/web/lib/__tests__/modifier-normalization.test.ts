import { describe, expect, it } from 'vitest';
import { normalizeModifierValues } from '../workflow';

describe('modifier normalization validation', () => {
  it('keeps only declared select values', () => {
    const definitions = {
      'MOD-select': {
        id: 'MOD-select',
        label: 'Synthetic select',
        inputType: 'select' as const,
        options: [
          { value: 'A', label: 'A' },
          { value: 'B', label: 'B' },
        ],
      },
    };
    const [valid] = normalizeModifierValues(
      [{ modifierId: 'MOD-select', state: 'KNOWN', value: 'A' }],
      definitions,
    );
    const [invalid] = normalizeModifierValues(
      [{ modifierId: 'MOD-select', state: 'KNOWN', value: 'C' }],
      definitions,
    );
    expect(valid?.state).toBe('KNOWN');
    expect(invalid?.state).toBe('UNKNOWN');
    expect(invalid?.value).toBeUndefined();
  });

  it('fails malformed boolean, text, and blank numeric inputs closed', () => {
    const cases = [
      {
        modifier: { modifierId: 'MOD-bool', state: 'KNOWN' as const, value: 1 },
        definitions: {
          'MOD-bool': { id: 'MOD-bool', label: 'Synthetic boolean', inputType: 'boolean' as const },
        },
      },
      {
        modifier: { modifierId: 'MOD-text', state: 'KNOWN' as const, value: 42 },
        definitions: {
          'MOD-text': { id: 'MOD-text', label: 'Synthetic text', inputType: 'text' as const },
        },
      },
      {
        modifier: { modifierId: 'MOD-number', state: 'KNOWN' as const, value: '   ' },
        definitions: {
          'MOD-number': { id: 'MOD-number', label: 'Synthetic number', inputType: 'number' as const },
        },
      },
    ];

    for (const item of cases) {
      const [normalized] = normalizeModifierValues([item.modifier], item.definitions);
      expect(normalized?.state).toBe('UNKNOWN');
      expect(normalized?.value).toBeUndefined();
    }
  });

  it('fails a known value closed when the modifier definition is missing', () => {
    const [normalized] = normalizeModifierValues(
      [{ modifierId: 'MOD-missing', state: 'KNOWN', value: 'A' }],
      {},
    );
    expect(normalized?.state).toBe('UNKNOWN');
    expect(normalized?.value).toBeUndefined();
  });

  it.each([
    ['true', true],
    ['false', false],
  ])('normalizes valid boolean string %s', (raw, expected) => {
    const [normalized] = normalizeModifierValues(
      [{ modifierId: 'MOD-bool', state: 'KNOWN', value: raw }],
      {
        'MOD-bool': { id: 'MOD-bool', label: 'Synthetic boolean', inputType: 'boolean' },
      },
    );
    expect(normalized?.state).toBe('KNOWN');
    expect(normalized?.value).toBe(expected);
  });
});

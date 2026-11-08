import { describe, expect, it } from 'vitest';
import { cockcroftGault } from '../components/CreatinineClearanceCalculator';

describe('Cockcroft-Gault creatinine clearance', () => {
  it('calculates male coefficient in mL/min', () => {
    expect(cockcroftGault({ ageYears: 60, weightKg: 80, serumCreatinineMgDl: 1, sexCoefficient: 1 })).toBeCloseTo(88.8889, 3);
  });
  it('calculates female coefficient in mL/min', () => {
    expect(cockcroftGault({ ageYears: 60, weightKg: 80, serumCreatinineMgDl: 1, sexCoefficient: 0.85 })).toBeCloseTo(75.5556, 3);
  });
  it('rejects missing, nonfinite, zero and negative inputs', () => {
    expect(cockcroftGault({ ageYears: 60, weightKg: 80, serumCreatinineMgDl: 0, sexCoefficient: 1 })).toBeNull();
    expect(cockcroftGault({ ageYears: 60, weightKg: -80, serumCreatinineMgDl: 1, sexCoefficient: 1 })).toBeNull();
    expect(cockcroftGault({ ageYears: Number.NaN, weightKg: 80, serumCreatinineMgDl: 1, sexCoefficient: 1 })).toBeNull();
  });
});

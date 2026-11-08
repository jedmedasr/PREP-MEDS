import { describe, expect, it } from 'vitest';
import { asge2016ApixabanHighRiskTiming as timing } from './antithrombotic-timing';

const base = { medicationIngredient: 'apixaban', procedureBleedingRisk: 'HIGH' as const, kidneyFunctionStable: true };
describe('ASGE 2016 apixaban high-risk research-only timing', () => {
  it.each([[15,4],[29,4],[30,3],[59,3],[60.1,1],[75,1]] as const)('maps CrCl %s to interval starting at %s days', (crcl, days) => {
    const result = timing({ ...base, creatinineClearanceMlMin: crcl });
    expect(result.status).toBe('MATCHED');
    if (result.status === 'MATCHED') expect(result.holdDays[0]).toBe(days);
  });
  it('does not silently decide the 60 mL/min boundary', () => {
    expect(timing({ ...base, creatinineClearanceMlMin: 60 }).status).toBe('REQUIRES_REVIEW');
  });
  it.each([null, NaN, Infinity, 0, -1, 14.9])('fails closed on missing/out-of-range CrCl %s', crcl => {
    expect(timing({ ...base, creatinineClearanceMlMin: crcl }).status).toBe('REQUIRES_REVIEW');
  });
  it('fails closed on unstable renal function', () => {
    expect(timing({ ...base, creatinineClearanceMlMin: 70, kidneyFunctionStable: false }).status).toBe('REQUIRES_REVIEW');
  });
  it('prevents cross-agent timing inheritance', () => {
    expect(timing({ ...base, medicationIngredient: 'rivaroxaban', creatinineClearanceMlMin: 70 }).status).toBe('REQUIRES_REVIEW');
  });
  it('does not apply high-risk hold timing to low-risk procedures', () => {
    expect(timing({ ...base, procedureBleedingRisk: 'LOW', creatinineClearanceMlMin: 70 }).status).toBe('REQUIRES_REVIEW');
  });
  it('preserves the source interval rather than picking a hold day', () => {
    const result = timing({ ...base, creatinineClearanceMlMin: 75 });
    if (result.status !== 'MATCHED') throw new Error('Expected matching bracket');
    expect(result.holdDays).toEqual([1, 2]);
  });
});

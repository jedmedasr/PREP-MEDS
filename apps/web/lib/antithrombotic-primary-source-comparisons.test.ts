import { describe, expect, it } from 'vitest';
import { anticoagulantSourceComparisons, getResearchOnlyAnticoagulantComparison, findAsge2016ResearchStratum } from './antithrombotic-primary-source-comparisons';

describe('source-specific anticoagulant research ledger (not prescribing guidance)', () => {
  it('does not silently apply apixaban renal strata to rivaroxaban', () => {
    const apixaban = getResearchOnlyAnticoagulantComparison('ING-apixaban');
    const rivaroxaban = getResearchOnlyAnticoagulantComparison('ING-rivaroxaban');
    expect(apixaban?.asge2016.table).toBe('Table 7');
    expect(rivaroxaban?.asge2016.table).toBe('Table 8');
    expect(apixaban?.asge2016.highRiskCrClDays).not.toEqual(rivaroxaban?.asge2016.highRiskCrClDays);
  });
  it('preserves ASGE ranges and minimums instead of inventing a unique dose date', () => {
    const apixaban = getResearchOnlyAnticoagulantComparison('ING-apixaban');
    const rivaroxaban = getResearchOnlyAnticoagulantComparison('ING-rivaroxaban');
    expect(apixaban?.asge2016.highRiskCrClDays[0].days).toEqual([1, 2]);
    expect(rivaroxaban?.asge2016.highRiskCrClDays[0].days).toEqual([1]);
    expect(rivaroxaban?.asge2016.highRiskCrClDays[0]).toHaveProperty('minimumDays', true);
  });
  it('retains distinct ASGE 2016 and BSG/ESGE 2021 evidence with unresolved approval', () => {
    expect(anticoagulantSourceComparisons).toHaveLength(2);
    for (const entry of anticoagulantSourceComparisons) {
      expect(entry.clinicalApproval).toBe(false);
      expect(entry.status).toBe('IN_PROGRESS');
      expect(entry.asge2016.doi).toBe('10.1016/j.gie.2015.09.035');
      expect(entry.bsgEsge2021.doi).toBe('10.1136/gutjnl-2021-325184');
      expect(entry.acgCag2022.exactHighRiskLastDoseDays).toBeNull();
      expect(entry.unresolved.length).toBeGreaterThan(0);
    }
    expect(getResearchOnlyAnticoagulantComparison('ING-dabigatran')).toBeNull();
    expect(getResearchOnlyAnticoagulantComparison('ING-warfarin')).toBeNull();
  });
});


describe('ASGE research renal boundaries fail closed', () => {
  it('does not invent apixaban timing at the unassigned CrCl 60 boundary', () => {
    expect(findAsge2016ResearchStratum('ING-apixaban', 60)).toBeNull();
    expect(findAsge2016ResearchStratum('ING-apixaban', 59)?.days).toEqual([3]);
    expect(findAsge2016ResearchStratum('ING-apixaban', 61)?.days).toEqual([1, 2]);
  });
  it('keeps rivaroxaban renal thresholds independent', () => {
    expect(findAsge2016ResearchStratum('ING-rivaroxaban', 60)?.days).toEqual([2]);
    expect(findAsge2016ResearchStratum('ING-rivaroxaban', 90)?.days).toEqual([2]);
    expect(findAsge2016ResearchStratum('ING-rivaroxaban', 91)?.days).toEqual([1]);
  });
  it('rejects missing, nonfinite, out-of-range and unrelated agent data', () => {
    for (const crcl of [0, -1, NaN, Infinity, -Infinity]) {
      expect(findAsge2016ResearchStratum('ING-apixaban', crcl)).toBeNull();
    }
    expect(findAsge2016ResearchStratum('ING-apixaban', 14)).toBeNull();
    expect(findAsge2016ResearchStratum('ING-rivaroxaban', 14)).toBeNull();
    expect(findAsge2016ResearchStratum('ING-warfarin', 80)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { anticoagulantSourceComparisons, getResearchOnlyAnticoagulantComparison, findAsge2016ResearchStratum, findAsge2016HighRiskEndoscopyEvidence } from './antithrombotic-primary-source-comparisons';

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

describe('research-only comparator evidence completeness gate', () => {
  it('never treats a partial ASGE comparison as clinical completion', () => {
    for (const entry of anticoagulantSourceComparisons) {
      expect(entry.status).toBe('IN_PROGRESS');
      expect(entry.clinicalApproval).toBe(false);
      expect(entry.unresolved.some(issue => /FDA|CHEST|ACC/i.test(issue))).toBe(true);
      expect(entry.asge2016.highRiskCrClDays.length).toBeGreaterThan(0);
      expect(entry.acgCag2022.exactHighRiskLastDoseDays).toBeNull();
    }
  });
  it('does not invent an ASGE dose interval at a gap or for another agent', () => {
    const { findAsge2016ResearchStratum } = require('./antithrombotic-primary-source-comparisons');
    expect(findAsge2016ResearchStratum('ING-apixaban', 60)).toBeNull();
    expect(findAsge2016ResearchStratum('ING-warfarin', 60)).toBeNull();
    expect(findAsge2016ResearchStratum('ING-rivaroxaban', Number.NaN)).toBeNull();
  });
});

describe('ASGE 2016 apixaban/rivaroxaban endoscopy scenario evidence (research only)', () => {
  const base = { ingredientId: 'ING-apixaban', creatinineClearance: 61, procedure: 'EGD' as const, interventionRisk: 'HIGH' as const, formulation: 'ADULT_ORAL' as const };
  it('only returns historical high-risk adult oral evidence when risk is explicit', () => {
    expect(findAsge2016HighRiskEndoscopyEvidence(base)?.days).toEqual([1, 2]);
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, interventionRisk: 'LOW' })).toBeNull();
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, interventionRisk: 'UNKNOWN' })).toBeNull();
  });
  it('never inherits adult evidence into pediatric or unadjudicated formulations', () => {
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, formulation: 'PEDIATRIC_ORAL' })).toBeNull();
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, formulation: 'UNKNOWN' })).toBeNull();
  });
  it('does not infer ASGE values at gaps or invalid CrCl, including fractional boundaries', () => {
    for (const crcl of [60, 59.5, 29.5, 14, 0, NaN, Infinity]) {
      expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, creatinineClearance: crcl })).toBeNull();
    }
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, creatinineClearance: 30 })?.days).toEqual([3]);
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, creatinineClearance: 29 })?.days).toEqual([4]);
  });
  it('does not conflate diagnostic, combined, or agent-specific high-risk pathways', () => {
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, procedure: 'COMBINED', interventionRisk: 'UNKNOWN' })).toBeNull();
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, procedure: 'COLONOSCOPY', interventionRisk: 'LOW' })).toBeNull();
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, ingredientId: 'ING-rivaroxaban', creatinineClearance: 91 })?.days).toEqual([1]);
    expect(findAsge2016HighRiskEndoscopyEvidence({ ...base, ingredientId: 'ING-warfarin' })).toBeNull();
  });
});

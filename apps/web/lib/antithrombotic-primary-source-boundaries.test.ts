import { describe, expect, it } from 'vitest';
import { getResearchOnlyAnticoagulantComparison } from './antithrombotic-primary-source-comparisons';

/** Research data boundary tests. No prescription or last-dose calculation is performed. */
function matchesStratum(stratum: { minInclusive?: number; minExclusive?: number; maxInclusive: number | null }, crcl: number): boolean {
  return (stratum.minInclusive === undefined || crcl >= stratum.minInclusive)
    && (stratum.minExclusive === undefined || crcl > stratum.minExclusive)
    && (stratum.maxInclusive === null || crcl <= stratum.maxInclusive);
}

describe('ASGE 2016 research table boundary integrity', () => {
  it.each([
    ['ING-apixaban', 14, 0], ['ING-apixaban', 15, 1],
    ['ING-apixaban', 29, 1], ['ING-apixaban', 30, 1],
    ['ING-apixaban', 59, 1], ['ING-apixaban', 60, 0],
    ['ING-apixaban', 61, 1],
    ['ING-rivaroxaban', 14, 0], ['ING-rivaroxaban', 15, 1],
    ['ING-rivaroxaban', 29, 1], ['ING-rivaroxaban', 30, 1],
    ['ING-rivaroxaban', 59, 1], ['ING-rivaroxaban', 60, 1],
    ['ING-rivaroxaban', 90, 1], ['ING-rivaroxaban', 91, 1],
  ] as const)('%s CrCl %s matches %s source strata', (ingredient, crcl, expected) => {
    const record = getResearchOnlyAnticoagulantComparison(ingredient);
    expect(record).not.toBeNull();
    const matches = record!.asge2016.highRiskCrClDays.filter(s => matchesStratum(s, crcl));
    expect(matches).toHaveLength(expected);
  });
  it('never maps an unrelated drug to an anticoagulant evidence table', () => {
    for (const id of ['ING-dabigatran', 'ING-edoxaban', 'ING-warfarin', 'ING-aspirin', '']) {
      expect(getResearchOnlyAnticoagulantComparison(id)).toBeNull();
    }
  });
});

/** Research-only LMWH bridging evidence: does not generate medication instructions. */
import { describe, expect, it } from 'vitest';
import manifest from '../../../docs/medication-audit-manifest.json';

const guidance = {
  ASGE2016: { source: 'https://doi.org/10.1016/j.gie.2015.09.035', section: 'Table 2, Table 3 and bridging narrative', bridgeLastDoseMinHours: 24 },
  BSGESGE2021: { source: 'https://doi.org/10.1136/gutjnl-2021-325184', section: 'Warfarin/LMWH bridging algorithm', bridgeLastDoseMinHours: 24 },
  ACGCAG2022: { source: 'https://gi.org/wp-content/uploads/2022/03/ACG-CAG-Guideline.pdf', section: 'Elective endoscopy, warfarin bridging', routineBridgingRecommended: false },
} as const;
type Indication = 'warfarin_bridge' | 'therapeutic_lmwh' | 'prophylactic_lmwh' | 'unknown';
type BleedRisk = 'low' | 'high' | 'unknown';
function researchClassification(indication: Indication, risk: BleedRisk, hours: number, hemostasis: boolean) {
  if (indication !== 'warfarin_bridge' || risk !== 'high' || !Number.isFinite(hours) || hours < 0)
    return 'REQUIRES_INDIVIDUAL_REVIEW';
  if (!hemostasis) return 'NO_AUTOMATIC_RESTART';
  return hours >= guidance.BSGESGE2021.bridgeLastDoseMinHours
    ? 'HISTORICAL_BRIDGE_INTERVAL_MET_NOT_APPROVAL' : 'HISTORICAL_BRIDGE_INTERVAL_NOT_MET';
}
describe('enoxaparin source-specific evidence safety (not clinical rules)', () => {
  it('keeps the three primary guidelines individually linked and bridging discordance explicit', () => {
    expect(Object.values(guidance).every(g => g.source.startsWith('https://'))).toBe(true);
    expect(guidance.ASGE2016.bridgeLastDoseMinHours).toBe(24);
    expect(guidance.BSGESGE2021.bridgeLastDoseMinHours).toBe(24);
    expect(guidance.ACGCAG2022.routineBridgingRecommended).toBe(false);
  });
  it.each([0, 23.99, 24, 24.01])('preserves historical 24-hour bridge boundary at %s hours', h => {
    expect(researchClassification('warfarin_bridge', 'high', h, true)).toBe(
      h >= 24 ? 'HISTORICAL_BRIDGE_INTERVAL_MET_NOT_APPROVAL' : 'HISTORICAL_BRIDGE_INTERVAL_NOT_MET');
  });
  it.each(['therapeutic_lmwh', 'prophylactic_lmwh', 'unknown'] as const)(
    'does not inherit warfarin bridging interval for %s', indication => {
      expect(researchClassification(indication, 'high', 48, true)).toBe('REQUIRES_INDIVIDUAL_REVIEW');
    });
  it.each(['low', 'unknown'] as const)('does not apply high-risk bridge to %s procedure', risk => {
    expect(researchClassification('warfarin_bridge', risk, 48, true)).toBe('REQUIRES_INDIVIDUAL_REVIEW');
  });
  it('never automatically restarts without secure hemostasis', () => {
    expect(researchClassification('warfarin_bridge', 'high', 48, false)).toBe('NO_AUTOMATIC_RESTART');
  });
  it.each([NaN, Infinity, -1])('rejects invalid elapsed time %s', hours => {
    expect(researchClassification('warfarin_bridge', 'high', hours, true)).toBe('REQUIRES_INDIVIDUAL_REVIEW');
  });
  it('maps enoxaparin only to its canonical ingredient ID and excludes UFH and DOACs', () => {
    const group = manifest.groups.find(g => g.ingredientSetKey === 'ING-enoxaparin');
    expect(group).toBeDefined();
    expect(group!.medicationIds).toEqual(['MED-enoxaparin']);
    expect(manifest.canonicalIdToProvisionalGroup['MED-enoxaparin']).toBe('ING-enoxaparin');
    for (const id of ['MED-heparin', 'MED-apixaban', 'MED-rivaroxaban']) {
      expect(manifest.canonicalIdToProvisionalGroup[id]).not.toBe('ING-enoxaparin');
    }
  });
});

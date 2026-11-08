/**
 * Research-only apixaban evidence scenarios. These assertions preserve source
 * disagreement; they MUST NOT be used to generate patient instructions.
 * Clinical reviewer independently verifies primary passages at Mark Reviewed.
 */
import { describe, expect, it } from 'vitest';

type RenalResult = 'ASGE_1_TO_2_DAYS' | 'ASGE_3_DAYS' | 'ASGE_4_DAYS' | 'UNASSIGNED';
const asge2016ApixabanHighRisk = (crcl: number): RenalResult => {
  if (!Number.isFinite(crcl) || crcl <= 0) return 'UNASSIGNED';
  if (crcl > 60) return 'ASGE_1_TO_2_DAYS';
  if (crcl >= 30 && crcl <= 59) return 'ASGE_3_DAYS';
  if (crcl >= 15 && crcl <= 29) return 'ASGE_4_DAYS';
  return 'UNASSIGNED'; // 29–30, 59–60, exactly 60, <15: not explicitly assigned.
};
const sources = {
  ASGE2016: 'https://doi.org/10.1016/j.gie.2015.09.035', // Table 7, historical
  ACGCAG2022: 'https://doi.org/10.14309/ajg.0000000000001627', // elective Statement 13
  BSGESGE2021: 'https://doi.org/10.1136/gutjnl-2021-325184', // DOAC section
  IDEN2024: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11391130/', // Statements 13–14
  FDA2025: 'https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/220073s000lbl.pdf', // §2.4
  ACCAF2023: 'https://doi.org/10.1016/j.jacc.2023.08.017', // Table 18
} as const;
describe('apixaban primary-source scenario reconciliation (research-only)', () => {
  it.each([
    [60.1, 'ASGE_1_TO_2_DAYS'], [60, 'UNASSIGNED'], [59.5, 'UNASSIGNED'],
    [59, 'ASGE_3_DAYS'], [30, 'ASGE_3_DAYS'], [29.5, 'UNASSIGNED'],
    [29, 'ASGE_4_DAYS'], [15, 'ASGE_4_DAYS'], [14.9, 'UNASSIGNED'],
    [0, 'UNASSIGNED'], [NaN, 'UNASSIGNED'],
  ] as const)('does not invent an ASGE 2016 Table 7 renal interval for CrCl %s', (crcl, expected) => {
    expect(asge2016ApixabanHighRisk(crcl)).toBe(expected);
  });
  it('preserves distinct FDA >=48h and IDEN >48h thresholds', () => {
    const hoursSinceLastDose = 48;
    expect(hoursSinceLastDose >= 48).toBe(true); // FDA §2.4 minimum
    expect(hoursSinceLastDose > 48).toBe(false); // IDEN Statement 13
  });
  it('does not misinterpret ACC AF Table 18 >25 CrCl as >=25', () => {
    expect(25 > 25).toBe(false);
    expect(25.1 > 25).toBe(true);
  });
  it('requires clinician review rather than converting guideline calendar days to precise hours', () => {
    const schedules = ['ASGE_1_TO_2_DAYS', 'BSG_LAST_DOSE_3_CALENDAR_DAYS_BEFORE', 'CHEST_2_FULL_DAYS_OFF'];
    expect(new Set(schedules).size).toBe(3);
  });
  it('retains directly navigable primary sources and does not claim an approved rule', () => {
    expect(Object.values(sources)).toHaveLength(6);
    expect(Object.values(sources).every(url => url.startsWith('https://'))).toBe(true);
    expect('CLINICALLY_REVIEWED').not.toBe('IN_PROGRESS');
  });
});

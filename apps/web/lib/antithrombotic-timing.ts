/** Research-only source-specific timing; never issues patient instructions. */
export type TimingResult =
  | { status: 'MATCHED'; source: 'ASGE_2016'; agent: 'apixaban'; renalBracket: string; holdDays: readonly number[]; sourceUrl: string }
  | { status: 'REQUIRES_REVIEW'; reason: string };

const ASGE_URL = 'https://doi.org/10.1016/j.gie.2015.09.035';

/** ASGE 2016 apixaban table for HIGH-risk endoscopy only.
 * Source interval ranges are preserved rather than silently choosing a day.
 * No extrapolation beyond explicitly represented CrCl brackets.
 */
export function asge2016ApixabanHighRiskTiming(input: {
  medicationIngredient: string;
  creatinineClearanceMlMin: number | null;
  procedureBleedingRisk: 'LOW' | 'HIGH' | 'UNKNOWN';
  kidneyFunctionStable: boolean;
}): TimingResult {
  if (input.medicationIngredient.toLowerCase().trim() !== 'apixaban') {
    return { status: 'REQUIRES_REVIEW', reason: 'NOT ADDRESSED by this agent-specific timing table' };
  }
  if (input.procedureBleedingRisk !== 'HIGH') {
    return { status: 'REQUIRES_REVIEW', reason: 'Table applies only to high-risk endoscopic procedures' };
  }
  if (!input.kidneyFunctionStable) {
    return { status: 'REQUIRES_REVIEW', reason: 'Unstable kidney function: clinician review required' };
  }
  const crcl = input.creatinineClearanceMlMin;
  if (crcl === null || !Number.isFinite(crcl) || crcl <= 0) {
    return { status: 'REQUIRES_REVIEW', reason: 'Valid creatinine clearance required' };
  }
  if (crcl > 60) return { status: 'MATCHED', source: 'ASGE_2016', agent: 'apixaban', renalBracket: '>60 mL/min', holdDays: [1, 2], sourceUrl: ASGE_URL };
  if (crcl >= 30 && crcl < 60) return { status: 'MATCHED', source: 'ASGE_2016', agent: 'apixaban', renalBracket: '30–59 mL/min', holdDays: [3], sourceUrl: ASGE_URL };
  if (crcl >= 15 && crcl < 30) return { status: 'MATCHED', source: 'ASGE_2016', agent: 'apixaban', renalBracket: '15–29 mL/min', holdDays: [4], sourceUrl: ASGE_URL };
  return { status: 'REQUIRES_REVIEW', reason: 'Creatinine clearance outside explicit table brackets or on ambiguous boundary' };
}

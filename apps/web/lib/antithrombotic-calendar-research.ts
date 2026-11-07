/**
 * Date-only research aid. Never represents an exact last permissible dose.
 * Uses the LOCAL calendar date supplied by the clinician, not UTC time or 24h offsets.
 * Hold-day interpretation varies by source and dosing regimen; verify independently.
 */
export type CalendarResearchResult =
  | { status: 'CALENDAR_DATES_ONLY'; candidateDates: string[]; disclaimer: string }
  | { status: 'REQUIRES_REVIEW'; reason: string };

function parseIsoCalendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year = NaN, month = NaN, day = NaN] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() + 1 !== month || date.getUTCDate() !== day) return null;
  return date;
}

export function researchHoldCalendarDates(input: {
  procedureLocalDate: string;
  holdDays: readonly number[];
}): CalendarResearchResult {
  const procedureDate = parseIsoCalendarDate(input.procedureLocalDate);
  if (!procedureDate) return { status: 'REQUIRES_REVIEW', reason: 'Valid procedure local calendar date required (YYYY-MM-DD)' };
  if (!input.holdDays.length || input.holdDays.some(day => !Number.isInteger(day) || day < 0 || day > 30)) {
    return { status: 'REQUIRES_REVIEW', reason: 'Validated whole-day source interval required' };
  }
  return {
    status: 'CALENDAR_DATES_ONLY',
    candidateDates: input.holdDays.map(day => {
      const d = new Date(procedureDate);
      d.setUTCDate(d.getUTCDate() - day);
      return d.toISOString().slice(0, 10);
    }),
    disclaimer: 'Calendar subtraction only, NOT a verified last-dose date/time. The meaning of “hold N days” and exact last dose must be reconciled to the cited guideline, dosing schedule and procedure time by a clinician.',
  };
}

import { describe, expect, it } from 'vitest';
import { researchHoldCalendarDates as dates } from './antithrombotic-calendar-research';
describe('research-only hold calendar dates', () => {
  it('preserves a source range as separate candidate dates', () => {
    expect(dates({procedureLocalDate:'2026-11-12',holdDays:[1,2]})).toMatchObject({
      status:'CALENDAR_DATES_ONLY',candidateDates:['2026-11-11','2026-11-10'],
    });
  });
  it('crosses year boundary without using current time zone', () => {
    expect(dates({procedureLocalDate:'2027-01-01',holdDays:[3]})).toMatchObject({candidateDates:['2026-12-29']});
  });
  it('handles leap day', () => {
    expect(dates({procedureLocalDate:'2028-03-01',holdDays:[1]})).toMatchObject({candidateDates:['2028-02-29']});
  });
  it.each(['2026-02-29','2026-13-01','2026-11-31','11/12/2026',''])('rejects invalid date %s', value => {
    expect(dates({procedureLocalDate:value,holdDays:[1]}).status).toBe('REQUIRES_REVIEW');
  });
  it.each([[],[-1],[1.5],[31]])('rejects unvalidated intervals %j', days => {
    expect(dates({procedureLocalDate:'2026-11-12',holdDays:days}).status).toBe('REQUIRES_REVIEW');
  });
});

import { describe,it,expect } from 'vitest';
import { addCalendarDays, subtractMinutes, calendarEvents, defaultInstructions, validatePlan, type Plan } from '../plan';
describe('patient calendar safety',()=>{
  it('handles month and leap-year transitions without local timezone drift',()=>{
    expect(addCalendarDays('2028-03-01',-1)).toBe('2028-02-29');
    expect(addCalendarDays('2026-01-01',-7)).toBe('2025-12-25');
  });
  it('calculates previous-day dose starts',()=>{
    expect(subtractMinutes('05:00',360)).toEqual({time:'23:00',dayOffset:-1});
    expect(subtractMinutes('09:00',360)).toEqual({time:'03:00',dayOffset:0});
  });
  it('blocks unapproved clinical instructions and protocol',()=>{
    const plan:Plan={product:'GoLYTELY',lowFiberDays:7,procedureDate:'2026-12-10',procedureTime:'09:00',arrivalTime:'08:00',protocolApproved:false,instructions:defaultInstructions('GoLYTELY')};
    expect(validatePlan(plan)).toContain('Institutional timing and fasting protocol not approved');
    expect(validatePlan(plan).some(x=>x.includes('pending approval'))).toBe(true);
    expect(calendarEvents(plan).find(x=>x.id==='diet-clear')?.date).toBe('2026-12-09');
  });
  it('keeps bowel-prep completion separate from facility liquid cutoff',()=>{
    expect(subtractMinutes('09:00',240)).toEqual({time:'05:00',dayOffset:0});
    expect(subtractMinutes('09:00',360)).toEqual({time:'03:00',dayOffset:0});
    const plan:Plan={product:'GoLYTELY',lowFiberDays:7,procedureDate:'2026-12-10',procedureTime:'09:00',arrivalTime:'08:00',anesthesiaClearLiquidCutoff:'invalid',protocolApproved:false,instructions:defaultInstructions('GoLYTELY')};
    expect(validatePlan(plan)).toContain('Invalid anesthesia clear-liquid cutoff');
    plan.anesthesiaClearLiquidCutoff=undefined;
    expect(validatePlan(plan)).not.toContain('Invalid anesthesia clear-liquid cutoff');
  });
  it('requires an identified clinician and valid schedule for approval',()=>{
    const plan:Plan={product:'SUPREP',lowFiberDays:7,procedureDate:'2026-12-10',procedureTime:'25:00',arrivalTime:'08:00',protocolApproved:true,instructions:defaultInstructions('SUPREP').map(x=>({...x,approved:true}))};
    expect(validatePlan(plan)).toContain('Valid procedure time required');
    expect(validatePlan(plan)).toContain('Clinician approval required');
  });
});

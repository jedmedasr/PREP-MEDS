export type PrepProduct = 'GoLYTELY' | 'SUPREP' | 'SUTAB' | 'CLENPIQ' | 'PLENVU' | 'MoviPrep';
export type PlanInstruction = {
  id: string; title: string; detail: string; offsetDays: number;
  time?: string; kind: 'diet' | 'prep' | 'medication' | 'other';
  critical: boolean; approved: boolean; overrideReason?: string;
};
export type Plan = {
  product: PrepProduct; lowFiberDays: number; instructions: PlanInstruction[];
  procedureDate: string; procedureTime: string; arrivalTime: string;
  protocolApproved: boolean; approvedBy?: string; approvedAt?: string;
};
export type CalendarEvent = PlanInstruction & { date: string; label: string };
export const PREPS: PrepProduct[] = ['GoLYTELY','SUPREP','SUTAB','CLENPIQ','PLENVU','MoviPrep'];
export const DIET_GUIDE = {
  lowFiber: { allowed: ['White rice','White bread','Plain pasta','Eggs','Skinless poultry'], avoid: ['Nuts and seeds','Popcorn','Whole grains','Raw vegetables','Fruit skins'] },
  clear: { allowed: ['Water','Clear broth','Apple juice without pulp','Tea without milk','Clear yellow sports drinks'], avoid: ['Solid food','Milk or cream','Juice with pulp','Red or purple drinks','Red or purple gelatin'] },
};
export function addCalendarDays(iso: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error('Invalid date');
  const date = new Date(iso + 'T12:00:00Z');
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0,10) !== iso) throw new Error('Invalid date');
  date.setUTCDate(date.getUTCDate()+days);
  return date.toISOString().slice(0,10);
}
export function subtractMinutes(time: string, minutes: number): {time:string; dayOffset:number} {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Invalid time');
  const [h,m] = time.split(':').map(Number);
  const total = (h ?? 0)*60+(m ?? 0)-minutes;
  const dayOffset = Math.floor(total/1440);
  const normalized = ((total%1440)+1440)%1440;
  return {time:String(Math.floor(normalized/60)).padStart(2,'0')+':'+String(normalized%60).padStart(2,'0'),dayOffset};
}
export function validatePlan(plan: Plan): string[] {
  const errors: string[]=[];
  try { addCalendarDays(plan.procedureDate,0); } catch { errors.push('Valid procedure date required'); }
  try { subtractMinutes(plan.procedureTime,0); } catch { errors.push('Valid procedure time required'); }
  try { subtractMinutes(plan.arrivalTime,0); } catch { errors.push('Valid arrival time required'); }
  if (!PREPS.includes(plan.product)) errors.push('Unknown bowel preparation');
  if (!Number.isInteger(plan.lowFiberDays) || plan.lowFiberDays < 0 || plan.lowFiberDays > 14) errors.push('Invalid low-fiber interval');
  if (!plan.protocolApproved) errors.push('Institutional timing and fasting protocol not approved');
  if (!plan.approvedBy || !plan.approvedAt) errors.push('Clinician approval required');
  for (const item of plan.instructions) {
    if (!item.title.trim() || !item.detail.trim()) errors.push('Incomplete instruction: '+item.id);
    if (!item.approved) errors.push('Instruction pending approval: '+item.id);
    if (item.critical && item.overrideReason === '') errors.push('Clinical override requires a reason: '+item.id);
    if (item.time) { try { subtractMinutes(item.time,0); } catch { errors.push('Invalid instruction time: '+item.id); } }
  }
  return errors;
}
export function calendarEvents(plan: Plan): CalendarEvent[] {
  addCalendarDays(plan.procedureDate,0);
  return plan.instructions.map(item=>({
    ...item,date:addCalendarDays(plan.procedureDate,item.offsetDays),
    label:item.offsetDays===0?'Procedure day':item.offsetDays===-1?'Day before':Math.abs(item.offsetDays)+' days before',
  })).sort((a,b)=>a.date.localeCompare(b.date)||(a.time??'').localeCompare(b.time??''));
}
export function defaultInstructions(product: PrepProduct): PlanInstruction[] {
  return [
    {id:'diet-low',title:'Low-fiber diet',detail:'Follow the low-fiber food guide. Avoid nuts, seeds, popcorn, and whole grains.',offsetDays:-7,kind:'diet',critical:false,approved:false},
    {id:'diet-clear',title:'Clear-liquid diet',detail:'Clear liquids only. No solid foods; avoid red or purple drinks and gelatin.',offsetDays:-1,kind:'diet',critical:false,approved:false},
    {id:'prep-first',title:product+' first dose',detail:'Dose and mixing instructions must be reviewed against the selected product and local protocol.',offsetDays:-1,time:'17:00',kind:'prep',critical:true,approved:false},
    {id:'prep-second',title:product+' second dose',detail:'Start and completion times must be calculated and approved for the scheduled procedure.',offsetDays:0,kind:'prep',critical:true,approved:false},
    {id:'fasting',title:'Stop drinking / fasting cutoff',detail:'Follow the approved anesthesia fasting cutoff. Do not infer it from bowel-preparation completion.',offsetDays:0,kind:'prep',critical:true,approved:false},
  ];
}

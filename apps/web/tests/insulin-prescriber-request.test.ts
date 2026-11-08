import { describe, expect, it } from 'vitest';
import { generateInsulinRequest, insulinDietDescription, type InsulinRequest } from '../components/InsulinPrescriberRequest';

const base: InsulinRequest = { clinician:'Dr. Endocrinology', patientReference:'TEST-123',procedure:'COLONOSCOPY',procedureDate:'2026-12-01',procedureTime:'08:00',insulinRegimen:'glargine 20 units nightly; lispro with meals',diabetesType:'Type 1',monitoring:'CGM',fastingPolicy:'midnight',clearLiquidStart:'',otherNotes:'' };
describe('insulin prescriber communication',()=>{
 it('uses clear-liquid day and explicitly preserves split-dose prep exception for colonoscopy',()=>{
  const text=generateInsulinRequest(base);
  expect(text).toContain('ENTIRE day before');
  expect(text).toContain('split-dose');
  expect(text).toContain('Do not omit the morning preparation dose');
  expect(text).toContain('basal insulin must not be completely omitted');
  expect(text).toContain('Rapid-/short-acting');
 });
 it('uses usual diet and NPO policy for EGD-only',()=>{
  const text=insulinDietDescription({...base,procedure:'EGD'});
  expect(text).toContain('usual diet');
  expect(text).not.toContain('ENTIRE day before');
  expect(text).toContain('after midnight');
 });
 it('uses colonoscopy diet for combined procedures',()=>{
  expect(insulinDietDescription({...base,procedure:'EGD_COLONOSCOPY'})).toContain('ENTIRE day before');
 });
 it('supports configurable anesthesia-specific fasting cutoffs',()=>{
  const text=insulinDietDescription({...base,fastingPolicy:'anesthesia'});
  expect(text).toContain('anesthesia-approved');
  expect(text).not.toContain('no routine oral intake after midnight');
 });
});

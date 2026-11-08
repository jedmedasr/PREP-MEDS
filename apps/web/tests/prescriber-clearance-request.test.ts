import { describe, expect, it } from 'vitest';
import { generateClearanceRequest, type ClearanceRequest } from '../components/PrescriberClearanceRequest';

const base: ClearanceRequest = {
 clinicianName:'Dr. Cardiology', patientReference:'TEST-123', medication:'clopidogrel',
 agentClass:'p2y12', indication:'coronary stent', procedure:'Colonoscopy',
 procedureDate:'2026-12-01', interventionRisk:'Possible polypectomy',
 holdDays:'5', renalClearance:'65', resumptionPlan:'After hemostasis, per prescriber',
 sourceNote:'ASGE 2016; ACG/CAG 2022'
};
describe('provider antithrombotic clearance draft',()=>{
 it('asks for explicit approval and aspirin substitution authorization for P2Y12 inhibitors',()=>{
  const text=generateClearanceRequest(base);
  expect(text).toContain('subject to your approval');
  expect(text).toContain('ONLY if you approve it');
  expect(text).toContain('coronary stents');
  expect(text).toContain('65 mL/min');
  expect(text).toContain('ASGE 2016');
  expect(text).toContain('documented approval');
 });
 it('does not imply aspirin substitutes for anticoagulation',()=>{
  const text=generateClearanceRequest({...base, medication:'apixaban', agentClass:'anticoagulant'});
  expect(text).toContain('does not imply that aspirin replaces therapeutic anticoagulation');
  expect(text).not.toContain('aspirin during the interruption');
 });
 it('does not invent a hold interval when missing',()=>{
  const text=generateClearanceRequest({...base,holdDays:''});
  expect(text).toContain('No interruption interval has been established');
 });
});

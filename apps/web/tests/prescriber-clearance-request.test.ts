import { describe, expect, it } from 'vitest';
import {
  consultFieldVisibility,
  generateClearanceRequest,
  inferAgentClass,
  inferMedicationIngredient,
  shouldShowManualHoldConfirmation,
  type ClearanceRequest,
} from '../components/PrescriberClearanceRequest';

const base: ClearanceRequest = {
  clinicianName: 'Dr. Cardiology',
  patientReference: 'TEST-123',
  medication: 'apixaban 5 mg twice daily',
  indication: 'atrial fibrillation',
  procedure: 'colonoscopy',
  procedureDate: '2026-12-01',
  holdInterval: '2 days',
};

describe('provider antithrombotic clearance draft', () => {
  it('uses the concise pre-op consult wording approved for cardiology or the prescribing clinician', () => {
    const text = generateClearanceRequest(base);
    expect(text).toContain('requesting your pre-operative clearance');
    expect(text).toContain('requesting clearance to hold this medication for 2 days');
    expect(text).toContain('otherwise optimized to proceed from your standpoint');
    expect(text).toContain('please arrange an expedited appointment');
  });

  it('does not mention guideline language or emit blank placeholders', () => {
    const text = generateClearanceRequest(base);
    expect(text).not.toContain('ASGE');
    expect(text).not.toContain('ACG');
    expect(text).not.toContain('guideline');
    expect(text).not.toContain('[not provided]');
  });

  it('does not generate an incomplete provider message', () => {
    expect(generateClearanceRequest({ ...base, clinicianName: '' })).toBe('');
    expect(generateClearanceRequest({ ...base, holdInterval: '' })).toBe('');
    expect(generateClearanceRequest({ ...base, procedureDate: '' })).toBe('');
  });

  it('derives common antithrombotic ingredient and class from the selected medication', () => {
    expect(inferMedicationIngredient('ELIQUIS apixaban 5 mg tablet')).toBe('apixaban');
    expect(inferAgentClass('ELIQUIS apixaban 5 mg tablet')).toBe('anticoagulant');
    expect(inferAgentClass('clopidogrel 75 mg tablet')).toBe('p2y12');
    expect(inferAgentClass('aspirin 81 mg tablet')).toBe('other-antiplatelet');
  });
});


describe('clearance consult field persistence', () => {
  it('keeps manually entered consult fields mounted while the user types', () => {
    expect(consultFieldVisibility('')).toEqual({
      clinicianName: true,
      patientReference: true,
      indication: true,
      procedure: true,
      procedureDate: true,
    });
  });

  it('hides only the procedure field when it was actually supplied upstream', () => {
    expect(consultFieldVisibility('Colonoscopy')).toEqual({
      clinicianName: true,
      patientReference: true,
      indication: true,
      procedure: false,
      procedureDate: true,
    });
  });
});


describe('clearance hold interval visibility', () => {
  it('shows a manual hold field when a selected reference cannot derive an interval', () => {
    expect(shouldShowManualHoldConfirmation({
      referenceSelected: true,
      medicationSelected: true,
      derivedHoldInterval: '',
      needsAsgeInputs: false,
      asgeInputsComplete: true,
    })).toBe(true);
  });

  it('does not hide the blocker when medication mapping is unknown', () => {
    expect(shouldShowManualHoldConfirmation({
      referenceSelected: true,
      medicationSelected: true,
      derivedHoldInterval: '',
      needsAsgeInputs: false,
      asgeInputsComplete: true,
    })).toBe(true);
  });

  it('waits for required ASGE apixaban inputs before offering manual confirmation', () => {
    expect(shouldShowManualHoldConfirmation({
      referenceSelected: true,
      medicationSelected: true,
      derivedHoldInterval: '',
      needsAsgeInputs: true,
      asgeInputsComplete: false,
    })).toBe(false);
    expect(shouldShowManualHoldConfirmation({
      referenceSelected: true,
      medicationSelected: true,
      derivedHoldInterval: '',
      needsAsgeInputs: true,
      asgeInputsComplete: true,
    })).toBe(true);
  });

  it('does not show manual confirmation when a hold interval was derived', () => {
    expect(shouldShowManualHoldConfirmation({
      referenceSelected: true,
      medicationSelected: true,
      derivedHoldInterval: '2 days',
      needsAsgeInputs: true,
      asgeInputsComplete: true,
    })).toBe(false);
  });
});

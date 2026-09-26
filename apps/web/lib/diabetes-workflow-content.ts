import type { UiModifierDefinition } from './content';
import { diabetesLevemirMedications } from './diabetes-levemir';

// Device use remains context on insulin; no empty-ingredient pump record is indexed as a drug.
export const diabetesSearchMedications = diabetesLevemirMedications;
export { diabetesCoreIngredients } from './diabetes-core-terminology';

export const diabetesModifierDefinitions: Record<string, UiModifierDefinition> = {
  'MOD-diabetes-medication-indication': {
    id: 'MOD-diabetes-medication-indication', label: 'Indication for this medication', inputType: 'select',
    description: 'Do not infer diabetes from the drug name. Metformin, bromocriptine and colesevelam may have other indications.',
    options: [{ value: 'DIABETES', label: 'Diabetes' }, { value: 'OTHER', label: 'Other / unclear indication' }],
  },
  'MOD-diabetes-care-phase': {
    id: 'MOD-diabetes-care-phase', label: 'Which phase does this question concern?', inputType: 'select',
    description: 'The procedure-day candidate is not an instruction for bowel-prep day or medication restart.',
    options: [
      { value: 'PREP_DAY', label: 'Bowel-preparation / reduced-intake day' },
      { value: 'PROCEDURE_DAY', label: 'Procedure day' },
      { value: 'RECOVERY', label: 'Recovery / restart after the procedure' },
      { value: 'OTHER', label: 'Other / unclear phase' },
    ],
  },
  'MOD-diabetes-medication-plan-confirmed': {
    id: 'MOD-diabetes-medication-plan-confirmed', label: 'Clinician medication plan confirmed?', inputType: 'boolean',
    description: 'Confirm a documented plan covering fasting/bowel preparation and this medication. This does not approve PREP-MEDS content.',
  },
  'MOD-bromocriptine-formulation': {
    id: 'MOD-bromocriptine-formulation', label: 'Verified bromocriptine product', inputType: 'select',
    description: 'Verify the actual prescription. A search selection or diabetes diagnosis does not establish Cycloset formulation.',
    options: [
      { value: 'CYCLOSET_QR', label: 'Cycloset / bromocriptine-QR formulation confirmed' },
      { value: 'PARLODEL', label: 'Parlodel / other bromocriptine formulation' },
      { value: 'OTHER', label: 'Other / product not confirmed' },
    ],
  },
  'MOD-current-insulin-plan-confirmed': {
    id: 'MOD-current-insulin-plan-confirmed', label: 'Individualized insulin plan confirmed?', inputType: 'boolean',
    description: 'Confirm a clinician-reviewed regimen, monitoring and contingency plan. PREP-MEDS does not calculate insulin doses.',
  },
  'MOD-insulin-formulation-confirmed': {
    id: 'MOD-insulin-formulation-confirmed', label: 'Exact insulin product and strength/concentration confirmed?', inputType: 'boolean',
    description: 'Verify the product, route, concentration or cartridge label strength, mixture and schedule from the actual prescription. Afrezza cartridge strength is not the prescribed dose or a units/mL concentration. Catalog identity is not regimen confirmation.',
  },
  'MOD-mealtime-insulin-use': {
    id: 'MOD-mealtime-insulin-use', label: 'Also using mealtime insulin?', inputType: 'boolean',
  },
  'MOD-current-oral-intake-state': {
    id: 'MOD-current-oral-intake-state', label: 'Current oral intake', inputType: 'select',
    options: [
      { value: 'USUAL_MEALS', label: 'Usual meals' },
      { value: 'REDUCED_INTAKE', label: 'Reduced intake / clear liquids' },
      { value: 'FASTING', label: 'Fasting / nothing by mouth' },
      { value: 'OTHER', label: 'Other / unclear' },
    ],
  },
  'MOD-pump-aid-system-type': {
    id: 'MOD-pump-aid-system-type', label: 'Insulin pump use in the regimen', inputType: 'select',
    description: 'Pump/AID use requires local-policy, monitoring and backup-therapy review. For inhaled insulin, this refers to pump use elsewhere in the regimen, not putting inhaled powder into a pump. No selection authorizes device compatibility.',
    options: [
      { value: 'NOT_USING_PUMP', label: 'Not using an insulin pump' },
      { value: 'MANUAL_PUMP', label: 'Insulin pump, manual mode' },
      { value: 'AID', label: 'Automated insulin delivery / hybrid closed loop' },
      { value: 'OTHER', label: 'Other / unclear delivery method' },
    ],
  },
};

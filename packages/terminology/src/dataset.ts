import type { MedicationRecord, TerminologyDataset } from './types.js';

export interface DatasetValidationIssue {
  path: string;
  message: string;
}

export function validateTerminologyDataset(dataset: TerminologyDataset): DatasetValidationIssue[] {
  const issues: DatasetValidationIssue[] = [];
  const medicationIds = new Set<string>();
  const ingredientIds = new Set(dataset.ingredients.map((ingredient) => ingredient.id));
  const seenIngredientIds = new Set<string>();

  for (const ingredient of dataset.ingredients) {
    if (seenIngredientIds.has(ingredient.id)) {
      issues.push({ path: `ingredients.${ingredient.id}`, message: 'Duplicate ingredient id' });
    }
    seenIngredientIds.add(ingredient.id);
    if (!ingredient.canonicalName.trim()) {
      issues.push({ path: `ingredients.${ingredient.id}.canonicalName`, message: 'Canonical name is required' });
    }
  }

  for (const medication of dataset.medications) {
    if (medicationIds.has(medication.id)) {
      issues.push({ path: `medications.${medication.id}`, message: 'Duplicate medication id' });
    }
    medicationIds.add(medication.id);

    if (!medication.canonicalName.trim()) {
      issues.push({ path: `medications.${medication.id}.canonicalName`, message: 'Canonical name is required' });
    }
    if (medication.ingredientIds.length === 0) {
      issues.push({ path: `medications.${medication.id}.ingredientIds`, message: 'At least one ingredient is required' });
    }
    for (const ingredientId of medication.ingredientIds) {
      if (!ingredientIds.has(ingredientId)) {
        issues.push({
          path: `medications.${medication.id}.ingredientIds`,
          message: `Unknown ingredient reference: ${ingredientId}`,
        });
      }
    }
  }

  return issues;
}

export function assertTerminologyDataset(dataset: TerminologyDataset): TerminologyDataset {
  const issues = validateTerminologyDataset(dataset);
  if (issues.length > 0) {
    const detail = issues.map((issue) => `${issue.path}: ${issue.message}`).join('; ');
    throw new Error(`Invalid terminology dataset: ${detail}`);
  }
  return dataset;
}

export function decomposeMedication(medication: MedicationRecord): string[] {
  return [...medication.ingredientIds];
}

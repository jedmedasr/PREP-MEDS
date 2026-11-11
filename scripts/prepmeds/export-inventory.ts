import { terminologyDataset } from '../../apps/web/lib/content';

export interface PrepMedsInventoryIngredient {
  ingredientId: string;
  name: string;
}

export interface PrepMedsInventoryMedication {
  medicationId: string;
  canonicalName: string;
  genericName: string | null;
  brandNames: string[];
  aliases: string[];
  ingredientIds: string[];
  ingredientSetKey: string;
}

export interface PrepMedsInventoryPayload {
  ingredients: PrepMedsInventoryIngredient[];
  medications: PrepMedsInventoryMedication[];
}

type InventoryDataset = typeof terminologyDataset;

export function byteOrderCompare(left: string, right: string): number {
  return Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8'));
}

export function ingredientSetKey(ingredientIds: readonly string[]): string {
  return [...ingredientIds].sort(byteOrderCompare).join('+');
}

export function buildInventoryPayload(
  dataset: InventoryDataset = terminologyDataset,
): PrepMedsInventoryPayload {
  return {
    ingredients: dataset.ingredients
      .map((ingredient) => ({
        ingredientId: ingredient.id,
        name: ingredient.canonicalName,
      }))
      .sort((left, right) => byteOrderCompare(left.ingredientId, right.ingredientId)),
    medications: dataset.medications
      .map((medication) => {
        const ingredientIds = [...medication.ingredientIds].sort(byteOrderCompare);
        return {
          medicationId: medication.id,
          canonicalName: medication.canonicalName,
          genericName: medication.genericName ?? null,
          brandNames: [...(medication.brandNames ?? [])],
          aliases: [...(medication.aliases ?? [])],
          ingredientIds,
          ingredientSetKey: ingredientSetKey(ingredientIds),
        };
      })
      .sort((left, right) => byteOrderCompare(left.medicationId, right.medicationId)),
  };
}

if (process.argv[1]?.endsWith('export-inventory.ts')) {
  process.stdout.write(`${JSON.stringify(buildInventoryPayload(), null, 2)}\n`);
}

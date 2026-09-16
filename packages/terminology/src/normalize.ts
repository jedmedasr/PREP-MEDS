const NON_ALPHANUMERIC = /[^a-z0-9]+/g;
const MULTISPACE = /\s+/g;

/**
 * Normalizes user-entered medication text for deterministic indexing/search.
 * This function deliberately does not expand abbreviations or infer a drug.
 */
export function normalizeMedicationText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(NON_ALPHANUMERIC, ' ')
    .replace(MULTISPACE, ' ')
    .trim();
}

export function tokenizeMedicationText(value: string): string[] {
  const normalized = normalizeMedicationText(value);
  return normalized ? normalized.split(' ') : [];
}

/** Standard Levenshtein edit distance; deterministic and dependency-free. */
export function editDistance(left: string, right: string): number {
  if (left === right) return 0;
  if (left.length === 0) return right.length;
  if (right.length === 0) return left.length;

  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  const current = new Array<number>(right.length + 1).fill(0);

  for (let i = 1; i <= left.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const substitution = previous[j - 1]! + (left[i - 1] === right[j - 1] ? 0 : 1);
      const insertion = current[j - 1]! + 1;
      const deletion = previous[j]! + 1;
      current[j] = Math.min(substitution, insertion, deletion);
    }
    for (let j = 0; j <= right.length; j += 1) previous[j] = current[j]!;
  }

  return previous[right.length]!;
}

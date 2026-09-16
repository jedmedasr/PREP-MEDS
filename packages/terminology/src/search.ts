import { editDistance, normalizeMedicationText, tokenizeMedicationText } from './normalize.js';
import type {
  MatchField,
  MatchKind,
  MedicationRecord,
  MedicationResolution,
  MedicationSearchHit,
  SearchOptions,
  TerminologyDataset,
} from './types.js';

interface IndexEntry {
  medication: MedicationRecord;
  field: MatchField;
  raw: string;
  normalized: string;
  tokens: string[];
}

const DEFAULT_LIMIT = 10;
const DEFAULT_MAX_EDIT_DISTANCE = 2;

function scoreEntry(query: string, queryTokens: string[], entry: IndexEntry, options: Required<SearchOptions>): MedicationSearchHit | null {
  if (!entry.normalized) return null;

  let score = 0;
  let matchKind: MatchKind | null = null;

  if (entry.normalized === query) {
    score = entry.field === 'externalCode' ? 1000 : 950;
    matchKind = 'EXACT';
  } else if (entry.normalized.startsWith(query) || query.startsWith(entry.normalized)) {
    const lengthPenalty = Math.abs(entry.normalized.length - query.length);
    score = 800 - Math.min(lengthPenalty, 100);
    matchKind = 'PREFIX';
  } else {
    const tokenMatches = queryTokens.filter((token) => entry.tokens.includes(token)).length;
    if (queryTokens.length > 0 && tokenMatches === queryTokens.length) {
      score = 700 - Math.abs(entry.tokens.length - queryTokens.length) * 10;
      matchKind = 'TOKEN';
    } else if (options.enableFuzzy) {
      const distance = editDistance(query, entry.normalized);
      if (distance <= options.maxEditDistance) {
        score = 600 - distance * 50;
        matchKind = 'FUZZY';
      }
    }
  }

  if (!matchKind) return null;

  const fieldBonus: Record<MatchField, number> = {
    canonicalName: 40,
    genericName: 35,
    brandName: 30,
    alias: 20,
    externalCode: 50,
  };

  return {
    medicationId: entry.medication.id,
    canonicalName: entry.medication.canonicalName,
    score: score + fieldBonus[entry.field],
    matchKind,
    matchedField: entry.field,
    matchedText: entry.raw,
    ingredientIds: [...entry.medication.ingredientIds],
  };
}

export class TerminologyIndex {
  private readonly medicationsById = new Map<string, MedicationRecord>();
  private readonly entries: IndexEntry[] = [];

  constructor(public readonly dataset: TerminologyDataset) {
    for (const medication of dataset.medications) {
      if (this.medicationsById.has(medication.id)) {
        throw new Error(`Duplicate medication id: ${medication.id}`);
      }
      this.medicationsById.set(medication.id, medication);
      this.addEntry(medication, 'canonicalName', medication.canonicalName);
      if (medication.genericName) this.addEntry(medication, 'genericName', medication.genericName);
      for (const brand of medication.brandNames ?? []) this.addEntry(medication, 'brandName', brand);
      for (const alias of medication.aliases ?? []) this.addEntry(medication, 'alias', alias);
      for (const code of medication.externalCodes ?? []) {
        this.addEntry(medication, 'externalCode', `${code.system}:${code.code}`);
        this.addEntry(medication, 'externalCode', code.code);
      }
    }
  }

  private addEntry(medication: MedicationRecord, field: MatchField, raw: string): void {
    const normalized = normalizeMedicationText(raw);
    if (!normalized) return;
    this.entries.push({ medication, field, raw, normalized, tokens: tokenizeMedicationText(raw) });
  }

  getMedicationById(id: string): MedicationRecord | null {
    return this.medicationsById.get(id) ?? null;
  }

  search(query: string, options: SearchOptions = {}): MedicationSearchHit[] {
    const normalizedQuery = normalizeMedicationText(query);
    if (!normalizedQuery) return [];

    const resolvedOptions: Required<SearchOptions> = {
      limit: options.limit ?? DEFAULT_LIMIT,
      enableFuzzy: options.enableFuzzy ?? true,
      maxEditDistance: options.maxEditDistance ?? DEFAULT_MAX_EDIT_DISTANCE,
    };
    const queryTokens = tokenizeMedicationText(query);

    const bestByMedication = new Map<string, MedicationSearchHit>();
    for (const entry of this.entries) {
      const hit = scoreEntry(normalizedQuery, queryTokens, entry, resolvedOptions);
      if (!hit) continue;
      const current = bestByMedication.get(hit.medicationId);
      if (!current || hit.score > current.score) bestByMedication.set(hit.medicationId, hit);
    }

    return [...bestByMedication.values()]
      .sort((a, b) => b.score - a.score || a.canonicalName.localeCompare(b.canonicalName) || a.medicationId.localeCompare(b.medicationId))
      .slice(0, resolvedOptions.limit);
  }

  resolve(query: string, options: SearchOptions = {}): MedicationResolution {
    const normalizedQuery = normalizeMedicationText(query);
    const candidates = this.search(query, options);
    const top = candidates[0];

    if (!top) {
      return {
        status: 'NOT_FOUND',
        query,
        normalizedQuery,
        ingredientIds: [],
        candidates: [],
        reason: 'NO_MATCH',
      };
    }

    const topMedication = this.getMedicationById(top.medicationId)!;
    if (top.matchKind === 'EXACT') {
      return {
        status: 'RESOLVED',
        query,
        normalizedQuery,
        medication: topMedication,
        ingredientIds: [...topMedication.ingredientIds],
        candidates,
        reason: 'EXACT_MATCH',
      };
    }

    const second = candidates[1];
    const hasConfidenceMargin = top.score >= 760 && (!second || top.score - second.score >= 75);
    if (hasConfidenceMargin) {
      return {
        status: 'RESOLVED',
        query,
        normalizedQuery,
        medication: topMedication,
        ingredientIds: [...topMedication.ingredientIds],
        candidates,
        reason: 'UNAMBIGUOUS_HIGH_CONFIDENCE_MATCH',
      };
    }

    return {
      status: 'AMBIGUOUS',
      query,
      normalizedQuery,
      ingredientIds: [],
      candidates,
      reason: 'MULTIPLE_PLAUSIBLE_MATCHES',
    };
  }
}

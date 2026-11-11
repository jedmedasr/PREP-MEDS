export type ExternalTerminologySystem = 'RXNORM' | 'NDC' | 'SNOMED_CT' | 'LOCAL' | 'OTHER';

export interface ExternalCode {
  system: ExternalTerminologySystem;
  code: string;
  display?: string;
  version?: string;
}

export interface IngredientRecord {
  id: string;
  canonicalName: string;
  aliases?: string[];
  externalCodes?: ExternalCode[];
}

export interface MedicationRecord {
  id: string;
  canonicalName: string;
  genericName?: string;
  brandNames?: string[];
  aliases?: string[];
  /** Resolver-only terms that may intentionally be ambiguous across products/groups. Not exported as canonical inventory aliases. */
  searchAliases?: string[];
  ingredientIds: string[];
  drugClassIds?: string[];
  externalCodes?: ExternalCode[];
  active?: boolean;
}

export type MatchField =
  | 'canonicalName'
  | 'genericName'
  | 'brandName'
  | 'alias'
  | 'externalCode';

export type MatchKind = 'EXACT' | 'PREFIX' | 'TOKEN' | 'FUZZY';

export interface MedicationSearchHit {
  medicationId: string;
  canonicalName: string;
  score: number;
  matchKind: MatchKind;
  matchedField: MatchField;
  matchedText: string;
  ingredientIds: string[];
}

export interface SearchOptions {
  limit?: number;
  enableFuzzy?: boolean;
  maxEditDistance?: number;
}

export type ResolutionStatus = 'RESOLVED' | 'AMBIGUOUS' | 'NOT_FOUND';

export interface MedicationResolution {
  status: ResolutionStatus;
  query: string;
  normalizedQuery: string;
  medication?: MedicationRecord;
  ingredientIds: string[];
  candidates: MedicationSearchHit[];
  reason:
    | 'EXACT_MATCH'
    | 'UNAMBIGUOUS_HIGH_CONFIDENCE_MATCH'
    | 'MULTIPLE_PLAUSIBLE_MATCHES'
    | 'NO_MATCH';
}

export interface TerminologyDataset {
  version: string;
  generatedAt: string;
  medications: MedicationRecord[];
  ingredients: IngredientRecord[];
}

export interface TerminologyProvider {
  getMedicationByExternalCode(system: ExternalTerminologySystem, code: string): Promise<MedicationRecord | null>;
  searchExternal(query: string, limit?: number): Promise<MedicationRecord[]>;
}

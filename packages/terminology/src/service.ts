import { TerminologyIndex } from './search.js';
import type {
  MedicationResolution,
  SearchOptions,
  TerminologyProvider,
} from './types.js';

export interface ResolveMedicationOptions extends SearchOptions {
  allowExternalLookup?: boolean;
}

/**
 * Orchestrates local, versioned terminology resolution with an optional external
 * terminology provider. External results are never silently accepted: they are
 * returned as candidates unless an exact local identity already exists.
 */
export class MedicationTerminologyService {
  constructor(
    private readonly index: TerminologyIndex,
    private readonly externalProvider?: TerminologyProvider,
  ) {}

  search(query: string, options: SearchOptions = {}) {
    return this.index.search(query, options);
  }

  async resolve(query: string, options: ResolveMedicationOptions = {}): Promise<MedicationResolution> {
    const local = this.index.resolve(query, options);
    if (local.status === 'RESOLVED' || !options.allowExternalLookup || !this.externalProvider) {
      return local;
    }

    const external = await this.externalProvider.searchExternal(query, options.limit ?? 10);
    if (external.length === 0) return local;

    // External terminology can enrich candidate discovery, but a candidate must
    // be ingested/versioned into the local dataset before the clinical engine can
    // treat it as a resolved PREP-MEDS medication identity.
    return {
      status: 'AMBIGUOUS',
      query,
      normalizedQuery: local.normalizedQuery,
      ingredientIds: [],
      candidates: local.candidates,
      reason: 'MULTIPLE_PLAUSIBLE_MATCHES',
    };
  }
}

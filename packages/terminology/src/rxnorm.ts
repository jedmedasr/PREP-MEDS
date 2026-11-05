import type { MedicationRecord, TerminologyProvider } from './types.js';

/**
 * Transport-neutral contract for a future RxNorm integration.
 * Stage 3 does not make network calls or persist NLM data; it defines the seam
 * so production ingestion can be tested and versioned independently.
 */
export interface RxNormClient {
  findRxcuiByString(name: string): Promise<string[]>;
  getNormalizedDrug(rxcui: string): Promise<{
    rxcui: string;
    name: string;
    synonym?: string;
  } | null>;
}

export class RxNormTerminologyProvider implements TerminologyProvider {
  constructor(
    private readonly client: RxNormClient,
    private readonly mapDrug: (drug: { rxcui: string; name: string; synonym?: string }) => MedicationRecord,
  ) {}

  async getMedicationByExternalCode(system: 'RXNORM' | 'NDC' | 'SNOMED_CT' | 'LOCAL' | 'OTHER', code: string): Promise<MedicationRecord | null> {
    if (system !== 'RXNORM') return null;
    const drug = await this.client.getNormalizedDrug(code);
    return drug ? this.mapDrug(drug) : null;
  }

  async searchExternal(query: string, limit = 10): Promise<MedicationRecord[]> {
    const rxcuis = (await this.client.findRxcuiByString(query)).slice(0, limit);
    const results: MedicationRecord[] = [];
    for (const rxcui of rxcuis) {
      const drug = await this.client.getNormalizedDrug(rxcui);
      if (drug) results.push(this.mapDrug(drug));
    }
    return results;
  }
}

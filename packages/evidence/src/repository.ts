import { assertValidEvidenceBundle } from './validate.js';
import type {
  EvidenceAtom,
  EvidenceBundle,
  EvidenceLifecycle,
  SourceDocument,
  VersionRef,
} from './types.js';

function key(ref: VersionRef): string {
  return `${ref.id}@${ref.version}`;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

export interface EvidenceQuery {
  medicationIds?: string[];
  ingredientIds?: string[];
  drugClassIds?: string[];
  procedureCodes?: string[];
  topic?: string;
  lifecycle?: EvidenceLifecycle[];
}

export class EvidenceRepository {
  readonly #sources = new Map<string, SourceDocument>();
  readonly #atoms = new Map<string, EvidenceAtom>();

  constructor(bundle?: EvidenceBundle) {
    if (bundle) this.load(bundle);
  }

  load(bundle: EvidenceBundle): void {
    assertValidEvidenceBundle(bundle);
    for (const source of bundle.sources) this.#sources.set(key(source), clone(source));
    for (const atom of bundle.atoms) this.#atoms.set(key(atom), clone(atom));
  }

  getSource(ref: VersionRef): SourceDocument | undefined {
    const value = this.#sources.get(key(ref));
    return value ? clone(value) : undefined;
  }

  getAtom(ref: VersionRef): EvidenceAtom | undefined {
    const value = this.#atoms.get(key(ref));
    return value ? clone(value) : undefined;
  }

  getLatestSource(id: string): SourceDocument | undefined {
    return this.#latestById([...this.#sources.values()], id);
  }

  getLatestAtom(id: string): EvidenceAtom | undefined {
    return this.#latestById([...this.#atoms.values()], id);
  }

  queryAtoms(query: EvidenceQuery): EvidenceAtom[] {
    const lifecycle = new Set(query.lifecycle ?? ['CURRENT']);
    const matches = [...this.#atoms.values()].filter((atom) => {
      if (!lifecycle.has(atom.lifecycle)) return false;
      if (query.topic && atom.normalizedTopic !== query.topic) return false;
      if (!overlaps(atom.applicability.medicationIds, query.medicationIds)) return false;
      if (!overlaps(atom.applicability.ingredientIds, query.ingredientIds)) return false;
      if (!overlaps(atom.applicability.drugClassIds, query.drugClassIds)) return false;
      if (!overlaps(atom.applicability.procedureCodes, query.procedureCodes)) return false;
      return true;
    });

    return matches
      .sort((a, b) => {
        const authority = a.retrieval.sourceAuthorityRank - b.retrieval.sourceAuthorityRank;
        if (authority !== 0) return authority;
        const topic = a.normalizedTopic.localeCompare(b.normalizedTopic);
        if (topic !== 0) return topic;
        const id = a.id.localeCompare(b.id);
        return id !== 0 ? id : b.version - a.version;
      })
      .map(clone);
  }

  snapshot(generatedAt = new Date().toISOString()): EvidenceBundle {
    return {
      schemaVersion: '1.0.0',
      generatedAt,
      sources: [...this.#sources.values()].map(clone),
      atoms: [...this.#atoms.values()].map(clone),
    };
  }

  #latestById<T extends { id: string; version: number }>(values: T[], id: string): T | undefined {
    const latest = values
      .filter((item) => item.id === id)
      .sort((a, b) => b.version - a.version)[0];
    return latest ? clone(latest) : undefined;
  }
}

function overlaps(stored?: string[], requested?: string[]): boolean {
  if (!requested || requested.length === 0) return true;
  if (!stored || stored.length === 0) return true;
  const storedSet = new Set(stored);
  return requested.some((value) => storedSet.has(value));
}

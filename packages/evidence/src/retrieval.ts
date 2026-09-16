import type { EvidenceAtom, RetrievalDocument, SourceDocument, VersionRef } from './types.js';

function sourceKey(ref: VersionRef): string {
  return `${ref.id}@${ref.version}`;
}

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

export function buildRetrievalDocument(
  atom: EvidenceAtom,
  source: SourceDocument,
): RetrievalDocument {
  if (source.id !== atom.source.id || source.version !== atom.source.version) {
    throw new Error(
      `Evidence atom ${atom.id}@${atom.version} expects source ${sourceKey(atom.source)} but received ${sourceKey(source)}.`,
    );
  }

  const applicability = [
    ...(atom.applicability.medicationIds ?? []),
    ...(atom.applicability.ingredientIds ?? []),
    ...(atom.applicability.drugClassIds ?? []),
    ...(atom.applicability.procedureCodes ?? []),
    ...(atom.applicability.populationTags ?? []),
    ...(atom.applicability.contextTags ?? []),
  ];

  const locator = [
    atom.locator.section && `Section: ${atom.locator.section}`,
    atom.locator.page && `Page: ${atom.locator.page}`,
    atom.locator.table && `Table: ${atom.locator.table}`,
    atom.locator.figure && `Figure: ${atom.locator.figure}`,
  ].filter(Boolean);

  const body = [
    atom.retrieval.summary,
    `Claim: ${atom.claim}`,
    `Topic: ${atom.normalizedTopic}`,
    `Stance: ${atom.stance}`,
    `Evidence strength: ${atom.evidenceStrength}`,
    applicability.length ? `Applicability: ${applicability.join(', ')}` : undefined,
    atom.limitations.length ? `Limitations: ${atom.limitations.join('; ')}` : undefined,
    locator.length ? locator.join(' | ') : undefined,
    `Source: ${source.title}`,
    source.societyOrRegulator ? `Authority: ${source.societyOrRegulator}` : undefined,
    source.publicationDate ? `Published: ${source.publicationDate}` : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    documentId: `rag:${atom.id}:${atom.version}`,
    evidenceRef: { id: atom.id, version: atom.version },
    sourceRef: { id: source.id, version: source.version },
    title: atom.retrieval.title,
    body: atom.retrieval.embeddingText ?? body,
    keywords: unique([...atom.retrieval.keywords, ...applicability]),
    concepts: unique(atom.retrieval.concepts),
    sourceAuthorityRank: atom.retrieval.sourceAuthorityRank,
    lifecycle: atom.lifecycle,
  };
}

export function buildRetrievalDocuments(
  atoms: EvidenceAtom[],
  sources: SourceDocument[],
): RetrievalDocument[] {
  const sourceMap = new Map(sources.map((source) => [sourceKey(source), source]));

  return atoms
    .filter((atom) => atom.lifecycle === 'CURRENT' || atom.lifecycle === 'REVIEWED')
    .map((atom) => {
      const source = sourceMap.get(sourceKey(atom.source));
      if (!source) {
        throw new Error(`Missing source ${sourceKey(atom.source)} for evidence atom ${atom.id}@${atom.version}.`);
      }
      return buildRetrievalDocument(atom, source);
    })
    .sort((a, b) => {
      const rank = a.sourceAuthorityRank - b.sourceAuthorityRank;
      return rank !== 0 ? rank : a.documentId.localeCompare(b.documentId);
    });
}

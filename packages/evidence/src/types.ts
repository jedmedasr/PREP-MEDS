export type EvidenceLifecycle =
  | 'DRAFT'
  | 'REVIEWED'
  | 'CURRENT'
  | 'SUPERSEDED'
  | 'RETIRED';

export type SourceType =
  | 'GUIDELINE'
  | 'FDA_LABEL'
  | 'PEER_REVIEWED_STUDY'
  | 'CONSENSUS_STATEMENT'
  | 'REGULATORY_GUIDANCE'
  | 'INSTITUTIONAL_POLICY'
  | 'OTHER';

export type EvidenceStrength =
  | 'HIGH'
  | 'MODERATE'
  | 'LOW'
  | 'VERY_LOW'
  | 'NOT_GRADED'
  | 'UNKNOWN';

export type EvidenceStance =
  | 'SUPPORTS'
  | 'OPPOSES'
  | 'CONDITIONAL'
  | 'INSUFFICIENT'
  | 'DESCRIPTIVE';

export interface VersionRef {
  id: string;
  version: number;
}

export interface SourceDocument {
  id: string;
  version: number;
  sourceType: SourceType;
  title: string;
  publisher?: string;
  societyOrRegulator?: string;
  publicationDate?: string;
  effectiveDate?: string;
  sourceUrl?: string;
  externalIdentifier?: string;
  jurisdiction?: string;
  language: string;
  checksum?: string;
  retrievedAt: string;
  lifecycle: EvidenceLifecycle;
  supersedes?: VersionRef;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface CitationLocator {
  section?: string;
  page?: string;
  table?: string;
  figure?: string;
  paragraph?: string;
  anchorText?: string;
}

export interface EvidenceApplicability {
  medicationIds?: string[];
  ingredientIds?: string[];
  drugClassIds?: string[];
  procedureCodes?: string[];
  populationTags?: string[];
  contextTags?: string[];
}

export interface RetrievalMetadata {
  title: string;
  summary: string;
  keywords: string[];
  concepts: string[];
  sourceAuthorityRank: number;
  embeddingText?: string;
  lexicalText?: string;
}

export interface EvidenceAtom {
  id: string;
  version: number;
  source: VersionRef;
  claim: string;
  normalizedTopic: string;
  stance: EvidenceStance;
  evidenceStrength: EvidenceStrength;
  applicability: EvidenceApplicability;
  locator: CitationLocator;
  limitations: string[];
  conflictGroup?: string;
  retrieval: RetrievalMetadata;
  lifecycle: EvidenceLifecycle;
  reviewedAt?: string;
  reviewedBy?: string;
  supersedes?: VersionRef;
  createdAt: string;
}

export interface EvidenceConflict {
  conflictGroup: string;
  atomRefs: VersionRef[];
  reason: 'OPPOSING_STANCE' | 'CONDITIONAL_DISAGREEMENT' | 'MANUAL';
  summary: string;
  resolvedByRuleOrPolicy?: VersionRef;
}

export interface EvidenceBundle {
  schemaVersion: '1.0.0';
  generatedAt: string;
  sources: SourceDocument[];
  atoms: EvidenceAtom[];
  conflicts?: EvidenceConflict[];
}

export interface RetrievalDocument {
  documentId: string;
  evidenceRef: VersionRef;
  sourceRef: VersionRef;
  title: string;
  body: string;
  keywords: string[];
  concepts: string[];
  sourceAuthorityRank: number;
  lifecycle: EvidenceLifecycle;
}

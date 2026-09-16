import type { EvidenceAtom, EvidenceBundle, SourceDocument, VersionRef } from './types.js';

export interface ValidationIssue {
  code: string;
  message: string;
  path?: string;
}

function key(ref: VersionRef): string {
  return `${ref.id}@${ref.version}`;
}

function validateVersionedIdentity(
  id: string,
  version: number,
  path: string,
  issues: ValidationIssue[],
): void {
  if (!id || !id.trim()) {
    issues.push({ code: 'MISSING_ID', message: 'ID is required.', path });
  }
  if (!Number.isInteger(version) || version < 1) {
    issues.push({ code: 'INVALID_VERSION', message: 'Version must be a positive integer.', path });
  }
}

function validateSource(source: SourceDocument, index: number, issues: ValidationIssue[]): void {
  const path = `sources[${index}]`;
  validateVersionedIdentity(source.id, source.version, path, issues);
  if (!source.title.trim()) {
    issues.push({ code: 'MISSING_SOURCE_TITLE', message: 'Source title is required.', path });
  }
  if (!source.retrievedAt) {
    issues.push({ code: 'MISSING_RETRIEVAL_TIME', message: 'retrievedAt is required.', path });
  }
  if (source.supersedes && source.supersedes.id !== source.id) {
    issues.push({
      code: 'INVALID_SUPERSESSION_ID',
      message: 'A source may supersede only a prior version of the same logical source ID.',
      path,
    });
  }
}

function validateAtom(
  atom: EvidenceAtom,
  index: number,
  sourceKeys: Set<string>,
  issues: ValidationIssue[],
): void {
  const path = `atoms[${index}]`;
  validateVersionedIdentity(atom.id, atom.version, path, issues);

  if (!sourceKeys.has(key(atom.source))) {
    issues.push({
      code: 'UNKNOWN_SOURCE_REFERENCE',
      message: `Evidence atom references missing source ${key(atom.source)}.`,
      path,
    });
  }
  if (!atom.claim.trim()) {
    issues.push({ code: 'MISSING_CLAIM', message: 'Evidence claim is required.', path });
  }
  if (!atom.normalizedTopic.trim()) {
    issues.push({ code: 'MISSING_TOPIC', message: 'normalizedTopic is required.', path });
  }
  if (atom.retrieval.sourceAuthorityRank < 0) {
    issues.push({
      code: 'INVALID_AUTHORITY_RANK',
      message: 'sourceAuthorityRank must be zero or greater.',
      path,
    });
  }
  if (atom.supersedes && atom.supersedes.id !== atom.id) {
    issues.push({
      code: 'INVALID_SUPERSESSION_ID',
      message: 'An evidence atom may supersede only a prior version of the same logical atom ID.',
      path,
    });
  }
}

export function validateEvidenceBundle(bundle: EvidenceBundle): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seen = new Set<string>();

  bundle.sources.forEach((source, index) => {
    validateSource(source, index, issues);
    const sourceKey = key(source);
    if (seen.has(`source:${sourceKey}`)) {
      issues.push({ code: 'DUPLICATE_SOURCE_VERSION', message: `Duplicate source ${sourceKey}.` });
    }
    seen.add(`source:${sourceKey}`);
  });

  const sourceKeys = new Set(bundle.sources.map(key));

  bundle.atoms.forEach((atom, index) => {
    validateAtom(atom, index, sourceKeys, issues);
    const atomKey = key(atom);
    if (seen.has(`atom:${atomKey}`)) {
      issues.push({ code: 'DUPLICATE_ATOM_VERSION', message: `Duplicate atom ${atomKey}.` });
    }
    seen.add(`atom:${atomKey}`);
  });

  for (const conflict of bundle.conflicts ?? []) {
    for (const ref of conflict.atomRefs) {
      if (!seen.has(`atom:${key(ref)}`)) {
        issues.push({
          code: 'UNKNOWN_CONFLICT_ATOM',
          message: `Conflict group ${conflict.conflictGroup} references missing atom ${key(ref)}.`,
        });
      }
    }
  }

  return issues;
}

export function assertValidEvidenceBundle(bundle: EvidenceBundle): void {
  const issues = validateEvidenceBundle(bundle);
  if (issues.length > 0) {
    const summary = issues.map((issue) => `${issue.code}: ${issue.message}`).join('\n');
    throw new Error(`Invalid evidence bundle:\n${summary}`);
  }
}

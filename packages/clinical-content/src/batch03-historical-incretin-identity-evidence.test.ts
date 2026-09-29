import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03HistoricalIncretinIdentityAtoms,
  batch03HistoricalIncretinIdentityDefinitions,
  batch03HistoricalIncretinIdentityEvidence,
  batch03HistoricalIncretinIdentitySources,
  batch03HistoricalIncretinMarketingStatusAtoms,
  batch03HistoricalIncretinReviewRules,
} from './batch03-historical-incretin-identity-evidence.js';

describe('Batch 03 historical standalone incretin evidence', () => {
  it('validates two historical product identities with separate regulatory-status sources', () => {
    expect(validateEvidenceBundle(batch03HistoricalIncretinIdentityEvidence)).toEqual([]);
    expect(batch03HistoricalIncretinIdentityDefinitions).toHaveLength(2);
    expect(batch03HistoricalIncretinIdentitySources).toHaveLength(4);
    expect(batch03HistoricalIncretinIdentityAtoms).toHaveLength(2);
    expect(batch03HistoricalIncretinMarketingStatusAtoms).toHaveLength(2);
  });

  it('pins ADLYXIN and TANZEUM label provenance without converting it into availability', () => {
    const byId = new Map(batch03HistoricalIncretinIdentitySources.map((source) => [source.id, source]));

    const adlyxin = byId.get('SRC-B3-ADLYXIN-SPL13');
    expect(adlyxin?.metadata?.setId).toBe('1727cc16-4f86-4f13-b8b5-804d4984fa8c');
    expect(adlyxin?.metadata?.splVersion).toBe(13);
    expect(adlyxin?.effectiveDate).toBe('2024-01-16');
    expect(adlyxin?.metadata?.applicationNumber).toBe('BLA208471');

    const tanzeum = byId.get('SRC-B3-TANZEUM-SPL17');
    expect(tanzeum?.metadata?.setId).toBe('5fcad939-76e7-49cf-af94-4e6aef17901f');
    expect(tanzeum?.metadata?.splVersion).toBe(17);
    expect(tanzeum?.effectiveDate).toBe('2017-12-20');
    expect(tanzeum?.metadata?.applicationNumber).toBe('BLA125431');

    for (const source of [adlyxin, tanzeum]) {
      expect(source?.lifecycle).toBe('DRAFT');
      expect(source?.metadata?.historicalProduct).toBe(true);
      expect(source?.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source?.metadata?.substitutionAuthorized).toBe(false);
      expect(source?.metadata?.clinicalApprovalGranted).toBe(false);
      expect(source?.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('records Purple Book Disc status separately from real-time availability', () => {
    const byId = new Map(batch03HistoricalIncretinIdentitySources.map((source) => [source.id, source]));
    for (const sourceId of [
      'SRC-B3-ADLYXIN-PURPLEBOOK-2026-09',
      'SRC-B3-TANZEUM-PURPLEBOOK-2026-09',
    ]) {
      const source = byId.get(sourceId);
      expect(source?.metadata?.productNumbers).toBe('001,002');
      expect(source?.metadata?.listedMarketingStatus).toBe('Disc');
      expect(source?.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source?.lifecycle).toBe('DRAFT');
    }

    for (const atom of batch03HistoricalIncretinMarketingStatusAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'No peri-procedural hold/continue/restart timing instruction is authorized by this marketing-status evidence.',
      );
    }
  });

  it('preserves historical product identity as descriptive, non-authorizing evidence', () => {
    expect(batch03HistoricalIncretinIdentityDefinitions.map((item) => item.historical)).toEqual([true, true]);
    for (const atom of batch03HistoricalIncretinIdentityAtoms) {
      expect(atom.lifecycle).toBe('DRAFT');
      expect(atom.stance).toBe('DESCRIPTIVE');
      expect(atom.evidenceStrength).toBe('NOT_GRADED');
      expect(atom.limitations).toContain(
        'No substitution, conversion, peri-procedural hold/continue/restart instruction, or pharmacy-inventory claim is authorized by this identity atom.',
      );
    }
  });

  it('keeps historical standalone GLP-1 products review-only and timing-free', () => {
    expect(batch03HistoricalIncretinReviewRules).toHaveLength(1);
    const guard = batch03HistoricalIncretinReviewRules[0];
    expect(guard?.scope.medicationIds).toEqual([
      'MED-lixisenatide-adlyxin',
      'MED-albiglutide-tanzeum',
    ]);
    expect(guard?.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
    expect(guard?.timingRule).toBeUndefined();
    expect(guard?.evidenceRefs).toEqual([
      { id: 'EVD-GLP1-HIGH-RISK-REVIEW-2024', version: 1 },
    ]);
  });
});

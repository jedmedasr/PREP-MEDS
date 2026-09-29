import { describe, expect, it } from 'vitest';
import { validateEvidenceBundle } from '@prep-meds/evidence';
import {
  batch03QternIdentityAtoms,
  batch03QternIdentityDefinitions,
  batch03QternIdentityEvidence,
  batch03QternIdentitySources,
  batch03QternMarketingStatusAtoms,
  batch03QternProcedureReviewAtoms,
  batch03QternReviewRules,
} from './batch03-qtern-identity-evidence.js';

describe('Batch 03 QTERN / dapagliflozin+saxagliptin evidence', () => {
  it('validates four source-distinct product/application identities plus QTERNMET market-status provenance', () => {
    expect(validateEvidenceBundle(batch03QternIdentityEvidence)).toEqual([]);
    expect(batch03QternIdentityDefinitions).toHaveLength(4);
    expect(batch03QternIdentitySources).toHaveLength(5);
    expect(batch03QternIdentityAtoms).toHaveLength(4);
    expect(batch03QternMarketingStatusAtoms).toHaveLength(1);
    expect(batch03QternProcedureReviewAtoms).toHaveLength(4);
  });

  it('pins current QTERN and ANDA211533 source metadata without availability inference', () => {
    const byId = new Map(batch03QternIdentitySources.map((source) => [source.id, source]));
    const qtern = byId.get('SRC-B3-QTERN-SPL32');
    expect(qtern?.metadata?.splVersion).toBe(32);
    expect(qtern?.effectiveDate).toBe('2026-06-03');
    expect(qtern?.metadata?.applicationNumber).toBe('NDA209091');
    expect(qtern?.metadata?.latestListedMarketingEndDate).toBe('2026-02-28');

    const novadoz = byId.get('SRC-B3-DAPA-SAXA-ANDA211533-SPL1');
    expect(novadoz?.metadata?.splVersion).toBe(1);
    expect(novadoz?.metadata?.setId).toBe('1cfa51fd-8406-404c-b2a8-0fc1068675fb');
    expect(novadoz?.metadata?.applicationNumber).toBe('ANDA211533');
    expect(novadoz?.metadata?.marketingEndDateListed).toBe(false);

    for (const source of [qtern, novadoz]) {
      expect(source?.lifecycle).toBe('DRAFT');
      expect(source?.metadata?.marketAvailabilityAsserted).toBe(false);
      expect(source?.metadata?.timingRuleAuthorized).toBe(false);
    }
  });

  it('keeps ANDA211537 application-level and does not invent an SPL', () => {
    const torrent = batch03QternIdentitySources.find((source) => source.id === 'SRC-B3-DAPA-SAXA-ANDA211537-FDA-APPROVAL');
    expect(torrent?.sourceType).toBe('OTHER');
    expect(torrent?.metadata?.applicationNumber).toBe('ANDA211537');
    expect(torrent?.metadata?.applicant).toBe('Torrent Pharmaceuticals Limited');
    expect(torrent?.metadata?.manufacturerSplVerified).toBe(false);
    expect(torrent?.metadata?.marketAvailabilityAsserted).toBe(false);
    expect(torrent?.metadata?.setId).toBeUndefined();
    expect(torrent?.metadata?.splVersion).toBeUndefined();
  });

  it('records QTERNMET XR as historical/discontinued without inventing a label SPL version', () => {
    const byId = new Map(batch03QternIdentitySources.map((source) => [source.id, source]));
    const label = byId.get('SRC-B3-QTERNMET-XR-HISTORICAL-LABEL');
    const orangeBook = byId.get('SRC-B3-QTERNMET-XR-ORANGE-BOOK-2026');
    expect(label?.metadata?.setId).toBe('cfffcbfe-dcd9-4001-963e-a99e67390116');
    expect(label?.metadata?.applicationNumber).toBe('NDA210874');
    expect(label?.metadata?.latestListedMarketingEndDate).toBe('2020-06-01');
    expect(label?.metadata?.splVersionAsserted).toBe(false);
    expect(label?.metadata?.splVersion).toBeUndefined();
    expect(orangeBook?.metadata?.orangeBookMarketingStatus).toBe('DISCONTINUED');
    expect(orangeBook?.metadata?.productNumbers).toBe('001,002,003,004');
    expect(orangeBook?.metadata?.marketAvailabilityAsserted).toBe(false);
    expect(batch03QternMarketingStatusAtoms[0]?.claim).toContain('all four QTERNMET XR presentations');
  });

  it('keeps both review guards timing-free', () => {
    expect(batch03QternReviewRules).toHaveLength(2);
    for (const rule of batch03QternReviewRules) {
      expect(rule.disposition).toBe('CLINICIAN_REVIEW_REQUIRED');
      expect(rule.timingRule).toBeUndefined();
    }
    for (const atom of batch03QternProcedureReviewAtoms) {
      expect(atom.stance).toBe('CONDITIONAL');
      expect(atom.limitations?.some((limitation) => limitation.includes('does not authorize a hold'))).toBe(true);
    }
  });
});

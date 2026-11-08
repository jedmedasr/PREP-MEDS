import { describe, expect, it } from 'vitest';
import { apixabanHighRiskEvidence as evidence } from './apixaban-high-risk-evidence';
describe('apixaban high-risk source comparison safety', () => {
  it('keeps three independently identified primary guideline sources', () => {
    expect(evidence.sources.map(s=>s.id)).toEqual(['ASGE_2016','ACG_CAG_2022','BSG_ESGE_2021']);
    for (const source of evidence.sources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.publishedYear).toBeGreaterThanOrEqual(2016);
      expect(source.location.length).toBeGreaterThan(10);
    }
  });
  it('does not treat comparison as clinical approval', () => {
    expect(evidence.reviewStatus).toBe('IN_PROGRESS');
    expect(evidence.clinicalApproval).toBe(false);
    expect(evidence.outstanding.length).toBeGreaterThan(0);
  });
  it('preserves disagreement and does not invent ACG-CAG timing', () => {
    expect(evidence.conflicts.length).toBeGreaterThan(0);
    expect(evidence.sources.find(s=>s.id==='ACG_CAG_2022')?.timingKind).toBe('NO_EXACT_AGENT_SPECIFIC_INTERVAL');
  });
});

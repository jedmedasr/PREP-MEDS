import { readFileSync } from 'node:fs';

import {
  evaluateDecision,
  type ClinicalRule,
  type EngineRequest,
  type ModifierValue,
} from '@prep-meds/clinical-engine';
import { describe, expect, it } from 'vitest';

import { replayDecision } from '../replay.js';
import { assertNoUnreviewedRuleChanges, diffClinicalRules } from '../rule-diff.js';

const syntheticRule: ClinicalRule = {
  id: 'RULE-SYNTHETIC-001',
  version: 1,
  name: 'Synthetic software test rule',
  scope: {
    medicationIds: ['MED-SYNTHETIC'],
    procedureCodes: ['COLONOSCOPY'],
  },
  requiredModifierIds: ['MOD-RECENT-EVENT'],
  hardStops: [
    {
      reasonCode: 'SYNTHETIC_RECENT_EVENT',
      condition: {
        op: 'EQUALS',
        field: 'modifier:MOD-RECENT-EVENT',
        value: true,
      },
      disposition: 'CLINICIAN_REVIEW_REQUIRED',
    },
  ],
  disposition: 'CONTINUE',
  restartOwner: 'NOT_APPLICABLE',
  evidenceRefs: [{ id: 'EVD-SYNTHETIC', version: 1 }],
  status: 'ACTIVE',
};

interface GoldenCase {
  id: string;
  procedureCode: 'EGD' | 'COLONOSCOPY' | 'EGD_COLONOSCOPY';
  recentEventState: ModifierValue['state'];
  recentEventValue?: boolean;
  expectedDisposition: string;
  expectedReasonCodes: string[];
}

function loadGoldenCases(): GoldenCase[] {
  const url = new URL('../../../../clinical-content/testing/golden-decisions.json', import.meta.url);
  const parsed = JSON.parse(readFileSync(url, 'utf8')) as { cases: GoldenCase[] };
  return parsed.cases;
}

function requestFor(testCase: GoldenCase): EngineRequest {
  const modifier: ModifierValue = {
    modifierId: 'MOD-RECENT-EVENT',
    state: testCase.recentEventState,
    provenance: {
      sourceType: 'USER_ENTERED',
      recordedAt: '2026-09-17T00:00:00Z',
      confirmationStatus: 'CONFIRMED',
    },
    ...(testCase.recentEventValue !== undefined ? { value: testCase.recentEventValue } : {}),
  };

  return {
    decisionEventId: `DEC-${testCase.id}`,
    occurredAt: '2026-09-17T00:00:00Z',
    actorRole: 'SYSTEM',
    engineVersion: 'test-1',
    mode: 'PRODUCTION',
    context: {
      organizationId: 'ORG-SYNTHETIC',
      procedureCode: testCase.procedureCode,
      medication: {
        medicationId: 'MED-SYNTHETIC',
        ingredientIds: ['ING-SYNTHETIC'],
        drugClassIds: ['CLS-SYNTHETIC'],
      },
      modifiers: [modifier],
    },
    rules: [syntheticRule],
    policies: [],
  };
}

describe('golden synthetic clinical-engine cases', () => {
  for (const testCase of loadGoldenCases()) {
    it(`${testCase.id} matches its approved synthetic expectation`, () => {
      const result = evaluateDecision(requestFor(testCase));
      expect(result.event.disposition).toBe(testCase.expectedDisposition);
      for (const reason of testCase.expectedReasonCodes) {
        expect(result.event.reasonCodes).toContain(reason);
      }
    });
  }
});

describe('deterministic replay', () => {
  it('returns the same canonical output and fingerprint across repeated executions', () => {
    const request = requestFor(loadGoldenCases()[0]!);
    const replay = replayDecision(request, 7);
    expect(replay.executions).toHaveLength(7);
    expect(new Set(replay.executions.map((item) => JSON.stringify(item))).size).toBe(1);
    expect(replay.fingerprint).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe('clinical rule change detection', () => {
  it('flags care-changing rule revisions as release-blocking', () => {
    const revised: ClinicalRule = {
      ...syntheticRule,
      version: 2,
      disposition: 'CONDITIONAL',
      requiredModifierIds: ['MOD-RECENT-EVENT', 'MOD-SYNTHETIC-SECOND'],
      evidenceRefs: [{ id: 'EVD-SYNTHETIC', version: 2 }],
    };

    const changes = diffClinicalRules([syntheticRule], [revised]);
    expect(changes.map((item) => item.kind)).toEqual(
      expect.arrayContaining([
        'DISPOSITION_CHANGED',
        'REQUIRED_INPUTS_CHANGED',
        'EVIDENCE_CHANGED',
      ]),
    );
    expect(changes.every((item) => item.releaseBlocking)).toBe(true);
    expect(() => assertNoUnreviewedRuleChanges(changes)).toThrow(/require explicit review/);
  });

  it('returns no change for byte-equivalent clinical semantics', () => {
    expect(diffClinicalRules([syntheticRule], [{ ...syntheticRule }])).toEqual([]);
  });
});

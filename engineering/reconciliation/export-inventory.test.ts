// Executed only after copying into the pinned sprint worktree's apps/web/tests.
// This audit never edits, commits to, or runs the automation of PR #37.
import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { terminologyDataset, clinicalReviewRules, clinicalReviewEvidenceBundles, activeRules } from '../lib/content';
import { buildMedicationValidationManifest } from '../lib/medication-validation-manifest';

const manifest = buildMedicationValidationManifest();
const duplicates = (items: string[]) => items.filter((id, index) => items.indexOf(id) !== index);
const ingredientIds = new Set(terminologyDataset.ingredients.map((x) => x.id));
const atomKeys = new Set(clinicalReviewEvidenceBundles.flatMap((b) => b.atoms.map((a) => `${a.id}@${a.version}`)));
const missingRuleEvidence = clinicalReviewRules.flatMap((r) => r.evidenceRefs.filter((e) => !atomKeys.has(`${e.id}@${e.version}`)).map((e) => ({ ruleId: r.id, reference: `${e.id}@${e.version}` })));
const missingAtomSources = clinicalReviewEvidenceBundles.flatMap((b) => {
  const keys = new Set(b.sources.map((s) => `${s.id}@${s.version}`));
  return b.atoms.filter((a) => !keys.has(`${a.source.id}@${a.source.version}`)).map((a) => ({ atomId: a.id, source: `${a.source.id}@${a.source.version}` }));
});

describe('SPR-001 read-only pinned inventory audit', () => {
  it('binds the audit to the exact observed sprint commit', () => {
    expect(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()).toBe(process.env.SPR001_SOURCE_SHA);
  });
  it('covers unique canonical identities and preserves all ingredients', () => {
    expect(duplicates(manifest.medications.map((m) => m.medicationId))).toEqual([]);
    expect(manifest.medications.map((m) => m.medicationId).sort()).toEqual(terminologyDataset.medications.map((m) => m.id).sort());
    expect(manifest.medications.flatMap((m) => m.ingredientIds.filter((id) => !ingredientIds.has(id)))).toEqual([]);
    expect(manifest.groups.flatMap((g) => g.medicationIds).sort()).toEqual(manifest.medications.map((m) => m.medicationId).sort());
  });
  it('resolves assembled rule evidence and atom source versions', () => {
    expect(missingRuleEvidence).toEqual([]);
    expect(missingAtomSources).toEqual([]);
  });
  it('exports counts and unresolved clinical milestones without asserting approval', () => {
    const directory = process.env.SPR001_OUTPUT_DIR;
    if (!directory) throw new Error('SPR001_OUTPUT_DIR is required');
    mkdirSync(directory, { recursive: true });
    const serialized = JSON.stringify(manifest, null, 2) + '\n';
    const combinations = manifest.medications.filter((m) => m.ingredientIds.length > 1);
    const summary = {
      schema_version: 1,
      task_id: 'SPR-001',
      repository: 'jedmedasr/PREP-MEDS',
      source_sha: process.env.SPR001_SOURCE_SHA,
      workflow_run_id: process.env.GITHUB_RUN_ID ?? null,
      observed_at: new Date().toISOString(),
      counts: manifest.counts,
      duplicate_medication_ids: duplicates(manifest.medications.map((m) => m.medicationId)),
      mapped_to_provisional_groups: manifest.groups.flatMap((g) => g.medicationIds).length,
      formulation_adjudication_pending: manifest.groups.filter((g) => g.formulationAdjudication === 'PENDING').length,
      documented_adjudicated_formulation_groups: 0,
      final_clinically_distinct_formulation_denominator: null,
      clinically_reviewed_groups_confirmed: 0,
      clinically_approved_medication_mappings_confirmed: 0,
      active_rules: activeRules.length,
      missing_rule_evidence: missingRuleEvidence,
      missing_atom_source_versions: missingAtomSources,
      manifest_sha256: createHash('sha256').update(serialized).digest('hex'),
      combinations,
      interpretation: 'Inventory and internal reference integrity only. NOT independent guideline review, clinical adjudication, approval, or a passing full sprint CI claim.',
      blockers: [
        'All provisional groups remain PENDING formulation adjudication and NOT_STARTED clinical review in the pinned manifest.',
        'The manifest has no per-ID source/version/date, scenario/test, reviewer, or approval metadata; assembled evidence references do not fill that gap.',
        'Latest observed PR #37 quality run 42345991815 failed TypeScript before tests/build; preserve this failure separately from the focused audit.'
      ]
    };
    expect(manifest.groups.every((g) => g.formulationAdjudication === 'PENDING' && g.clinicalStatus === 'NOT_STARTED')).toBe(true);
    expect(activeRules).toEqual([]);
    writeFileSync(resolve(directory, 'manifest.json'), serialized);
    writeFileSync(resolve(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
    console.log('SPR001_RECOMPUTED_COUNTS', JSON.stringify(manifest.counts));
  });
});

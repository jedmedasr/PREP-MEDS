// Copied only into a separate checkout of the exact source-pin.json commit.
// Exports observations, not assumptions from a prior sprint report.
import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { terminologyDataset, clinicalReviewRules, clinicalReviewEvidenceBundles, activeRules } from '../lib/content';
import { buildMedicationValidationManifest } from '../lib/medication-validation-manifest';
import { buildAntithromboticAuditQueue } from '../lib/antithrombotic-audit-queue';

const manifest = buildMedicationValidationManifest();
const queue = buildAntithromboticAuditQueue();
const duplicates = (items: string[]) => items.filter((id, index) => items.indexOf(id) !== index);
const countsBy = (values: string[]) => Object.fromEntries([...new Set(values)].sort().map(value => [value, values.filter(x => x === value).length]));
const ingredientIds = new Set(terminologyDataset.ingredients.map(x => x.id));
const atomKeys = new Set(clinicalReviewEvidenceBundles.flatMap(b => b.atoms.map(a => `${a.id}@${a.version}`)));
const missingRuleEvidence = clinicalReviewRules.flatMap(r => r.evidenceRefs.filter(e => !atomKeys.has(`${e.id}@${e.version}`)).map(e => ({ ruleId: r.id, reference: `${e.id}@${e.version}` })));
const missingAtomSources = clinicalReviewEvidenceBundles.flatMap(b => {
  const keys = new Set(b.sources.map(s => `${s.id}@${s.version}`));
  return b.atoms.filter(a => !keys.has(`${a.source.id}@${a.source.version}`)).map(a => ({ atomId: a.id, source: `${a.source.id}@${a.source.version}` }));
});

describe('SPR-001 pinned main inventory reconciliation', () => {
  it('binds every observation to the exact checkout, not a moving branch', () => {
    expect(process.env.SPR001_SOURCE_SHA).toMatch(/^[a-f0-9]{40}$/);
    expect(execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()).toBe(process.env.SPR001_SOURCE_SHA);
  });
  it('covers each unique canonical identity exactly once without losing ingredients', () => {
    const canonical = manifest.medications.map(m => m.medicationId);
    expect(duplicates(canonical)).toEqual([]);
    expect([...canonical].sort()).toEqual(terminologyDataset.medications.map(m => m.id).sort());
    expect(manifest.medications.flatMap(m => m.ingredientIds.filter(id => !ingredientIds.has(id)))).toEqual([]);
    expect(manifest.groups.flatMap(g => g.medicationIds).sort()).toEqual([...canonical].sort());
    expect(Object.keys(manifest.canonicalIdToProvisionalGroup).sort()).toEqual([...canonical].sort());
    for (const m of manifest.medications) expect(manifest.canonicalIdToProvisionalGroup[m.medicationId]).toBe(m.ingredientSetKey);
  });
  it('resolves all assembled rule evidence and atom source versions', () => {
    expect(missingRuleEvidence).toEqual([]);
    expect(missingAtomSources).toEqual([]);
  });
  it('exports measured denominators, current metadata and unresolved milestones', () => {
    const directory = process.env.SPR001_OUTPUT_DIR;
    if (!directory) throw new Error('SPR001_OUTPUT_DIR is required');
    mkdirSync(directory, { recursive: true });
    const serialized = JSON.stringify(manifest, null, 2) + '\n';
    const groupsPending = manifest.groups.filter(g => String(g.formulationAdjudication) === 'PENDING').length;
    const metadata = {
      records: manifest.medications.length,
      review_status_counts: countsBy(manifest.medications.map(m => m.reviewStatus)),
      with_review_date: manifest.medications.filter(m => m.lastReviewedDate !== null).length,
      with_review_commit: manifest.medications.filter(m => m.reviewCommit !== null).length,
      with_source_versions: manifest.medications.filter(m => m.sourceVersions.length > 0).length,
      with_test_evidence: manifest.medications.filter(m => m.testEvidence.length > 0).length,
      with_remaining_issues: manifest.medications.filter(m => m.remainingIssues.length > 0).length
    };
    const blockers = [];
    if (groupsPending) blockers.push(`${groupsPending} provisional ingredient groups lack formulation adjudication; the final formulation-specific denominator is unknown.`);
    if (metadata.with_remaining_issues) blockers.push(`${metadata.with_remaining_issues} canonical-ID records retain unresolved issues.`);
    if (metadata.with_source_versions < metadata.records) blockers.push('The manifest does not establish complete per-ID primary-source verification. Draft research in other files is not equivalent to a populated, verified manifest.');
    const summary = {
      schema_version: 1, task_id: 'SPR-001', repository: 'jedmedasr/PREP-MEDS',
      source_sha: process.env.SPR001_SOURCE_SHA, workflow_run_id: process.env.GITHUB_RUN_ID ?? null,
      observed_at: new Date().toISOString(), counts: manifest.counts,
      duplicate_medication_ids: duplicates(manifest.medications.map(m => m.medicationId)),
      mapped_to_provisional_groups: manifest.groups.flatMap(g => g.medicationIds).length,
      formulation_adjudication_pending: groupsPending,
      formulation_status_counts: countsBy(manifest.groups.map(g => String(g.formulationAdjudication))),
      clinical_group_status_counts: countsBy(manifest.groups.map(g => String(g.clinicalStatus))),
      final_clinically_distinct_formulation_denominator: null,
      independent_clinical_approval_assessed: false,
      active_rules: activeRules.length, per_id_metadata: metadata,
      antithrombotic_queue: { counts: queue.counts, interpretation: 'Provisional discovery grouping, not exhaustive clinical coverage or completed society comparisons.' },
      missing_rule_evidence: missingRuleEvidence, missing_atom_source_versions: missingAtomSources,
      manifest_sha256: createHash('sha256').update(serialized).digest('hex'),
      combinations: manifest.medications.filter(m => m.ingredientIds.length > 1),
      interpretation: 'Measured inventory and internal-reference integrity only. Source-CI status is recorded separately. No source-semantic verification, clinical endorsement or production approval inferred.',
      blockers
    };
    // Preserve the current fail-closed baseline; an intentional activation requires a separate reviewed change.
    expect(activeRules).toEqual([]);
    writeFileSync(resolve(directory, 'manifest.json'), serialized);
    writeFileSync(resolve(directory, 'antithrombotic-queue.json'), JSON.stringify(queue, null, 2) + '\n');
    writeFileSync(resolve(directory, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
    console.log('SPR001_RECOMPUTED_COUNTS', JSON.stringify(manifest.counts));
    console.log('SPR001_ANTITHROMBOTIC_QUEUE', JSON.stringify(queue.counts));
  });
});

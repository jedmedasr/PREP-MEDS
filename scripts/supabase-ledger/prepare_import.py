"""Build a deterministic import from the existing manifest/allocation; never infer A/B PASS."""
import argparse
import hashlib
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

def prepare(root=ROOT):
    manifest = json.loads((root / 'docs/medication-audit-manifest.json').read_text())
    allocation = (root / 'docs/parallel-clinical-buckets-2026-11-08.md').read_text()
    buckets = {}
    bucket = None
    for line in allocation.splitlines():
        found = re.match(r'## Bucket (\d+)', line)
        if found:
            bucket = int(found[1])
        found = re.match(r'- `(ING-[^`]+)`', line)
        if found:
            if bucket is None or found[1] in buckets:
                raise ValueError('DUPLICATE_OR_UNALLOCATED_GROUP')
            buckets[found[1]] = bucket
    groups = []
    seen = set()
    for row in manifest['groups']:
        key = row['ingredientSetKey']
        if key in seen or key not in buckets:
            raise ValueError('ALLOCATION_MANIFEST_MISMATCH')
        seen.add(key)
        path = root / 'docs/medication-evidence/groups' / (key + '.json')
        evidence = json.loads(path.read_text()) if path.exists() else None
        deficiencies = ['NO_AUTHENTICATED_AGENT_A_EXECUTION', 'FORMULATION_SCOPE_REQUIRES_ADJUDICATION']
        if evidence is None:
            deficiencies.append('EVIDENCE_PACKAGE_MISSING')
        else:
            if not evidence.get('tests'):
                deficiencies.append('EXECUTED_TEST_RECEIPTS_MISSING')
            if not all(s.get('passages') and s.get('document_sha256') for s in evidence.get('sources', [])):
                deficiencies.append('EXACT_HASHED_PRIMARY_PASSAGES_MISSING')
            if not evidence.get('commitSha'):
                deficiencies.append('EVIDENCE_COMMIT_MISSING_IN_PACKAGE')
        groups.append({'group_id': key, 'bucket': buckets[key], 'owner_lane': 'odd' if buckets[key] % 2 else 'even',
                       'ingredient_ids': row['ingredientIds'], 'original_manifest_record': row,
                       'preliminary_evidence': evidence, 'imported_as': 'AGENT_A_WORK_IN_PROGRESS',
                       'deficiencies': deficiencies, 'awaiting_b_eligible': False})
    if set(buckets) != seen:
        raise ValueError('UNMAPPED_ALLOCATION_GROUP')
    meds = []
    ids = set()
    for row in manifest['medications']:
        mid = row['medicationId']
        if mid in ids or row['ingredientSetKey'] not in seen:
            raise ValueError('DUPLICATE_OR_UNMAPPED_CANONICAL_ID')
        ids.add(mid)
        meds.append({'medication_id': mid, 'group_id': row['ingredientSetKey'], 'canonical_name': row['canonicalName'],
                     'original_manifest_record': row})
    group_ids = {r['ingredientSetKey']: sorted(r['medicationIds']) for r in manifest['groups']}
    for group, expected in group_ids.items():
        if expected != sorted(m['medication_id'] for m in meds if m['group_id'] == group):
            raise ValueError('GROUP_MEMBERSHIP_DRIFT')
    combinations = sum(len(r['ingredientIds']) > 1 for r in manifest['medications'])
    if (len(meds), len(groups), combinations) != (436, 233, 48):
        raise ValueError('OWNER_BASELINE_CHANGED: reconcile new allocation before import')
    return {'schema_version': 1, 'scope': 'PRELIMINARY_IMPORT_NOT_VERIFICATION',
            'manifest_sha256': hashlib.sha256((root / 'docs/medication-audit-manifest.json').read_bytes()).hexdigest(),
            'counts': {'canonical_ids': len(meds), 'provisional_groups': len(groups), 'combination_entries': combinations,
                       'odd_groups': sum(g['owner_lane'] == 'odd' for g in groups), 'even_groups': sum(g['owner_lane'] == 'even' for g in groups)},
            'groups': sorted(groups, key=lambda x: (x['bucket'], x['group_id'])),
            'medications': sorted(meds, key=lambda x: x['medication_id'])}

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    data = prepare()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(data, sort_keys=True, indent=2) + '\n')
    print(json.dumps(data['counts'], sort_keys=True))

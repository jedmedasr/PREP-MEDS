import type { EvidenceAtom, EvidenceConflict, EvidenceStance, VersionRef } from './types.js';

const OPPOSING: ReadonlySet<string> = new Set([
  'SUPPORTS|OPPOSES',
  'OPPOSES|SUPPORTS',
]);

function ref(atom: EvidenceAtom): VersionRef {
  return { id: atom.id, version: atom.version };
}

function stancePair(a: EvidenceStance, b: EvidenceStance): string {
  return `${a}|${b}`;
}

export function detectEvidenceConflicts(atoms: EvidenceAtom[]): EvidenceConflict[] {
  const groups = new Map<string, EvidenceAtom[]>();

  for (const atom of atoms) {
    if (!atom.conflictGroup) continue;
    if (atom.lifecycle === 'RETIRED') continue;
    const group = groups.get(atom.conflictGroup) ?? [];
    group.push(atom);
    groups.set(atom.conflictGroup, group);
  }

  const conflicts: EvidenceConflict[] = [];

  for (const [conflictGroup, members] of groups.entries()) {
    let opposing = false;
    let conditional = false;

    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        const pair = stancePair(members[i].stance, members[j].stance);
        if (OPPOSING.has(pair)) opposing = true;
        if (
          members[i].stance !== members[j].stance &&
          (members[i].stance === 'CONDITIONAL' || members[j].stance === 'CONDITIONAL')
        ) {
          conditional = true;
        }
      }
    }

    if (!opposing && !conditional) continue;

    conflicts.push({
      conflictGroup,
      atomRefs: members.map(ref),
      reason: opposing ? 'OPPOSING_STANCE' : 'CONDITIONAL_DISAGREEMENT',
      summary: opposing
        ? 'Active evidence atoms in this group contain opposing stances.'
        : 'Active evidence atoms in this group differ in conditionality or applicability.',
    });
  }

  return conflicts.sort((a, b) => a.conflictGroup.localeCompare(b.conflictGroup));
}

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const roots = [
  path.join(root, 'clinical-content/rules'),
  path.join(root, 'clinical-content/policies'),
];

async function walk(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...(await walk(fullPath)));
      else if (entry.isFile() && entry.name.endsWith('.json')) files.push(fullPath);
    }
    return files;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return [];
    throw error;
  }
}

function collectObjects(value, results = []) {
  if (Array.isArray(value)) {
    for (const item of value) collectObjects(item, results);
    return results;
  }
  if (value && typeof value === 'object') {
    results.push(value);
    for (const child of Object.values(value)) collectObjects(child, results);
  }
  return results;
}

const failures = [];
const files = (await Promise.all(roots.map(walk))).flat().sort();

for (const file of files) {
  const relative = path.relative(root, file);
  const parsed = JSON.parse(await readFile(file, 'utf8'));
  for (const object of collectObjects(parsed)) {
    const status = object.status;
    if (status !== 'APPROVED' && status !== 'ACTIVE') continue;

    const lifecycle = object.lifecycle;
    const approvedBy = lifecycle && typeof lifecycle === 'object' ? lifecycle.approved_by : undefined;
    const approvedAt = lifecycle && typeof lifecycle === 'object' ? lifecycle.approved_at : undefined;

    if (typeof approvedBy !== 'string' || approvedBy.trim() === '') {
      failures.push(`${relative}: ${status} artifact missing lifecycle.approved_by`);
    }
    if (typeof approvedAt !== 'string' || approvedAt.trim() === '') {
      failures.push(`${relative}: ${status} artifact missing lifecycle.approved_at`);
    }

    if ('evidence_refs' in object && Array.isArray(object.evidence_refs) && object.evidence_refs.length === 0) {
      failures.push(`${relative}: ${status} artifact has an empty evidence_refs array`);
    }
  }
}

if (failures.length > 0) {
  console.error('Clinical governance gate failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Clinical governance gate passed (${files.length} JSON file(s) inspected).`);

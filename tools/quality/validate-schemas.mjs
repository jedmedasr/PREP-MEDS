import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

async function loadJson(relativePath) {
  const fullPath = path.join(root, relativePath);
  return JSON.parse(await readFile(fullPath, 'utf8'));
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
  allowUnionTypes: true,
});
addFormats(ajv);

const prepMedsSchema = await loadJson('schemas/v1/prep-meds.schema.json');
const bundleSchema = await loadJson('schemas/v1/bundle.schema.json');
const evidenceBundleSchema = await loadJson('schemas/v1/evidence-bundle.schema.json');

ajv.addSchema(prepMedsSchema);
ajv.addSchema(bundleSchema);
ajv.addSchema(evidenceBundleSchema);

const checks = [
  {
    schemaId: bundleSchema.$id,
    instance: 'schemas/v1/examples/minimal-bundle.json',
  },
  {
    schemaId: evidenceBundleSchema.$id,
    instance: 'clinical-content/evidence/examples/synthetic-evidence-bundle.json',
  },
];

let failures = 0;
for (const check of checks) {
  const validate = ajv.getSchema(check.schemaId);
  if (!validate) throw new Error(`Schema not registered: ${check.schemaId}`);
  const instance = await loadJson(check.instance);
  const valid = validate(instance);
  if (!valid) {
    failures += 1;
    console.error(`\nSchema validation failed: ${check.instance}`);
    for (const error of validate.errors ?? []) {
      console.error(`- ${error.instancePath || '/'} ${error.message ?? 'is invalid'}`);
    }
  } else {
    console.log(`Schema valid: ${check.instance}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} schema validation check(s) failed.`);
  process.exit(1);
}

console.log(`\nAll ${checks.length} schema validation checks passed.`);

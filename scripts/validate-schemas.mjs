import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const root = process.cwd();
const schemaDir = path.join(root, 'schemas', 'v1');
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);

const schemaFiles = fs.readdirSync(schemaDir).filter((name) => name.endsWith('.schema.json')).sort();
for (const file of schemaFiles) {
  const schema = JSON.parse(fs.readFileSync(path.join(schemaDir, file), 'utf8'));
  ajv.addSchema(schema);
}

const fixtures = [
  ['schemas/v1/bundle.schema.json', 'schemas/v1/examples/minimal-bundle.json'],
  ['schemas/v1/evidence-bundle.schema.json', 'clinical-content/evidence/examples/synthetic-evidence-bundle.json'],
];

for (const [schemaPath, fixturePath] of fixtures) {
  if (!fs.existsSync(path.join(root, schemaPath)) || !fs.existsSync(path.join(root, fixturePath))) continue;
  const schema = JSON.parse(fs.readFileSync(path.join(root, schemaPath), 'utf8'));
  const fixture = JSON.parse(fs.readFileSync(path.join(root, fixturePath), 'utf8'));
  const validate = ajv.getSchema(schema.$id) ?? ajv.compile(schema);
  if (!validate(fixture)) {
    console.error(`Schema validation failed: ${fixturePath}`);
    console.error(validate.errors);
    process.exitCode = 1;
  }
}

if (!process.exitCode) console.log(`Validated ${schemaFiles.length} schemas and ${fixtures.length} fixture mappings.`);

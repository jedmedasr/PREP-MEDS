import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const paths = [
  'apps/web/lib/diabetes-afrezza.ts',
  'apps/web/lib/__tests__/diabetes-afrezza.test.ts',
  'apps/web/lib/__tests__/diabetes-afrezza-generic-identity.test.ts',
  'packages/terminology/src/search.ts',
  'apps/web/lib/content.ts',
];
const receipt = {
  formatVersion: 1,
  checkoutSha: git('rev-parse', 'HEAD'),
  checkoutTree: git('rev-parse', 'HEAD^{tree}'),
  eventSha: process.env.GITHUB_SHA ?? null,
  headRef: process.env.GITHUB_HEAD_REF ?? null,
  runId: process.env.GITHUB_RUN_ID ?? null,
  nodeVersion: process.version,
  files: [],
};
for (const path of paths) {
  const bytes = readFileSync(path);
  const text = bytes.toString('utf8');
  const expectedBlob = git('rev-parse', `HEAD:${path}`);
  const actualBlob = git('hash-object', path);
  receipt.files.push({
    path, expectedBlob, actualBlob,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    lineCount: text.split('\n').length,
    relevantLines: text.split('\n').flatMap((line, index) =>
      /beforeEach|genericInhaledInsulinName|let index:|const index =|expect\(result\.status/.test(line)
        ? [{ line: index + 1, text: line.trim() }] : []),
    emittedSiblingPaths: ['.js', '.js.map', '.cjs', '.mjs'].map((extension) => path.replace(/\.ts$/, extension)).filter(existsSync),
  });
  assert.equal(actualBlob, expectedBlob, `Working copy differs from checkout for ${path}`);
}
console.log('PREP_MEDS_CI_SOURCE_RECEIPT_BEGIN');
console.log(JSON.stringify(receipt, null, 2));
console.log('PREP_MEDS_CI_SOURCE_RECEIPT_END');

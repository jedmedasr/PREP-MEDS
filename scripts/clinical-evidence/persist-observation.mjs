// Writes only the isolated surveillance-state branch, never main or PR #37.
import { readFile, writeFile } from 'node:fs/promises';
import { digest } from './core.mjs';
const repo = process.env.GITHUB_REPOSITORY;
if (repo !== 'jedmedasr/PREP-MEDS') throw new Error('REPOSITORY_NOT_ALLOWLISTED');
const token = process.env.GH_TOKEN;
if (!token) throw new Error('MISSING_TOKEN');
const branch = 'automation/evidence-surveillance-state';
const path = 'engineering/clinical-evidence/observations.json';
async function api(endpoint, method = 'GET', body) {
  const res = await fetch(`https://api.github.com/repos/${repo}/${endpoint}`, { method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json', 'X-GitHub-Api-Version': '2022-11-28' }, body: body ? JSON.stringify(body) : undefined });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GITHUB_${res.status}`);
  return res.json();
}
const command = process.argv[2]; const file = process.argv[3];
if (!['read', 'write'].includes(command) || !file) throw new Error('USAGE: read|write file');
const current = await api(`contents/${path}?ref=${branch}`);
if (command === 'read') await writeFile(file, current ? Buffer.from(current.content, 'base64') : '{"observations":{}}');
else {
  const text = await readFile(file, 'utf8'); const parsed = JSON.parse(text);
  const expected = current ? JSON.parse(Buffer.from(current.content, 'base64').toString()) : { observations: {} };
  if (parsed.previousStateHash !== digest(expected)) throw new Error('OBSERVATION_BASE_CHANGED');
  if (parsed.modelCalls !== 0 || parsed.agentCalls !== 0) throw new Error('SURVEILLANCE_BUDGET_VIOLATION');
  if (!await api(`git/ref/heads/${branch}`)) {
    const main = await api('git/ref/heads/main');
    await api('git/refs', 'POST', { ref: `refs/heads/${branch}`, sha: main.object.sha });
  }
  const latest = await api(`contents/${path}?ref=${branch}`);
  if (current?.sha !== latest?.sha) throw new Error('STATE_CHANGED_RECONCILE_REQUIRED');
  await api(`contents/${path}`, 'PUT', { branch, message: `chore(evidence): source observation ${parsed.checkedAt}`, content: Buffer.from(text).toString('base64'), ...(latest ? { sha: latest.sha } : {}) });
  console.log('Persisted observation on automation/evidence-surveillance-state; no clinical activation.');
}

# Source-verification implementation evidence

This is an isolated synthetic validation package. It does not certify a real society guideline. Read `docs/clinical-governance/source-verification-amendment.md` for the distinction between source fidelity, treating-clinician selection and local-policy/deployment authorization. No per-extraction clinician endorsement is introduced.

## Reproduce

```
pnpm evidence:test
pnpm evidence:demo
pnpm evidence:watch
```

The lab is `/evidence-lab` and requires BOTH `PREP_MEDS_CONTENT_MODE=shadow` and `PREP_MEDS_EVIDENCE_LAB=synthetic`. Existing production/unset content mode remains fail-closed. No deployment environment was changed for this PR.

## Committed fixture provenance

`synthetic-bundle.json` is a compact gzip/base64 envelope of the actual two-worker output from GitHub Actions run 42376964048, source commit f93182ca35f74dfa5cd2576931bfd91c988b3b31. The server and timing tests verify the decompressed SHA-256 before use. It includes source snapshots, exact passages, independent-process receipts and the fictional case. It is not encrypted or a hidden approval mechanism; inspect the source JSON with:

```
node --input-type=module -e "import{readFileSync}from'node:fs';import{gunzipSync}from'node:zlib';const e=JSON.parse(readFileSync('engineering/clinical-evidence/synthetic-bundle.json'));console.log(gunzipSync(Buffer.from(e.data,'base64')).toString())"
```

The uncompressed source bundle and full acceptance report are also in the run artifact: https://github.com/jedmedasr/PREP-MEDS/actions/runs/42376964048/artifacts/13576046722 . Artifact ZIP SHA-256: fb775e81815092ce52b94af236a1683d4341635ab6f6555ca8f70f25dee95b06. Expiry: 2026-12-07. The committed fixture survives artifact expiry; new CI runs generate fresh synthetic receipts.

## Remaining real-system work

- Trusted primary PDF/text acquisition with page/table/footnote context and full source-version storage.
- Two independently configured live clinical extraction/verification adapters; fixture workers explicitly refuse real documents.
- Verified real-society coverage, actual revision/supersession reconciliation, and autonomous graph/evidence updates from those results. Current watcher emits proposed graph events only.
- Authenticated treating-clinician identity, authorized institutional-policy integration and compliant durable decision storage. The current browser audit export is synthetic only.
- Monthly workflow adoption on main. May/November comprehensive source observation is not yet a complete clinical evidence review.

No provider subscription, API key, paid model loop or continuous agent was configured. Missing evidence/adapters stay UNVERIFIED; they are not sent to a new clinician endorsement queue. Passing tests establish the synthetic engineering contract, not full clinical correctness.

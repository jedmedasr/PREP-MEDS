# Clinician source verification at Mark Reviewed

Authority: owner instruction and dedicated evidence-agent commit
`54ba41ff7c68232fb92bb8886a0e73fbfb165a54`:
https://github.com/jedmedasr/PREP-MEDS/commit/54ba41ff7c68232fb92bb8886a0e73fbfb165a54

## Current policy (supersedes the two-independent-AI prerequisite)

The clinical evidence agent completes medication-specific extraction and society/FDA comparisons, sources, formulation/identity mapping and scenario tests. A complete package becomes `READY_FOR_CLINICIAN_REVIEW`; extraction advances to the next medication immediately. No second AI verifier and no waiting for a previous clinician review are required. Conflicting recommendations remain separate; absence of advice is explicit, not invented.

The allowlisted clinician signs in and independently checks the primary passages when clicking **Mark Reviewed**. Only that affirmative, version-bound action yields `CLINICALLY_REVIEWED`. GitHub membership, a model's claim, link accessibility or a passing test is not clinical approval. This is evidence-group approval, NOT a patient-specific decision, institutional-policy authorization, rule activation or deployment approval. Existing ACTIVE rules are untouched.

Earlier source-verification design and fixtures remain historical/test implementations. Their two-worker receipt contract is NOT a prerequisite to this clinical queue. Legacy production safeguards remain effective until separately migrated. Engineering implementation review remains separate from clinician source review.

## Runtime interface

`/clinical-review` and `/api/clinical-review` are enabled explicitly with `PREP_MEDS_CLINICIAN_REVIEW=enabled`. The user authenticates with GitHub OAuth authorization-code flow, state and S256 PKCE. The server rechecks the user ID and the clinician allowlist on every request. No identity or approval flag from the request body is trusted. Cookies are Secure/HttpOnly/SameSite=Lax with a 30-minute encrypted session; writes also require exact Origin, JSON and a session-bound CSRF token.

The clinical review store is repository `jedmedasr/PREP-MEDS`, branch `clinical-review/audit`, path `clinical-review-audit/ledger.json`. The application never writes main. A server-only Contents-write credential creates the dedicated audit branch on the first real review and appends signed, hash-linked events using non-force optimistic updates. Concurrent changes fail closed and require refreshing. A failed write never becomes a local approval. Sources are reread from main, not a stale deployed fixture; a source race after append returns invalidated historical evidence rather than approving the new revision.

Each event preserves GitHub numeric reviewer ID/login, timestamp, source versions and locators, evidence revision, material hash, full group/evidence snapshot, precise scoped canonical mappings, modifications since prior review, notes, and prior-event identity. Review notes are not hidden clinical edits. **Request changes** records corrections and invalidates review; the evidence agent publishes a new immutable revision. **Revoke evidence review** preserves the prior record and makes it ineffective.

Current evidence and mapping content is hashed conservatively. Timing, renal thresholds, source/footnote/version, applicability, exceptions, conflicts, formulation and canonical mapping changes invalidate an older approval on read without deleting it. Presentation-only labels/editorial notes do not. The importer/history CI reject material edits without a new revision, overwriting historical snapshots, or reusing a historical revision after rollback. Review validity is always derived from current content; no approval flag is copied forward. Group evidence propagates to each mapped canonical ID with explicit formulation scope/confirmation, never to a combination merely containing that ingredient.

## Evidence-agent import contract and work separation

Use the type contract in `scripts/clinician-review/core.d.mts`. Publish groups in `clinical-content/clinician-review/catalog.json`, with exactly scoped ingredient sets and clinically distinct route/form/release/chemical-form/device/regimen. The mapping must reference existing canonical IDs. Generic IDs may carry multiple explicitly qualified groups; neither is a formulation identification.

Each recommendation includes publisher/title/publication/version, exact locator, primary URL and precise deep link where available, passage/context/footnotes, source revision, access limitations, procedure/renal scope, interruption/resumption, bridging, exceptions, strength/certainty and conflicts. When a deep link genuinely cannot be supplied, retain the full primary source, precise section identifier and an explicit limitation. Do not fabricate page anchors. Missing facts are stated rather than extrapolated. The runtime validator checks structure, not medical entailment.

`node scripts/clinician-review/import.mjs GROUP.json INVENTORY.json --write`

The inventory argument is an exported array of canonical `{id, ingredientIds}` records. The command retains old and new snapshots and refuses material change under the old revision. The application CI additionally checks the catalog against assembled live terminology. READY packages require linked recommendations, no unresolved source-access/structural blockers, and test-evidence references. Genuine guideline conflicts do not force consensus or prevent clinician comparison. Neither AI verification nor clinician approval is an input to readiness. `nextExtraction` skips READY packages regardless of review backlog.

The initial apixaban import reuses the dedicated agent's six-source comparison at the exact authority commit. It remains DRAFT because that source explicitly identifies unfinished exact-passages/currentness/scenario/mapping work. No new primary-source extraction or independently verified medical content is claimed. The source agent owns that completion; the engineering agent owns this interface. Do not reread all guidelines just to recreate its existing comparison.

## One-time owner configuration (no paid service required)

Create a GitHub OAuth app for the clinician-review website; callback:
`https://<review-host>/api/clinical-review/auth`. Request only `read:user`, not repository scope, for clinician sign-in. Configure server-only variables:

- `PREP_MEDS_REVIEW_ORIGIN`: exact HTTPS origin, no path/query.
- `PREP_MEDS_REVIEW_CLIENT_ID` / `PREP_MEDS_REVIEW_CLIENT_SECRET`: registered app credentials.
- `PREP_MEDS_REVIEW_SESSION_KEY`: 32 cryptographically random bytes encoded as 64 lowercase hex characters. Also derives the audit HMAC key; retain securely for historical verification. A planned rotation needs a keyring migration, not silent key replacement.
- `PREP_MEDS_REVIEW_STORE_TOKEN`: narrowly repository-scoped Contents read/write credential for this repository. Never expose it in NEXT_PUBLIC variables or browser storage.
- `PREP_MEDS_CLINICIAN_GITHUB_IDS`: explicit comma-separated numeric GitHub IDs approved by the institution/owner as clinicians. Empty by default. Neither the implementation author nor any repository administrator is automatically added.
- `PREP_MEDS_CLINICIAN_REVIEW=enabled`: enables clinician evidence review only. It does not enable patient-facing content.

Owner should restrict deletion/force-push and writes to the audit branch. HMAC detects unauthorized content changes without the secret, but is not independent notarization, nor a defense against a compromised application server/administrator or complete branch rollback. Key custody, retention, recovery, access auditing and organization-level authentication controls require deployment security validation. GitHub stores evidence-group metadata only: NO patient data, demographics, clinical episodes or identifiable case notes. This is not an EHR or compliant patient decision store.

## Validation boundary

Pure regression tests exercise real code with synthetic records and mocked GitHub/OAuth transport. No real clinician approval, credential configuration or live login is fabricated. Before activating this UI, test the real OAuth callback, allowlist, durable audit append, revocation and concurrent edits in a controlled deployment. Existing source observers may trigger new evidence revisions; they never click Mark Reviewed. No continuous agents or paid model calls are introduced.

Official technical references:
https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
https://docs.github.com/en/rest/git/refs
https://docs.github.com/en/rest/repos/contents

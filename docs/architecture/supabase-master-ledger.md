# Supabase master ledger: implementation boundary

Authority: owner's database-backed A -> independent B instruction; baseline migration f6f28735b45273486b443f04bab6d6b49466b112. Supabase is the operational source of truth; GitHub is the evidence/code source. This supersedes the no-second-AI rule for this evidence-completion workflow only. Clinician review and patient-facing release remain separate.

## Live access, not an assumed deployment

At execution start the Supabase plugin search returned installed=false, and no Supabase project/SQL action or database credential was exposed in this session. The connection control was surfaced. No existing project has yet been inspected or modified. Do not interpret isolated PostgreSQL CI as live Supabase acceptance. Never create a replacement project.

Before applying: identify the existing project; run supabase/ops/inspect-existing.sql; inspect existing medication/evidence tables and migration history; reconcile any naming/data overlap; preserve an owner-approved snapshot and exact schema fingerprint. If the proposed prepmeds_audit baseline already exists, do not rerun its non-idempotent ADD CONSTRAINT statements. Apply the additive migrations only after actual schema reconciliation. They are not automatically deployed by CI.

## Reviewed defects in the supplied baseline

The original migration is unchanged. Its duplicate ADD CONSTRAINT statements prevent raw-script replay. unique(group_id,agent,revision) prevents legitimate attempts after expired claims. It lacks authenticated agent identity, atomic dispatch, immutable revisions, idempotent request tracking, lease recovery, material-revision binding, and a formulation-aware many-to-many membership. Custody UPDATE/DELETE protection does not block TRUNCATE. No inference of clinical correctness is possible from the baseline state column alone.

Reuse review_groups, canonical_mapping, agent_runs and custody_events. Extend review_groups into provisional parents plus formulation units; canonical_mapping remains the one-row-per-canonical master, while review_unit_members supports generic IDs in explicitly distinct scopes. Immutable evidence_revisions hold exact A payloads and mappings. import_receipts retain unmodified GitHub history as preliminary evidence. dispatch_requests bind idempotency keys to the original response. Separate registered principals fix each credential's lane/role and independence identity; clients cannot choose their role by changing a request field.

Only the restricted RPC entrypoint is callable by the server service role. Browser roles have neither schema access nor table/function grants. Private security-definer procedures pin search_path and validate per-agent bearer credentials. Tokens are never committed or returned. Enabling runtime requires explicit project binding, inspection digest and independently provisioned A/B identities. Even an EVIDENCE_COMPLETE result leaves clinical_reviewed and patient_facing_enabled unchanged.

Database owners and server credential custodians are trusted. A difference in registered principal IDs is not scientific proof that two model contexts were independent; actual separate source-only workers and source retrieval evidence must be demonstrated before live acceptance. Synthetic PostgreSQL fixtures test enforcement only and cannot certify any medication.

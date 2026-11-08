# Integration checkpoint: PRs #40, #41, #42 and #43

This candidate combines the exact heads in `integration-manifest.json` with the inspected current main. It does not merge any PR into main, complete a task automatically, or enable clinical guidance. Each source branch was first reconciled with main using non-force updates and exact-head checks. PR #37 was already merged by its independent owner; its code is preserved byte-for-byte.

## Resolutions

The task graph is the union of all task IDs. SPR-001 status/source and the current snapshot come from the refreshed #40; ENG-003 comes from #41; EVD/CKG nodes come from #42/#43. All remain at their existing review/blocker states. The ledger is the exact-record union, deduplicating only identical IDs/content and preserving failure history. No evidence is upgraded into clinical approval.

Root AGENTS retains #42/#43's source-fidelity amendment and adds #41's operating contract. The original #41 decision log is retained verbatim as `decisions-stage2.md`; #42/#43 decisions remain in `decisions.md`. Package scripts preserve evidence/knowledge/schema commands and add the graph interface. All remaining files follow their source snapshots; where #43 extends its #42 ancestor, the descendant version is used.

`node scripts/verify-integration.mjs` checks exact-record/task preservation, script availability, baseline clinical-file identity, source ancestry and non-conflicting file hashes against the immutable input commits. Its fixture tests include dropped tasks, changed historical evidence and conflicting IDs. This is a pinned checkpoint test, not a rule forbidding future reviewed development; intentionally updating its source pins requires renewed verification.

## Merge/review sequence

Keep #40, #41, #42 and #43 separately reviewable. This combined PR establishes compatibility with current main and records resolutions. It is not permission to skip independent engineering review. Once reviewed, the owner may adopt the reviewed combined candidate or use the same resolutions in sequential integration, but must not merge stale, conflicting snapshots or lose appended evidence. Re-run checks and reconcile live main before the actual integration. No self-approval.

## Current acceptance limits

The refreshed main-source audit measured 436 medication IDs, 233 provisional ingredient groups, 48 combinations and 17/17 antithrombotic discovery entries/groups. No duplicate IDs or broken assembled source references were found. All 233 formulation groups remain pending and all 436 per-ID review records remain NOT_STARTED. These are source-pinned inventory observations, not clinical review.

The combined application remains synthetic/reference-only under its existing explicit flags. Real source-semantic verification, authenticated observation delivery, institutional-policy execution and compliant clinical decision persistence remain separate incomplete milestones. No new scenario, paid provider, autonomous agent, production credential or deployment configuration is introduced by this checkpoint.

Final combined CI and live reconciliation must be inspected; passing source-branch CI alone is insufficient. The main branch stays untouched until the required review and checks are satisfied.

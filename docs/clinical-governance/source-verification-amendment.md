# Source-verified society guidance and clinician-directed selection

## Governing principle
The published society guideline is the recommendation of its authors. PREP-MEDS must reproduce it faithfully; a second clinician is not required to re-endorse every extraction. Automated verification asserts source fidelity/provenance, not universal clinical validity. The treating clinician makes the patient-specific decision.

This amendment defines a separate source-reproduction pathway. It does not reclassify legacy draft rules, disable legacy production gates, or approve locally authored recommendations. The existing clinical rule lifecycle and packages/evidence/src/governance.ts remain unchanged during isolated validation. Engineering review of this new pathway is not a per-guideline clinician-signoff workflow.

## Automated pathway
1. Retrieve an allowlisted primary document; preserve URL, publication precision, retrieval time, raw/text hashes, extraction version and source locations. Society indexes identify possible revisions but are not clinical evidence. Missing sources or access challenges cannot pass verification.
2. Worker A extracts medication identity, formulation, procedural/bleeding/thrombotic scope, renal metric and boundary inclusivity, interruption/resumption semantics, time units, bridging, exceptions, strength and certainty. Every consequential field needs an exact supporting passage and source location. Missing advice is not_specified, never invented.
3. Worker B receives the original source and scope in a separate context, never A's interpretation. Execution receipts bind source, input, output and worker versions. Agreement without passages, or different worker names alone, is insufficient. Source text is data, not executable instructions.
4. Deterministic checks enforce structure, mapping, complete combination ingredients, numeric/unit passage support, renal boundaries, timing anchors and provenance. Disagreement and unsupported interpretations remain UNVERIFIED.
5. Society extractions passing the source-fidelity pathway become eligible for SOURCE_VERIFIED comparison without a clinician re-endorsement field. Synthetic documents receive SYNTHETIC_VERIFIED and must never masquerade as verified society guidance.
6. Preserve independent society rows, dates, certainty, exceptions and potentially superseded status. Do not select shortest/longest intervals or invent consensus. Missing sources and incomplete society coverage remain visible.
7. The treating clinician selects an applicable verified source or authorized institutional policy. Persist source/rule versions, patient inputs, authenticated identity, choice, timestamp and deterministic output. Unknown or unsupported scenarios remain blocked. Ranges require explicit choice. Calendar dates are not elapsed hours or an invented dose time. Resumption requires appropriate postprocedure/hemostasis information.

Institutional policy changes and locally authored/derived recommendations retain explicit institutional human authorization. An agent's approved flag is not authorization. Routine society extraction, surveillance, verification, tests and evidence updates do not require a clinical sign-off task.

## Implemented validation boundary
This implementation supplies an executable verifier, two independent-process deterministic synthetic workers, immutable version/receipt handling, impact mapping, fail-closed timing, a synthetic comparison lab and scheduled source observation. It activates no real clinical rules.

The synthetic workers parse fictional controlled-language documents and refuse real documents. They test isolated source-only inputs and the engineering workflow; they are NOT live clinical AI agents. Process separation is not an operating-system sandbox. Distinct code hashes do not prove independent clinical reasoning.

Real primary-document/PDF-layout acquisition and two independently configured live clinical extraction agents are not provisioned. Real source-registry entries therefore remain unverified. Matching quoted text does not prove semantic entailment: live verification must also check tables, footnotes, negation, exceptions and context. Unsupported formats must fail closed. A SOURCE_VERIFIED-shaped object must never be accepted from an untrusted client.

The lab requires BOTH PREP_MEDS_CONTENT_MODE=shadow and PREP_MEDS_EVIDENCE_LAB=synthetic. Production/unset modes return 404. It accepts bounded synthetic fields only. Clinician identity, medication and case are explicit fixtures. Real use requires authenticated episode decisions, institutionally authorized policies, compliant durable event storage and validated deployment integration. Those are platform controls, not another clinician review of each society recommendation.

## Surveillance and cost
The GitHub workflow specifies one monthly run on the seventh at 11:37 UTC. May and November perform comprehensive source observation, including unconditional retrieval and society-index checks, in the same job rather than duplicate polling. Successful observation is not a comprehensive clinical evidence review; reports explicitly retain missing adapters, inaccessible sources and incomplete coverage.

Initial scope is ASGE 2016, BSG/ESGE 2021 and ACG/CAG 2022 antithrombotic source locations and society indexes. This is not an exhaustive all-medication/all-society catalogue. SHA-256, conditional requests and bounded downloads reduce unnecessary work. Index changes are revision candidates, not automatic supersession declarations.

Persistent observations and their history use automation/evidence-surveillance-state, not main or PR #37. Optimistic concurrency rejects stale writes. The branch contains no patient information or activated rules. Model-call budget defaults to zero: no paid provider, continuous agent or subscription has been configured. The pipeline cache includes source, scope, agent, runner and verifier versions. Reuse requires the intact evidence artifact, not a success flag. Unchanged blocked work requires explicit retry or changed implementation.

Schedule execution begins only after merging the workflow to the default branch. A workflow on a feature branch is not an active recurring service.

## Acceptance and remaining integration
Run node --test scripts/__tests__/clinical-evidence.test.mjs, node scripts/clinical-evidence/demo.mjs, and the existing complete application quality/graph checks. The synthetic demo detects a revision, independently extracts/verifies, preserves history, identifies impacted IDs, keeps conflicting society rows, requires selection and generates traceable instructions. It proves the engineering path, not an actual society guideline revision.

Preserve PR #40's SPR-001 reconciliation and PR #41's ENG-003 work when combining branches. PR #37 remains undisturbed. The follow-on work is real source acquisition/live-agent integration and clinical deployment integration, not per-extraction human endorsement. Existing legacy clinical/release gates remain effective until this amendment is deliberately validated and adopted.

References: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule ; source locations are recorded in engineering/clinical-evidence/sources.json.

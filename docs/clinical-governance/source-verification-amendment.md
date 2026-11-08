# Source-verification amendment - current policy

The owner decision recorded in commit `54ba41ff7c68232fb92bb8886a0e73fbfb165a54` supersedes the former requirement for two independent AI extraction/verification contexts.

Current implementation and operating contract: [Clinician source verification at Mark Reviewed](clinician-mark-reviewed.md).

The clinical evidence agent completes primary-source extraction and comparisons, including medication/formulation, renal and procedural scope, interruption/resumption, exceptions, strength/certainty and direct source locators. Structurally complete, scenario-tested packages enter `READY_FOR_CLINICIAN_REVIEW`; extraction proceeds to the next group immediately. No separate independent AI step or prior clinician review blocks that queue.

The authenticated, authorized clinician verifies the linked primary passages when selecting Mark Reviewed. The audit binds identity, timestamp, source versions, exact evidence revision, modifications and scoped canonical mappings. Material changes invalidate previous review. Conflicting society recommendations remain separate and patient-specific selection remains explicit.

Clinical evidence approval is not institutional-policy approval, patient-specific authorization or permission to activate patient-facing instructions. Existing production controls remain unchanged. No stored draft is automatically relabeled approved.

The earlier two-worker implementation is retained for historical engineering tests, not used as an additional clinical review gate. Its former design is preserved in Git history at main merge `70dc22c693906368ceee0f6966b866bbf65f5451`. Existing source-surveillance hashing/caching and monthly/six-month schedules are reused. Successful source observation is not clinician review or proof of comprehensive clinical evidence coverage.

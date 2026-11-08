# SPR-001: exact-source inventory reconciliation

The current audit target is recorded in `source-pin.json`: main `b117988e353d6c5731fffcde1f491ccbf03713c0`, after PR #37 was merged independently. This PR does not modify the sprint branch, clinical recommendations or deployment settings.

`sprint-reconciliation.yml` checks out the pin into an isolated directory, recomputes inventory and queue counts, checks references, and exports the full manifest, combination entries, queue, summary and source archives. It runs for every PR change so a metadata-only synchronization does not lack an audit gate. The pin is immutable during a run and is checked against the checkout SHA.

Do not assume the older 436/233/48 or 17/17 counts persist. Use the completed audit for the exact pin. Source main quality run 42412574938 passed; that is separate from the new reconciliation PR checks and is not clinical validation.

`verified-report.json` and `latest-observation.json` predate this refresh and remain historical records for their embedded source SHAs. They are not rewritten to describe new source content. After the refreshed run succeeds, append a new exact-SHA observation and ledger evidence. SPR-001 remains needs_review until independent engineering acceptance and integration; downstream clinical work is not silently advanced.

The exporter measures current statuses rather than insisting that they remain NOT_STARTED. Missing formulation adjudication, source verification and metadata are reported independently of test/build success. No repetitive clinician re-endorsement is required to count terminology records or reproduce faithfully verified society guidance. Existing production safeguards remain unchanged.

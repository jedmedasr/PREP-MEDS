# Clinical knowledge editing contract

Read README.md in this directory, the root AGENTS.md, and docs/architecture/clinical-knowledge-graph.md. Keep this clinical graph separate from engineering/task-graph.json.

Never promote a claim because it has matching quotations, repeated use, two agreeing model outputs or passing tests. Source-semantic verification must be independently executed against identifiable original context. Do not require repetitive physician endorsement merely to reproduce verified society guidance. Institutional/local recommendations and production deployment remain separately authorized.

Keep full source version, precise page/table/footnote links, verified method/date and remaining uncertainty visible. Source updates invalidate dependent current claims without deleting history. Use targeted reverse dependencies and scoped research keys; do not re-run inference for unrelated edits or unchanged intact evidence. No patient identifiers, free-text histories or clinical decision records belong in GitHub.

Run pnpm knowledge:test, pnpm validate:schemas and full application quality checks. Run existing engineering graph checks after graph/ledger changes. Do not rename mechanical PDF readers as independent clinical AI agents. Do not expand beyond the reference VTE slice until CKG-002 and its existing EVD-002 dependency genuinely satisfy independent source-semantic verification. Never modify PR #37 as part of this work.

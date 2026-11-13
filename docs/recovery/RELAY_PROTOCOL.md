# PREP-MEDS worker transports

A research worker reaches the database in one of two ways. Both use the same protocol and the
same database functions. Status: the database side is built and tested (tests J01 to J05 for the
relay path). The GitHub workflow and script described here are specified, not built; the master
prompt builds them in Phase 2.

## Direct

```
POST {SUPABASE_URL}/rest/v1/rpc/<function>
apikey: {PUBLISHABLE_KEY}
Content-Type: application/json
Content-Profile: prepmeds

{"p_token": "<lane token>", ...named arguments}
```

Confirmed against the hosted project on 2026-11-11 by the `prepmeds-maintenance` workflow
(run 42952352040), which called `rpc/get_progress` successfully using exactly the headers above:
`apikey`, `Content-Type: application/json`, and `Content-Profile: prepmeds`. No
`Authorization` header is required for this project's publishable-key RPC path. The lane token
is created by `admin_create_worker`, shown once, and kept in the agent's private instructions.
It can be replaced with `admin_rotate_worker_token`.

## Relay

For a worker that can only commit files to GitHub.

### Branches

- `lane/odd` is written by Agent 1, `lane/even` by Agent 2. They are orphan branches holding
  only `requests/`, `responses/`, a README and `.github/workflows/relay-poke.yml`.
- The worker writes `requests/<request_id>.json`, one file per commit.
- The relay writes `responses/<request_id>.json` on the same branch.

### Request

```
{"request_id": "odd-s12-004", "op": "submit", "session_id": 12, "task_id": 7,
 "claim_token": "<uuid from the claim>", "submission_id": "ING-apixaban-r0-1",
 "package": { ... }, "then": "claim"}
```

| op | Fields | Database function |
| --- | --- | --- |
| `start_session` | `label`, optional `then: "claim"` | `_start_session` |
| `claim` | `session_id` | `_claim` |
| `heartbeat` | `session_id`, `task_id`, `claim_token` | `_heartbeat` |
| `save_progress` | `session_id`, `task_id`, `claim_token`, `progress` | `_save_progress` |
| `submit` | `session_id`, `task_id`, `claim_token`, `submission_id`, `package`, optional `then: "claim"` | `_submit` |
| `release` | `session_id`, `task_id`, `claim_token`, `code`, `note` | `_release` |
| `split` | `session_id`, `task_id`, `claim_token`, `parts`, `rationale` | `_split` |
| `report` | `session_id` | `_session_report` |

All go through `prepmeds.ci_relay(p_ci_token, p_github_login, p_lane, p_request)`.

### Response

The database's JSON result, plus `worker_id` and `op`. With `then: "claim"`, the claim result is
under `next`. After an accepted submit the relay also runs the two suites for the new revision
and adds `tests` and `group_status`. On an error: `{"ok": false, "error": "<database message>"}`.

A claim result carries the whole brief:

```
{"ok": true, "status": "CLAIMED" | "RESUMED" | "NO_WORK",
 "task": {"task_id", "claim_token", "attempt", "reason", "detail", "lease_expires_at",
          "saved_progress", "saved_progress_at", "last_error_code"},
 "group": {"group_id", "kind", "bucket", "lane", "domain", "class", "ingredients", "medications"},
 "based_on_revision_no", "comparators_pinned", "required_sources", "scenarios",
 "known_passages", "components", "package_schema_version"}
```

### Rules the relay must follow

1. Identity is the GitHub login that pushed the commit introducing the request, read from
   GitHub-controlled push metadata. The relay checks repository activity, the repository
   PushEvent stream, and the actor of the branch-local relay-poke workflow run tied to the exact
   request commit. These are independent GitHub-controlled metadata paths; disagreement is
   rejected as ambiguous. Never use a field of the request and never use the git author/committer
   as identity.
2. Lane is the branch name. The database refuses a login that does not own that lane.
3. A request is pending while its response file does not exist. Pending requests are processed
   in commit order. Ordinary errors produce a response. If GitHub has not yet exposed any trusted
   push identity for a request commit, the relay leaves that request pending instead of writing an
   immutable identity error; a later scheduled sweep retries it. Workers must not infer failure
   from repeated immediate 404 reads: a request remains pending while its relay-poke or trusted
   prepmeds-ci run is queued or running. RELAY_NO_RESPONSE is only appropriate after the trusted
   relay run has completed without materializing the response, or after the scheduled fallback
   also fails to process a request for which no relay run appeared. Ambiguous identities still fail.
4. A file that is not valid JSON, or is larger than 1 MB, gets an error response and no database
   call.
5. `git_commit` passed with a submit is the SHA of the request commit.
6. Responses are committed with the workflow token, which does not trigger further workflows.
7. Nothing from a request is interpolated into a shell command.
8. The workflow that holds the CI token (`prepmeds-ci.yml`) is defined on `main` and uses the
   protected environment `prepmeds`. It checks out `main` for code and fetches the lane branch as
   data. It never executes anything from a lane branch.
9. `relay-poke.yml` on each lane branch only dispatches `prepmeds-ci.yml` on `main` with the lane
   as input. It holds no secret. A 5-minute schedule on `main` sweeps both lanes if the poke
   fails.

### Idempotency and recovery

- A submit with a `submission_id` already stored for that task returns the stored revision.
- To re-process a request, delete its response file.
- A claim that is never used lapses after the lease (90 minutes) at the next claim in that lane.

### What is public

On a public repository, request and response files are public. They contain medication names,
guideline citations, short verbatim quotes and claim tokens. A claim token alone cannot be used:
the relay accepts requests only from the lane's GitHub login, and the direct transport needs the
lane token. Lane tokens, the CI token and the clinician PIN never appear in these files.

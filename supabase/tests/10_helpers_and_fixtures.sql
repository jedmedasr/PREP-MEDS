-- Test helpers and SYNTHETIC fixtures. Nothing in this file is clinical content: every drug,
-- guideline, quote and number below is invented so that no test can be mistaken for evidence.
\set ON_ERROR_STOP on
\set QUIET on
set client_min_messages = warning;

create schema pmtest;
create table pmtest.results (n serial primary key, name text not null, ok boolean not null, detail text);
create table pmtest.secrets (name text primary key, value text not null);

create or replace function pmtest.ok(p_name text, p_ok boolean, p_detail text default null) returns void language sql as
$t$ insert into pmtest.results (name, ok, detail) values (p_name, coalesce(p_ok, false), case when coalesce(p_ok, false) then null else p_detail end) $t$;

-- The statement must fail with a message containing p_expect.
create or replace function pmtest.throws(p_name text, p_sql text, p_expect text) returns void language plpgsql as $t$
declare v_msg text;
begin
  begin
    execute p_sql;
    insert into pmtest.results (name, ok, detail) values (p_name, false, 'expected an error containing "' || p_expect || '" but the statement succeeded');
  exception when others then
    v_msg := sqlerrm;
    insert into pmtest.results (name, ok, detail)
    values (p_name, position(p_expect in v_msg) > 0, case when position(p_expect in v_msg) > 0 then null else 'got: ' || v_msg end);
  end;
end $t$;

-- The result of submit_package must be a rejection that names p_expect.
create or replace function pmtest.rejected(p_name text, p_result jsonb, p_expect text) returns void language sql as $t$
  insert into pmtest.results (name, ok, detail)
  select p_name,
         (p_result->>'accepted') = 'false' and exists (select 1 from jsonb_array_elements_text(p_result->'deficiencies') d where position(p_expect in d) > 0),
         'result: ' || left(p_result::text, 700)
$t$;

create or replace function pmtest.secret(p_name text) returns text language sql stable as
$t$ select value from pmtest.secrets where name = p_name $t$;

create or replace function pmtest.sign_in(p_user uuid) returns void language sql as
$t$ select set_config('request.jwt.claims', case when p_user is null then '' else jsonb_build_object('sub', p_user)::text end, false) $t$;

-- A structurally complete package for any group, built from what the database requires of it.
-- p_edit is merged over the top so a test can break exactly one thing.
create or replace function pmtest.package(p_group text, p_edit jsonb default '{}') returns jsonb language plpgsql stable as $t$
declare g prepmeds.review_groups; v jsonb; v_srcs text[]; s text; v_recs jsonb := '[]'; v_passages jsonb := '[]'; v_cmp jsonb := '[]'; v_cov jsonb := '[]';
  sc record; v_comp jsonb := '[]'; v_ing jsonb := '[]'; i record;
begin
  select * into g from prepmeds.review_groups x where x.group_id = p_group;
  select coalesce(array_agg(r.source_id order by r.source_id), '{}') into v_srcs from prepmeds.domain_required_sources r where r.domain_key = g.domain_key;
  if cardinality(v_srcs) = 0 then v_srcs := array['SOC-A-2016']; end if;
  foreach s in array v_srcs loop
    v_cmp := v_cmp || jsonb_build_object('source_id', s, 'status', 'COMPARED', 'checked_locators', 'Table 1');
    v_passages := v_passages || jsonb_build_object('key', 'p-' || s, 'source_id', s, 'locator', 'Table 1 (' || p_group || ')', 'page', '4',
                    'deep_link', 'https://example.org/' || lower(s) || '#page=4',
                    'quote', 'Synthetic test quotation for ' || p_group || ' from ' || s || '.');
    for sc in select d.scenario_key from prepmeds.domain_scenarios d where d.domain_key = g.domain_key and d.required order by 1 loop
      v_recs := v_recs || jsonb_build_object('source_id', s, 'passage', 'p-' || s, 'scenario_key', sc.scenario_key, 'action', 'continue',
                  'summary', 'Synthetic recommendation for ' || sc.scenario_key || '.');
    end loop;
  end loop;
  for sc in select d.scenario_key from prepmeds.domain_scenarios d where d.domain_key = g.domain_key and d.required order by 1 loop
    v_cov := v_cov || jsonb_build_object('scenario_key', sc.scenario_key, 'status', 'ADDRESSED');
  end loop;
  if g.kind = 'combination' then
    for i in select gi.ingredient_id from prepmeds.group_ingredients gi where gi.group_id = p_group order by 1 loop
      if exists (select 1 from prepmeds._standalone_groups(i.ingredient_id)) then
        v_comp := v_comp || (select jsonb_build_object('group_id', q.gid, 'revision_no', (prepmeds._head(q.gid)).revision_no)
                             from prepmeds._standalone_groups(i.ingredient_id) q(gid) order by q.gid limit 1);
      else
        v_ing := v_ing || jsonb_build_object('ingredient_id', i.ingredient_id, 'covered_by', 'own_recommendations');
      end if;
    end loop;
  end if;
  v := jsonb_build_object('schema_version', 1, 'group_id', p_group,
         'based_on_revision_no', coalesce((prepmeds._head(p_group)).revision_no, 0),
         'medication_ids', to_jsonb(prepmeds._current_meds(p_group)),
         'formulation', jsonb_build_object('decision', 'single_unit', 'rationale', 'Synthetic rationale: all mapped products share one recommendation set in this test.'),
         'passages', v_passages, 'comparisons', v_cmp, 'recommendations', v_recs, 'scenario_coverage', v_cov,
         'conflicts', '[]'::jsonb, 'components', v_comp, 'ingredient_coverage', v_ing, 'open_questions', '[]'::jsonb,
         'editorial', jsonb_build_object('notes', 'synthetic'));
  return v || p_edit;
end $t$;

-- Claim the next task for a worker and return the brief (starts a session if none is open).
create or replace function pmtest.claim(p_worker text) returns jsonb language plpgsql as $t$
declare v_tok text := pmtest.secret(p_worker); v_sid bigint;
begin
  v_sid := (prepmeds.worker_status(v_tok)->>'open_session_id')::bigint;
  if v_sid is null then v_sid := (prepmeds.start_session(v_tok, 'test')->>'session_id')::bigint; end if;
  return prepmeds.claim_next(v_tok, v_sid) || jsonb_build_object('session_id', v_sid);
end $t$;

-- Submit a package for the task described by a brief returned from pmtest.claim.
create or replace function pmtest.submit(p_worker text, p_brief jsonb, p_package jsonb, p_submission text default null) returns jsonb language sql as $t$
  select prepmeds.submit_package(pmtest.secret(p_worker), (p_brief->>'session_id')::bigint, (p_brief->'task'->>'task_id')::bigint,
           (p_brief->'task'->>'claim_token')::uuid, coalesce(p_submission, gen_random_uuid()::text), p_package)
$t$;

-- Record passing (or failing) CI runs for both suites of a group's current revision.
create or replace function pmtest.ci(p_group text, p_passed boolean default true, p_run bigint default null) returns jsonb language plpgsql as $t$
declare h prepmeds.evidence_revisions := prepmeds._head(p_group); v_run bigint := coalesce(p_run, (random() * 1e9)::bigint + 1); r jsonb;
begin
  r := prepmeds.ci_record_test_run(pmtest.secret('ci'), h.revision_id, h.content_sha256, 'evidence', 1, p_passed, 12, case when p_passed then 0 else 2 end,
         repeat('a', 40), v_run, 1, jsonb_build_object('synthetic', true));
  r := prepmeds.ci_record_test_run(pmtest.secret('ci'), h.revision_id, h.content_sha256, 'mapping', 1, p_passed, 5, case when p_passed then 0 else 1 end,
         repeat('a', 40), v_run, 1, jsonb_build_object('synthetic', true));
  return r;
end $t$;

-- Take a group all the way to "ready for clinician review" as its lane's worker.
create or replace function pmtest.make_ready(p_worker text, p_group text) returns jsonb language plpgsql as $t$
declare b jsonb; r jsonb;
begin
  b := pmtest.claim(p_worker);
  if b->'group'->>'group_id' is distinct from p_group then
    raise exception 'pmtest.make_ready: expected to claim % but got %', p_group, coalesce(b->'group'->>'group_id', b->>'status');
  end if;
  r := pmtest.submit(p_worker, b, pmtest.package(p_group));
  if (r->>'accepted') <> 'true' then raise exception 'pmtest.make_ready: % rejected: %', p_group, r; end if;
  perform pmtest.ci(p_group, true);
  return r;
end $t$;

-- ── Fixtures ─────────────────────────────────────────────────────────────────────────
insert into pmtest.secrets select 'agent-1', prepmeds.admin_create_worker('agent-1', 'odd', 'odd-bot');
insert into pmtest.secrets select 'agent-2', prepmeds.admin_create_worker('agent-2', 'even', 'even-bot');
insert into pmtest.secrets select 'ci', prepmeds.admin_create_ci_credential('github-actions');

select prepmeds.admin_register_source('{"source_id":"SOC-A-2016","kind":"society_guideline","society":"Synthetic Society A","title":"Synthetic guideline A","publication_date":"2016-01-01","version_label":"2016","doi":"10.9999/synthetic.a","url":"https://example.org/soc-a-2016"}');
select prepmeds.admin_register_source('{"source_id":"SOC-B-2021","kind":"society_guideline","society":"Synthetic Society B","title":"Synthetic guideline B","publication_date":"2021-01-01","version_label":"2021","doi":"10.9999/synthetic.b","url":"https://example.org/soc-b-2021"}');
select prepmeds.admin_register_source('{"source_id":"SOC-C-2022","kind":"consensus_statement","society":"Synthetic Society C","title":"Synthetic consensus C","publication_date":"2022-01-01","version_label":"2022","url":"https://example.org/soc-c-2022"}');
select prepmeds.admin_register_source('{"source_id":"LABEL-X","kind":"regulatory_label","society":"Synthetic regulator","title":"Synthetic drug label X","url":"https://example.org/label-x"}');

select prepmeds.admin_upsert_domain('{"domain_key":"t_antithrombotic","label":"Synthetic antithrombotic domain",
  "scenarios":[{"scenario_key":"low_risk_procedure","label":"Low-risk procedure","required":true},
               {"scenario_key":"high_risk_procedure","label":"High-risk procedure","required":true},
               {"scenario_key":"resumption","label":"Resumption","required":true},
               {"scenario_key":"urgent_procedure","label":"Urgent procedure","required":false}],
  "required_sources":["SOC-A-2016","SOC-B-2021"]}');

-- Twelve synthetic canonical IDs in nine ingredient sets.
select prepmeds.ci_sync_inventory(pmtest.secret('ci'), repeat('1', 40), '{"medications":[
  {"medicationId":"MED-alphaxaban","canonicalName":"Alphaxaban","ingredientIds":["ING-alphaxaban"],"route":"oral","dosageForm":"tablet","brandNames":["Alphaquis"]},
  {"medicationId":"MED-alphaquis-starter","canonicalName":"Alphaquis starter pack","ingredientIds":["ING-alphaxaban"],"route":"oral","dosageForm":"tablet","brandNames":["Alphaquis"]},
  {"medicationId":"MED-betaformin","canonicalName":"Betaformin","ingredientIds":["ING-betaformin"],"route":"oral","dosageForm":"tablet","releaseType":"immediate"},
  {"medicationId":"MED-betaformin-xr","canonicalName":"Betaformin XR","ingredientIds":["ING-betaformin"],"route":"oral","dosageForm":"tablet","releaseType":"extended"},
  {"medicationId":"MED-gammagliptin","canonicalName":"Gammagliptin","ingredientIds":["ING-gammagliptin"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-betagamma","canonicalName":"Betagamma","ingredientIds":["ING-gammagliptin","ING-betaformin"],"route":"oral","dosageForm":"tablet","ingredientSetKey":"ING-betaformin+ING-gammagliptin"},
  {"medicationId":"MED-betadelta","canonicalName":"Betadelta","ingredientIds":["ING-betaformin","ING-deltaflozin"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-epsilon-tablet","canonicalName":"Epsilon tablet","ingredientIds":["ING-epsilon"],"route":"oral","dosageForm":"tablet"},
  {"medicationId":"MED-epsilon-depot","canonicalName":"Epsilon depot injection","ingredientIds":["ING-epsilon"],"route":"intramuscular","dosageForm":"injection","releaseType":"extended"},
  {"medicationId":"MED-zetaparin","canonicalName":"Zetaparin","ingredientIds":["ING-zetaparin"],"route":"subcutaneous","dosageForm":"injection"},
  {"medicationId":"MED-etaprazole","canonicalName":"Etaprazole","ingredientIds":["ING-etaprazole"],"route":"oral","dosageForm":"capsule"},
  {"medicationId":"MED-thetastatin","canonicalName":"Thetastatin","ingredientIds":["ING-thetastatin"],"route":"oral","dosageForm":"tablet"}]}') as first_sync \gset

-- Buckets: odd lane owns buckets 1 and 3, even lane owns buckets 2 and 4.
select prepmeds.admin_assign_groups('[
  {"group_id":"ING-alphaxaban","bucket":1,"domain_key":"t_antithrombotic","class_key":"synthetic-xaban"},
  {"group_id":"ING-zetaparin","bucket":1,"domain_key":"t_antithrombotic","class_key":"synthetic-heparin"},
  {"group_id":"ING-epsilon","bucket":3},
  {"group_id":"ING-thetastatin","bucket":3},
  {"group_id":"ING-betaformin+ING-deltaflozin","bucket":3},
  {"group_id":"ING-betaformin","bucket":2},
  {"group_id":"ING-gammagliptin","bucket":2},
  {"group_id":"ING-betaformin+ING-gammagliptin","bucket":4},
  {"group_id":"ING-etaprazole","bucket":4}]');
select prepmeds.admin_open_initial_tasks() as tasks_opened \gset

-- Clinicians: one who may review and release, one who may only review, and a signed-in user who is neither.
\set clin_a '11111111-1111-4111-8111-111111111111'
\set clin_b '22222222-2222-4222-8222-222222222222'
\set outsider '33333333-3333-4333-8333-333333333333'
select prepmeds.admin_add_clinician(:'clin_a'::uuid, 'Test Clinician A', true, true, 'pin-alpha-1');
select prepmeds.admin_add_clinician(:'clin_b'::uuid, 'Test Clinician B', true, false, 'pin-bravo-2');
insert into pmtest.secrets values ('clin_a', :'clin_a'), ('clin_b', :'clin_b'), ('outsider', :'outsider');

-- Repair demonstrated PostgreSQL variable collision and add replay/context guards.
-- Prior migrations were tested only in disposable CI; no hosted deployment occurred.
create or replace function prepmeds_audit.recover_expired(p_lane text) returns integer
language plpgsql set search_path='' as $$
declare g prepmeds_audit.review_groups; r prepmeds_audit.agent_runs; n integer:=0;
begin
  for g in select x.* from prepmeds_audit.review_groups x join prepmeds_audit.agent_runs ar
    on ar.run_id=case when x.state='AGENT_A_CLAIMED' then x.latest_a_run else x.latest_b_run end
    where x.owner_lane=p_lane and x.state in ('AGENT_A_CLAIMED','AGENT_B_CLAIMED') and ar.state='CLAIMED' and ar.lease_until<=clock_timestamp()
    order by x.group_id limit 100 for update of x skip locked loop
    select * into r from prepmeds_audit.agent_runs where run_id=case when g.state='AGENT_A_CLAIMED' then g.latest_a_run else g.latest_b_run end for update;
    if r.state='CLAIMED' and r.lease_until<=clock_timestamp() then
      update prepmeds_audit.agent_runs set state='EXPIRED',finished_at=clock_timestamp() where run_id=r.run_id;
      update prepmeds_audit.review_groups set state=case when r.agent='B' then 'AWAITING_B' when r.previous_state='DISPUTED' then 'DISPUTED' else 'QUEUED' end,updated_at=clock_timestamp() where group_id=g.group_id;
      insert into prepmeds_audit.custody_events(group_id,run_id,event_type,details) values(g.group_id,r.run_id,'LEASE_EXPIRED',jsonb_build_object('revision',r.revision,'agent',r.agent,'progress_preserved',true));
      n:=n+1;
    end if;
  end loop;
  return n;
end $$;

create or replace function prepmeds_audit.dispatch(p_token text,p_action text,p_payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare a prepmeds_audit.agent_principals; cfg prepmeds_audit.runtime_config; g prepmeds_audit.review_groups; r prepmeds_audit.agent_runs; prior prepmeds_audit.agent_runs; e prepmeds_audit.evidence_revisions; req prepmeds_audit.dispatch_requests;
  key text; h text; errors jsonb; reply jsonb; stage text; n integer; ttl integer; evidence jsonb; verification jsonb; s jsonb; q jsonb; v jsonb; u jsonb; unit_id text; medication text; covered text[]:='{}'; expected text[]; next_revision integer; outcome text;
begin
  if p_token is null or length(p_token)<32 then raise exception 'UNAUTHORIZED' using errcode='42501'; end if;
  select * into a from prepmeds_audit.agent_principals where credential_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and enabled;
  if not found then raise exception 'UNAUTHORIZED' using errcode='42501'; end if;
  if jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>2000000 then raise exception 'INVALID_OR_OVERSIZED_PAYLOAD'; end if;
  select * into cfg from prepmeds_audit.runtime_config where singleton;
  if p_action='status' then
    return jsonb_build_object('enabled',cfg.enabled,'environment',cfg.environment,'project_ref',cfg.project_ref,'observed_at_utc',clock_timestamp(),'lane',a.owner_lane,'agent',a.agent,'identity_id',a.identity_id,
      'canonical_ids',(select count(*) from prepmeds_audit.canonical_mapping),
      'provisional_groups',(select count(*) from prepmeds_audit.review_groups where parent_group_id is null),
      'states',(select coalesce(jsonb_object_agg(x.state,x.n),'{}') from (select state,count(*) n from prepmeds_audit.review_groups where owner_lane=a.owner_lane and not is_container group by state) x),
      'agent_a_completed_runs',(select count(*) from prepmeds_audit.agent_runs x join prepmeds_audit.review_groups y using(group_id) where y.owner_lane=a.owner_lane and x.agent='A' and x.state='PASS' and x.principal_id is not null),
      'agent_b_verified_runs',(select count(*) from prepmeds_audit.agent_runs x join prepmeds_audit.review_groups y using(group_id) where y.owner_lane=a.owner_lane and x.agent='B' and x.state='PASS' and x.principal_id is not null),
      'patient_facing_authorized',false);
  end if;
  if cfg.enabled is distinct from true then raise exception 'LEDGER_NOT_ACTIVATED'; end if;
  if p_action in ('next','claim') then
    n:=prepmeds_audit.recover_expired(a.owner_lane);
    stage:=case when exists(select 1 from prepmeds_audit.review_groups where owner_lane=a.owner_lane and state='AWAITING_B' and not is_container) then 'B' else 'A' end;
    if p_action='next' then return jsonb_build_object('next_agent',stage,'recovered',n,'observed_at_utc',clock_timestamp(),'lane',a.owner_lane); end if;
    key:=p_payload->>'idempotency_key';
    if coalesce(key,'') !~ '^[A-Za-z0-9:_./-]{8,180}$' then raise exception 'IDEMPOTENCY_KEY_REQUIRED'; end if;
    perform 1 from prepmeds_audit.agent_principals where principal_id=a.principal_id for update;
    select * into req from prepmeds_audit.dispatch_requests where principal_id=a.principal_id and request_key=key;
    if found then
      if req.request_hash<>prepmeds_audit.hash_json(p_payload) then raise exception 'IDEMPOTENCY_KEY_REUSE'; end if;
      select * into r from prepmeds_audit.agent_runs where run_id=req.run_id;
      return req.response || jsonb_build_object('replayed',true,'run',case when r.run_id is null then null else to_jsonb(r) end,'execution_authorized',false,'resume_requires_explicit_owned_context',coalesce(r.state='CLAIMED' and r.lease_until>clock_timestamp(),false));
    end if;
    if exists(select 1 from prepmeds_audit.agent_runs where principal_id=a.principal_id and state='CLAIMED') then raise exception 'PRINCIPAL_ALREADY_HAS_ACTIVE_EXECUTION'; end if;
    if a.agent='A' and stage='B' then
      reply:=jsonb_build_object('run',null,'next_agent','B','reason','AWAITING_INDEPENDENT_B','execution_authorized',false);
    else
      select * into g from prepmeds_audit.review_groups x where x.owner_lane=a.owner_lane and not x.is_container
        and ((a.agent='A' and x.state in ('QUEUED','DISPUTED')) or (a.agent='B' and x.state='AWAITING_B' and exists(select 1 from prepmeds_audit.agent_runs ar join prepmeds_audit.agent_principals ap on ap.principal_id=ar.principal_id where ar.run_id=x.latest_a_run and ap.identity_id<>a.identity_id)))
        order by case when x.state='DISPUTED' then 0 else 1 end,x.bucket,x.group_id for update skip locked limit 1;
      if not found then reply:=jsonb_build_object('run',null,'next_agent',stage,'reason','NO_ELIGIBLE_WORK','execution_authorized',false);
      else
        ttl:=coalesce((p_payload->>'lease_seconds')::integer,2700);
        if ttl<1 or ttl>3600 or (cfg.environment<>'test' and ttl<60) then raise exception 'INVALID_LEASE'; end if;
        next_revision:=g.current_revision+case when a.agent='A' then 1 else 0 end;
        insert into prepmeds_audit.agent_runs(group_id,agent,revision,attempt,principal_id,context_id,previous_state,claimed_at,lease_until)
        values(g.group_id,a.agent,next_revision,(select coalesce(max(attempt),0)+1 from prepmeds_audit.agent_runs where group_id=g.group_id and agent=a.agent and agent_runs.revision=next_revision),a.principal_id,gen_random_uuid()::text,g.state,clock_timestamp(),clock_timestamp()+make_interval(secs=>ttl)) returning * into r;
        update prepmeds_audit.review_groups set state=case when a.agent='A' then 'AGENT_A_CLAIMED' else 'AGENT_B_CLAIMED' end,latest_a_run=case when a.agent='A' then r.run_id else latest_a_run end,latest_b_run=case when a.agent='B' then r.run_id else latest_b_run end,updated_at=clock_timestamp() where group_id=g.group_id;
        insert into prepmeds_audit.custody_events(group_id,run_id,event_type,details) values(g.group_id,r.run_id,'CLAIMED',jsonb_build_object('principal',a.principal_id,'identity',a.identity_id,'agent',a.agent,'revision',r.revision,'context',r.context_id,'lease_until',r.lease_until));
        reply:=jsonb_build_object('run',to_jsonb(r),'execution_authorized',true,'next_agent',a.agent);
      end if;
    end if;
    insert into prepmeds_audit.dispatch_requests(principal_id,request_key,request_hash,run_id,response) values(a.principal_id,key,prepmeds_audit.hash_json(p_payload),r.run_id,reply);
    return reply;
  end if;
  select * into r from prepmeds_audit.agent_runs where run_id=(p_payload->>'run_id')::uuid and principal_id=a.principal_id;
  if not found then raise exception 'EXECUTION_NOT_OWNED' using errcode='42501'; end if;
  select * into g from prepmeds_audit.review_groups where group_id=r.group_id for update;
  select * into r from prepmeds_audit.agent_runs where run_id=r.run_id for update;
  if p_action='get' then
    return jsonb_build_object('run',to_jsonb(r),'group',to_jsonb(g),'members',(select coalesce(jsonb_agg(to_jsonb(m) order by medication_id),'[]') from prepmeds_audit.review_unit_members m where group_id=g.group_id),'previous_runs',(select coalesce(jsonb_agg(to_jsonb(z) order by z.claimed_at),'[]') from prepmeds_audit.agent_runs z where z.group_id=g.group_id and z.run_id<>r.run_id),'current_evidence',(select to_jsonb(x) from prepmeds_audit.evidence_revisions x where group_id=g.group_id and x.revision=g.current_revision),'imports',(select coalesce(jsonb_agg(jsonb_build_object('commit',i.source_commit,'group',j)),'[]') from prepmeds_audit.import_receipts i cross join lateral jsonb_array_elements(i.payload->'groups') j where j->>'group_id'=coalesce(g.parent_group_id,g.group_id)));
  end if;
  if p_payload->>'context_id' is distinct from r.context_id then raise exception 'EXECUTION_CONTEXT_MISMATCH'; end if;
  h:=prepmeds_audit.hash_json(jsonb_build_object('action',p_action,'payload',p_payload));
  if r.state<>'CLAIMED' then
    if p_action in ('submit','verify','split') and r.result_hash=h then return jsonb_build_object('replayed',true,'run_id',r.run_id,'run_state',r.state,'current_state',g.state,'execution_authorized',false); end if;
    raise exception 'EXECUTION_ALREADY_FINISHED';
  end if;
  if r.lease_until<=clock_timestamp() then raise exception 'LEASE_EXPIRED'; end if;
  if (r.agent='A' and (g.latest_a_run<>r.run_id or g.state<>'AGENT_A_CLAIMED' or r.revision<>g.current_revision+1)) or (r.agent='B' and (g.latest_b_run<>r.run_id or g.state<>'AGENT_B_CLAIMED' or r.revision<>g.current_revision)) then raise exception 'STALE_EXECUTION'; end if;
  if p_action='renew' then
    ttl:=coalesce((p_payload->>'lease_seconds')::integer,2700);
    if ttl<1 or ttl>3600 or (cfg.environment<>'test' and ttl<60) then raise exception 'INVALID_LEASE'; end if;
    update prepmeds_audit.agent_runs set lease_until=greatest(lease_until,clock_timestamp()+make_interval(secs=>ttl)) where run_id=r.run_id returning * into r;
    insert into prepmeds_audit.custody_events(group_id,run_id,event_type,details) values(g.group_id,r.run_id,'LEASE_RENEWED',jsonb_build_object('lease_until',r.lease_until));
    return jsonb_build_object('run',to_jsonb(r));
  elsif p_action='checkpoint' then
    if r.result_hash is distinct from h then
      update prepmeds_audit.agent_runs set scenario_evidence=p_payload->'progress',result_hash=h where run_id=r.run_id;
      insert into prepmeds_audit.custody_events(group_id,run_id,event_type,details) values(g.group_id,r.run_id,'PROGRESS_SAVED',jsonb_build_object('progress',p_payload->'progress','hash',h));
    end if;
    return jsonb_build_object('saved',true,'run_id',r.run_id);
  elsif p_action='split' then
    if a.agent<>'A' or g.parent_group_id is not null or g.is_container or jsonb_typeof(p_payload->'units') is distinct from 'array' or jsonb_array_length(p_payload->'units')=0 then raise exception 'FORMULATION_SPLIT_NOT_ALLOWED'; end if;
    select array_agg(medication_id order by medication_id) into expected from prepmeds_audit.canonical_mapping where group_id=g.group_id;
    for u in select value from jsonb_array_elements(p_payload->'units') loop
      if coalesce(u->>'key','') !~ '^[a-z0-9][a-z0-9-]{2,100}$' or coalesce(u#>>'{scope,route}','')='' or coalesce(u#>>'{scope,regimen}','')='' or jsonb_typeof(u->'medication_ids') is distinct from 'array' or jsonb_array_length(u->'medication_ids')=0 then raise exception 'INVALID_FORMULATION_SCOPE'; end if;
      unit_id:=g.group_id||'::'||(u->>'key');
      insert into prepmeds_audit.review_groups(group_id,parent_group_id,bucket,owner_lane,ingredient_ids,formulation_key) values(unit_id,g.group_id,g.bucket,g.owner_lane,g.ingredient_ids,u->>'key');
      for medication in select jsonb_array_elements_text(u->'medication_ids') loop
        if not coalesce(medication=any(expected),false) or (medication=any(covered) and u#>>'{scope,requires_confirmation}' is distinct from 'true') then raise exception 'FORMULATION_MAPPING_OUTSIDE_PARENT_OR_AMBIGUOUS'; end if;
        covered:=array_append(covered,medication);
        insert into prepmeds_audit.review_unit_members values(unit_id,medication,u->'scope');
      end loop;
      insert into prepmeds_audit.custody_events(group_id,event_type,details) values(unit_id,'FORMULATION_UNIT_PROPOSED',jsonb_build_object('parent',g.group_id,'proposing_run',r.run_id,'scope',u));
    end loop;
    if (select array_agg(distinct x order by x) from unnest(covered) x) is distinct from expected then raise exception 'FORMULATION_SPLIT_LOST_CANONICAL_IDS'; end if;
    update prepmeds_audit.agent_runs set state='SUPERSEDED',finished_at=clock_timestamp(),result_hash=h where run_id=r.run_id;
    update prepmeds_audit.review_groups set is_container=true,state='QUEUED',updated_at=clock_timestamp() where group_id=g.group_id;
    insert into prepmeds_audit.custody_events(group_id,run_id,event_type,details) values(g.group_id,r.run_id,'SPLIT_INTO_REVIEW_UNITS',p_payload->'units');
    return jsonb_build_object('split',true,'parent',g.group_id,'clinical_reviewed',false);
  elsif p_action='submit' then
    if a.agent<>'A' then raise exception 'AGENT_A_REQUIRED'; end if;
    evidence:=p_payload->'evidence';
    if jsonb_typeof(evidence) is distinct from 'object' then raise exception 'EVIDENCE_OBJECT_REQUIRED'; end if;
    errors:=prepmeds_audit.evidence_deficiencies(g.group_id,evidence,p_payload->>'github_commit');
    insert into prepmeds_audit.evidence_revisions(group_id,revision,a_run_id,content_hash,github_commit,payload,mapping_snapshot,deficiencies)
    values(g.group_id,r.revision,r.run_id,prepmeds_audit.hash_json(evidence),p_payload->>'github_commit',evidence,(select jsonb_agg(to_jsonb(m) order by medication_id) from prepmeds_audit.review_unit_members m where group_id=g.group_id),errors) returning * into e;
    outcome:=case when errors='[]' then 'PASS' else 'FAIL' end;
    update prepmeds_audit.agent_runs set state=outcome,evidence_hash=e.content_hash,evidence_commit=e.github_commit,source_citations=coalesce(evidence->'sources','[]'),test_evidence=coalesce(evidence->'tests','[]'),discrepancies=errors,result_hash=h,finished_at=clock_timestamp() where run_id=r.run_id;
    update prepmeds_audit.review_groups set current_revision=r.revision,state=case when outcome='PASS' then 'AWAITING_B' when r.previous_state='DISPUTED' then 'DISPUTED' else 'QUEUED' end,updated_at=clock_timestamp() where group_id=g.group_id returning * into g;
    insert into prepmeds_audit.custody_events(group_id,run_id,event_type,details) values(g.group_id,r.run_id,case when outcome='PASS' then 'AGENT_A_SUBMITTED' else 'AGENT_A_INCOMPLETE' end,jsonb_build_object('revision',r.revision,'hash',e.content_hash,'deficiencies',errors));
    return jsonb_build_object('run_id',r.run_id,'revision',r.revision,'evidence_hash',e.content_hash,'state',g.state,'deficiencies',errors,'clinical_reviewed',false,'patient_facing_authorized',false);
  elsif p_action='verify' then
    if a.agent<>'B' then raise exception 'AGENT_B_REQUIRED'; end if;
    select * into e from prepmeds_audit.evidence_revisions where group_id=g.group_id and evidence_revisions.revision=g.current_revision;
    select * into prior from prepmeds_audit.agent_runs where run_id=e.a_run_id;
    if e.content_hash is distinct from p_payload->>'evidence_hash' or e.revision::text is distinct from p_payload->>'revision' then raise exception 'STALE_EVIDENCE_REVISION'; end if;
    if a.identity_id=(select identity_id from prepmeds_audit.agent_principals where principal_id=prior.principal_id) or r.context_id=prior.context_id then raise exception 'SELF_VERIFICATION_FORBIDDEN'; end if;
    verification:=p_payload->'verification';outcome:=p_payload->>'outcome';
    if outcome is null or outcome not in ('PASS','FAIL') or jsonb_typeof(verification) is distinct from 'object' then raise exception 'INVALID_VERDICT'; end if;
    if outcome='PASS' then
      errors:=prepmeds_audit.evidence_deficiencies(g.group_id,e.payload,e.github_commit);
      if errors<>'[]' or verification->>'context_id' is distinct from r.context_id or verification->>'method' is distinct from 'INDEPENDENT_PRIMARY_DOCUMENT' or verification->>'mapping_adjudicated' is distinct from 'true' or verification->>'tests_passed' is distinct from 'true' or verification->>'test_commit' is distinct from e.github_commit or coalesce(verification->'discrepancies','["MISSING"]')<>'[]' then raise exception 'PASS_REQUIREMENTS_UNMET'; end if;
      if jsonb_typeof(verification->'source_checks') is distinct from 'array' then raise exception 'PRIMARY_SOURCE_CHECKS_REQUIRED'; end if;
      if jsonb_array_length(verification->'source_checks')<>jsonb_array_length(e.payload->'sources') or (select count(distinct x->>'source_id') from jsonb_array_elements(verification->'source_checks') x) <> jsonb_array_length(verification->'source_checks') then raise exception 'DUPLICATE_OR_EXTRA_SOURCE_CHECKS'; end if;
      for s in select value from jsonb_array_elements(e.payload->'sources') loop
        select x into v from jsonb_array_elements(verification->'source_checks') x where x->>'source_id'=s->>'id';
        if not found or v->>'access' is distinct from 'VERIFIED_PRIMARY_PASSAGES' or v->>'document_sha256' is distinct from s->>'document_sha256' or v->>'primary_url' is distinct from s->>'primary_url' then raise exception 'PRIMARY_SOURCE_NOT_VERIFIED'; end if;
        for q in select value from jsonb_array_elements(s->'passages') loop
          if not coalesce((v->'passage_hashes') ? (q->>'sha256'),false) then raise exception 'SOURCE_PASSAGE_NOT_VERIFIED'; end if;
        end loop;
      end loop;
    else
      if jsonb_typeof(verification->'discrepancies') is distinct from 'array' or jsonb_array_length(verification->'discrepancies')=0 then raise exception 'FAIL_REQUIRES_DISCREPANCIES'; end if;
    end if;
    update prepmeds_audit.agent_runs set state=outcome,evidence_hash=e.content_hash,evidence_commit=e.github_commit,scenario_evidence=verification,source_citations=coalesce(verification->'source_checks','[]'),test_evidence=e.payload->'tests',discrepancies=verification->'discrepancies',result_hash=h,finished_at=clock_timestamp() where run_id=r.run_id;
    update prepmeds_audit.review_groups set state=case when outcome='PASS' then 'EVIDENCE_COMPLETE' else 'DISPUTED' end,updated_at=clock_timestamp() where group_id=g.group_id returning * into g;
    insert into prepmeds_audit.custody_events(group_id,run_id,event_type,details) values(g.group_id,r.run_id,'AGENT_B_'||outcome,jsonb_build_object('revision',e.revision,'hash',e.content_hash,'verification',verification,'a_run',e.a_run_id,'b_identity',a.identity_id));
    return jsonb_build_object('state',g.state,'revision',e.revision,'evidence_hash',e.content_hash,'clinical_reviewed',false,'patient_facing_authorized',false);
  end if;
  raise exception 'UNKNOWN_ACTION';
end $$;

-- Administrative invalidation preserves the old evidence and PASS/FAIL history.
create or replace function prepmeds_audit.invalidate_revision(p_group text,p_hash text,p_reason text,p_commit text) returns jsonb
language plpgsql security definer set search_path='' as $$
declare g prepmeds_audit.review_groups; e prepmeds_audit.evidence_revisions; r prepmeds_audit.agent_runs;
begin
  if coalesce(length(p_reason),0)<8 or coalesce(p_commit,'') !~ '^[0-9a-f]{40}$' then raise exception 'INVALID_INVALIDATION'; end if;
  select * into g from prepmeds_audit.review_groups where group_id=p_group for update;
  if not found then raise exception 'UNKNOWN_GROUP'; end if;
  select * into e from prepmeds_audit.evidence_revisions where group_id=g.group_id and revision=g.current_revision;
  if e.content_hash is distinct from p_hash or e.content_hash is null then raise exception 'STALE_INVALIDATION'; end if;
  if exists(select 1 from prepmeds_audit.custody_events where group_id=g.group_id and event_type='EVIDENCE_INVALIDATED' and details->>'evidence_hash'=p_hash and details->>'source_commit'=p_commit) then return jsonb_build_object('replayed',true,'state',g.state); end if;
  select * into r from prepmeds_audit.agent_runs where group_id=g.group_id and state='CLAIMED' for update;
  if found then update prepmeds_audit.agent_runs set state='EXPIRED',finished_at=clock_timestamp() where run_id=r.run_id; end if;
  update prepmeds_audit.review_groups set state='QUEUED',updated_at=clock_timestamp() where group_id=g.group_id;
  insert into prepmeds_audit.custody_events(group_id,event_type,details) values(g.group_id,'EVIDENCE_INVALIDATED',jsonb_build_object('revision',e.revision,'evidence_hash',p_hash,'source_commit',p_commit,'reason',p_reason));
  return jsonb_build_object('state','QUEUED','previous_revision',e.revision);
end $$;
revoke all on function prepmeds_audit.invalidate_revision(text,text,text,text) from public,anon,authenticated,service_role;
drop trigger if exists imports_no_truncate on prepmeds_audit.import_receipts;
create trigger imports_no_truncate before truncate on prepmeds_audit.import_receipts for each statement execute function prepmeds_audit.prevent_custody_changes();
drop trigger if exists runs_no_truncate on prepmeds_audit.agent_runs;
create trigger runs_no_truncate before truncate on prepmeds_audit.agent_runs for each statement execute function prepmeds_audit.prevent_custody_changes();
drop trigger if exists dispatch_immutable on prepmeds_audit.dispatch_requests;
create trigger dispatch_immutable before update or delete on prepmeds_audit.dispatch_requests for each row execute function prepmeds_audit.prevent_custody_changes();
drop trigger if exists dispatch_no_truncate on prepmeds_audit.dispatch_requests;
create trigger dispatch_no_truncate before truncate on prepmeds_audit.dispatch_requests for each statement execute function prepmeds_audit.prevent_custody_changes();

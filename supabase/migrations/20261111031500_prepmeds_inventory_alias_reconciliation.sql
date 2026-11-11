-- Reconcile medication aliases authoritatively on every inventory sync.
-- The recovery API originally appended brand/synonym aliases but never removed stale
-- values when the repository inventory changed. Preserve the original implementation
-- as an internal function and wrap it with exact alias replacement.

alter function prepmeds.ci_sync_inventory(text, text, jsonb)
  rename to _ci_sync_inventory_v1;

revoke all on function prepmeds._ci_sync_inventory_v1(text, text, jsonb)
  from public, anon, authenticated, service_role;

create function prepmeds.ci_sync_inventory(
  p_ci_token text,
  p_commit_sha text,
  p_inventory jsonb
) returns jsonb
language plpgsql
security definer
set search_path = prepmeds, pg_catalog
as $fn$
declare
  v_result jsonb;
  v_ci text;
  v_aliases int;
begin
  v_result := prepmeds._ci_sync_inventory_v1(p_ci_token, p_commit_sha, p_inventory);
  v_ci := prepmeds._ci(p_ci_token);

  perform prepmeds._enter();

  delete from prepmeds.medication_aliases a
  using jsonb_array_elements(p_inventory->'medications') x
  where a.medication_id = x->>'medicationId';

  insert into prepmeds.medication_aliases (medication_id, alias, kind)
  select x->>'medicationId', btrim(v.alias), 'brand'
  from jsonb_array_elements(p_inventory->'medications') x
  cross join lateral jsonb_array_elements_text(
    case
      when jsonb_typeof(x->'brandNames') = 'array' then x->'brandNames'
      else '[]'::jsonb
    end
  ) as v(alias)
  where length(btrim(v.alias)) > 0
  on conflict do nothing;

  insert into prepmeds.medication_aliases (medication_id, alias, kind)
  select x->>'medicationId', btrim(v.alias), 'synonym'
  from jsonb_array_elements(p_inventory->'medications') x
  cross join lateral jsonb_array_elements_text(
    case
      when jsonb_typeof(x->'aliases') = 'array' then x->'aliases'
      else '[]'::jsonb
    end
  ) as v(alias)
  where length(btrim(v.alias)) > 0
  on conflict do nothing;

  select count(*) into v_aliases
  from prepmeds.medication_aliases a
  where a.medication_id in (
    select x->>'medicationId'
    from jsonb_array_elements(p_inventory->'medications') x
  );

  perform prepmeds._event(
    'ci',
    v_ci,
    'inventory_aliases_reconciled',
    null,
    null,
    null,
    jsonb_build_object('aliases', v_aliases, 'commit_sha', p_commit_sha)
  );

  perform prepmeds._exit();

  return v_result || jsonb_build_object(
    'aliases_reconciled', true,
    'aliases_active', v_aliases,
    'gaps', (select count(*) from prepmeds.inventory_gaps)
  );
exception
  when others then
    perform prepmeds._exit();
    raise;
end
$fn$;

revoke all on function prepmeds.ci_sync_inventory(text, text, jsonb)
  from public, anon, authenticated, service_role;
grant execute on function prepmeds.ci_sync_inventory(text, text, jsonb)
  to anon, authenticated;

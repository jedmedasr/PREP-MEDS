create table if not exists prepmeds.owner_dashboard_credentials (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

alter table prepmeds.owner_dashboard_credentials enable row level security;
revoke all on prepmeds.owner_dashboard_credentials from public, anon, authenticated;

revoke execute on function prepmeds.owner_dashboard_snapshot() from public, anon, authenticated;

create or replace function prepmeds.owner_dashboard_snapshot(p_token text)
returns jsonb
language plpgsql
stable
security definer
set search_path = prepmeds, pg_catalog
as $function$
begin
  if p_token is null or not exists (
    select 1
    from prepmeds.owner_dashboard_credentials c
    where c.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  ) then
    raise exception 'PREPMEDS_OWNER_DASHBOARD_UNAUTHORIZED' using errcode = '42501';
  end if;

  return prepmeds.owner_dashboard_snapshot();
end;
$function$;

revoke all on function prepmeds.owner_dashboard_snapshot(text) from public;
grant execute on function prepmeds.owner_dashboard_snapshot(text) to anon, authenticated, service_role;

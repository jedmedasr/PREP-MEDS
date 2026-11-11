-- READ ONLY. Execute against the selected existing project before ANY migration.
-- No clinical/patient rows, credentials or connection strings are selected.
select jsonb_build_object(
  'database',current_database(),'server_version',current_setting('server_version'),
  'observed_at_utc',clock_timestamp(),
  'schemas',(select jsonb_agg(nspname order by nspname) from pg_namespace where nspname !~ '^pg_' and nspname<>'information_schema'),
  'tables',(select coalesce(jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'rls',c.relrowsecurity,'force_rls',c.relforcerowsecurity,'estimated_rows',c.reltuples) order by n.nspname,c.relname),'[]') from pg_class c join pg_namespace n on n.oid=c.relnamespace where c.relkind='r' and n.nspname !~ '^pg_' and n.nspname not in ('information_schema','auth','storage','realtime','vault','extensions')),
  'columns',(select jsonb_agg(jsonb_build_object('schema',table_schema,'table',table_name,'column',column_name,'type',udt_name,'nullable',is_nullable,'default',column_default) order by table_schema,table_name,ordinal_position) from information_schema.columns where table_schema in ('public','prepmeds_audit')),
  'constraints',(select jsonb_agg(jsonb_build_object('schema',n.nspname,'table',c.relname,'name',co.conname,'definition',pg_get_constraintdef(co.oid)) order by n.nspname,c.relname,co.conname) from pg_constraint co join pg_class c on c.oid=co.conrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname in ('public','prepmeds_audit')),
  'indexes',(select jsonb_agg(to_jsonb(i) order by schemaname,tablename,indexname) from pg_indexes i where schemaname in ('public','prepmeds_audit')),
  'policies',(select jsonb_agg(to_jsonb(p) order by schemaname,tablename,policyname) from pg_policies p where schemaname in ('public','prepmeds_audit')),
  'grants',(select jsonb_agg(to_jsonb(g) order by table_schema,table_name,grantee,privilege_type) from information_schema.role_table_grants g where table_schema in ('public','prepmeds_audit'))
) as inspection;

#!/usr/bin/env bash
# Loads the repository's real inventory (436 canonical IDs) and bucket assignments into a THROWAWAY
# local database built from the two migrations, and prints what the database then reports.
# Plain PostgreSQL only. Never point this at the hosted project.
# usage: PGHOST=... PGPORT=... PGUSER=postgres tools/dry_run_real_inventory.sh [dbname]
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DB="${1:-prepmeds_dryrun}"
bash "$HERE/supabase/tests/fresh_db.sh" "$DB"
CI=$(psql -q -d "$DB" -Atc "select prepmeds.admin_create_ci_credential('dry-run')")
psql -q -v ON_ERROR_STOP=1 -d "$DB" -At <<SQL
\set inv \`cat "$HERE/data/inventory_from_manifest_dbf7ccc.json"\`
\set buckets \`cat "$HERE/data/bucket_assignments_dbf7ccc.json"\`
select 'sync:       ' || (prepmeds.ci_sync_inventory('$CI', 'dbf7cccdf58be1fbacfb20d098d8fff8692abe78', :'inv'::jsonb) - 'commit_sha')::text;
select 'assign:     ' || prepmeds.admin_assign_groups(:'buckets'::jsonb)::text;
select 'tasks:      ' || prepmeds.admin_open_initial_tasks()::text || ' initial tasks opened';
select 'replay:     replayed=' || (prepmeds.ci_sync_inventory('$CI', 'dbf7cccdf58be1fbacfb20d098d8fff8692abe78', :'inv'::jsonb)->>'replayed');
select 'gaps:       ' || count(*)::text from prepmeds.inventory_gaps;
select 'lanes:      ' || string_agg(lane || '=' || n || ' groups/' || ids || ' ids/' || combos || ' combination', '  ' order by lane)
  from (select g.lane, count(distinct g.group_id) n, count(m.medication_id) ids, count(distinct g.group_id) filter (where g.kind = 'combination') combos
        from prepmeds.review_groups g join prepmeds.medication_group_map m using (group_id) group by 1) q;
select 'progress:   ' || (prepmeds.get_progress() - 'by_lane' - 'blocked_tasks' - 'generated_at' - 'milestones' - 'canonical_ids_by_milestone')::text;
select 'milestones: ' || (prepmeds.get_progress()->'milestones')::text;
select 'integrity:  ' || prepmeds.verify_integrity()::text;
select 'objects:    tables=' || (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'prepmeds' and c.relkind = 'r')
    || ' functions=' || (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'prepmeds')
    || ' triggers=' || (select count(*) from pg_trigger t join pg_class c on c.oid = t.tgrelid join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'prepmeds' and not t.tgisinternal)
    || ' constraints=' || (select count(*) from pg_constraint con join pg_namespace n on n.oid = con.connamespace where n.nspname = 'prepmeds')
    || ' views=' || (select count(*) from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'prepmeds' and c.relkind = 'v');
SQL
psql -q -d postgres -c "drop database if exists \"$DB\"" >/dev/null

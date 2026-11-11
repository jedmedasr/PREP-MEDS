#!/usr/bin/env bash
# Creates a fresh throwaway database and applies the prelude and both migrations.
# usage: fresh_db.sh <dbname>     (uses PGHOST/PGPORT/PGUSER from the environment)
set -euo pipefail
DB="${1:?database name}"
HERE="$(cd "$(dirname "$0")" && pwd)"
psql -q -d postgres -c "drop database if exists \"$DB\"" -c "create database \"$DB\"" 2>/dev/null
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$HERE/00_plain_postgres_prelude.sql" >/dev/null
for f in "$HERE"/../migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f" >/dev/null; done

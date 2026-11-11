-- Harden helper functions flagged by the Supabase security advisor.
-- These helpers do not need caller-controlled name resolution.

alter function prepmeds._enter()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._exit()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._jwt_sub()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._new_token()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._sha256(text)
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._guard()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._immutable()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._required_source_kind()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._events_chain()
  set search_path = prepmeds, pg_catalog;
alter function prepmeds._event_hash(text, text, text, text, text, bigint, bigint, jsonb, timestamptz)
  set search_path = prepmeds, pg_catalog;


drop trigger if exists a_guard_row on prepmeds.owner_dashboard_credentials;
create trigger a_guard_row
before insert or update or delete on prepmeds.owner_dashboard_credentials
for each row execute function prepmeds._guard();

drop trigger if exists a_guard_truncate on prepmeds.owner_dashboard_credentials;
create trigger a_guard_truncate
before truncate on prepmeds.owner_dashboard_credentials
for each statement execute function prepmeds._guard();

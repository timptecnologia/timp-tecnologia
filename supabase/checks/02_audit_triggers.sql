-- Triggers de imutabilidade do audit_log (inclui TRUNCATE, que information_schema não lista).
select t.tgname, t.tgenabled,
  (t.tgtype & 8) > 0 as on_delete, (t.tgtype & 16) > 0 as on_update, (t.tgtype & 32) > 0 as on_truncate
from pg_trigger t where t.tgrelid = 'public.audit_log'::regclass and not t.tgisinternal order by 1;

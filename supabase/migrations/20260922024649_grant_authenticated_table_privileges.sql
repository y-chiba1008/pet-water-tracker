-- Data API (PostgREST) requires table-level GRANTs in addition to RLS.
-- Without these, authenticated requests fail with 42501 / 403
-- ("permission denied for table ...").
-- Privileges match existing RLS policies (select / insert / update only).

grant select, insert, update on table public.users to authenticated;
grant select, insert, update on table public.bowls to authenticated;
grant select, insert, update on table public.bowl_records to authenticated;
grant select, insert, update on table public.individual_records to authenticated;

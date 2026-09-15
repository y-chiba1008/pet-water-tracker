-- private helpers (not exposed via PostgREST)
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

-- users: app profile linked 1:1 with auth.users
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

-- bowls
create table public.bowls (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  is_active boolean not null default true
);

-- bowl_records: one cycle from fill to next fill
create table public.bowl_records (
  id uuid primary key default gen_random_uuid(),
  bowl_id uuid not null references public.bowls (id),
  start_time timestamptz not null,
  start_amount_ml integer not null,
  start_recorded_by uuid not null references public.users (id),
  end_time timestamptz,
  end_amount_ml integer,
  end_recorded_by uuid references public.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- at most one in-progress cycle per bowl
create unique index bowl_records_active_cycle_idx
  on public.bowl_records (bowl_id)
  where end_time is null;

-- individual_records
create table public.individual_records (
  id uuid primary key default gen_random_uuid(),
  recorded_at timestamptz not null,
  amount_ml integer not null,
  recorded_by uuid not null references public.users (id),
  created_at timestamptz not null default now()
);

-- keep bowl_records.updated_at current on update
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bowl_records_set_updated_at
  before update on public.bowl_records
  for each row
  execute function public.set_updated_at();

-- sync public.users when auth.users is created (trigger only; not callable via API)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- authorization helper (SECURITY DEFINER to avoid RLS recursion; private schema hides RPC)
create or replace function private.is_authorized(uid uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.users where id = uid
  );
$$;

revoke all on function private.is_authorized(uuid) from public;
revoke execute on function private.is_authorized(uuid) from anon;
grant execute on function private.is_authorized(uuid) to authenticated;

-- RLS
alter table public.users enable row level security;
alter table public.bowls enable row level security;
alter table public.bowl_records enable row level security;
alter table public.individual_records enable row level security;

-- users policies
create policy "users_select" on public.users
  for select to authenticated
  using (private.is_authorized((select auth.uid())));

create policy "users_insert" on public.users
  for insert to authenticated
  with check (private.is_authorized((select auth.uid())));

create policy "users_update" on public.users
  for update to authenticated
  using (private.is_authorized((select auth.uid())))
  with check (private.is_authorized((select auth.uid())));

-- bowls policies
create policy "bowls_select" on public.bowls
  for select to authenticated
  using (private.is_authorized((select auth.uid())));

create policy "bowls_insert" on public.bowls
  for insert to authenticated
  with check (private.is_authorized((select auth.uid())));

create policy "bowls_update" on public.bowls
  for update to authenticated
  using (private.is_authorized((select auth.uid())))
  with check (private.is_authorized((select auth.uid())));

-- bowl_records policies
create policy "bowl_records_select" on public.bowl_records
  for select to authenticated
  using (private.is_authorized((select auth.uid())));

create policy "bowl_records_insert" on public.bowl_records
  for insert to authenticated
  with check (private.is_authorized((select auth.uid())));

create policy "bowl_records_update" on public.bowl_records
  for update to authenticated
  using (private.is_authorized((select auth.uid())))
  with check (private.is_authorized((select auth.uid())));

-- individual_records policies
create policy "individual_records_select" on public.individual_records
  for select to authenticated
  using (private.is_authorized((select auth.uid())));

create policy "individual_records_insert" on public.individual_records
  for insert to authenticated
  with check (private.is_authorized((select auth.uid())));

create policy "individual_records_update" on public.individual_records
  for update to authenticated
  using (private.is_authorized((select auth.uid())))
  with check (private.is_authorized((select auth.uid())));

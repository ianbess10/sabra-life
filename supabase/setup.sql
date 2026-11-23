-- Sabra Life — run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Creates profiles + inventory, RLS, grants, and an auth trigger that
-- inserts a profile and inventory row when a user signs up.

create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  shekels integer not null default 200,
  xp integer not null default 0,
  location text not null default 'tel-aviv',
  completed_missions text[] not null default '{}'::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (id)
);

create table if not exists public.inventory (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  vehicle text,
  property text,
  phone text not null default 'basic',
  dining text not null default 'street',
  updated_at timestamptz not null default now(),
  primary key (id),
  unique (user_id)
);

grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

grant select on public.inventory to anon;
grant select, insert, update, delete on public.inventory to authenticated;
grant select, insert, update, delete on public.inventory to service_role;

alter table public.profiles enable row level security;
alter table public.inventory enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists "inventory_select_own" on public.inventory;
create policy "inventory_select_own"
  on public.inventory
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "inventory_insert_own" on public.inventory;
create policy "inventory_insert_own"
  on public.inventory
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "inventory_update_own" on public.inventory;
create policy "inventory_update_own"
  on public.inventory
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.inventory (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

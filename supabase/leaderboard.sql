-- Incremental script for existing projects. New production databases
-- should run supabase/migrations/0001_initial_schema.sql instead.
--
-- Sabra Life leaderboard — run this in the Supabase SQL Editor
-- (Dashboard → SQL → New query) after supabase/setup.sql.
-- Adds profiles.username, rebuilds the signup trigger, then creates
-- public.public_leaderboard and grants SELECT to anon + authenticated.

alter table public.profiles
  add column if not exists username text;

update public.profiles
set username = coalesce(username, 'oleh-' || substr(id::text, 1, 8))
where username is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data->>'username', ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'oleh-' || substr(new.id::text, 1, 8)
    )
  );

  insert into public.inventory (user_id)
  values (new.id);

  return new;
end;
$$;

create or replace view public.public_leaderboard
with (security_invoker = false) as
select id, username, xp, shekels
from public.profiles;

grant select on public.public_leaderboard to authenticated;
grant select on public.public_leaderboard to anon;

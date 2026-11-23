-- Sabra Life daily streak — run this in the Supabase SQL Editor
-- (Dashboard → SQL → New query) after supabase/setup.sql.

alter table public.profiles
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_mission_date date;

-- ============================================================
-- Founder OS · Phase 2 · Seed default habits
-- Prerequisite: the login user must exist in Supabase Auth
-- (Authentication → Users → Add user → laurenz.geissler@proton.me)
-- AND 001_phase2_schema.sql must have been run.
-- Run this in the Supabase SQL Editor (paste + Run).
-- ============================================================

do $$
declare
  uid uuid;
begin
  select id into uid
  from auth.users
  where email = 'laurenz.geissler@proton.me';

  if uid is null then
    raise exception
      'User laurenz.geissler@proton.me not found. Create the user in '
      'Authentication → Users first, then run this script again.';
  end if;

  insert into public.habits (user_id, label, position) values
    (uid, 'Exercise',       1),
    (uid, 'Deep Work',      2),
    (uid, 'Reading',        3),
    (uid, 'Bible Studies',  4),
    (uid, 'Studying',       5)
  on conflict do nothing;

  raise notice 'Seeded % habits for %', 5, uid;
end;
$$;

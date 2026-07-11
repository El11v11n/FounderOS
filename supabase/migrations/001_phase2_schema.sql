-- ============================================================
-- Founder OS · Phase 2 · Initial schema
-- Run this in the Supabase SQL Editor (paste + Run).
-- Prerequisite: none. Safe to run once on a fresh project.
-- ============================================================

-- updated_at bookkeeping ------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- tasks ------------------------------------------------------------------

create table public.tasks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  details     text,
  venture     text,                    -- 'cafe' | 'hotel' | 'holding' | 'personal' | null
  due_date    date,
  done        boolean not null default false,
  done_at     timestamptz,
  source      text not null default 'manual',   -- 'manual' | 'capture' | 'telegram'
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ideas (BRAIN) -----------------------------------------------------------

create table public.ideas (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  details     text,
  tags        text[] not null default '{}',
  venture     text,
  status      text not null default 'inbox',    -- 'inbox' | 'active' | 'archived'
  source      text not null default 'manual',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- events (CALENDAR) --------------------------------------------------------

create table public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  details     text,
  event_date  date not null,
  event_time  time,
  category    text not null default 'BUSINESS', -- 'BUSINESS' | 'CAFÉ' | 'HOTEL' | 'PRIVATE'
  source      text not null default 'manual',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- contacts (CRM) ------------------------------------------------------------

create table public.contacts (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name              text not null,
  company           text,
  role              text,
  email             text,
  phone             text,
  tags              text[] not null default '{}',
  venture           text,
  notes             text,
  last_contacted_at date,
  follow_up_days    integer,          -- follow-up cadence; null = no cadence
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- habits + daily checks ------------------------------------------------------

create table public.habits (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  label       text not null,
  position    integer not null default 0,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.habit_checks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  habit_id    uuid not null references public.habits (id) on delete cascade,
  check_date  date not null default current_date,
  created_at  timestamptz not null default now(),
  unique (habit_id, check_date)
);

-- goals -----------------------------------------------------------------------

create table public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null,
  scope       text not null default 'WEEK',     -- 'WEEK' | 'MONTH' | 'QUARTER'
  progress    numeric not null default 0 check (progress >= 0 and progress <= 1),
  done        boolean not null default false,
  target_date date,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- journal ------------------------------------------------------------------------

create table public.journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_date  date not null default current_date,
  content     text not null,
  source      text not null default 'manual',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- transactions (provider-agnostic: manual now, Revolut CSV / GoCardless later) ----

create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  booked_at    date not null,
  amount       numeric(12,2) not null,          -- negative = expense, positive = income
  currency     text not null default 'EUR',
  description  text,
  counterparty text,
  category     text,
  venture      text,
  source       text not null default 'manual',  -- 'manual' | 'capture' | 'telegram' | 'revolut_csv' | 'gocardless'
  external_id  text,                            -- provider id for dedupe on import
  raw          jsonb,                           -- untouched provider payload
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- dedupe guard for imports: same provider row never lands twice
create unique index transactions_external_dedupe
  on public.transactions (user_id, source, external_id)
  where external_id is not null;

-- captures (audit trail + unsorted inbox for the classification pipeline) --------

create table public.captures (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  raw_text     text not null,
  source       text not null default 'app',     -- 'app' | 'telegram'
  classified   jsonb,                           -- full model output
  confidence   numeric,
  status       text not null default 'unsorted',-- 'unsorted' | 'filed' | 'undone'
  target_table text,                            -- where the item was filed
  target_id    uuid,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- updated_at triggers --------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array['tasks','ideas','events','contacts','habits','goals',
                           'journal_entries','transactions','captures']
  loop
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t);
  end loop;
end;
$$;

-- Row Level Security: every table, owner-only ---------------------------------------

do $$
declare t text;
begin
  foreach t in array array['tasks','ideas','events','contacts','habits','habit_checks',
                           'goals','journal_entries','transactions','captures']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I
         for all to authenticated
         using (user_id = auth.uid())
         with check (user_id = auth.uid())',
      t || '_owner_only', t);
  end loop;
end;
$$;

-- helpful indexes ---------------------------------------------------------------------

create index tasks_open_idx        on public.tasks (user_id, done, due_date);
create index ideas_status_idx      on public.ideas (user_id, status);
create index events_date_idx       on public.events (user_id, event_date);
create index contacts_name_idx     on public.contacts (user_id, name);
create index habit_checks_date_idx on public.habit_checks (user_id, check_date);
create index journal_date_idx      on public.journal_entries (user_id, entry_date);
create index transactions_date_idx on public.transactions (user_id, booked_at);
create index captures_status_idx   on public.captures (user_id, status);

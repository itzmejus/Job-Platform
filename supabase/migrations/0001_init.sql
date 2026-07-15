-- Germany Job Discovery Dashboard — initial schema
-- Tables, constraints, and indexes. RLS policies live in 0002_rls_policies.sql.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per Supabase auth user
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------------
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  website text,
  location text,
  industry text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- jobs
-- ---------------------------------------------------------------------------
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  location text,
  country text not null default 'Germany',
  work_mode text check (work_mode in ('remote', 'hybrid', 'onsite')),
  salary_min integer,
  salary_max integer,
  salary_currency text,
  employment_type text check (
    employment_type in ('full_time', 'part_time', 'contract', 'temporary', 'internship', 'other')
  ),
  experience_level text check (
    experience_level in ('entry', 'junior', 'mid', 'senior', 'lead', 'principal', 'unknown')
  ),
  job_url text not null,
  date_posted timestamptz,
  date_collected timestamptz not null default now(),
  source text not null,
  sources text[] not null default '{}',
  description text,
  skills text[] not null default '{}',
  language text,
  visa_sponsorship boolean,
  fingerprint text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_jobs_date_posted on public.jobs (date_posted desc);
create index idx_jobs_date_collected on public.jobs (date_collected desc, id);
create index idx_jobs_location on public.jobs (location);
create index idx_jobs_work_mode on public.jobs (work_mode);
create index idx_jobs_company_id on public.jobs (company_id);
create index idx_jobs_source on public.jobs (source);

-- ---------------------------------------------------------------------------
-- saved_jobs
-- ---------------------------------------------------------------------------
create table public.saved_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  status text not null default 'saved' check (status in ('saved', 'archived', 'hidden')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index idx_saved_jobs_user on public.saved_jobs (user_id);

-- ---------------------------------------------------------------------------
-- applied_jobs
-- ---------------------------------------------------------------------------
create table public.applied_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  applied_date date not null default current_date,
  status text not null default 'waiting' check (status in ('waiting', 'interview', 'rejected', 'offer')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create index idx_applied_jobs_user on public.applied_jobs (user_id);

-- ---------------------------------------------------------------------------
-- sync_logs
-- ---------------------------------------------------------------------------
create table public.sync_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  jobs_found integer not null default 0,
  jobs_inserted integer not null default 0,
  jobs_skipped integer not null default 0,
  errors text[] not null default '{}'
);

create index idx_sync_logs_source_started on public.sync_logs (source, started_at desc);

-- ---------------------------------------------------------------------------
-- job_sources
-- ---------------------------------------------------------------------------
create table public.job_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null,
  enabled boolean not null default true,
  config jsonb not null default '{}',
  last_synced_at timestamptz
);

-- ---------------------------------------------------------------------------
-- filter_config: single-row table holding the configurable keyword lists
-- ---------------------------------------------------------------------------
create table public.filter_config (
  id uuid primary key default gen_random_uuid(),
  include_keywords text[] not null default '{}',
  exclude_title_keywords text[] not null default '{}',
  allowed_countries text[] not null default '{}',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

create trigger trg_saved_jobs_updated_at
  before update on public.saved_jobs
  for each row execute function public.set_updated_at();

create trigger trg_applied_jobs_updated_at
  before update on public.applied_jobs
  for each row execute function public.set_updated_at();

create trigger trg_filter_config_updated_at
  before update on public.filter_config
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- profile auto-creation on signup
-- ---------------------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- seed the default filter configuration used by the sync engine
-- ---------------------------------------------------------------------------
insert into public.filter_config (include_keywords, exclude_title_keywords, allowed_countries)
values (
  array[
    'react', 'next.js', 'nextjs', 'frontend', 'frontend engineer', 'frontend developer',
    'full stack', 'fullstack', 'software engineer', 'typescript', 'javascript', 'node.js', 'nodejs'
  ],
  array['intern', 'internship', 'praktikum', 'praktikant', 'werkstudent'],
  array['Germany']
);

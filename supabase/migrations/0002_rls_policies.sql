-- Row Level Security policies.
-- Convention: the anon/authenticated client role only ever reads jobs/companies/
-- sync metadata; all writes to those tables happen through the service-role
-- key (cron/orchestrator/admin routes), which bypasses RLS entirely. User-owned
-- tables (saved_jobs, applied_jobs, profiles) get full CRUD scoped to auth.uid().

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.saved_jobs enable row level security;
alter table public.applied_jobs enable row level security;
alter table public.sync_logs enable row level security;
alter table public.job_sources enable row level security;
alter table public.filter_config enable row level security;

-- profiles: a user can read and update only their own row
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- companies: readable by any authenticated user, writes are service-role only
create policy "companies_select_authenticated"
  on public.companies for select
  to authenticated
  using (true);

-- jobs: readable by any authenticated user, writes are service-role only
create policy "jobs_select_authenticated"
  on public.jobs for select
  to authenticated
  using (true);

-- saved_jobs: full CRUD, scoped to the owning user
create policy "saved_jobs_select_own"
  on public.saved_jobs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "saved_jobs_insert_own"
  on public.saved_jobs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "saved_jobs_update_own"
  on public.saved_jobs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "saved_jobs_delete_own"
  on public.saved_jobs for delete
  to authenticated
  using (auth.uid() = user_id);

-- applied_jobs: full CRUD, scoped to the owning user
create policy "applied_jobs_select_own"
  on public.applied_jobs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "applied_jobs_insert_own"
  on public.applied_jobs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "applied_jobs_update_own"
  on public.applied_jobs for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "applied_jobs_delete_own"
  on public.applied_jobs for delete
  to authenticated
  using (auth.uid() = user_id);

-- sync_logs / job_sources / filter_config: read-only for the admin UI,
-- writes are service-role only (cron + admin API routes)
create policy "sync_logs_select_authenticated"
  on public.sync_logs for select
  to authenticated
  using (true);

create policy "job_sources_select_authenticated"
  on public.job_sources for select
  to authenticated
  using (true);

create policy "filter_config_select_authenticated"
  on public.filter_config for select
  to authenticated
  using (true);

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Job } from "@/types/domain";
import type { JobListSearchParams } from "@/lib/validation/schemas";
import { mapJobRow } from "./mappers";

type DbClient = SupabaseClient<Database>;

export const JOBS_PAGE_SIZE = 25;

export interface JobListResult {
  jobs: Job[];
  totalCount: number;
  page: number;
  pageSize: number;
}

/**
 * Server-side paginated/filtered/sorted job list backing app/(dashboard)/jobs.
 * Search only matches title+description — PostgREST's .or() can't filter
 * across an embedded resource's columns (verified: `companies.name.ilike...`
 * inside .or() fails to parse), so company-name search isn't included.
 * Sorting is limited to columns that live directly on `jobs` for the same
 * reason: ordering by an embedded resource's column controls the embed's
 * internal order, not the parent row order.
 */
export async function listJobs(
  supabase: DbClient,
  filters: JobListSearchParams
): Promise<JobListResult> {
  const from = (filters.page - 1) * JOBS_PAGE_SIZE;
  const to = from + JOBS_PAGE_SIZE - 1;

  let query = supabase
    .from("jobs")
    .select("*, companies(id, name, logo_url, website, location, industry, created_at)", {
      count: "exact",
    });

  if (filters.q) {
    const term = `%${filters.q}%`;
    query = query.or(`title.ilike.${term},description.ilike.${term}`);
  }

  if (filters.location) {
    query = query.ilike("location", `%${filters.location}%`);
  }

  if (filters.workMode) {
    query = query.eq("work_mode", filters.workMode);
  }

  if (filters.salaryMin !== undefined) {
    query = query.or(`salary_max.gte.${filters.salaryMin},salary_min.gte.${filters.salaryMin}`);
  }

  if (filters.salaryMax !== undefined) {
    query = query.lte("salary_min", filters.salaryMax);
  }

  if (filters.visa) {
    query = query.eq("visa_sponsorship", filters.visa === "yes");
  }

  if (filters.level) {
    query = query.eq("experience_level", filters.level);
  }

  if (filters.source) {
    query = query.contains("sources", [filters.source]);
  }

  if (filters.posted) {
    query = query.gte("date_posted", postedCutoff(filters.posted));
  }

  query = query
    .order(filters.sortBy, { ascending: filters.sortDir === "asc", nullsFirst: false })
    .range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    jobs: (data ?? []).map(mapJobRow),
    totalCount: count ?? 0,
    page: filters.page,
    pageSize: JOBS_PAGE_SIZE,
  };
}

/** Distinct source names for the filter dropdown — from job_sources, not a live scan of jobs. */
export async function listSourceNames(supabase: DbClient): Promise<string[]> {
  const { data, error } = await supabase.from("job_sources").select("name").order("name");
  if (error) throw error;
  return (data ?? []).map((row) => row.name);
}

export async function getJobById(supabase: DbClient, id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, companies(id, name, logo_url, website, location, industry, created_at)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapJobRow(data) : null;
}

function postedCutoff(window: "24h" | "7d" | "30d"): string {
  const hoursByWindow: Record<typeof window, number> = { "24h": 24, "7d": 24 * 7, "30d": 24 * 30 };
  return new Date(Date.now() - hoursByWindow[window] * 60 * 60 * 1000).toISOString();
}

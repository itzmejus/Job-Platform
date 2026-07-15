import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { StatCounts } from "@/types/domain";

type DbClient = SupabaseClient<Database>;

/**
 * "Favorite Companies" has no dedicated table/flag in the schema — it's
 * derived here as the distinct companies behind the user's currently-saved
 * jobs, which needs no schema change. Revisit if true company-level
 * favoriting is wanted later.
 */
export async function getStatCounts(supabase: DbClient, userId: string): Promise<StatCounts> {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [newToday, thisWeek, saved, applied, savedWithCompany] = await Promise.all([
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .gte("date_collected", startOfToday.toISOString()),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .gte("date_collected", sevenDaysAgo.toISOString()),
    supabase
      .from("saved_jobs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "saved"),
    supabase.from("applied_jobs").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("saved_jobs")
      .select("jobs(company_id)")
      .eq("user_id", userId)
      .eq("status", "saved"),
  ]);

  for (const result of [newToday, thisWeek, saved, applied, savedWithCompany]) {
    if (result.error) throw result.error;
  }

  const favoriteCompanies = new Set(
    (savedWithCompany.data ?? [])
      .map((row) => row.jobs?.company_id)
      .filter((id): id is string => Boolean(id))
  ).size;

  return {
    newJobsToday: newToday.count ?? 0,
    jobsThisWeek: thisWeek.count ?? 0,
    savedJobs: saved.count ?? 0,
    appliedJobs: applied.count ?? 0,
    favoriteCompanies,
  };
}

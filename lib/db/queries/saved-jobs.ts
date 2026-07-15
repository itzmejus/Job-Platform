import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { SavedJob, SavedJobStatus } from "@/types/domain";
import { mapJobRow } from "./mappers";

type DbClient = SupabaseClient<Database>;
type SavedJobRow = Database["public"]["Tables"]["saved_jobs"]["Row"];
type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export async function getSavedJob(
  supabase: DbClient,
  userId: string,
  jobId: string
): Promise<SavedJob | null> {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSavedJobRow(data) : null;
}

export async function listSavedJobs(
  supabase: DbClient,
  userId: string,
  status: SavedJobStatus
): Promise<SavedJob[]> {
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, jobs(*, companies(id, name, logo_url, website, location, industry, created_at))")
    .eq("user_id", userId)
    .eq("status", status)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapSavedJobRow);
}

function mapSavedJobRow(
  row: SavedJobRow & { jobs?: (JobRow & { companies: CompanyRow | null }) | null }
): SavedJob {
  const { jobs, ...savedJob } = row;
  return {
    id: savedJob.id,
    userId: savedJob.user_id,
    jobId: savedJob.job_id,
    job: jobs ? mapJobRow(jobs) : undefined,
    status: savedJob.status,
    notes: savedJob.notes,
    createdAt: savedJob.created_at,
    updatedAt: savedJob.updated_at,
  };
}

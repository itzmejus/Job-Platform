import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AppliedJob } from "@/types/domain";
import { mapJobRow } from "./mappers";

type DbClient = SupabaseClient<Database>;
type AppliedJobRow = Database["public"]["Tables"]["applied_jobs"]["Row"];
type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export async function getAppliedJob(
  supabase: DbClient,
  userId: string,
  jobId: string
): Promise<AppliedJob | null> {
  const { data, error } = await supabase
    .from("applied_jobs")
    .select("*")
    .eq("user_id", userId)
    .eq("job_id", jobId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapAppliedJobRow(data) : null;
}

export async function listAppliedJobs(supabase: DbClient, userId: string): Promise<AppliedJob[]> {
  const { data, error } = await supabase
    .from("applied_jobs")
    .select("*, jobs(*, companies(id, name, logo_url, website, location, industry, created_at))")
    .eq("user_id", userId)
    .order("applied_date", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapAppliedJobRow);
}

function mapAppliedJobRow(
  row: AppliedJobRow & { jobs?: (JobRow & { companies: CompanyRow | null }) | null }
): AppliedJob {
  const { jobs, ...appliedJob } = row;
  return {
    id: appliedJob.id,
    userId: appliedJob.user_id,
    jobId: appliedJob.job_id,
    job: jobs ? mapJobRow(jobs) : undefined,
    appliedDate: appliedJob.applied_date,
    status: appliedJob.status,
    notes: appliedJob.notes,
    createdAt: appliedJob.created_at,
    updatedAt: appliedJob.updated_at,
  };
}

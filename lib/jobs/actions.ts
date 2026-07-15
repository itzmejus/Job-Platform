"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/server";
import type { SavedJobStatus, AppliedJobStatus } from "@/types/domain";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function revalidateJobViews(jobId: string) {
  revalidatePath("/");
  revalidatePath("/jobs");
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/saved");
  revalidatePath("/applied");
}

export async function setSavedStatus(jobId: string, status: SavedJobStatus) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("saved_jobs")
    .upsert({ user_id: userId, job_id: jobId, status }, { onConflict: "user_id,job_id" });
  if (error) throw error;
  revalidateJobViews(jobId);
}

export async function removeSavedJob(jobId: string) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw error;
  revalidateJobViews(jobId);
}

export async function updateSavedNotes(jobId: string, formData: FormData) {
  const { supabase, userId } = await requireUser();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const { error } = await supabase
    .from("saved_jobs")
    .update({ notes })
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw error;
  revalidateJobViews(jobId);
}

export async function markAsApplied(jobId: string) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase.from("applied_jobs").insert({
    user_id: userId,
    job_id: jobId,
    status: "waiting",
    applied_date: new Date().toISOString().slice(0, 10),
  });
  if (error) throw error;
  revalidateJobViews(jobId);
}

export async function updateAppliedStatus(jobId: string, status: AppliedJobStatus) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("applied_jobs")
    .update({ status })
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw error;
  revalidateJobViews(jobId);
}

export async function updateAppliedNotes(jobId: string, formData: FormData) {
  const { supabase, userId } = await requireUser();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const { error } = await supabase
    .from("applied_jobs")
    .update({ notes })
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw error;
  revalidateJobViews(jobId);
}

export async function removeAppliedJob(jobId: string) {
  const { supabase, userId } = await requireUser();
  const { error } = await supabase
    .from("applied_jobs")
    .delete()
    .eq("user_id", userId)
    .eq("job_id", jobId);
  if (error) throw error;
  revalidateJobViews(jobId);
}

import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/db/admin";
import { jobSourceRegistry } from "@/lib/sources/registry";
import type { RawJob } from "@/lib/sources/types";
import type { Database } from "@/types/database";
import { loadFilterConfig } from "./config";
import { passesFilters } from "./filters";
import { normalizeJob } from "./normalize";
import { computeFingerprint } from "./fingerprint";

type AdminClient = SupabaseClient<Database>;

export interface SourceSyncSummary {
  source: string;
  jobsFound: number;
  jobsInserted: number;
  jobsSkipped: number;
  errors: string[];
}

/**
 * Runs every enabled source sequentially (polite to free-tier rate limits),
 * filters + normalizes + dedupes each result, and writes one sync_logs row
 * per source. One source throwing is caught here and logged — the rest of
 * the sources still run.
 */
export async function runSync(): Promise<SourceSyncSummary[]> {
  const supabase = createAdminClient();
  const filterConfig = await loadFilterConfig();
  const summaries: SourceSyncSummary[] = [];

  for (const source of jobSourceRegistry) {
    const startedAt = new Date().toISOString();
    let jobsFound = 0;
    let jobsInserted = 0;
    let jobsSkipped = 0;
    const errors: string[] = [];

    try {
      const result = await source.fetchJobs();
      jobsFound = result.jobs.length;
      errors.push(...result.errors);

      for (const rawJob of result.jobs) {
        try {
          if (!passesFilters(rawJob, filterConfig)) {
            jobsSkipped++;
            continue;
          }

          const inserted = await ingestJob(supabase, rawJob, source.name);
          if (inserted) jobsInserted++;
          else jobsSkipped++;
        } catch (err) {
          jobsSkipped++;
          errors.push(describeError(err));
        }
      }
    } catch (err) {
      errors.push(describeError(err));
    }

    const finishedAt = new Date().toISOString();

    await supabase.from("sync_logs").insert({
      source: source.name,
      started_at: startedAt,
      finished_at: finishedAt,
      jobs_found: jobsFound,
      jobs_inserted: jobsInserted,
      jobs_skipped: jobsSkipped,
      errors,
    });

    await supabase
      .from("job_sources")
      .upsert(
        { name: source.name, type: "api", enabled: source.enabled, last_synced_at: finishedAt },
        { onConflict: "name" }
      );

    summaries.push({ source: source.name, jobsFound, jobsInserted, jobsSkipped, errors });
  }

  return summaries;
}

/** Returns true if a new job row was inserted, false if an existing one was updated. */
async function ingestJob(supabase: AdminClient, rawJob: RawJob, sourceName: string): Promise<boolean> {
  const companyId = await resolveCompany(supabase, rawJob);
  const fingerprint = computeFingerprint(rawJob.companyName, rawJob.title, rawJob.location, rawJob.url);

  const { data: existing, error: lookupError } = await supabase
    .from("jobs")
    .select("id, sources")
    .eq("fingerprint", fingerprint)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    if (!existing.sources.includes(sourceName)) {
      const { error: updateError } = await supabase
        .from("jobs")
        .update({ sources: [...existing.sources, sourceName] })
        .eq("id", existing.id);
      if (updateError) throw updateError;
    }
    return false;
  }

  const { error: insertError } = await supabase.from("jobs").insert({
    ...normalizeJob(rawJob),
    company_id: companyId,
    source: sourceName,
    sources: [sourceName],
    fingerprint,
  });
  if (insertError) throw insertError;

  return true;
}

/** Finds or creates the company by name; patches in a logo/website only if currently missing. */
async function resolveCompany(supabase: AdminClient, rawJob: RawJob): Promise<string> {
  const { data: existing, error: lookupError } = await supabase
    .from("companies")
    .select("id, logo_url, website")
    .eq("name", rawJob.companyName)
    .maybeSingle();
  if (lookupError) throw lookupError;

  if (existing) {
    const patch: Database["public"]["Tables"]["companies"]["Update"] = {};
    if (!existing.logo_url && rawJob.companyLogoUrl) patch.logo_url = rawJob.companyLogoUrl;
    if (!existing.website && rawJob.companyWebsite) patch.website = rawJob.companyWebsite;

    if (Object.keys(patch).length > 0) {
      const { error: updateError } = await supabase.from("companies").update(patch).eq("id", existing.id);
      if (updateError) throw updateError;
    }

    return existing.id;
  }

  const { data: created, error: insertError } = await supabase
    .from("companies")
    .insert({
      name: rawJob.companyName,
      logo_url: rawJob.companyLogoUrl ?? null,
      website: rawJob.companyWebsite ?? null,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;

  return created.id;
}

function describeError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

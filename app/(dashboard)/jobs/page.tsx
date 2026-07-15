import { Briefcase } from "lucide-react";
import { createClient } from "@/lib/db/server";
import { listJobs, listSourceNames } from "@/lib/db/queries/jobs";
import { jobListSearchParamsSchema } from "@/lib/validation/schemas";
import { JobFilters } from "@/components/jobs/job-filters";
import { JobTable } from "@/components/jobs/job-table";
import { EmptyState } from "@/components/shared/empty-state";

interface JobsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const rawParams = await searchParams;
  const filters = jobListSearchParamsSchema.parse(flattenSearchParams(rawParams));

  const supabase = await createClient();
  const [{ jobs, totalCount, page, pageSize }, sourceNames] = await Promise.all([
    listJobs(supabase, filters),
    listSourceNames(supabase),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          {totalCount.toLocaleString()} job{totalCount === 1 ? "" : "s"} matching your filters.
        </p>
      </div>

      <JobFilters filters={filters} sourceNames={sourceNames} />

      {jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs match these filters"
          description="Try widening your search or clearing a filter."
        />
      ) : (
        <JobTable jobs={jobs} filters={filters} totalCount={totalCount} page={page} pageSize={pageSize} />
      )}
    </div>
  );
}

/** Empty-string values (a cleared form field) are normalized to "unset" rather than failing Zod validation. */
function flattenSearchParams(
  params: Record<string, string | string[] | undefined>
): Record<string, string | undefined> {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    flat[key] = single === "" ? undefined : single;
  }
  return flat;
}

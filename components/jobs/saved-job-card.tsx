import Link from "next/link";
import { CompanyLogo } from "./company-logo";
import { SavedStatusButtons } from "./saved-status-buttons";
import { Badge } from "@/components/ui/badge";
import type { SavedJob } from "@/types/domain";

export function SavedJobCard({ savedJob }: { savedJob: SavedJob }) {
  const job = savedJob.job;
  if (!job) return null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <CompanyLogo name={job.company?.name ?? "Unknown"} logoUrl={job.company?.logoUrl} />
        <div className="min-w-0">
          <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">
            {job.title}
          </Link>
          <p className="truncate text-sm text-muted-foreground">
            {job.company?.name ?? "Unknown"}
            {job.location ? ` · ${job.location}` : ""}
          </p>
          {savedJob.notes && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground italic">
              &ldquo;{savedJob.notes}&rdquo;
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {job.workMode && (
          <Badge variant={job.workMode === "remote" ? "default" : "secondary"} className="capitalize">
            {job.workMode}
          </Badge>
        )}
        <SavedStatusButtons jobId={job.id} currentStatus={savedJob.status} showRemove />
      </div>
    </div>
  );
}

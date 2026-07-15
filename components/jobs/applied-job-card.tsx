import Link from "next/link";
import { CompanyLogo } from "./company-logo";
import { AppliedStatusButtons } from "./applied-status-buttons";
import type { AppliedJob } from "@/types/domain";

export function AppliedJobCard({ appliedJob }: { appliedJob: AppliedJob }) {
  const job = appliedJob.job;
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
            {job.company?.name ?? "Unknown"} · Applied{" "}
            {new Date(appliedJob.appliedDate).toLocaleDateString()}
          </p>
          {appliedJob.notes && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground italic">
              &ldquo;{appliedJob.notes}&rdquo;
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0">
        <AppliedStatusButtons jobId={job.id} currentStatus={appliedJob.status} showRemove />
      </div>
    </div>
  );
}

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { createClient } from "@/lib/db/server";
import { listSavedJobs } from "@/lib/db/queries/saved-jobs";
import { SavedJobCard } from "@/components/jobs/saved-job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";
import type { SavedJobStatus } from "@/types/domain";

const TABS: Array<{ value: SavedJobStatus; label: string }> = [
  { value: "saved", label: "Saved" },
  { value: "archived", label: "Archived" },
  { value: "hidden", label: "Hidden" },
];

interface SavedPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function SavedPage({ searchParams }: SavedPageProps) {
  const { status: rawStatus } = await searchParams;
  const status: SavedJobStatus = TABS.some((tab) => tab.value === rawStatus)
    ? (rawStatus as SavedJobStatus)
    : "saved";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const savedJobs = await listSavedJobs(supabase, user!.id, status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved Jobs</h1>
        <p className="text-muted-foreground">Jobs you&apos;ve saved, archived, or hidden.</p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/saved?status=${tab.value}`}
            className={cn(
              "border-b-2 px-3 py-2 text-sm transition-colors",
              status === tab.value
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {savedJobs.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title={`No ${status} jobs`}
          description="Jobs you save from the job table or details page will show up here."
        />
      ) : (
        <div className="space-y-3">
          {savedJobs.map((savedJob) => (
            <SavedJobCard key={savedJob.id} savedJob={savedJob} />
          ))}
        </div>
      )}
    </div>
  );
}

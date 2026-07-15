import { Send } from "lucide-react";
import { createClient } from "@/lib/db/server";
import { listAppliedJobs } from "@/lib/db/queries/applied-jobs";
import { AppliedJobCard } from "@/components/jobs/applied-job-card";
import { EmptyState } from "@/components/shared/empty-state";

export default async function AppliedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appliedJobs = await listAppliedJobs(supabase, user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Applied Jobs</h1>
        <p className="text-muted-foreground">Track where each application stands.</p>
      </div>

      {appliedJobs.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No applications yet"
          description="Mark a job as applied from its details page to start tracking it here."
        />
      ) : (
        <div className="space-y-3">
          {appliedJobs.map((appliedJob) => (
            <AppliedJobCard key={appliedJob.id} appliedJob={appliedJob} />
          ))}
        </div>
      )}
    </div>
  );
}

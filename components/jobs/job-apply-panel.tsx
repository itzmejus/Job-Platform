import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { markAsApplied, updateAppliedNotes } from "@/lib/jobs/actions";
import { AppliedStatusButtons } from "./applied-status-buttons";
import type { AppliedJob } from "@/types/domain";

export function JobApplyPanel({
  jobId,
  appliedJob,
}: {
  jobId: string;
  appliedJob: AppliedJob | null;
}) {
  if (!appliedJob) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-medium">Application</p>
        <p className="mt-1 text-sm text-muted-foreground">Not applied yet.</p>
        <form action={markAsApplied.bind(null, jobId)} className="mt-3">
          <Button type="submit" size="sm">
            Mark as applied
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <p className="text-sm font-medium">Application</p>

      <p className="text-sm text-muted-foreground">
        Applied {new Date(appliedJob.appliedDate).toLocaleDateString()}
      </p>

      <AppliedStatusButtons jobId={jobId} currentStatus={appliedJob.status} showRemove />

      <form action={updateAppliedNotes.bind(null, jobId)} className="space-y-2">
        <Label htmlFor="applied-notes">Notes</Label>
        <Textarea
          id="applied-notes"
          name="notes"
          defaultValue={appliedJob.notes ?? ""}
          placeholder="Interview notes, contacts, follow-ups..."
          rows={3}
        />
        <Button type="submit" size="sm" variant="outline">
          Save notes
        </Button>
      </form>
    </div>
  );
}

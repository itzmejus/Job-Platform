import { Button } from "@/components/ui/button";
import { updateAppliedStatus, removeAppliedJob } from "@/lib/jobs/actions";
import type { AppliedJobStatus } from "@/types/domain";

const STATUS_OPTIONS: Array<{ value: AppliedJobStatus; label: string }> = [
  { value: "waiting", label: "Waiting" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
  { value: "offer", label: "Offer" },
];

export function AppliedStatusButtons({
  jobId,
  currentStatus,
  showRemove = false,
}: {
  jobId: string;
  currentStatus: AppliedJobStatus;
  showRemove?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {STATUS_OPTIONS.map((option) => (
        <form key={option.value} action={updateAppliedStatus.bind(null, jobId, option.value)}>
          <Button
            type="submit"
            size="sm"
            variant={currentStatus === option.value ? "default" : "outline"}
          >
            {option.label}
          </Button>
        </form>
      ))}
      {showRemove && (
        <form action={removeAppliedJob.bind(null, jobId)}>
          <Button type="submit" variant="ghost" size="sm">
            Remove
          </Button>
        </form>
      )}
    </div>
  );
}

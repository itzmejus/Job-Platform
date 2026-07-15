import type { LucideIcon } from "lucide-react";
import { Bookmark, Archive, EyeOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setSavedStatus, removeSavedJob } from "@/lib/jobs/actions";
import type { SavedJobStatus } from "@/types/domain";

export function SavedStatusButtons({
  jobId,
  currentStatus,
  showRemove = false,
}: {
  jobId: string;
  currentStatus?: SavedJobStatus;
  showRemove?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusButton
        jobId={jobId}
        status="saved"
        active={currentStatus === "saved"}
        icon={Bookmark}
        label="Save"
      />
      <StatusButton
        jobId={jobId}
        status="archived"
        active={currentStatus === "archived"}
        icon={Archive}
        label="Archive"
      />
      <StatusButton
        jobId={jobId}
        status="hidden"
        active={currentStatus === "hidden"}
        icon={EyeOff}
        label="Hide"
      />
      {showRemove && currentStatus && (
        <form action={removeSavedJob.bind(null, jobId)}>
          <Button type="submit" variant="ghost" size="sm">
            <X className="size-3.5" /> Remove
          </Button>
        </form>
      )}
    </div>
  );
}

function StatusButton({
  jobId,
  status,
  active,
  icon: Icon,
  label,
}: {
  jobId: string;
  status: SavedJobStatus;
  active: boolean;
  icon: LucideIcon;
  label: string;
}) {
  return (
    <form action={setSavedStatus.bind(null, jobId, status)}>
      <Button type="submit" size="sm" variant={active ? "default" : "outline"}>
        <Icon className="size-3.5" /> {label}
      </Button>
    </form>
  );
}

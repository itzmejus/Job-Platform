import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { updateSavedNotes } from "@/lib/jobs/actions";
import { SavedStatusButtons } from "./saved-status-buttons";
import type { SavedJob } from "@/types/domain";

export function JobSavePanel({ jobId, savedJob }: { jobId: string; savedJob: SavedJob | null }) {
  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div>
        <p className="text-sm font-medium">Save for review</p>
        <div className="mt-2">
          <SavedStatusButtons jobId={jobId} currentStatus={savedJob?.status} showRemove />
        </div>
      </div>

      <form action={updateSavedNotes.bind(null, jobId)} className="space-y-2">
        <Label htmlFor="saved-notes">Notes</Label>
        <Textarea
          id="saved-notes"
          name="notes"
          defaultValue={savedJob?.notes ?? ""}
          placeholder="Why did you save this one?"
          rows={3}
        />
        <Button type="submit" size="sm" variant="outline">
          Save notes
        </Button>
      </form>
    </div>
  );
}

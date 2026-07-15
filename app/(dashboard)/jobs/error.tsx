"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function JobsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load jobs"
      description="Something went wrong fetching the job list."
      onRetry={reset}
    />
  );
}

"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function JobDetailsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load this job"
      description="Something went wrong fetching the job details."
      onRetry={reset}
    />
  );
}

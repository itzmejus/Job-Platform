"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function AppliedError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load applied jobs"
      description="Something went wrong fetching your applications."
      onRetry={reset}
    />
  );
}

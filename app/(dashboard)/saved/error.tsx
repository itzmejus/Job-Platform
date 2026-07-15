"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function SavedError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load saved jobs"
      description="Something went wrong fetching your saved jobs."
      onRetry={reset}
    />
  );
}

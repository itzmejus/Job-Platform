"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function DashboardHomeError({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load your dashboard"
      description="Something went wrong fetching your stats."
      onRetry={reset}
    />
  );
}

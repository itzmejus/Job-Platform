import { StatCardsSkeleton } from "@/components/shared/loading-skeleton";

export default function DashboardHomeLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-72 animate-pulse rounded bg-secondary" />
      </div>
      <StatCardsSkeleton />
    </div>
  );
}

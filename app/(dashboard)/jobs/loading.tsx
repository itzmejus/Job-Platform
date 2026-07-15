import { TableSkeleton } from "@/components/shared/loading-skeleton";

export default function JobsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-24 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-56 animate-pulse rounded bg-secondary" />
      </div>
      <div className="h-40 animate-pulse rounded-xl bg-secondary" />
      <TableSkeleton />
    </div>
  );
}

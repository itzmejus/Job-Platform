export default function JobDetailsLoading() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="h-48 animate-pulse rounded-xl bg-secondary" />
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="h-72 animate-pulse rounded-xl bg-secondary" />
        <div className="h-72 animate-pulse rounded-xl bg-secondary" />
      </div>
    </div>
  );
}

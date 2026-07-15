export default function AppliedLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-40 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-64 animate-pulse rounded bg-secondary" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />
        ))}
      </div>
    </div>
  );
}

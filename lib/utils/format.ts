export function formatSalary(
  min: number | null,
  max: number | null,
  currency: string | null,
  fallback = "—"
): string {
  if (!min && !max) return fallback;
  const fmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency ?? "EUR",
    maximumFractionDigits: 0,
  });
  if (min && max) return `${fmt.format(min)} – ${fmt.format(max)}`;
  return fmt.format((min ?? max)!);
}

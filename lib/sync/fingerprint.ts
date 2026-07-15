/**
 * Dedupe key for a job: normalized company+title+location, plus the
 * canonical URL when available. Backed by a unique index on jobs.fingerprint
 * (see supabase/migrations/0001_init.sql) — the orchestrator upserts on this
 * rather than inserting a fresh row every sync.
 */
export function computeFingerprint(
  companyName: string,
  title: string,
  location: string | null | undefined,
  url?: string | null
): string {
  const base = [slugify(companyName), slugify(title), slugify(location ?? "")]
    .filter(Boolean)
    .join("::");

  if (!url) return base;

  const canonicalUrl = url.split("?")[0].replace(/\/+$/, "");
  return `${base}::${slugify(canonicalUrl)}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

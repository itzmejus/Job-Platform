import type { RawJob } from "@/lib/sources/types";
import type { ResolvedFilterConfig } from "./config";

/**
 * Applied to every RawJob before it's normalized/stored. Keeps the keyword
 * lists DB-configurable (filter_config table) rather than hardcoded here.
 */
export function passesFilters(job: RawJob, config: ResolvedFilterConfig): boolean {
  const title = job.title.toLowerCase();

  if (config.excludeTitleKeywords.some((kw) => title.includes(kw.toLowerCase()))) {
    return false;
  }

  const haystack = [job.title, job.description ?? "", ...(job.skills ?? [])]
    .join(" ")
    .toLowerCase();
  if (!config.includeKeywords.some((kw) => haystack.includes(kw.toLowerCase()))) {
    return false;
  }

  if (config.allowedCountries.length > 0) {
    const countryText = `${job.country ?? ""} ${job.location ?? ""}`.toLowerCase();
    const matchesCountry = config.allowedCountries.some((country) =>
      countryText.includes(country.toLowerCase())
    );
    if (!matchesCountry) return false;
  }

  return true;
}

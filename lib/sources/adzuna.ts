/**
 * Adzuna (https://developer.adzuna.com) — free tier, requires an app_id +
 * app_key pair. Response shape follows Adzuna's stable, publicly documented
 * REST contract; the endpoint/auth mechanism was confirmed live (a request
 * with dummy credentials correctly returns a 401 AUTH_FAIL rather than 404).
 * Actual result parsing should be smoke-tested once real keys are added —
 * see README.
 */
import { defineJobSource, type RawJob } from "./types";
import { adzunaResponseSchema } from "@/lib/validation/schemas";

const BASE_URL = "https://api.adzuna.com/v1/api/jobs/de/search";
const PAGES_TO_FETCH = 2;
const KEYWORDS_OR = [
  "react",
  "next.js",
  "frontend",
  "full stack",
  "software engineer",
  "typescript",
  "javascript",
  "node.js",
].join(" ");

export const adzuna = defineJobSource({
  name: "adzuna",
  displayName: "Adzuna",
  baseUrl: BASE_URL,
  isEnabled: () => Boolean(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY),
  fetch: async (): Promise<RawJob[]> => {
    const jobs: RawJob[] = [];

    for (let page = 1; page <= PAGES_TO_FETCH; page++) {
      const params = new URLSearchParams({
        app_id: process.env.ADZUNA_APP_ID!,
        app_key: process.env.ADZUNA_APP_KEY!,
        results_per_page: "50",
        what_or: KEYWORDS_OR,
        where: "Germany",
      });

      const response = await fetch(`${BASE_URL}/${page}?${params}`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Adzuna request failed: ${response.status} ${response.statusText}`);
      }

      const parsed = adzunaResponseSchema.parse(await response.json());
      if (parsed.results.length === 0) break;

      for (const item of parsed.results) {
        jobs.push({
          sourceJobId: item.id ?? item.redirect_url,
          title: item.title,
          companyName: item.company?.display_name || "Unknown",
          location: item.location?.display_name,
          country: "Germany",
          salaryMin: item.salary_min,
          salaryMax: item.salary_max,
          salaryCurrency: item.salary_min || item.salary_max ? "EUR" : undefined,
          employmentType: item.contract_time ?? item.contract_type,
          description: item.description,
          url: item.redirect_url,
          datePosted: item.created,
        });
      }
    }

    return jobs;
  },
});

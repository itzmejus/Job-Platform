/**
 * Arbeitnow (https://www.arbeitnow.com) — free, public, no API key required.
 * Response shape verified live against the real endpoint (2026-07-15); it
 * does NOT include a structured visa-sponsorship field despite the original
 * project brief assuming one — visa sponsorship is detected as best-effort
 * text matching in lib/sync/normalize.ts instead. Arbeitnow is a Germany-
 * focused board (confirmed via its own "Jobs in Germany" branding), so
 * country is hardcoded rather than parsed from free-text location.
 */
import { defineJobSource, type RawJob } from "./types";
import { arbeitnowResponseSchema } from "@/lib/validation/schemas";

const BASE_URL = "https://www.arbeitnow.com/api/job-board-api";
const PAGES_TO_FETCH = 3;

export const arbeitnow = defineJobSource({
  name: "arbeitnow",
  displayName: "Arbeitnow",
  baseUrl: BASE_URL,
  isEnabled: () => true,
  fetch: async (): Promise<RawJob[]> => {
    const jobs: RawJob[] = [];

    for (let page = 1; page <= PAGES_TO_FETCH; page++) {
      const response = await fetch(`${BASE_URL}?page=${page}`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Arbeitnow request failed: ${response.status} ${response.statusText}`);
      }

      const parsed = arbeitnowResponseSchema.parse(await response.json());
      if (parsed.data.length === 0) break;

      for (const item of parsed.data) {
        jobs.push({
          sourceJobId: item.slug,
          title: item.title,
          companyName: item.company_name,
          location: item.location || undefined,
          country: "Germany",
          workMode: item.remote ? "remote" : null,
          employmentType: item.job_types[0],
          description: item.description,
          skills: item.tags,
          url: item.url,
          datePosted: item.created_at ? new Date(item.created_at * 1000).toISOString() : undefined,
        });
      }
    }

    return jobs;
  },
});

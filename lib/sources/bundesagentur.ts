/**
 * Bundesagentur für Arbeit Jobsuche API — Germany's official government job
 * database. There's no public developer program for it, but the backend
 * that powers the official "Jobbörse" app is reachable directly and
 * documented (auth scheme, endpoints, fields) at
 * https://github.com/bundesAPI/jobsuche-api. Auth is a static, openly
 * published client key ("jobboerse-jobsuche") sent as `X-API-Key` — the
 * same key the official app itself uses — so this adapter works with zero
 * configuration. Verified live against the real endpoints (2026-07-15).
 *
 * The search endpoint returns only a summary (title, employer, location,
 * refnr) — description and remote/full-time details require a second
 * per-job "details" call. To avoid one detail request per search hit, we
 * pre-filter on title using a local keyword list before fetching details.
 * This is purely a network-cost optimization: the orchestrator still runs
 * the authoritative DB-configured filter afterward against the full
 * title+description, so this can only under-fetch (miss a job whose title
 * doesn't hint at the role but whose description would have matched), never
 * over-admit an irrelevant one.
 */
import { defineJobSource, type RawJob } from "./types";
import {
  bundesagenturSearchResponseSchema,
  bundesagenturDetailSchema,
} from "@/lib/validation/schemas";

const SEARCH_URL = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs";
const DETAILS_URL = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobdetails";
const DEFAULT_API_KEY = "jobboerse-jobsuche";
const MAX_DETAIL_FETCHES = 40;

const TITLE_PREFILTER_KEYWORDS = [
  "react",
  "next.js",
  "nextjs",
  "frontend",
  "front-end",
  "full stack",
  "fullstack",
  "software engineer",
  "softwareentwickl",
  "typescript",
  "javascript",
  "node.js",
  "nodejs",
  "developer",
  "entwickler",
];

function apiKey(): string {
  return process.env.BUNDESAGENTUR_API_KEY || DEFAULT_API_KEY;
}

function headers(): HeadersInit {
  return {
    Accept: "application/json",
    "X-API-Key": apiKey(),
  };
}

export const bundesagentur = defineJobSource({
  name: "bundesagentur",
  displayName: "Bundesagentur für Arbeit",
  baseUrl: SEARCH_URL,
  isEnabled: () => true,
  fetch: async (): Promise<RawJob[]> => {
    const searchParams = new URLSearchParams({
      berufsfeld: "Informatik",
      wo: "Deutschland",
      angebotsart: "1", // ARBEIT — excludes Ausbildung/Praktikum/Selbstaendigkeit at the API level
      size: "100",
      page: "1",
    });

    const searchResponse = await fetch(`${SEARCH_URL}?${searchParams}`, { headers: headers() });
    if (!searchResponse.ok) {
      throw new Error(
        `Bundesagentur search request failed: ${searchResponse.status} ${searchResponse.statusText}`
      );
    }

    const searchResult = bundesagenturSearchResponseSchema.parse(await searchResponse.json());

    const candidates = searchResult.stellenangebote
      .filter((item) => {
        const title = item.titel.toLowerCase();
        return TITLE_PREFILTER_KEYWORDS.some((kw) => title.includes(kw));
      })
      .slice(0, MAX_DETAIL_FETCHES);

    const jobs: RawJob[] = [];

    for (const item of candidates) {
      const encodedRefnr = Buffer.from(item.refnr).toString("base64");
      const detailResponse = await fetch(`${DETAILS_URL}/${encodedRefnr}`, { headers: headers() });
      if (!detailResponse.ok) continue;

      const detail = bundesagenturDetailSchema.parse(await detailResponse.json());
      const location = [item.arbeitsort?.ort, item.arbeitsort?.region]
        .filter(Boolean)
        .join(", ");

      jobs.push({
        sourceJobId: item.refnr,
        title: detail.stellenangebotsTitel || item.titel,
        companyName: item.arbeitgeber,
        location: location || undefined,
        country: "Germany",
        workMode: detail.homeofficemoeglich ? "remote" : null,
        employmentType: detail.arbeitszeitVollzeit ? "full_time" : undefined,
        description: detail.stellenangebotsBeschreibung,
        url: item.externeUrl || detail.externeURL || `https://www.arbeitsagentur.de/jobsuche/jobdetail/${item.refnr}`,
        datePosted: item.aktuelleVeroeffentlichungsdatum
          ? new Date(item.aktuelleVeroeffentlichungsdatum).toISOString()
          : undefined,
        language: "de",
      });
    }

    return jobs;
  },
});

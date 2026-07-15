/**
 * Jooble (https://jooble.org/api/about) — free API key, POST-based search.
 * Response shape follows Jooble's stable, publicly documented contract.
 * The bare endpoint is fronted by Cloudflare bot-protection that challenges
 * unauthenticated/no-key requests, so the exact behavior with a real key
 * couldn't be verified live during development — smoke-test this adapter
 * once JOOBLE_API_KEY is set (check sync_logs for the "jooble" source after
 * a manual sync) and adjust the schema in lib/validation/schemas.ts if the
 * real response drifts from what's modeled here.
 */
import { defineJobSource, type RawJob } from "./types";
import { joobleResponseSchema } from "@/lib/validation/schemas";

const BASE_URL = "https://jooble.org/api";
const KEYWORDS_OR = [
  "React",
  "Next.js",
  "Frontend",
  "Full Stack",
  "Software Engineer",
  "TypeScript",
  "JavaScript",
  "Node.js",
].join(", ");

export const jooble = defineJobSource({
  name: "jooble",
  displayName: "Jooble",
  baseUrl: BASE_URL,
  isEnabled: () => Boolean(process.env.JOOBLE_API_KEY),
  fetch: async (): Promise<RawJob[]> => {
    const response = await fetch(`${BASE_URL}/${process.env.JOOBLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keywords: KEYWORDS_OR, location: "Germany" }),
    });

    if (!response.ok) {
      throw new Error(`Jooble request failed: ${response.status} ${response.statusText}`);
    }

    const parsed = joobleResponseSchema.parse(await response.json());

    return parsed.jobs.map((item) => ({
      sourceJobId: String(item.id ?? item.link),
      title: item.title,
      companyName: item.company || "Unknown",
      location: item.location || undefined,
      country: "Germany",
      description: item.snippet,
      url: item.link,
      datePosted: item.updated,
    }));
  },
});

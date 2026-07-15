/**
 * Local-dev only. Inserts a handful of clearly-fake companies/jobs so the
 * dashboard has something to render before the sync engine is wired up or
 * while iterating on UI offline. Never run against a production project.
 *
 * Usage: npm run seed   (reads .env.local)
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";
import { computeFingerprint } from "../lib/sync/fingerprint";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const seedCompanies = [
    {
      name: "[SEED] Nordlicht Software GmbH",
      website: "https://example.com/nordlicht",
      location: "Berlin, Germany",
      industry: "Software",
    },
    {
      name: "[SEED] Rheinbrücke Digital",
      website: "https://example.com/rheinbrucke",
      location: "Cologne, Germany",
      industry: "Fintech",
    },
  ];

  console.log(`Seeding ${seedCompanies.length} companies...`);
  const { data: companies, error: companyError } = await supabase
    .from("companies")
    .upsert(seedCompanies, { onConflict: "name" })
    .select("id, name");

  if (companyError) throw companyError;

  const nordlicht = companies.find((c) => c.name === seedCompanies[0].name)!;
  const rheinbruecke = companies.find((c) => c.name === seedCompanies[1].name)!;

  const seedJobs = [
    {
      companyId: nordlicht.id,
      companyName: nordlicht.name,
      title: "Senior Frontend Engineer (React/Next.js)",
      location: "Berlin, Germany",
      workMode: "hybrid" as const,
      salaryMin: 70000,
      salaryMax: 90000,
      salaryCurrency: "EUR",
      employmentType: "full_time" as const,
      experienceLevel: "senior" as const,
      url: "https://example.com/jobs/nordlicht-senior-frontend",
      skills: ["React", "Next.js", "TypeScript"],
      language: "en",
      visaSponsorship: true,
    },
    {
      companyId: rheinbruecke.id,
      companyName: rheinbruecke.name,
      title: "Full Stack Software Engineer",
      location: "Cologne, Germany",
      workMode: "remote" as const,
      salaryMin: 60000,
      salaryMax: 80000,
      salaryCurrency: "EUR",
      employmentType: "full_time" as const,
      experienceLevel: "mid" as const,
      url: "https://example.com/jobs/rheinbrucke-fullstack",
      skills: ["Node.js", "TypeScript", "React"],
      language: "de",
      visaSponsorship: null,
    },
  ];

  console.log(`Seeding ${seedJobs.length} jobs...`);
  const rows = seedJobs.map((job) => ({
    company_id: job.companyId,
    title: job.title,
    location: job.location,
    country: "Germany",
    work_mode: job.workMode,
    salary_min: job.salaryMin,
    salary_max: job.salaryMax,
    salary_currency: job.salaryCurrency,
    employment_type: job.employmentType,
    experience_level: job.experienceLevel,
    job_url: job.url,
    date_posted: new Date().toISOString(),
    source: "seed",
    sources: ["seed"],
    skills: job.skills,
    language: job.language,
    visa_sponsorship: job.visaSponsorship,
    fingerprint: computeFingerprint(job.companyName, job.title, job.location, job.url),
  }));

  const { error: jobError } = await supabase
    .from("jobs")
    .upsert(rows, { onConflict: "fingerprint" });

  if (jobError) throw jobError;

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  // Set the exit code rather than forcing process.exit() here — an immediate
  // exit can race open network sockets (e.g. undici keep-alive) and crash
  // with a libuv assertion on Windows instead of exiting cleanly.
  process.exitCode = 1;
});

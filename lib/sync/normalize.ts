import type { RawJob } from "@/lib/sources/types";
import type { Database } from "@/types/database";

type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];
type WorkMode = NonNullable<JobInsert["work_mode"]>;
type EmploymentType = NonNullable<JobInsert["employment_type"]>;
type ExperienceLevel = NonNullable<JobInsert["experience_level"]>;

/** Fields the orchestrator still needs to attach: company_id, source, sources, fingerprint. */
export type NormalizedJob = Omit<JobInsert, "company_id" | "source" | "sources" | "fingerprint">;

export function normalizeJob(raw: RawJob): NormalizedJob {
  const haystack = [raw.title, raw.description ?? "", ...(raw.skills ?? [])].join(" ");

  return {
    title: raw.title.trim(),
    location: raw.location?.trim() || null,
    country: "Germany",
    work_mode: normalizeWorkMode(raw),
    salary_min: raw.salaryMin ?? null,
    salary_max: raw.salaryMax ?? null,
    salary_currency: raw.salaryCurrency ?? null,
    employment_type: normalizeEmploymentType(raw.employmentType),
    experience_level: normalizeExperienceLevel(raw),
    job_url: raw.url,
    date_posted: raw.datePosted ?? null,
    description: raw.description ?? null,
    skills: raw.skills ?? [],
    language: raw.language ?? detectLanguageHint(haystack),
    visa_sponsorship: raw.visaSponsorship ?? detectVisaSponsorship(haystack),
  };
}

function normalizeWorkMode(raw: RawJob): WorkMode | null {
  if (raw.workMode) return raw.workMode;

  const haystack = `${raw.location ?? ""} ${raw.title} ${raw.description ?? ""}`.toLowerCase();
  if (/\bremote\b/.test(haystack)) return "remote";
  if (/\bhybrid\b/.test(haystack)) return "hybrid";
  return null;
}

const EMPLOYMENT_TYPE_MAP: Record<string, EmploymentType> = {
  // Canonical values pass through as-is, so adapters may set either a raw
  // human-readable string or the enum value directly.
  full_time: "full_time",
  "full-time": "full_time",
  "full time": "full_time",
  fulltime: "full_time",
  permanent: "full_time",
  part_time: "part_time",
  "part-time": "part_time",
  "part time": "part_time",
  parttime: "part_time",
  contract: "contract",
  contractor: "contract",
  freelance: "contract",
  temporary: "temporary",
  temp: "temporary",
  internship: "internship",
  intern: "internship",
  other: "other",
};

function normalizeEmploymentType(raw?: string): EmploymentType | null {
  if (!raw) return null;
  const key = raw.trim().toLowerCase();
  return EMPLOYMENT_TYPE_MAP[key] ?? "other";
}

const CANONICAL_EXPERIENCE_LEVELS = new Set<ExperienceLevel>([
  "entry",
  "junior",
  "mid",
  "senior",
  "lead",
  "principal",
  "unknown",
]);

const EXPERIENCE_TITLE_PATTERNS: Array<[RegExp, ExperienceLevel]> = [
  [/\bprincipal\b/i, "principal"],
  [/\blead\b/i, "lead"],
  [/\b(senior|sr\.?)\b/i, "senior"],
  [/\b(junior|jr\.?)\b/i, "junior"],
  [/\b(entry[- ]?level|graduate|working student|werkstudent)\b/i, "entry"],
];

function normalizeExperienceLevel(raw: RawJob): ExperienceLevel {
  const provided = raw.experienceLevel?.trim().toLowerCase() as ExperienceLevel | undefined;
  if (provided && CANONICAL_EXPERIENCE_LEVELS.has(provided)) {
    return provided;
  }

  for (const [pattern, level] of EXPERIENCE_TITLE_PATTERNS) {
    if (pattern.test(raw.title)) return level;
  }

  return "unknown";
}

const ENGLISH_HINTS = /\b(fluent english|english[- ]speaking|business english|english is required|working language is english)\b/i;
const GERMAN_HINTS = /[äöüß]|\b(gute deutschkenntnisse|deutschkenntnisse|fließend deutsch)\b/i;

/** Best-effort only — most sources don't provide a structured language field. */
function detectLanguageHint(text: string): string | undefined {
  if (ENGLISH_HINTS.test(text)) return "en";
  if (GERMAN_HINTS.test(text)) return "de";
  return undefined;
}

const VISA_HINTS = /\b(visa sponsorship|sponsor(s|ship)? (a |your )?visa|relocation support|work permit sponsorship|visumsponsoring)\b/i;

/** Best-effort only — no source in this project exposes a structured visa field. */
function detectVisaSponsorship(text: string): boolean | null {
  return VISA_HINTS.test(text) ? true : null;
}

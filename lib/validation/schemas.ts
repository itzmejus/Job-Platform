import { z } from "zod";

export const authCredentialsSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;

// ---------------------------------------------------------------------------
// Job source API responses — verified against each source's live/documented
// shape (see lib/sources/*.ts for notes on which). Schemas are deliberately
// lenient (most fields optional/nullable): a source adding a field or
// omitting one we don't strictly need shouldn't break ingestion.
// ---------------------------------------------------------------------------

export const arbeitnowJobSchema = z.object({
  slug: z.string(),
  company_name: z.string(),
  title: z.string(),
  description: z.string().optional().default(""),
  remote: z.boolean().optional().default(false),
  url: z.url(),
  tags: z.array(z.string()).optional().default([]),
  job_types: z.array(z.string()).optional().default([]),
  location: z.string().optional().default(""),
  created_at: z.number().optional(),
});

export const arbeitnowResponseSchema = z.object({
  data: z.array(arbeitnowJobSchema),
});

export const bundesagenturSearchItemSchema = z.object({
  refnr: z.string(),
  titel: z.string(),
  arbeitgeber: z.string().optional().default("Unknown"),
  arbeitsort: z
    .object({
      ort: z.string().optional(),
      region: z.string().optional(),
      land: z.string().optional(),
    })
    .optional(),
  aktuelleVeroeffentlichungsdatum: z.string().optional(),
  externeUrl: z.string().optional(),
});

export const bundesagenturSearchResponseSchema = z.object({
  stellenangebote: z.array(bundesagenturSearchItemSchema).optional().default([]),
});

export const bundesagenturDetailSchema = z.object({
  stellenangebotsTitel: z.string().optional(),
  stellenangebotsBeschreibung: z.string().optional().default(""),
  homeofficemoeglich: z.boolean().optional(),
  homeofficetyp: z.string().nullable().optional(),
  arbeitszeitVollzeit: z.boolean().optional(),
  externeURL: z.string().optional(),
});

export const adzunaJobSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  description: z.string().optional().default(""),
  redirect_url: z.url(),
  created: z.string().optional(),
  company: z.object({ display_name: z.string().optional() }).optional(),
  location: z
    .object({ display_name: z.string().optional(), area: z.array(z.string()).optional() })
    .optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  contract_type: z.string().optional(),
  contract_time: z.string().optional(),
});

export const adzunaResponseSchema = z.object({
  results: z.array(adzunaJobSchema).optional().default([]),
});

export const joobleJobSchema = z.object({
  title: z.string(),
  location: z.string().optional().default(""),
  snippet: z.string().optional().default(""),
  salary: z.string().optional(),
  type: z.string().optional(),
  link: z.url(),
  company: z.string().optional().default("Unknown"),
  updated: z.string().optional(),
  id: z.union([z.string(), z.number()]).optional(),
});

export const joobleResponseSchema = z.object({
  jobs: z.array(joobleJobSchema).optional().default([]),
});

// ---------------------------------------------------------------------------
// Job table URL search params (app/(dashboard)/jobs) — validated because
// they're user-controlled external input, same as any query string.
// ---------------------------------------------------------------------------

export const jobListSearchParamsSchema = z.object({
  q: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  workMode: z.enum(["remote", "hybrid", "onsite"]).optional(),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  visa: z.enum(["yes", "no"]).optional(),
  level: z
    .enum(["entry", "junior", "mid", "senior", "lead", "principal", "unknown"])
    .optional(),
  source: z.string().trim().min(1).optional(),
  posted: z.enum(["24h", "7d", "30d"]).optional(),
  sortBy: z.enum(["date_posted", "salary_max", "title"]).catch("date_posted"),
  sortDir: z.enum(["asc", "desc"]).catch("desc"),
  page: z.coerce.number().int().positive().catch(1),
});

export type JobListSearchParams = z.infer<typeof jobListSearchParamsSchema>;

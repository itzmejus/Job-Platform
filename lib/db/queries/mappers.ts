import type { Database } from "@/types/database";
import type { Company, Job } from "@/types/domain";

type JobRow = Database["public"]["Tables"]["jobs"]["Row"];
type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];

export function mapJobRow(row: JobRow & { companies?: CompanyRow | null }): Job {
  const { companies, ...job } = row;
  return {
    id: job.id,
    companyId: job.company_id,
    company: companies ? mapCompanyRow(companies) : undefined,
    title: job.title,
    location: job.location,
    country: job.country,
    workMode: job.work_mode,
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    salaryCurrency: job.salary_currency,
    employmentType: job.employment_type,
    experienceLevel: job.experience_level,
    jobUrl: job.job_url,
    datePosted: job.date_posted,
    dateCollected: job.date_collected,
    source: job.source,
    sources: job.sources,
    description: job.description,
    skills: job.skills,
    language: job.language,
    visaSponsorship: job.visa_sponsorship,
    fingerprint: job.fingerprint,
    createdAt: job.created_at,
    updatedAt: job.updated_at,
  };
}

export function mapCompanyRow(row: CompanyRow): Company {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url,
    website: row.website,
    location: row.location,
    industry: row.industry,
    createdAt: row.created_at,
  };
}

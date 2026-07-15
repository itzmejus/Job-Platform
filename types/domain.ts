export type WorkMode = "remote" | "hybrid" | "onsite";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "temporary"
  | "internship"
  | "other";

export type ExperienceLevel =
  | "entry"
  | "junior"
  | "mid"
  | "senior"
  | "lead"
  | "principal"
  | "unknown";

export type SavedJobStatus = "saved" | "archived" | "hidden";

export type AppliedJobStatus = "waiting" | "interview" | "rejected" | "offer";

export interface Company {
  id: string;
  name: string;
  logoUrl: string | null;
  website: string | null;
  location: string | null;
  industry: string | null;
  createdAt: string;
}

export interface Job {
  id: string;
  companyId: string;
  company?: Company;
  title: string;
  location: string | null;
  country: string;
  workMode: WorkMode | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  employmentType: EmploymentType | null;
  experienceLevel: ExperienceLevel | null;
  jobUrl: string;
  datePosted: string | null;
  dateCollected: string;
  /** First source that reported this job. */
  source: string;
  /** Every source that has reported this job, appended on repeat sightings. */
  sources: string[];
  description: string | null;
  skills: string[];
  language: string | null;
  visaSponsorship: boolean | null;
  fingerprint: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  status: SavedJobStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppliedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  appliedDate: string;
  status: AppliedJobStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SyncLog {
  id: string;
  source: string;
  startedAt: string;
  finishedAt: string | null;
  jobsFound: number;
  jobsInserted: number;
  jobsSkipped: number;
  errors: string[];
}

export interface JobSourceRecord {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  config: Record<string, unknown>;
  lastSyncedAt: string | null;
}

export interface FilterConfig {
  id: string;
  /** Any of these appearing in the title/description/skills qualifies a job. */
  includeKeywords: string[];
  /** Any of these appearing in the title disqualifies a job (e.g. internship terms). */
  excludeTitleKeywords: string[];
  /** Countries a job's location must resolve to in order to be kept. */
  allowedCountries: string[];
  updatedAt: string;
}

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
}

export interface StatCounts {
  newJobsToday: number;
  jobsThisWeek: number;
  savedJobs: number;
  appliedJobs: number;
  favoriteCompanies: number;
}

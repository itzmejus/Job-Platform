/**
 * Shared contract every job source adapter implements. This file is the only
 * thing the sync orchestrator and adapters both depend on — adding a new
 * source never requires touching the orchestrator, and the orchestrator
 * never imports an individual adapter directly (see registry.ts).
 */

export interface RawJob {
  /** Source's own id or URL slug, kept for traceability/debugging only. */
  sourceJobId: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  /** Free text as provided by the source; normalize.ts maps it to canonical fields. */
  location?: string;
  country?: string;
  workMode?: "remote" | "hybrid" | "onsite" | null;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  employmentType?: string;
  experienceLevel?: string;
  description?: string;
  skills?: string[];
  language?: string;
  visaSponsorship?: boolean | null;
  /** Canonical/apply URL for the job. */
  url: string;
  /** ISO 8601 if the source provides a posting date. */
  datePosted?: string;
  /** Original payload, kept only for debugging — never persisted to the DB. */
  raw?: Record<string, unknown>;
}

export interface JobSourceResult {
  jobs: RawJob[];
  /** Non-fatal issues; a partial job list can still be returned alongside these. */
  errors: string[];
}

export interface JobSource {
  /** Unique key, matches job_sources.name in the database. */
  name: string;
  displayName: string;
  baseUrl: string;
  /** Computed from config/env presence — false sources are skipped, never called. */
  enabled: boolean;
  fetchJobs(): Promise<JobSourceResult>;
}

export class NotImplementedError extends Error {
  constructor(sourceName: string) {
    super(
      `${sourceName} has no official API access configured. This adapter is a ` +
        `stub pending a licensed feed or official API key — see the file for details.`
    );
    this.name = "NotImplementedError";
  }
}

interface DefineJobSourceOptions {
  name: string;
  displayName: string;
  baseUrl: string;
  /** Evaluated once at module load (typically checks an env var is present). */
  isEnabled: () => boolean;
  fetch: () => Promise<RawJob[]>;
  timeoutMs?: number;
  /** Overrides the default "disabled: MISSING_API_KEY" sync_logs message — used by stubs. */
  disabledReason?: string;
}

/**
 * Wraps an adapter's fetch implementation with the disabled/timeout/error
 * handling every source needs, so one failing or unconfigured source can
 * never break the orchestrator's run across the rest of the sources.
 */
export function defineJobSource(options: DefineJobSourceOptions): JobSource {
  const {
    name,
    displayName,
    baseUrl,
    isEnabled,
    fetch: fetchImpl,
    timeoutMs = 15_000,
    disabledReason = "disabled: MISSING_API_KEY",
  } = options;
  const enabled = isEnabled();

  return {
    name,
    displayName,
    baseUrl,
    enabled,
    async fetchJobs(): Promise<JobSourceResult> {
      if (!enabled) {
        return { jobs: [], errors: [disabledReason] };
      }
      try {
        const jobs = await withTimeout(fetchImpl(), timeoutMs, name);
        return { jobs, errors: [] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { jobs: [], errors: [message] };
      }
    },
  };
}

function withTimeout<T>(promise: Promise<T>, ms: number, sourceName: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${sourceName} timed out after ${ms}ms`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

import { notFound } from "next/navigation";
import { ExternalLink, Globe } from "lucide-react";
import { createClient } from "@/lib/db/server";
import { getJobById } from "@/lib/db/queries/jobs";
import { getSavedJob } from "@/lib/db/queries/saved-jobs";
import { getAppliedJob } from "@/lib/db/queries/applied-jobs";
import { CompanyLogo } from "@/components/jobs/company-logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JobSavePanel } from "@/components/jobs/job-save-panel";
import { JobApplyPanel } from "@/components/jobs/job-apply-panel";
import { sanitizeJobDescription } from "@/lib/utils/sanitize-html";
import { formatSalary } from "@/lib/utils/format";

interface JobDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const job = await getJobById(supabase, id);
  if (!job) notFound();

  const [savedJob, appliedJob] = await Promise.all([
    getSavedJob(supabase, user!.id, id),
    getAppliedJob(supabase, user!.id, id),
  ]);

  const sanitizedDescription = job.description ? sanitizeJobDescription(job.description) : null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-4">
          <CompanyLogo name={job.company?.name ?? "Unknown"} logoUrl={job.company?.logoUrl} />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold tracking-tight">{job.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              <span>{job.company?.name ?? "Unknown company"}</span>
              {job.location && (
                <>
                  <span>·</span>
                  <span>{job.location}</span>
                </>
              )}
              {job.company?.website && (
                <>
                  <span>·</span>
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    <Globe className="size-3.5" /> Website
                  </a>
                </>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.workMode && (
                <Badge variant={job.workMode === "remote" ? "default" : "secondary"} className="capitalize">
                  {job.workMode}
                </Badge>
              )}
              {job.experienceLevel && job.experienceLevel !== "unknown" && (
                <Badge variant="secondary" className="capitalize">
                  {job.experienceLevel}
                </Badge>
              )}
              {job.employmentType && (
                <Badge variant="secondary" className="capitalize">
                  {job.employmentType.replace("_", " ")}
                </Badge>
              )}
              <Badge variant="secondary" className="capitalize">
                {job.source}
              </Badge>
              {job.visaSponsorship !== null && (
                <Badge variant={job.visaSponsorship ? "default" : "secondary"}>
                  {job.visaSponsorship ? "Visa sponsorship" : "No visa sponsorship"}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
          <div className="text-sm text-muted-foreground">
            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, "Salary not disclosed")}
            {job.datePosted && <span> · Posted {new Date(job.datePosted).toLocaleDateString()}</span>}
          </div>
          <Button
            size="lg"
            nativeButton={false}
            render={
              <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                Open Original Job <ExternalLink className="size-4" />
              </a>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {sanitizedDescription && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-3 text-sm font-medium">Description</h2>
              <div
                className="text-sm text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:font-medium [&_h1]:text-foreground [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:font-medium [&_h2]:text-foreground [&_h3]:mb-1.5 [&_h3]:mt-3 [&_h3]:font-medium [&_h3]:text-foreground [&_li]:ml-1 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
              />
            </div>
          )}

          {job.skills.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-3 text-sm font-medium">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <JobSavePanel jobId={job.id} savedJob={savedJob} />
          <JobApplyPanel jobId={job.id} appliedJob={appliedJob} />
        </div>
      </div>
    </div>
  );
}

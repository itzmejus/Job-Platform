import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CompanyLogo } from "./company-logo";
import type { Job } from "@/types/domain";
import type { JobListSearchParams } from "@/lib/validation/schemas";
import { formatSalary } from "@/lib/utils/format";

interface JobTableProps {
  jobs: Job[];
  filters: JobListSearchParams;
  totalCount: number;
  page: number;
  pageSize: number;
}

const SORTABLE_COLUMNS = {
  title: "title",
  date_posted: "date_posted",
  salary_max: "salary_max",
} as const;

export function JobTable({ jobs, filters, totalCount, page, pageSize }: JobTableProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(totalCount, page * pageSize);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <SortableHead label="Title" column={SORTABLE_COLUMNS.title} filters={filters} />
              <TableHead>Location</TableHead>
              <TableHead>Remote</TableHead>
              <TableHead>Source</TableHead>
              <SortableHead label="Posted" column={SORTABLE_COLUMNS.date_posted} filters={filters} />
              <SortableHead label="Salary" column={SORTABLE_COLUMNS.salary_max} filters={filters} />
              <TableHead>Visa Sponsorship</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <CompanyLogo name={job.company?.name ?? "Unknown"} logoUrl={job.company?.logoUrl} />
                    <span className="max-w-40 truncate text-sm">{job.company?.name ?? "Unknown"}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-64">
                  <Link href={`/jobs/${job.id}`} className="line-clamp-2 text-sm font-medium hover:underline">
                    {job.title}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {job.location ?? "—"}
                </TableCell>
                <TableCell>
                  <WorkModeBadge workMode={job.workMode} />
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {job.source}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  <PostedDate date={job.datePosted} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                </TableCell>
                <TableCell>
                  <VisaBadge visaSponsorship={job.visaSponsorship} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      nativeButton={false}
                      render={<Link href={`/jobs/${job.id}`}>View</Link>}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={
                        <a href={job.jobUrl} target="_blank" rel="noopener noreferrer">
                          Open <ExternalLink className="size-3.5" />
                        </a>
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {from}–{to} of {totalCount.toLocaleString()}
        </p>
        <div className="flex items-center gap-2">
          <PageLink filters={filters} page={page - 1} disabled={page <= 1}>
            Previous
          </PageLink>
          <span>
            Page {page} of {totalPages}
          </span>
          <PageLink filters={filters} page={page + 1} disabled={page >= totalPages}>
            Next
          </PageLink>
        </div>
      </div>
    </div>
  );
}

function SortableHead({
  label,
  column,
  filters,
}: {
  label: string;
  column: keyof typeof SORTABLE_COLUMNS;
  filters: JobListSearchParams;
}) {
  const isActive = filters.sortBy === column;
  const nextDir = isActive && filters.sortDir === "asc" ? "desc" : "asc";
  const href = buildJobsHref(filters, { sortBy: column, sortDir: nextDir, page: undefined });

  const Icon = !isActive ? ArrowUpDown : filters.sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead>
      <Link href={href} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        <Icon className="size-3.5" />
      </Link>
    </TableHead>
  );
}

function PageLink({
  filters,
  page,
  disabled,
  children,
}: {
  filters: JobListSearchParams;
  page: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-border px-3 py-1.5 opacity-50">
        {children}
      </span>
    );
  }

  return (
    <Link
      href={buildJobsHref(filters, { page })}
      className="rounded-md border border-border px-3 py-1.5 hover:bg-secondary"
    >
      {children}
    </Link>
  );
}

function buildJobsHref(
  filters: JobListSearchParams,
  overrides: Partial<Record<"sortBy" | "sortDir" | "page", string | number | undefined>>
): string {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.location) params.set("location", filters.location);
  if (filters.workMode) params.set("workMode", filters.workMode);
  if (filters.salaryMin !== undefined) params.set("salaryMin", String(filters.salaryMin));
  if (filters.salaryMax !== undefined) params.set("salaryMax", String(filters.salaryMax));
  if (filters.visa) params.set("visa", filters.visa);
  if (filters.level) params.set("level", filters.level);
  if (filters.source) params.set("source", filters.source);
  if (filters.posted) params.set("posted", filters.posted);

  const sortBy = "sortBy" in overrides ? overrides.sortBy : filters.sortBy;
  const sortDir = "sortDir" in overrides ? overrides.sortDir : filters.sortDir;
  const page = "page" in overrides ? overrides.page : filters.page;

  if (sortBy) params.set("sortBy", String(sortBy));
  if (sortDir) params.set("sortDir", String(sortDir));
  if (page !== undefined) params.set("page", String(page));

  return `/jobs?${params.toString()}`;
}

function WorkModeBadge({ workMode }: { workMode: Job["workMode"] }) {
  if (!workMode) return <span className="text-sm text-muted-foreground">—</span>;

  const labels: Record<NonNullable<Job["workMode"]>, string> = {
    remote: "Remote",
    hybrid: "Hybrid",
    onsite: "Onsite",
  };

  return <Badge variant={workMode === "remote" ? "default" : "secondary"}>{labels[workMode]}</Badge>;
}

function VisaBadge({ visaSponsorship }: { visaSponsorship: boolean | null }) {
  if (visaSponsorship === null) return <span className="text-sm text-muted-foreground">—</span>;
  return <Badge variant={visaSponsorship ? "default" : "secondary"}>{visaSponsorship ? "Yes" : "No"}</Badge>;
}

function PostedDate({ date }: { date: string | null }) {
  if (!date) return <span>—</span>;
  const parsed = new Date(date);
  return <span title={parsed.toLocaleDateString()}>{formatDistanceToNowStrict(parsed, { addSuffix: true })}</span>;
}


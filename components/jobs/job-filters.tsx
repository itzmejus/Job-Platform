import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { JobListSearchParams } from "@/lib/validation/schemas";

interface JobFiltersProps {
  filters: JobListSearchParams;
  sourceNames: string[];
}

/**
 * Plain <form method="GET">, no client JS: every field's `name` matches the
 * query param it controls, so submitting re-navigates to /jobs with the new
 * filter combination baked into the URL — which is what makes these views
 * shareable. shadcn's Select is built on Base UI, which renders a hidden
 * native input keyed by `name`/`defaultValue`, so it participates in the
 * native submission the same as a plain <input>.
 */
export function JobFilters({ filters, sourceNames }: JobFiltersProps) {
  return (
    <form action="/jobs" className="rounded-xl border border-border bg-card p-4">
      <input type="hidden" name="sortBy" value={filters.sortBy} />
      <input type="hidden" name="sortDir" value={filters.sortDir} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" placeholder="Title or description" defaultValue={filters.q} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            placeholder="e.g. Berlin"
            defaultValue={filters.location}
          />
        </div>

        <SelectField
          label="Work mode"
          name="workMode"
          defaultValue={filters.workMode}
          options={[
            { value: "remote", label: "Remote" },
            { value: "hybrid", label: "Hybrid" },
            { value: "onsite", label: "Onsite" },
          ]}
        />

        <SelectField
          label="Visa sponsorship"
          name="visa"
          defaultValue={filters.visa}
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
        />

        <SelectField
          label="Experience level"
          name="level"
          defaultValue={filters.level}
          options={[
            { value: "entry", label: "Entry" },
            { value: "junior", label: "Junior" },
            { value: "mid", label: "Mid" },
            { value: "senior", label: "Senior" },
            { value: "lead", label: "Lead" },
            { value: "principal", label: "Principal" },
            { value: "unknown", label: "Unspecified" },
          ]}
        />

        <SelectField
          label="Source"
          name="source"
          defaultValue={filters.source}
          options={sourceNames.map((name) => ({ value: name, label: name }))}
        />

        <SelectField
          label="Date posted"
          name="posted"
          defaultValue={filters.posted}
          options={[
            { value: "24h", label: "Last 24 hours" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
          ]}
        />

        <div className="space-y-1.5">
          <Label htmlFor="salaryMin">Min salary</Label>
          <Input
            id="salaryMin"
            name="salaryMin"
            type="number"
            min={0}
            placeholder="e.g. 50000"
            defaultValue={filters.salaryMin}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="salaryMax">Max salary</Label>
          <Input
            id="salaryMax"
            name="salaryMax"
            type="number"
            min={0}
            placeholder="e.g. 90000"
            defaultValue={filters.salaryMax}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button type="submit" size="sm">
          Apply filters
        </Button>
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href="/jobs">Reset</Link>}
        />
      </div>
    </form>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Select name={name} defaultValue={defaultValue ?? ""}>
        <SelectTrigger id={name} className="w-full">
          <SelectValue placeholder="Any" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

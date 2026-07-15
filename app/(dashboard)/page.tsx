import { Sparkles, CalendarDays, Bookmark, Send, Building2 } from "lucide-react";
import { createClient } from "@/lib/db/server";
import { getStatCounts } from "@/lib/db/queries/stats";
import { StatCard } from "@/components/dashboard/stat-card";

export default async function DashboardHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const stats = await getStatCounts(supabase, user!.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">Here&apos;s what&apos;s new since your last visit.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <StatCard label="New Jobs Today" value={stats.newJobsToday} icon={Sparkles} />
        <StatCard label="Jobs This Week" value={stats.jobsThisWeek} icon={CalendarDays} />
        <StatCard label="Saved Jobs" value={stats.savedJobs} icon={Bookmark} />
        <StatCard label="Applied Jobs" value={stats.appliedJobs} icon={Send} />
        <StatCard label="Favorite Companies" value={stats.favoriteCompanies} icon={Building2} />
      </div>
    </div>
  );
}

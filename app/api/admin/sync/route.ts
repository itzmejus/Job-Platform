import { NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { runSync } from "@/lib/sync/orchestrator";

export const maxDuration = 60;

/** Manual sync trigger for the admin page (built in Phase 7) — requires a logged-in session. */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summaries = await runSync();
  return NextResponse.json({ summaries });
}

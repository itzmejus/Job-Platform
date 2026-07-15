import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/** Supabase client for Client Components. Runs as the current user (RLS enforced). */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

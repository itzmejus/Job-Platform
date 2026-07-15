import "server-only";
import { createAdminClient } from "@/lib/db/admin";

export interface ResolvedFilterConfig {
  includeKeywords: string[];
  excludeTitleKeywords: string[];
  allowedCountries: string[];
}

/** Loads the single filter_config row (seeded by supabase/migrations/0001_init.sql). */
export async function loadFilterConfig(): Promise<ResolvedFilterConfig> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("filter_config").select("*").limit(1).maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error(
      "No filter_config row found. Run supabase/migrations/0001_init.sql, which seeds a default row."
    );
  }

  return {
    includeKeywords: data.include_keywords,
    excludeTitleKeywords: data.exclude_title_keywords,
    allowedCountries: data.allowed_countries,
  };
}

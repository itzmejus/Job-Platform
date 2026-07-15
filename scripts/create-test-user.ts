/**
 * Local-dev only. Creates a pre-confirmed Supabase auth user via the
 * service-role admin API, bypassing email delivery entirely — useful
 * because Supabase's built-in (free-tier) email service is rate-limited to
 * a handful of sends per hour, which blocks iterating on signup manually.
 *
 * Usage: npm run create-test-user -- <email> <password>
 * Defaults to test@example.com / TestPassword123! if omitted.
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
  }

  const email = process.argv[2] ?? "test@example.com";
  const password = process.argv[3] ?? "TestPassword123!";

  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) throw error;

  console.log(`Created and confirmed: ${data.user.email} (${data.user.id})`);
  console.log(`Log in at /login with:\n  email: ${email}\n  password: ${password}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

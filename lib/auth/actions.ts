"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/db/server";
import { authCredentialsSchema } from "@/lib/validation/schemas";

export interface AuthActionState {
  error?: string;
  success?: string;
}

function parseCredentials(formData: FormData): AuthActionState & { email?: string; password?: string } {
  const parsed = authCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid email or password." };
  }

  return { email: parsed.data.email, password: parsed.data.password };
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = parseCredentials(formData);
  if (parsed.error || !parsed.email || !parsed.password) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = parseCredentials(formData);
  if (parsed.error || !parsed.email || !parsed.password) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.email,
    password: parsed.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email to confirm your account, then log in." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

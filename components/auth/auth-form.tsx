"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuthActionState } from "@/lib/auth/actions";

interface AuthFormProps {
  action: (prevState: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  submitLabel: string;
  pendingLabel: string;
  footer: { prompt: string; linkLabel: string; href: string };
}

const initialState: AuthActionState = {};

export function AuthForm({ action, submitLabel, pendingLabel, footer }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="text-sm text-emerald-500" role="status">
          {state.success}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? pendingLabel : submitLabel}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {footer.prompt}{" "}
        <Link href={footer.href} className="text-foreground underline underline-offset-4">
          {footer.linkLabel}
        </Link>
      </p>
    </form>
  );
}

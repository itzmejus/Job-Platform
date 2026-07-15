import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <>
      <h2 className="mb-6 text-lg font-medium">Sign in</h2>
      <AuthForm
        action={login}
        submitLabel="Sign in"
        pendingLabel="Signing in..."
        footer={{ prompt: "Don't have an account?", linkLabel: "Sign up", href: "/signup" }}
      />
    </>
  );
}

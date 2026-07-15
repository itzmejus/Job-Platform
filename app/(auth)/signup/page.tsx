import { AuthForm } from "@/components/auth/auth-form";
import { signup } from "@/lib/auth/actions";

export default function SignupPage() {
  return (
    <>
      <h2 className="mb-6 text-lg font-medium">Create an account</h2>
      <AuthForm
        action={signup}
        submitLabel="Sign up"
        pendingLabel="Signing up..."
        footer={{ prompt: "Already have an account?", linkLabel: "Sign in", href: "/login" }}
      />
    </>
  );
}

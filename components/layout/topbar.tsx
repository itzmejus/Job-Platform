import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";

export function TopBar({ email }: { email: string }) {
  return (
    <header className="flex items-center justify-between border-b border-border px-4 py-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav />
        <div>
          <p className="text-sm font-medium">Germany Job Discovery Dashboard</p>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </div>
      <form action={logout}>
        <Button variant="outline" size="sm" type="submit">
          Sign out
        </Button>
      </form>
    </header>
  );
}

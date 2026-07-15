import { SearchX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";

export default function JobNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Job not found"
      description="It may have been removed, or the link is incorrect."
      action={
        <Button size="sm" render={<Link href="/jobs">Back to jobs</Link>} nativeButton={false} />
      }
    />
  );
}

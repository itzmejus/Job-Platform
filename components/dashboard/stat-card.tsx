import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
}

export function StatCard({ label, value, icon: Icon }: StatCardProps) {
  return (
    <Card className="gap-0 py-5">
      <CardContent className="flex items-center justify-between px-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value.toLocaleString()}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-full bg-secondary">
          <Icon className="size-4 text-secondary-foreground" strokeWidth={1.75} />
        </div>
      </CardContent>
    </Card>
  );
}

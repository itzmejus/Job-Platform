"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";

export function CompanyLogo({ name, logoUrl }: { name: string; logoUrl?: string | null }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary">
        <Building2 className="size-4 text-secondary-foreground" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-secondary">
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        fill
        sizes="32px"
        className="object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

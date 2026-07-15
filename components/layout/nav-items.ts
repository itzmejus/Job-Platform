import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Briefcase } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Grows as later phases add Saved/Applied/Companies/Admin routes. */
export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
];

import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Briefcase, Bookmark, Send } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Grows as later phases add Companies/Admin routes. */
export const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/saved", label: "Saved", icon: Bookmark },
  { href: "/applied", label: "Applied", icon: Send },
];

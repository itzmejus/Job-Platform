import { SidebarNav } from "./sidebar-nav";

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border px-3 py-6 md:block">
      <SidebarNav />
    </aside>
  );
}

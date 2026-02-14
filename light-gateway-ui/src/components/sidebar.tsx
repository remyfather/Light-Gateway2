"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Workflow,
  Home,
  Settings,
  Activity,
  Database,
  ChevronRight,
  Plus,
} from "lucide-react";

const navItems = [
  { id: "home", label: "Workflows", icon: Home, href: "/" },
  { id: "activity", label: "Activity", icon: Activity, href: "#" },
  { id: "databases", label: "Databases", icon: Database, href: "#" },
  { id: "settings", label: "Settings", icon: Settings, href: "#" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const isDesigner =
    pathname?.startsWith("/workflows/") && pathname?.includes("/design");

  return (
    <aside className="w-[220px] min-w-[220px] h-screen flex flex-col bg-[var(--mongo-sidebar)] border-r border-[var(--mongo-border)]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[var(--mongo-border)]">
        <div className="w-7 h-7 rounded-md bg-[#00ED64] flex items-center justify-center">
          <Workflow className="size-4 text-[#0F1419]" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white leading-tight">
            Light Gateway
          </span>
          <span className="text-[10px] text-[var(--mongo-text-muted)] leading-tight">
            UIE Studio
          </span>
        </div>
      </div>

      {/* New Workflow Button */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => router.push("/workflows/new/design")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-[#00ED64] text-[#0F1419] hover:bg-[#00D45A] transition-colors"
        >
          <Plus className="size-4" />
          New Workflow
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/" || pathname?.startsWith("/workflows")
              : pathname === item.href;
          return (
            <button
              key={item.id}
              onClick={() => item.href !== "#" && router.push(item.href)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-[var(--mongo-bg-medium)] text-white"
                  : "text-[var(--mongo-text-secondary)] hover:text-[var(--mongo-text-primary)] hover:bg-[var(--mongo-bg-dark)]"
              }`}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && <ChevronRight className="size-3 opacity-50" />}
            </button>
          );
        })}

        {isDesigner && (
          <div className="pt-3 mt-3 border-t border-[var(--mongo-border)]">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm bg-[#00ED64]/10 text-[#00ED64]">
              <Workflow className="size-4 shrink-0" />
              <span>Designer</span>
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-[var(--mongo-border)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ED64]" />
          <span className="text-xs text-[var(--mongo-text-muted)]">
            Gateway Connected
          </span>
        </div>
      </div>
    </aside>
  );
}

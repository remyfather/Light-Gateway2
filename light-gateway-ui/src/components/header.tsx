"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Workflow, Home } from "lucide-react";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const isWorkflowDesigner = pathname?.startsWith("/workflows/") && pathname?.includes("/design");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 w-full items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-xl font-bold hover:opacity-80 transition-opacity"
          >
            <span className="text-amber-500">Light</span>
            <span>Gateway</span>
          </button>
          <nav className="flex items-center gap-4 text-sm">
            <button
              onClick={() => router.push("/")}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                pathname === "/" ? "bg-accent text-accent-foreground" : "hover:bg-accent"
              }`}
            >
              <Home className="size-4" />
              Workflows
            </button>
            {isWorkflowDesigner && (
              <span className="flex items-center gap-2 px-3 py-2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400">
                <Workflow className="size-4" />
                Designer
              </span>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/workflows/new/design")}
          >
            <Workflow className="size-4" />
            New Workflow
          </Button>
        </div>
      </div>
    </header>
  );
}

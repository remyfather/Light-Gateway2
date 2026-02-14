"use client";

import { FileText, Repeat, Plug, GitFork, Merge, Sheet, Inbox, LogOut } from "lucide-react";

export interface PaletteItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  category: "io" | "processing" | "integration";
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: "input",
    label: "Input",
    icon: <Inbox className="size-4" />,
    color: "text-gray-400",
    description: "Workflow entry point",
    category: "io",
  },
  {
    type: "output",
    label: "Output",
    icon: <LogOut className="size-4" />,
    color: "text-gray-400",
    description: "Workflow endpoint",
    category: "io",
  },
  {
    type: "splitter",
    label: "Splitter",
    icon: <GitFork className="size-4" />,
    color: "text-amber-400",
    description: "Fan-out: split batch into individual files",
    category: "processing",
  },
  {
    type: "uie",
    label: "UIE",
    icon: <FileText className="size-4" />,
    color: "text-[#00ED64]",
    description: "Upstage UIE API call + parsing",
    category: "processing",
  },
  {
    type: "merger",
    label: "Merger",
    icon: <Merge className="size-4" />,
    color: "text-rose-400",
    description: "Fan-in: merge parallel results",
    category: "processing",
  },
  {
    type: "transform",
    label: "Transform",
    icon: <Repeat className="size-4" />,
    color: "text-cyan-400",
    description: "Map and reshape data fields",
    category: "processing",
  },
  {
    type: "connector",
    label: "HTTP",
    icon: <Plug className="size-4" />,
    color: "text-violet-400",
    description: "Send results via REST API",
    category: "integration",
  },
  {
    type: "googlesheets",
    label: "Google Sheets",
    icon: <Sheet className="size-4" />,
    color: "text-emerald-400",
    description: "Write results to Google Sheets",
    category: "integration",
  },
];

const CATEGORIES: { key: string; label: string }[] = [
  { key: "io", label: "I/O" },
  { key: "processing", label: "Processing" },
  { key: "integration", label: "Integration" },
];

interface NodePaletteProps {
  onAddNode: (type: string, label: string) => void;
}

export function NodePalette({ onAddNode }: NodePaletteProps) {
  const onDragStart = (e: React.DragEvent, item: PaletteItem) => {
    e.dataTransfer.setData("application/reactflow-type", item.type);
    e.dataTransfer.setData("application/reactflow-label", item.label);
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="space-y-4">
      {CATEGORIES.map((cat) => {
        const items = PALETTE_ITEMS.filter((p) => p.category === cat.key);
        if (items.length === 0) return null;
        return (
          <div key={cat.key}>
            <h4 className="text-[10px] font-medium text-[var(--mongo-text-muted)] uppercase tracking-wider mb-2 px-1">
              {cat.label}
            </h4>
            <div className="space-y-1">
              {items.map((item) => (
                <div
                  key={item.type}
                  draggable
                  onDragStart={(e) => onDragStart(e, item)}
                  onClick={() => onAddNode(item.type, item.label)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-md cursor-grab active:cursor-grabbing hover:bg-[var(--mongo-bg-medium)] transition-colors group border border-transparent hover:border-[var(--mongo-border)]"
                >
                  <div className={`${item.color} shrink-0`}>{item.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--mongo-text-primary)] group-hover:text-white">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-[var(--mongo-text-muted)] truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

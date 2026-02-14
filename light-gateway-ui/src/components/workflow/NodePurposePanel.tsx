"use client";

import { Inbox, LogOut } from "lucide-react";

const NODE_PURPOSES: Record<string, { title: string; desc: string; icon: React.ReactNode; color: string }> = {
  input: {
    title: "Input Node",
    desc: "Workflow entry point. Execution starts here when a document file is uploaded.",
    icon: <Inbox className="size-3.5" />,
    color: "text-[var(--mongo-text-secondary)]",
  },
  output: {
    title: "Output Node",
    desc: "Workflow endpoint. The final parsed/transformed result is returned as the API response from this node.",
    icon: <LogOut className="size-3.5" />,
    color: "text-[var(--mongo-text-secondary)]",
  },
};

interface NodePurposePanelProps {
  nodeType: string;
}

export function NodePurposePanel({ nodeType }: NodePurposePanelProps) {
  const info = NODE_PURPOSES[nodeType];
  if (!info) return null;

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-[var(--mongo-bg-medium)] border border-[var(--mongo-border)]">
        <div className="flex items-center gap-2 mb-2">
          <span className={info.color}>{info.icon}</span>
          <span className="text-sm font-medium text-white">{info.title}</span>
        </div>
        <p className="text-xs text-[var(--mongo-text-secondary)]">{info.desc}</p>
      </div>
      <p className="text-xs text-[var(--mongo-text-muted)]">
        This node requires no configuration.
      </p>
    </div>
  );
}

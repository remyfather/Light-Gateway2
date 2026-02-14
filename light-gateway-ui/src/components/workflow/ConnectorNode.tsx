"use client";

import { Handle, Position } from "@xyflow/react";
import { Plug } from "lucide-react";

export interface ConnectorNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    type?: string;
    url?: string;
    method?: string;
  };
}

export function ConnectorNode({ data }: { data: ConnectorNodeData }) {
  const label = data.label || "Connector Node";
  const hasConfig = !!data.config?.url?.trim();

  return (
    <div
      className={`px-4 py-2.5 rounded-lg border min-w-[160px] shadow-lg transition-all ${
        hasConfig
          ? "border-violet-400/60 bg-[var(--mongo-bg-medium)]"
          : "border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]/80"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-violet-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-violet-400/15 flex items-center justify-center">
          <Plug className="size-3.5 text-violet-400" />
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      {data.config?.url && (
        <p className="text-[11px] text-[var(--mongo-text-muted)] mt-1.5 truncate pl-8" title={data.config.url}>
          {data.config.url}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-violet-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
    </div>
  );
}

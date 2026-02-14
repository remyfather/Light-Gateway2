"use client";

import { Handle, Position } from "@xyflow/react";
import { Merge } from "lucide-react";

export interface MergerNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    strategy?: string;
    groupByKey?: string;
    includeFileMetadata?: boolean;
  };
}

export function MergerNode({ data }: { data: MergerNodeData }) {
  const label = data.label || "Merger";
  const strategy = data.config?.strategy || "array";

  return (
    <div className="px-4 py-2.5 rounded-lg border min-w-[160px] shadow-lg transition-all border-rose-400/60 bg-[var(--mongo-bg-medium)]">
      <Handle type="target" position={Position.Top} className="!bg-rose-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-rose-400/15 flex items-center justify-center">
          <Merge className="size-3.5 text-rose-400" />
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <p className="text-[11px] text-[var(--mongo-text-muted)] mt-1.5 pl-8">
        {strategy}
      </p>
      <Handle type="source" position={Position.Bottom} className="!bg-rose-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
    </div>
  );
}

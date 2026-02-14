"use client";

import { Handle, Position } from "@xyflow/react";
import { GitFork } from "lucide-react";

export interface SplitterNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    maxParallel?: number;
    timeoutSeconds?: number;
  };
}

export function SplitterNode({ data }: { data: SplitterNodeData }) {
  const label = data.label || "Splitter";
  const maxP = data.config?.maxParallel;

  return (
    <div className="px-4 py-2.5 rounded-lg border min-w-[160px] shadow-lg transition-all border-amber-400/60 bg-[var(--mongo-bg-medium)]">
      <Handle type="target" position={Position.Top} className="!bg-amber-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-amber-400/15 flex items-center justify-center">
          <GitFork className="size-3.5 text-amber-400" />
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      {maxP && maxP > 0 && (
        <p className="text-[11px] text-[var(--mongo-text-muted)] mt-1.5 pl-8">
          max {maxP} parallel
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-amber-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
    </div>
  );
}

"use client";

import { Handle, Position } from "@xyflow/react";
import { Repeat } from "lucide-react";

export interface TransformNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    fieldMappings?: { sourceKey: string; targetPath: string }[];
    outputTemplate?: string;
  };
}

export function TransformNode({ data }: { data: TransformNodeData }) {
  const label = data.label || "Transform Node";
  const hasConfig =
    (data.config?.fieldMappings?.length ?? 0) > 0 || !!data.config?.outputTemplate?.trim();

  return (
    <div
      className={`px-4 py-2.5 rounded-lg border min-w-[160px] shadow-lg transition-all ${
        hasConfig
          ? "border-cyan-400/60 bg-[var(--mongo-bg-medium)]"
          : "border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]/80"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-cyan-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-cyan-400/15 flex items-center justify-center">
          <Repeat className="size-3.5 text-cyan-400" />
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-cyan-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
    </div>
  );
}

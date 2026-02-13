"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Repeat } from "lucide-react";

export interface TransformNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    fieldMappings?: { sourceKey: string; targetPath: string }[];
    outputTemplate?: string;
  };
}

export function TransformNode({ data }: NodeProps<TransformNodeData>) {
  const label = data.label || "Transform Node";
  const hasConfig =
    (data.config?.fieldMappings?.length ?? 0) > 0 || !!data.config?.outputTemplate?.trim();

  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 min-w-[140px] ${
        hasConfig ? "border-emerald-500 bg-emerald-50" : "border-emerald-300 bg-emerald-50/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-500" />
      <div className="flex items-center gap-2">
        <Repeat className="size-4 text-emerald-600 shrink-0" />
        <span className="text-sm font-medium text-emerald-900">{label}</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-500" />
    </div>
  );
}

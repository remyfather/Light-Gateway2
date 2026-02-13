"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FileText } from "lucide-react";

export interface UieNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    url?: string;
    documentName?: string;
    version?: string;
    selectedKeys?: string[];
    outputFormat?: string;
    minConfidence?: number;
  };
}

export function UieNode({ data }: NodeProps<UieNodeData>) {
  const label = data.label || "UIE Node";
  const hasConfig = data.config?.url;

  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 min-w-[140px] ${
        hasConfig
          ? "border-amber-500 bg-amber-50"
          : "border-amber-300 bg-amber-50/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-amber-500" />
      <div className="flex items-center gap-2">
        <FileText className="size-4 text-amber-600 shrink-0" />
        <span className="text-sm font-medium text-amber-900">{label}</span>
      </div>
      {data.config?.documentName && (
        <p className="text-xs text-amber-700 mt-1 truncate">
          {data.config.documentName}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-amber-500" />
    </div>
  );
}

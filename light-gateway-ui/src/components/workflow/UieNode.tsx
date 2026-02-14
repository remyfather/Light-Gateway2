"use client";

import { Handle, Position } from "@xyflow/react";
import { FileText } from "lucide-react";

export interface UieNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    url?: string;
    documentName?: string;
    version?: string;
    selectedKeys?: string[];
    outputFormat?: string;
    keyMappings?: Record<string, string>;
    minConfidence?: number;
  };
}

export function UieNode({ data }: { data: UieNodeData }) {
  const label = data.label || "UIE Node";
  const hasConfig = data.config?.url;

  return (
    <div
      className={`px-4 py-2.5 rounded-lg border min-w-[160px] shadow-lg transition-all ${
        hasConfig
          ? "border-[#00ED64]/60 bg-[var(--mongo-bg-medium)]"
          : "border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]/80"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-[#00ED64] !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-[#00ED64]/15 flex items-center justify-center">
          <FileText className="size-3.5 text-[#00ED64]" />
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      {data.config?.documentName && (
        <p className="text-[11px] text-[var(--mongo-text-muted)] mt-1.5 truncate pl-8">
          {data.config.documentName}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-[#00ED64] !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
    </div>
  );
}

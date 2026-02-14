"use client";

import { Handle, Position } from "@xyflow/react";
import { Sheet } from "lucide-react";

export interface GoogleSheetsNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    webhookUrl?: string;
    sheetName?: string;
    columnKeys?: string[];
    includeHeader?: boolean;
  };
}

export function GoogleSheetsNode({ data }: { data: GoogleSheetsNodeData }) {
  const label = data.label || "Google Sheets";
  const hasConfig = !!data.config?.webhookUrl?.trim();

  return (
    <div
      className={`px-4 py-2.5 rounded-lg border min-w-[160px] shadow-lg transition-all ${
        hasConfig
          ? "border-emerald-400/60 bg-[var(--mongo-bg-medium)]"
          : "border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]/80"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-emerald-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded bg-emerald-400/15 flex items-center justify-center">
          <Sheet className="size-3.5 text-emerald-400" />
        </div>
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      {data.config?.sheetName && (
        <p className="text-[11px] text-[var(--mongo-text-muted)] mt-1.5 truncate pl-8">
          {data.config.sheetName}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-emerald-400 !w-2.5 !h-2.5 !border-2 !border-[var(--mongo-bg-darkest)]" />
    </div>
  );
}

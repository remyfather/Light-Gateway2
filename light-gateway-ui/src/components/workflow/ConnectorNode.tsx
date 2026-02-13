"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Plug } from "lucide-react";

export interface ConnectorNodeData extends Record<string, unknown> {
  label?: string;
  config?: {
    type?: string;
    url?: string;
    method?: string;
  };
}

export function ConnectorNode({ data }: NodeProps<ConnectorNodeData>) {
  const label = data.label || "Connector Node";
  const hasConfig = !!data.config?.url?.trim();

  return (
    <div
      className={`px-4 py-2 rounded-lg border-2 min-w-[140px] ${
        hasConfig ? "border-violet-500 bg-violet-50" : "border-violet-300 bg-violet-50/50"
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-violet-500" />
      <div className="flex items-center gap-2">
        <Plug className="size-4 text-violet-600 shrink-0" />
        <span className="text-sm font-medium text-violet-900">{label}</span>
      </div>
      {data.config?.url && (
        <p className="text-xs text-violet-700 mt-1 truncate" title={data.config.url}>
          {data.config.url}
        </p>
      )}
      <Handle type="source" position={Position.Bottom} className="!bg-violet-500" />
    </div>
  );
}

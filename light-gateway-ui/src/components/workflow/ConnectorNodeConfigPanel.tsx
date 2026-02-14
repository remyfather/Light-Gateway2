"use client";

import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConnectorNodeData } from "./ConnectorNode";
import { Plug } from "lucide-react";

interface ConnectorNodeConfigPanelProps {
  node: Node<ConnectorNodeData>;
  onUpdate: (nodeId: string, data: Partial<ConnectorNodeData>) => void;
}

export function ConnectorNodeConfigPanel({ node, onUpdate }: ConnectorNodeConfigPanelProps) {
  const data = node.data;
  const config = data.config || {};

  const handleChange = (field: string, value: unknown) => {
    if (field === "label") {
      onUpdate(node.id, { ...data, label: value as string });
    } else {
      onUpdate(node.id, {
        ...data,
        config: { ...config, [field]: value },
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Purpose Banner */}
      <div className="p-3 rounded-lg bg-violet-400/5 border border-violet-400/20">
        <div className="flex items-center gap-2 mb-1">
          <Plug className="size-3.5 text-violet-400" />
          <span className="text-xs font-medium text-violet-400">Purpose</span>
        </div>
        <p className="text-xs text-[var(--mongo-text-secondary)]">
          Sends processed results to external systems via HTTP REST API (POST/PUT JSON body).
        </p>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Connector Node"
        />
      </div>

      {/* URL */}
      <div className="space-y-1.5">
        <Label>URL *</Label>
        <Input
          value={config.url || ""}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://api.example.com/ingest"
          className="font-mono text-xs"
        />
      </div>

      {/* Method */}
      <div className="space-y-1.5">
        <Label>Method</Label>
        <select
          value={config.method || "POST"}
          onChange={(e) => handleChange("method", e.target.value)}
          className="w-full h-9 rounded-md border border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)] px-3 text-sm text-[var(--mongo-text-primary)] focus:outline-none focus:border-[#00ED64]/50"
        >
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
    </div>
  );
}

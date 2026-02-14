"use client";

import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SplitterNodeData } from "./SplitterNode";
import { GitFork } from "lucide-react";

interface SplitterNodeConfigPanelProps {
  node: Node<SplitterNodeData>;
  onUpdate: (nodeId: string, data: Partial<SplitterNodeData>) => void;
}

export function SplitterNodeConfigPanel({ node, onUpdate }: SplitterNodeConfigPanelProps) {
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
      <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/20">
        <div className="flex items-center gap-2 mb-1">
          <GitFork className="size-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-400">Fan-Out</span>
        </div>
        <p className="text-xs text-[var(--mongo-text-secondary)]">
          Splits batch input into individual files and routes each to the connected UIE node for parallel processing.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Splitter"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Max Parallel (0 = unlimited)</Label>
        <Input
          type="number"
          min={0}
          value={config.maxParallel ?? ""}
          onChange={(e) => handleChange("maxParallel", e.target.value ? Number(e.target.value) : undefined)}
          placeholder="0"
        />
        <p className="text-[10px] text-[var(--mongo-text-muted)]">
          Limits concurrent UIE API calls. 0 or empty means process all files simultaneously.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Timeout (seconds)</Label>
        <Input
          type="number"
          min={1}
          value={config.timeoutSeconds ?? ""}
          onChange={(e) => handleChange("timeoutSeconds", e.target.value ? Number(e.target.value) : undefined)}
          placeholder="60"
        />
      </div>
    </div>
  );
}

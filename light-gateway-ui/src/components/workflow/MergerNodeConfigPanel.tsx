"use client";

import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MergerNodeData } from "./MergerNode";
import { Merge } from "lucide-react";

const MERGE_STRATEGIES = [
  { value: "array", label: "Array (all items in a list)" },
  { value: "flat_merge", label: "Flat Merge (merge all keys)" },
  { value: "grouped", label: "Grouped (group by key)" },
] as const;

interface MergerNodeConfigPanelProps {
  node: Node<MergerNodeData>;
  onUpdate: (nodeId: string, data: Partial<MergerNodeData>) => void;
}

export function MergerNodeConfigPanel({ node, onUpdate }: MergerNodeConfigPanelProps) {
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
      <div className="p-3 rounded-lg bg-rose-400/5 border border-rose-400/20">
        <div className="flex items-center gap-2 mb-1">
          <Merge className="size-3.5 text-rose-400" />
          <span className="text-xs font-medium text-rose-400">Fan-In</span>
        </div>
        <p className="text-xs text-[var(--mongo-text-secondary)]">
          Collects parallel UIE results and merges them into a single output using the selected strategy.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Merger"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Merge Strategy</Label>
        <select
          value={config.strategy || "array"}
          onChange={(e) => handleChange("strategy", e.target.value)}
          className="w-full h-9 rounded-md border border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)] px-3 text-sm text-[var(--mongo-text-primary)] focus:outline-none focus:border-[#00ED64]/50"
        >
          {MERGE_STRATEGIES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {config.strategy === "grouped" && (
        <div className="space-y-1.5">
          <Label>Group By Key</Label>
          <Input
            value={config.groupByKey || ""}
            onChange={(e) => handleChange("groupByKey", e.target.value)}
            placeholder="_fileName"
            className="font-mono text-xs"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Include File Metadata</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.includeFileMetadata !== false}
            onChange={(e) => handleChange("includeFileMetadata", e.target.checked)}
            className="w-4 h-4 rounded border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)] text-[#00ED64] focus:ring-[#00ED64]/50"
          />
          <span className="text-xs text-[var(--mongo-text-secondary)]">
            Add _fileName and _fileIndex to each result
          </span>
        </label>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef } from "react";
import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TransformNodeData } from "./TransformNode";
import type { FieldMapping } from "@/lib/api";
import * as api from "@/lib/api";
import { Play, Upload, Map, Repeat } from "lucide-react";
import { TransformMappingModal } from "./TransformMappingModal";

interface SourceItem {
  key: string;
  value: string;
}

interface TransformNodeConfigPanelProps {
  node: Node<TransformNodeData>;
  onUpdate: (nodeId: string, data: Partial<TransformNodeData>) => void;
  workflowId: string | null;
}

export function TransformNodeConfigPanel({
  node,
  onUpdate,
  workflowId,
}: TransformNodeConfigPanelProps) {
  const data = node.data;
  const config = data.config || {};
  const [sourceItems, setSourceItems] = useState<SourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fieldMappings = config.fieldMappings || [];

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

  const extractSourceItems = (result: Record<string, unknown>): SourceItem[] => {
    if (result.fields && Array.isArray(result.fields)) {
      return (result.fields as Array<{ key?: string; value?: string; refinedValue?: string }>)
        .filter((f) => f.key)
        .map((f) => ({
          key: String(f.key),
          value: String(f.refinedValue ?? f.value ?? ""),
        }));
    }
    return Object.entries(result)
      .filter(([k]) => k !== "fields" && (typeof result[k] === "string" || typeof result[k] === "number"))
      .map(([key, value]) => ({ key, value: String(value) }));
  };

  const handlePreview = async () => {
    if (!workflowId || !fileRef.current?.files?.[0]) {
      setError("Save workflow first, then select a file.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.previewWorkflow(workflowId, fileRef.current.files[0]);
      setSourceItems(extractSourceItems(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
      setSourceItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Purpose Banner */}
      <div className="p-3 rounded-lg bg-cyan-400/5 border border-cyan-400/20">
        <div className="flex items-center gap-2 mb-1">
          <Repeat className="size-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-cyan-400">Purpose</span>
        </div>
        <p className="text-xs text-[var(--mongo-text-secondary)]">
          Maps UIE output to enterprise schema. Drag Source to Target. Default target matches source keys.
        </p>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Transform Node"
        />
      </div>

      {/* Source Load (Preview) */}
      <div className="pt-3 border-t border-[var(--mongo-border)]">
        <Label>Load Source (Preview)</Label>
        <div className="flex gap-2 mt-2 items-center flex-wrap">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
          />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="size-4" />
            File
          </Button>
          <Button size="sm" onClick={handlePreview} disabled={loading || !workflowId || !fileName}>
            <Play className="size-4" />
            {loading ? "Running..." : "Preview"}
          </Button>
          {fileName && (
            <span className="text-xs text-[var(--mongo-text-muted)] truncate max-w-[120px]">
              {fileName}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>

      {/* Mapping Editor */}
      <div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setModalOpen(true)}
          disabled={sourceItems.length === 0}
        >
          <Map className="size-4" />
          Edit Mapping {fieldMappings.length > 0 && `(${fieldMappings.length})`}
        </Button>
      </div>

      <TransformMappingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        sourceItems={sourceItems}
        fieldMappings={fieldMappings}
        onSave={(mappings) => handleChange("fieldMappings", mappings)}
      />
    </div>
  );
}

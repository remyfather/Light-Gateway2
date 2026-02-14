"use client";

import { useState, useRef } from "react";
import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { UieNodeData } from "./UieNode";
import * as api from "@/lib/api";
import { Play, Upload, FileText } from "lucide-react";

const OUTPUT_FORMATS = [
  { value: "flat_keyvalue", label: "Flat key-value (Transform/Connector)" },
  { value: "fields_only", label: "Fields only" },
  { value: "full", label: "Full (Raw)" },
] as const;

interface UieNodeConfigPanelProps {
  node: Node<UieNodeData>;
  onUpdate: (nodeId: string, data: Partial<UieNodeData>) => void;
  workflowId: string | null;
}

export function UieNodeConfigPanel({ node, onUpdate, workflowId }: UieNodeConfigPanelProps) {
  const data = node.data;
  const config = data.config || {};
  const [previewResult, setPreviewResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: unknown) => {
    if (field === "label") {
      onUpdate(node.id, { ...data, label: value as string });
    } else {
      onUpdate(node.id, {
        ...data,
        config: { ...config, [field]: value },
      });
    }
    if (field === "outputFormat" || field === "selectedKeys" || field === "keyMappings" || field === "minConfidence") {
      setPreviewResult(null);
    }
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
      setPreviewResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Preview failed");
      setPreviewResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeysChange = (val: string) => {
    const keys = val.split(",").map((k) => k.trim()).filter(Boolean);
    handleChange("selectedKeys", keys);
  };

  return (
    <div className="space-y-5">
      {/* Purpose Banner */}
      <div className="p-3 rounded-lg bg-[#00ED64]/5 border border-[#00ED64]/20">
        <div className="flex items-center gap-2 mb-1">
          <FileText className="size-3.5 text-[#00ED64]" />
          <span className="text-xs font-medium text-[#00ED64]">Purpose</span>
        </div>
        <p className="text-xs text-[var(--mongo-text-secondary)]">
          UIE API call + parsing. Extracts information from documents and passes flat_keyvalue to next node.
        </p>
      </div>

      {/* Label */}
      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="UIE Node"
        />
      </div>

      {/* API URL */}
      <div className="space-y-1.5">
        <Label>API URL *</Label>
        <Input
          value={config.url || ""}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://ews.ebs.instage.ai/api/ocr/..."
          className="font-mono text-xs"
        />
      </div>

      {/* Document Name */}
      <div className="space-y-1.5">
        <Label>Document Name</Label>
        <Input
          value={config.documentName || ""}
          onChange={(e) => handleChange("documentName", e.target.value)}
          placeholder="세금계산서 추출"
        />
      </div>

      {/* Version */}
      <div className="space-y-1.5">
        <Label>Version</Label>
        <Input
          value={config.version || ""}
          onChange={(e) => handleChange("version", e.target.value)}
          placeholder="1.0"
        />
      </div>

      {/* Output Format */}
      <div className="space-y-1.5">
        <Label>Output Format</Label>
        <select
          value={config.outputFormat || "flat_keyvalue"}
          onChange={(e) => handleChange("outputFormat", e.target.value)}
          className="w-full h-9 rounded-md border border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)] px-3 text-sm text-[var(--mongo-text-primary)] focus:outline-none focus:border-[#00ED64]/50"
        >
          {OUTPUT_FORMATS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Selected Keys */}
      <div className="space-y-1.5">
        <Label>Selected Keys (comma-separated)</Label>
        <Input
          value={(config.selectedKeys || []).join(", ")}
          onChange={(e) => handleKeysChange(e.target.value)}
          placeholder="cpu_core, memory_gb, ..."
          className="font-mono text-xs"
        />
      </div>

      {/* Min Confidence */}
      <div className="space-y-1.5">
        <Label>Min Confidence (0~1)</Label>
        <Input
          type="number"
          min={0}
          max={1}
          step={0.1}
          value={config.minConfidence ?? ""}
          onChange={(e) => handleChange("minConfidence", e.target.value ? Number(e.target.value) : undefined)}
          placeholder="0.5"
        />
      </div>

      {/* Preview */}
      <div className="pt-3 border-t border-[var(--mongo-border)]">
        <Label>Preview</Label>
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
        {previewResult && (
          <pre className="mt-3 p-3 rounded-lg bg-[var(--mongo-bg-darkest)] border border-[var(--mongo-border)] text-[#00ED64] text-xs overflow-auto max-h-48 font-mono">
            {JSON.stringify(previewResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

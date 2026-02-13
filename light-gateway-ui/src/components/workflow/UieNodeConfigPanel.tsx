"use client";

import { useState, useRef } from "react";
import { Node } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { UieNodeData } from "./UieNode";
import * as api from "@/lib/api";
import { Play, Upload } from "lucide-react";

const OUTPUT_FORMATS = [
  { value: "flat_keyvalue", label: "Flat key-value (Transform/Connector용)" },
  { value: "fields_only", label: "Fields only" },
  { value: "full", label: "Full (원본)" },
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
      setError("저장 후 파일을 선택하세요.");
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">UIE Node 설정</CardTitle>
        <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900">
          <p className="font-medium">목적</p>
          <p className="mt-0.5">
            UIE API 호출 + 파싱. 문서에서 정보 추출 후 flat_keyvalue 등으로 변환해 다음 노드로 전달합니다.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>라벨</Label>
          <Input
            value={data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            placeholder="UIE Node"
            className="mt-1"
          />
        </div>
        <div>
          <Label>API URL *</Label>
          <Input
            value={config.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://ews.ebs.instage.ai/api/ocr/information-extract/deployed"
            className="mt-1 font-mono text-xs"
          />
        </div>
        <div>
          <Label>Document Name</Label>
          <Input
            value={config.documentName || ""}
            onChange={(e) => handleChange("documentName", e.target.value)}
            placeholder="세금계산서 추출"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Version</Label>
          <Input
            value={config.version || ""}
            onChange={(e) => handleChange("version", e.target.value)}
            placeholder="1.0"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Output Format</Label>
          <select
            value={config.outputFormat || "flat_keyvalue"}
            onChange={(e) => handleChange("outputFormat", e.target.value)}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            {OUTPUT_FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Selected Keys (쉼표 구분, 비워두면 전체)</Label>
          <Input
            value={(config.selectedKeys || []).join(", ")}
            onChange={(e) => handleKeysChange(e.target.value)}
            placeholder="cpu_core, memory_gb, ..."
            className="mt-1 font-mono text-sm"
          />
        </div>
        <div>
          <Label>Min Confidence (0~1)</Label>
          <Input
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={config.minConfidence ?? ""}
            onChange={(e) => handleChange("minConfidence", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="0.5"
            className="mt-1"
          />
        </div>
        <div className="pt-2 border-t">
          <Label>미리보기</Label>
          <div className="flex gap-2 mt-1 items-center flex-wrap">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" />
              파일
            </Button>
            <Button size="sm" onClick={handlePreview} disabled={loading || !workflowId || !fileName}>
              <Play className="size-4" />
              {loading ? "실행 중..." : "미리보기"}
            </Button>
            {fileName && <span className="text-xs text-gray-500 truncate max-w-[120px]">{fileName}</span>}
          </div>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          {previewResult && (
            <pre className="mt-2 p-3 rounded bg-gray-900 text-gray-100 text-xs overflow-auto max-h-48">
              {JSON.stringify(previewResult, null, 2)}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

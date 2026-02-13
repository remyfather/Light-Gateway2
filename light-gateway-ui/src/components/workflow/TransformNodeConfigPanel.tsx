"use client";

import { useState, useRef } from "react";
import { Node } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { TransformNodeData } from "./TransformNode";
import type { FieldMapping } from "@/lib/api";
import * as api from "@/lib/api";
import { Play, Upload, Map } from "lucide-react";
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
      setError("저장 후 파일을 선택하세요.");
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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Transform Node</CardTitle>
        <div className="mt-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-900">
          <p className="font-medium">목적</p>
          <p className="mt-0.5">
            UIE 출력을 기업 스키마로 매핑. Source → Target 드래그앤드롭. 기본값은 Source와 동일.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>라벨</Label>
          <Input
            value={data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            placeholder="Transform Node"
            className="mt-1"
          />
        </div>
        <div className="pt-2 border-t">
          <Label>Source 로드 (미리보기)</Label>
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
        </div>
        <div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setModalOpen(true)}
            disabled={sourceItems.length === 0}
          >
            <Map className="size-4" />
            매핑 편집 {fieldMappings.length > 0 && `(${fieldMappings.length}개)`}
          </Button>
        </div>
      </CardContent>
      <TransformMappingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        sourceItems={sourceItems}
        fieldMappings={fieldMappings}
        onSave={(mappings) => handleChange("fieldMappings", mappings)}
      />
    </Card>
  );
}

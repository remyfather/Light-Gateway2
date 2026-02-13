"use client";

import { Node } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ConnectorNodeData } from "./ConnectorNode";

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
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Connector Node 설정</CardTitle>
        <div className="mt-2 p-3 rounded-lg bg-violet-50 border border-violet-200 text-sm text-violet-900">
          <p className="font-medium">목적</p>
          <p className="mt-0.5">
            가공된 결과를 외부 시스템으로 전송합니다. HTTP REST API로 JSON 본문을 POST/PUT 합니다.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div>
          <Label>라벨</Label>
          <Input
            value={data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            placeholder="Connector Node"
            className="mt-1"
          />
        </div>
        <div>
          <Label>URL *</Label>
          <Input
            value={config.url || ""}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://api.example.com/ingest"
            className="mt-1 font-mono text-xs"
          />
        </div>
        <div>
          <Label>Method</Label>
          <select
            value={config.method || "POST"}
            onChange={(e) => handleChange("method", e.target.value)}
            className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
          </select>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { Node } from "@xyflow/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GoogleSheetsNodeData } from "./GoogleSheetsNode";
import { Sheet } from "lucide-react";

interface GoogleSheetsNodeConfigPanelProps {
  node: Node<GoogleSheetsNodeData>;
  onUpdate: (nodeId: string, data: Partial<GoogleSheetsNodeData>) => void;
}

export function GoogleSheetsNodeConfigPanel({ node, onUpdate }: GoogleSheetsNodeConfigPanelProps) {
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

  const handleColumnKeysChange = (val: string) => {
    const keys = val.split(",").map((k) => k.trim()).filter(Boolean);
    handleChange("columnKeys", keys);
  };

  return (
    <div className="space-y-5">
      <div className="p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/20">
        <div className="flex items-center gap-2 mb-1">
          <Sheet className="size-3.5 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400">Google Sheets</span>
        </div>
        <p className="text-xs text-[var(--mongo-text-secondary)]">
          Sends processed results to a Google Sheet via Apps Script webhook. Each merged row becomes a spreadsheet row.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Label</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => handleChange("label", e.target.value)}
          placeholder="Google Sheets"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Webhook URL *</Label>
        <Input
          value={config.webhookUrl || ""}
          onChange={(e) => handleChange("webhookUrl", e.target.value)}
          placeholder="https://script.google.com/macros/s/..."
          className="font-mono text-xs"
        />
        <p className="text-[10px] text-[var(--mongo-text-muted)]">
          Google Apps Script Web App URL (deployed as &quot;Execute as me&quot;)
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Sheet Name</Label>
        <Input
          value={config.sheetName || ""}
          onChange={(e) => handleChange("sheetName", e.target.value)}
          placeholder="Sheet1"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Column Keys (comma-separated)</Label>
        <Input
          value={(config.columnKeys || []).join(", ")}
          onChange={(e) => handleColumnKeysChange(e.target.value)}
          placeholder="invoice_no, date, total_amount"
          className="font-mono text-xs"
        />
        <p className="text-[10px] text-[var(--mongo-text-muted)]">
          Keys from UIE results to map as spreadsheet columns. Order determines column order.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Include Header Row</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.includeHeader !== false}
            onChange={(e) => handleChange("includeHeader", e.target.checked)}
            className="w-4 h-4 rounded border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)] text-[#00ED64] focus:ring-[#00ED64]/50"
          />
          <span className="text-xs text-[var(--mongo-text-secondary)]">
            Add column key names as the first row
          </span>
        </label>
      </div>
    </div>
  );
}

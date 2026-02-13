"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FieldMapping } from "@/lib/api";
import { Plus, X } from "lucide-react";

interface SourceItem {
  key: string;
  value: string;
}

interface TransformMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceItems: SourceItem[];
  fieldMappings: FieldMapping[];
  onSave: (mappings: FieldMapping[]) => void;
}

export function TransformMappingModal({
  open,
  onOpenChange,
  sourceItems,
  fieldMappings,
  onSave,
}: TransformMappingModalProps) {
  const [targetPaths, setTargetPaths] = useState<string[]>([]);
  const [mappings, setMappings] = useState<FieldMapping[]>([]);

  useEffect(() => {
    if (open) {
      if (fieldMappings.length > 0) {
        setTargetPaths(fieldMappings.map((m) => m.targetPath));
        setMappings([...fieldMappings]);
      } else if (sourceItems.length > 0) {
        const paths = sourceItems.map((s) => s.key);
        setTargetPaths(paths);
        setMappings(sourceItems.map((s) => ({ sourceKey: s.key, targetPath: s.key })));
      } else {
        setTargetPaths([]);
        setMappings([]);
      }
    }
  }, [open, fieldMappings, sourceItems]);

  const initFromSource = () => {
    const paths = sourceItems.map((s) => s.key);
    setTargetPaths(paths);
    setMappings(sourceItems.map((s) => ({ sourceKey: s.key, targetPath: s.key })));
  };

  const addMapping = (sourceKey: string, targetPath: string) => {
    setMappings((prev) => {
      const filtered = prev.filter((m) => m.targetPath !== targetPath);
      return [...filtered, { sourceKey, targetPath }];
    });
  };

  const removeMapping = (targetPath: string) => {
    setMappings((prev) => prev.filter((m) => m.targetPath !== targetPath));
    setTargetPaths((prev) => prev.filter((p) => p !== targetPath));
  };

  const addTargetPath = (path: string) => {
    if (!path.trim()) return;
    setTargetPaths((prev) => (prev.includes(path) ? prev : [...prev, path]));
  };

  const updateTargetPath = (oldPath: string, newPath: string) => {
    if (!newPath.trim()) return;
    setTargetPaths((prev) => prev.map((p) => (p === oldPath ? newPath : p)));
    setMappings((prev) =>
      prev.map((m) => (m.targetPath === oldPath ? { ...m, targetPath: newPath } : m))
    );
  };

  const getMappedSource = (targetPath: string) =>
    mappings.find((m) => m.targetPath === targetPath)?.sourceKey;

  const onDragStart = (e: React.DragEvent, sourceKey: string) => {
    e.dataTransfer.setData("sourceKey", sourceKey);
    e.dataTransfer.effectAllowed = "copy";
  };

  const onDrop = (e: React.DragEvent, targetPath: string) => {
    e.preventDefault();
    const sourceKey = e.dataTransfer.getData("sourceKey");
    if (sourceKey) addMapping(sourceKey, targetPath);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleSave = () => {
    onSave(mappings);
    onOpenChange(false);
  };

  const [newPath, setNewPath] = useState("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader>
        <DialogTitle>Source ↔ Target 매핑</DialogTitle>
      </DialogHeader>
      <DialogContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Source (UIE 결과)</h3>
            <div className="rounded-lg border bg-gray-50 p-3 max-h-64 overflow-auto space-y-2">
              {sourceItems.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">미리보기 실행 후 표시</p>
              ) : (
                sourceItems.map((item) => (
                  <div
                    key={item.key}
                    draggable
                    onDragStart={(e) => onDragStart(e, item.key)}
                    className="flex items-center gap-2 px-3 py-2 rounded bg-white border cursor-grab active:cursor-grabbing text-sm hover:bg-emerald-50"
                  >
                    <span className="font-mono flex-1 truncate">{item.key}</span>
                    <span className="text-gray-500 text-xs truncate max-w-[100px]">{item.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Target (편집 가능)</h3>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPath}
                onChange={(e) => setNewPath(e.target.value)}
                placeholder="spec.cpu"
                className="flex-1 font-mono text-sm"
                onKeyDown={(e) => e.key === "Enter" && (addTargetPath(newPath), setNewPath(""))}
              />
              <Button variant="outline" size="sm" onClick={() => (addTargetPath(newPath), setNewPath(""))}>
                <Plus className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={initFromSource}>
                Source와 동일
              </Button>
            </div>
            <div className="rounded-lg border bg-gray-50 p-3 max-h-64 overflow-auto space-y-2">
              {targetPaths.map((path) => (
                <div
                  key={path}
                  onDrop={(e) => onDrop(e, path)}
                  onDragOver={onDragOver}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${
                    getMappedSource(path)
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-white border border-dashed"
                  }`}
                >
                  <Input
                    value={path}
                    onChange={(e) => updateTargetPath(path, e.target.value)}
                    className="flex-1 font-mono text-sm h-8"
                  />
                  <span className="text-xs text-gray-500 shrink-0 w-20 truncate">
                    ← {getMappedSource(path) || "드롭"}
                  </span>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeMapping(path)}>
                    <X className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          취소
        </Button>
        <Button onClick={handleSave}>저장</Button>
      </DialogFooter>
    </Dialog>
  );
}

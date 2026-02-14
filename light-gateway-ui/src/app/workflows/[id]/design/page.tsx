"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeProps,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Save, Play, X } from "lucide-react";
import { UieNode } from "@/components/workflow/UieNode";
import { UieNodeConfigPanel } from "@/components/workflow/UieNodeConfigPanel";
import type { UieNodeData } from "@/components/workflow/UieNode";
import { TransformNode } from "@/components/workflow/TransformNode";
import { TransformNodeConfigPanel } from "@/components/workflow/TransformNodeConfigPanel";
import type { TransformNodeData } from "@/components/workflow/TransformNode";
import { ConnectorNode } from "@/components/workflow/ConnectorNode";
import { ConnectorNodeConfigPanel } from "@/components/workflow/ConnectorNodeConfigPanel";
import type { ConnectorNodeData } from "@/components/workflow/ConnectorNode";
import { NodePurposePanel } from "@/components/workflow/NodePurposePanel";
import * as api from "@/lib/api";

const nodeTypes = {
  uie: UieNode as React.ComponentType<NodeProps>,
  transform: TransformNode as React.ComponentType<NodeProps>,
  connector: ConnectorNode as React.ComponentType<NodeProps>,
};

const initialNodes: Node[] = [
  { id: "1", type: "input", data: { label: "Input" }, position: { x: 250, y: 0 } },
  {
    id: "2",
    type: "uie",
    data: {
      label: "UIE Node",
      config: {
        url: "https://ews.ebs.instage.ai/api/ocr/information-extract/deployed",
        documentName: "세금계산서 추출",
        version: "1.0",
        outputFormat: "flat_keyvalue",
      },
    },
    position: { x: 250, y: 80 },
  },
  {
    id: "3",
    type: "transform",
    data: {
      label: "Transform Node",
      config: { fieldMappings: [] },
    },
    position: { x: 250, y: 160 },
  },
  {
    id: "4",
    type: "connector",
    data: {
      label: "Connector Node",
      config: { type: "http", url: "", method: "POST" },
    },
    position: { x: 250, y: 240 },
  },
  { id: "5", type: "output", data: { label: "Output" }, position: { x: 250, y: 320 } },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-4", source: "3", target: "4" },
  { id: "e4-5", source: "4", target: "5" },
];

function toApiWorkflow(
  name: string,
  nodes: Node[],
  edges: Edge[]
): api.Workflow {
  const typeMap = (t: string) => {
    if (t === "input") return "input";
    if (t === "output") return "output";
    if (t === "transform") return "transform";
    if (t === "connector") return "connector";
    return "uie";
  };
  return {
    name,
    nodes: nodes.map((n) => {
      const base = {
        id: n.id,
        type: typeMap(n.type || "uie") as api.WorkflowNode["type"],
        label: (n.data as { label?: string }).label,
        positionX: n.position.x,
        positionY: n.position.y,
      };
      if (n.type === "uie") {
        const d = n.data as UieNodeData;
        return {
          ...base,
          config: {
            url: d.config?.url || "",
            method: "POST",
            formFields: {
              ...(d.config?.documentName && { documentName: d.config.documentName }),
              ...(d.config?.version && { version: d.config.version }),
            },
            fileFieldName: "file",
            selectedKeys: d.config?.selectedKeys || [],
            outputFormat: d.config?.outputFormat || "flat_keyvalue",
            keyMappings: d.config?.keyMappings,
            minConfidence: d.config?.minConfidence,
          },
        };
      }
      if (n.type === "transform") {
        const d = n.data as TransformNodeData;
        return {
          ...base,
          config: d.config
            ? {
                fieldMappings: d.config.fieldMappings,
                outputTemplate: d.config.outputTemplate,
              }
            : undefined,
        };
      }
      if (n.type === "connector") {
        const d = n.data as ConnectorNodeData;
        return {
          ...base,
          config: d.config
            ? {
                type: d.config.type || "http",
                url: d.config.url,
                method: d.config.method || "POST",
              }
            : undefined,
        };
      }
      return { ...base, config: undefined };
    }),
    edges: edges.map((e) => ({
      id: e.id,
      sourceNodeId: e.source,
      targetNodeId: e.target,
    })),
  };
}

function fromApiWorkflow(w: api.Workflow): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = (w.nodes || []).map((n) => {
    const pos = { x: n.positionX, y: n.positionY };
    if (n.type === "uie") {
      const c = n.config as api.UieNodeConfig;
      return {
        id: n.id,
        type: "uie",
        data: {
          label: n.label,
          config: {
            url: c?.url,
            documentName: c?.formFields?.documentName,
            version: c?.formFields?.version,
            selectedKeys: c?.selectedKeys,
            outputFormat: c?.outputFormat,
            keyMappings: c?.keyMappings,
            minConfidence: c?.minConfidence,
          },
        },
        position: pos,
      };
    }
    if (n.type === "transform") {
      const c = n.config as api.TransformNodeConfig;
      return {
        id: n.id,
        type: "transform",
        data: {
          label: n.label,
          config: c
            ? { fieldMappings: c.fieldMappings, outputTemplate: c.outputTemplate }
            : undefined,
        },
        position: pos,
      };
    }
    if (n.type === "connector") {
      const c = n.config as api.ConnectorNodeConfig;
      return {
        id: n.id,
        type: "connector",
        data: {
          label: n.label,
          config: c
            ? { type: c.type, url: c.url, method: c.method }
            : undefined,
        },
        position: pos,
      };
    }
    return {
      id: n.id,
      type: n.type || "input",
      data: { label: n.label },
      position: pos,
    };
  });
  const edges: Edge[] = (w.edges || []).map((e) => ({
    id: e.id,
    source: e.sourceNodeId,
    target: e.targetNodeId,
  }));
  return { nodes, edges };
}

export default function WorkflowDesignPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const isNew = workflowId === "new";

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState("새 워크플로우");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : workflowId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isNew && workflowId) {
      api
        .getWorkflow(workflowId)
        .then((w) => {
          const { nodes: n, edges: e } = fromApiWorkflow(w);
          setNodes(n);
          setEdges(e);
          setWorkflowName(w.name || workflowId);
        })
        .catch(() => {});
    }
  }, [workflowId, isNew, setNodes, setEdges]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const w = toApiWorkflow(workflowName, nodes, edges);
      if (savedId) {
        await api.updateWorkflow(savedId, { ...w, id: savedId });
      } else {
        const saved = await api.saveWorkflow(w);
        setSavedId(saved.id || null);
        if (saved.id && isNew) {
          router.replace(`/workflows/${saved.id}/design`);
        }
      }
    } catch (e) {
      alert("저장 실패: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setSaving(false);
    }
  };

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (["input", "uie", "transform", "connector", "output"].includes(node.type || "")) {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

  const handlePaneClick = useCallback(() => setSelectedNode(null), []);

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Partial<UieNodeData | TransformNodeData | ConnectorNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...data } });
      }
    },
    [setNodes, selectedNode]
  );

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Designer Toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-[var(--mongo-text-secondary)] hover:text-white hover:bg-[var(--mongo-bg-medium)] transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <div className="w-px h-6 bg-[var(--mongo-border)]" />
            <span className="text-sm text-[var(--mongo-text-secondary)]">
              {isNew ? "New Workflow" : workflowName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm border border-[var(--mongo-border)] text-[var(--mongo-text-primary)] hover:bg-[var(--mongo-bg-medium)] transition-colors disabled:opacity-50"
            >
              <Save className="size-4" />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              disabled={!savedId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#00ED64] text-[#0F1419] hover:bg-[#00D45A] transition-colors disabled:opacity-30"
            >
              <Play className="size-4" />
              Deploy
            </button>
          </div>
        </div>

        {/* Canvas + Config Panel */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange as OnNodesChange}
              onEdgesChange={onEdgesChange as OnEdgesChange}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              nodeTypes={nodeTypes}
              fitView
              className="!bg-[var(--mongo-bg-darkest)]"
            >
              <Background color="var(--mongo-border)" gap={20} size={1} />
              <Controls />
              <MiniMap
                nodeStrokeColor="var(--mongo-border)"
                nodeColor="var(--mongo-bg-light)"
                maskColor="rgba(15, 20, 25, 0.8)"
              />
            </ReactFlow>
          </div>

          {selectedNode && (
            <div className="w-[420px] min-w-[420px] border-l border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)] overflow-auto">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]">
                <span className="text-sm font-medium text-white">
                  {selectedNode.type === "uie"
                    ? "UIE Configuration"
                    : selectedNode.type === "transform"
                    ? "Transform Configuration"
                    : selectedNode.type === "connector"
                    ? "Connector Configuration"
                    : selectedNode.type === "input"
                    ? "Input Node"
                    : "Output Node"}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 rounded hover:bg-[var(--mongo-bg-light)] text-[var(--mongo-text-muted)] hover:text-white transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="p-4">
                {selectedNode.type === "uie" && (
                  <UieNodeConfigPanel
                    node={selectedNode as Node<UieNodeData>}
                    onUpdate={handleUpdateNode}
                    workflowId={savedId}
                  />
                )}
                {selectedNode.type === "transform" && (
                  <TransformNodeConfigPanel
                    node={selectedNode as Node<TransformNodeData>}
                    onUpdate={handleUpdateNode}
                    workflowId={savedId}
                  />
                )}
                {selectedNode.type === "connector" && (
                  <ConnectorNodeConfigPanel
                    node={selectedNode as Node<ConnectorNodeData>}
                    onUpdate={handleUpdateNode}
                  />
                )}
                {(selectedNode.type === "input" || selectedNode.type === "output") && (
                  <NodePurposePanel nodeType={selectedNode.type} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

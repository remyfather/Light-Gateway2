"use client";

import { useParams, useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Sidebar } from "@/components/sidebar";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Node,
  type Edge,
  type NodeProps,
  type OnNodesChange,
  type OnEdgesChange,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Save, Play, X, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { UieNode } from "@/components/workflow/UieNode";
import { UieNodeConfigPanel } from "@/components/workflow/UieNodeConfigPanel";
import type { UieNodeData } from "@/components/workflow/UieNode";
import { TransformNode } from "@/components/workflow/TransformNode";
import { TransformNodeConfigPanel } from "@/components/workflow/TransformNodeConfigPanel";
import type { TransformNodeData } from "@/components/workflow/TransformNode";
import { ConnectorNode } from "@/components/workflow/ConnectorNode";
import { ConnectorNodeConfigPanel } from "@/components/workflow/ConnectorNodeConfigPanel";
import type { ConnectorNodeData } from "@/components/workflow/ConnectorNode";
import { SplitterNode } from "@/components/workflow/SplitterNode";
import { SplitterNodeConfigPanel } from "@/components/workflow/SplitterNodeConfigPanel";
import type { SplitterNodeData } from "@/components/workflow/SplitterNode";
import { MergerNode } from "@/components/workflow/MergerNode";
import { MergerNodeConfigPanel } from "@/components/workflow/MergerNodeConfigPanel";
import type { MergerNodeData } from "@/components/workflow/MergerNode";
import { GoogleSheetsNode } from "@/components/workflow/GoogleSheetsNode";
import { GoogleSheetsNodeConfigPanel } from "@/components/workflow/GoogleSheetsNodeConfigPanel";
import type { GoogleSheetsNodeData } from "@/components/workflow/GoogleSheetsNode";
import { NodePurposePanel } from "@/components/workflow/NodePurposePanel";
import { NodePalette } from "@/components/workflow/NodePalette";
import * as api from "@/lib/api";

const nodeTypes = {
  uie: UieNode as React.ComponentType<NodeProps>,
  transform: TransformNode as React.ComponentType<NodeProps>,
  connector: ConnectorNode as React.ComponentType<NodeProps>,
  splitter: SplitterNode as React.ComponentType<NodeProps>,
  merger: MergerNode as React.ComponentType<NodeProps>,
  googlesheets: GoogleSheetsNode as React.ComponentType<NodeProps>,
};

const ALL_NODE_TYPES = ["input", "uie", "transform", "connector", "output", "splitter", "merger", "googlesheets"];

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

type AnyNodeData = UieNodeData | TransformNodeData | ConnectorNodeData | SplitterNodeData | MergerNodeData | GoogleSheetsNodeData;

function toApiWorkflow(
  name: string,
  nodes: Node[],
  edges: Edge[]
): api.Workflow {
  const typeMap = (t: string): api.WorkflowNode["type"] => {
    if (ALL_NODE_TYPES.includes(t)) return t as api.WorkflowNode["type"];
    return "uie";
  };
  return {
    name,
    nodes: nodes.map((n) => {
      const base = {
        id: n.id,
        type: typeMap(n.type || "uie"),
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
      if (n.type === "splitter") {
        const d = n.data as SplitterNodeData;
        return {
          ...base,
          config: d.config
            ? {
                maxParallel: d.config.maxParallel,
                timeoutSeconds: d.config.timeoutSeconds,
              }
            : undefined,
        };
      }
      if (n.type === "merger") {
        const d = n.data as MergerNodeData;
        return {
          ...base,
          config: d.config
            ? {
                strategy: d.config.strategy,
                groupByKey: d.config.groupByKey,
                includeFileMetadata: d.config.includeFileMetadata,
              }
            : undefined,
        };
      }
      if (n.type === "googlesheets") {
        const d = n.data as GoogleSheetsNodeData;
        return {
          ...base,
          config: d.config
            ? {
                webhookUrl: d.config.webhookUrl,
                sheetName: d.config.sheetName,
                columnKeys: d.config.columnKeys,
                includeHeader: d.config.includeHeader,
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
    if (n.type === "splitter") {
      const c = n.config as api.SplitterNodeConfig;
      return {
        id: n.id,
        type: "splitter",
        data: {
          label: n.label,
          config: c
            ? { maxParallel: c.maxParallel, timeoutSeconds: c.timeoutSeconds }
            : undefined,
        },
        position: pos,
      };
    }
    if (n.type === "merger") {
      const c = n.config as api.MergerNodeConfig;
      return {
        id: n.id,
        type: "merger",
        data: {
          label: n.label,
          config: c
            ? { strategy: c.strategy, groupByKey: c.groupByKey, includeFileMetadata: c.includeFileMetadata }
            : undefined,
        },
        position: pos,
      };
    }
    if (n.type === "googlesheets") {
      const c = n.config as api.GoogleSheetsNodeConfig;
      return {
        id: n.id,
        type: "googlesheets",
        data: {
          label: n.label,
          config: c
            ? { webhookUrl: c.webhookUrl, sheetName: c.sheetName, columnKeys: c.columnKeys, includeHeader: c.includeHeader }
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

let nodeIdCounter = 100;

export default function WorkflowDesignPage() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id as string;
  const isNew = workflowId === "new";
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [workflowName, setWorkflowName] = useState("새 워크플로우");
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [savedId, setSavedId] = useState<string | null>(isNew ? null : workflowId);
  const [saving, setSaving] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(true);

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
    if (ALL_NODE_TYPES.includes(node.type || "")) {
      setSelectedNode(node);
    } else {
      setSelectedNode(null);
    }
  }, []);

  const handlePaneClick = useCallback(() => setSelectedNode(null), []);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({ ...connection, id: `e${connection.source}-${connection.target}` }, eds));
    },
    [setEdges]
  );

  const handleUpdateNode = useCallback(
    (nodeId: string, data: Partial<AnyNodeData>) => {
      setNodes((nds) =>
        nds.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...data } } : null);
      }
    },
    [setNodes, selectedNode]
  );

  const handleAddNode = useCallback(
    (type: string, label: string) => {
      const id = String(++nodeIdCounter);
      const lastNode = nodes[nodes.length - 1];
      const x = lastNode ? lastNode.position.x : 250;
      const y = lastNode ? lastNode.position.y + 80 : 0;

      const defaultData: Record<string, unknown> = { label };
      if (type === "splitter") defaultData.config = { maxParallel: 0, timeoutSeconds: 60 };
      if (type === "merger") defaultData.config = { strategy: "array", includeFileMetadata: true };
      if (type === "googlesheets") defaultData.config = { sheetName: "Sheet1", includeHeader: true };
      if (type === "uie") defaultData.config = { outputFormat: "flat_keyvalue" };
      if (type === "transform") defaultData.config = { fieldMappings: [] };
      if (type === "connector") defaultData.config = { type: "http", method: "POST" };

      const newNode: Node = {
        id,
        type,
        data: defaultData,
        position: { x, y },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes]
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow-type");
      const label = event.dataTransfer.getData("application/reactflow-label");
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 80,
        y: event.clientY - bounds.top - 20,
      };

      const id = String(++nodeIdCounter);
      const defaultData: Record<string, unknown> = { label: label || type };
      if (type === "splitter") defaultData.config = { maxParallel: 0, timeoutSeconds: 60 };
      if (type === "merger") defaultData.config = { strategy: "array", includeFileMetadata: true };
      if (type === "googlesheets") defaultData.config = { sheetName: "Sheet1", includeHeader: true };
      if (type === "uie") defaultData.config = { outputFormat: "flat_keyvalue" };
      if (type === "transform") defaultData.config = { fieldMappings: [] };
      if (type === "connector") defaultData.config = { type: "http", method: "POST" };

      const newNode: Node = { id, type, data: defaultData, position };
      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      if (selectedNode?.id === nodeId) setSelectedNode(null);
    },
    [setNodes, setEdges, selectedNode]
  );

  const panelTitle = (type?: string) => {
    switch (type) {
      case "uie": return "UIE Configuration";
      case "transform": return "Transform Configuration";
      case "connector": return "Connector Configuration";
      case "splitter": return "Splitter Configuration";
      case "merger": return "Merger Configuration";
      case "googlesheets": return "Google Sheets Configuration";
      case "input": return "Input Node";
      case "output": return "Output Node";
      default: return "Configuration";
    }
  };

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
            <input
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="text-sm text-[var(--mongo-text-secondary)] bg-transparent border-0 outline-none focus:text-white px-1 py-0.5 rounded hover:bg-[var(--mongo-bg-medium)] transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPaletteOpen((v) => !v)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-[var(--mongo-text-secondary)] hover:text-white hover:bg-[var(--mongo-bg-medium)] transition-colors"
              title={paletteOpen ? "Hide palette" : "Show palette"}
            >
              {paletteOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>
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

        {/* Canvas + Palette + Config Panel */}
        <div className="flex-1 flex overflow-hidden">
          {/* Node Palette */}
          {paletteOpen && (
            <div className="w-[200px] min-w-[200px] border-r border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)] overflow-auto">
              <div className="px-3 py-3 border-b border-[var(--mongo-border)]">
                <h3 className="text-xs font-semibold text-[var(--mongo-text-secondary)] uppercase tracking-wider">
                  Nodes
                </h3>
              </div>
              <div className="p-2">
                <NodePalette onAddNode={handleAddNode} />
              </div>
            </div>
          )}

          {/* React Flow Canvas */}
          <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange as OnNodesChange}
              onEdgesChange={onEdgesChange as OnEdgesChange}
              onConnect={onConnect}
              onNodeClick={handleNodeClick}
              onPaneClick={handlePaneClick}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="!bg-[var(--mongo-bg-darkest)]"
              deleteKeyCode={["Backspace", "Delete"]}
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

          {/* Config Panel */}
          {selectedNode && (
            <div className="w-[420px] min-w-[420px] border-l border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)] overflow-auto">
              {/* Panel Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]">
                <span className="text-sm font-medium text-white">
                  {panelTitle(selectedNode.type)}
                </span>
                <div className="flex items-center gap-1">
                  {selectedNode.type !== "input" && selectedNode.type !== "output" && (
                    <button
                      onClick={() => handleDeleteNode(selectedNode.id)}
                      className="px-2 py-1 rounded text-[10px] font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="p-1 rounded hover:bg-[var(--mongo-bg-light)] text-[var(--mongo-text-muted)] hover:text-white transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>
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
                {selectedNode.type === "splitter" && (
                  <SplitterNodeConfigPanel
                    node={selectedNode as Node<SplitterNodeData>}
                    onUpdate={handleUpdateNode}
                  />
                )}
                {selectedNode.type === "merger" && (
                  <MergerNodeConfigPanel
                    node={selectedNode as Node<MergerNodeData>}
                    onUpdate={handleUpdateNode}
                  />
                )}
                {selectedNode.type === "googlesheets" && (
                  <GoogleSheetsNodeConfigPanel
                    node={selectedNode as Node<GoogleSheetsNodeData>}
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

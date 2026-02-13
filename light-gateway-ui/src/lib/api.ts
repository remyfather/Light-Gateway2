const API_BASE = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8080";

export interface UieNodeConfig {
  url: string;
  method?: string;
  formFields?: Record<string, string>;
  fileFieldName?: string;
  selectedKeys?: string[];
  outputFormat?: "fields_only" | "flat_keyvalue" | "full";
  keyMappings?: Record<string, string>;
  minConfidence?: number;
}

export interface FieldMapping {
  sourceKey: string;
  targetPath: string;
}

export interface TransformNodeConfig {
  fieldMappings?: FieldMapping[];
  outputTemplate?: string;
}

export interface ConnectorNodeConfig {
  type?: string;
  url?: string;
  method?: string;
  headers?: Record<string, string>;
}

export interface WorkflowNode {
  id: string;
  type: "input" | "uie" | "transform" | "connector" | "output";
  label?: string;
  positionX: number;
  positionY: number;
  config?: UieNodeConfig | TransformNodeConfig | ConnectorNodeConfig;
}

export interface WorkflowEdge {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
}

export interface Workflow {
  id?: string;
  name: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export async function listWorkflows(): Promise<Workflow[]> {
  const res = await fetch(`${API_BASE}/workflows`);
  if (!res.ok) throw new Error("Failed to list workflows");
  return res.json();
}

export async function getWorkflow(id: string): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows/${id}`);
  if (!res.ok) throw new Error("Failed to get workflow");
  return res.json();
}

export async function saveWorkflow(workflow: Workflow): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(workflow),
  });
  if (!res.ok) throw new Error("Failed to save workflow");
  return res.json();
}

export async function updateWorkflow(id: string, workflow: Workflow): Promise<Workflow> {
  const res = await fetch(`${API_BASE}/workflows/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...workflow, id }),
  });
  if (!res.ok) throw new Error("Failed to update workflow");
  return res.json();
}

export async function executeWorkflow(id: string, file: File): Promise<unknown> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/workflows/${id}/execute`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Execute failed");
  }
  return res.json();
}

/** 미리보기 - UIE 실행(호출+파싱) 결과 반환 */
export async function previewWorkflow(id: string, file: File): Promise<Record<string, unknown>> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/workflows/${id}/preview`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Preview failed");
  }
  return res.json();
}

export interface UieField {
  id?: number;
  key: string;
  type?: string;
  value?: string;
  refinedValue?: string;
  confidence?: number;
  boundingBoxes?: unknown[];
}

export interface UiePreviewResponse {
  fields?: UieField[];
  mimeType?: string;
  documentType?: string;
  [key: string]: unknown;
}

"use client";

import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import {
  Workflow,
  Plus,
  FileText,
  Zap,
  Clock,
  MoreHorizontal,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";
import { useState } from "react";

const sampleWorkflows = [
  {
    id: "uie-invoice",
    title: "Invoice 정보 추출",
    description: "인보이스 문서에서 스키마 기반 정보 추출",
    badges: ["UIE", "Schema"],
  },
  {
    id: "uie-contract",
    title: "계약서 분석",
    description: "계약서에서 주요 조항 및 날짜 추출",
    badges: ["UIE", "Prompt"],
  },
  {
    id: "uie-bol",
    title: "B/L 처리",
    description: "선하증권에서 화물/선박 정보 추출",
    badges: ["UIE", "Schema"],
  },
  {
    id: "batch-sheets",
    title: "Batch → Google Sheets",
    description: "다수 파일 병렬 UIE 처리 후 Google Sheets에 결과 자동 업데이트",
    badges: ["Batch", "Fan-out", "Sheets"],
  },
];

const recentWorkflows = [
  {
    id: "1",
    title: "Invoice 정보 추출",
    lastUsed: "2024-01-15",
    status: "active",
    nodes: 5,
  },
  {
    id: "2",
    title: "계약서 분석",
    lastUsed: "2024-01-12",
    status: "draft",
    nodes: 4,
  },
];

export default function HomePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const handleNewWorkflow = () => {
    router.push("/workflows/new/design");
  };

  const handleWorkflowClick = (id: string) => {
    router.push(`/workflows/${id}/design`);
  };

  return (
    <div className="h-screen flex">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)]">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-semibold text-white">Workflows</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--mongo-bg-medium)] text-[var(--mongo-text-secondary)]">
              {recentWorkflows.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--mongo-text-muted)]" />
              <input
                type="text"
                placeholder="Search workflows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-64 rounded-md text-sm bg-[var(--mongo-bg-medium)] border border-[var(--mongo-border)] text-[var(--mongo-text-primary)] placeholder:text-[var(--mongo-text-muted)] focus:outline-none focus:border-[#00ED64]/50"
              />
            </div>
            <div className="flex items-center bg-[var(--mongo-bg-medium)] rounded-md border border-[var(--mongo-border)] p-0.5">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "list"
                    ? "bg-[var(--mongo-bg-light)] text-white"
                    : "text-[var(--mongo-text-muted)] hover:text-[var(--mongo-text-secondary)]"
                }`}
              >
                <List className="size-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-[var(--mongo-bg-light)] text-white"
                    : "text-[var(--mongo-text-muted)] hover:text-[var(--mongo-text-secondary)]"
                }`}
              >
                <LayoutGrid className="size-4" />
              </button>
            </div>
            <button
              onClick={handleNewWorkflow}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-[#00ED64] text-[#0F1419] hover:bg-[#00D45A] transition-colors"
            >
              <Plus className="size-4" />
              New
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* My Workflows */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-[var(--mongo-text-secondary)] uppercase tracking-wider mb-3">
              My Workflows
            </h2>

            {viewMode === "list" ? (
              <div className="rounded-lg border border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)] overflow-hidden">
                <div className="grid grid-cols-[1fr_120px_80px_100px_40px] gap-4 px-4 py-2.5 border-b border-[var(--mongo-border)] bg-[var(--mongo-bg-medium)]">
                  <span className="text-xs font-medium text-[var(--mongo-text-muted)] uppercase tracking-wider">
                    Name
                  </span>
                  <span className="text-xs font-medium text-[var(--mongo-text-muted)] uppercase tracking-wider">
                    Last Modified
                  </span>
                  <span className="text-xs font-medium text-[var(--mongo-text-muted)] uppercase tracking-wider">
                    Nodes
                  </span>
                  <span className="text-xs font-medium text-[var(--mongo-text-muted)] uppercase tracking-wider">
                    Status
                  </span>
                  <span />
                </div>
                {recentWorkflows.length > 0 ? (
                  recentWorkflows.map((wf) => (
                    <div
                      key={wf.id}
                      onClick={() => handleWorkflowClick(wf.id)}
                      className="grid grid-cols-[1fr_120px_80px_100px_40px] gap-4 px-4 py-3 border-b border-[var(--mongo-border)] last:border-b-0 hover:bg-[var(--mongo-bg-medium)] cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-[#00ED64]/10 flex items-center justify-center">
                          <Workflow className="size-4 text-[#00ED64]" />
                        </div>
                        <span className="text-sm font-medium text-[var(--mongo-text-primary)] group-hover:text-white transition-colors">
                          {wf.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-[var(--mongo-text-muted)]">
                          <Clock className="inline size-3 mr-1" />
                          {wf.lastUsed}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-[var(--mongo-text-secondary)]">
                          {wf.nodes} nodes
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            wf.status === "active"
                              ? "bg-[#00ED64]/15 text-[#00ED64]"
                              : "bg-[var(--mongo-bg-light)] text-[var(--mongo-text-muted)]"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              wf.status === "active"
                                ? "bg-[#00ED64]"
                                : "bg-[var(--mongo-text-muted)]"
                            }`}
                          />
                          {wf.status === "active" ? "Active" : "Draft"}
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded hover:bg-[var(--mongo-bg-light)] text-[var(--mongo-text-muted)] hover:text-[var(--mongo-text-primary)] transition-colors"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-12 text-center">
                    <Workflow className="size-12 mx-auto mb-3 text-[var(--mongo-text-muted)] opacity-40" />
                    <p className="text-sm text-[var(--mongo-text-muted)]">
                      No workflows yet
                    </p>
                    <button
                      className="mt-4 px-4 py-2 rounded-md text-sm border border-[var(--mongo-border)] text-[var(--mongo-text-secondary)] hover:text-white hover:border-[var(--mongo-text-muted)] transition-colors"
                      onClick={handleNewWorkflow}
                    >
                      Create your first workflow
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentWorkflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => handleWorkflowClick(wf.id)}
                    className="rounded-lg border border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)] p-4 cursor-pointer hover:border-[#00ED64]/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00ED64]/10 flex items-center justify-center">
                        <Workflow className="size-5 text-[#00ED64]" />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          wf.status === "active"
                            ? "bg-[#00ED64]/15 text-[#00ED64]"
                            : "bg-[var(--mongo-bg-light)] text-[var(--mongo-text-muted)]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            wf.status === "active"
                              ? "bg-[#00ED64]"
                              : "bg-[var(--mongo-text-muted)]"
                          }`}
                        />
                        {wf.status === "active" ? "Active" : "Draft"}
                      </span>
                    </div>
                    <h3 className="text-sm font-medium text-[var(--mongo-text-primary)] group-hover:text-white transition-colors mb-1">
                      {wf.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[var(--mongo-text-muted)]">
                      <span>{wf.nodes} nodes</span>
                      <span>{wf.lastUsed}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Sample Workflows / Templates */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-[var(--mongo-text-secondary)] uppercase tracking-wider mb-3">
              Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleWorkflows.map((wf) => (
                <div
                  key={wf.id}
                  onClick={() => handleWorkflowClick(wf.id)}
                  className="rounded-lg border border-[var(--mongo-border)] bg-[var(--mongo-bg-dark)] p-4 cursor-pointer hover:border-[#00ED64]/30 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-[var(--mongo-bg-medium)] flex items-center justify-center border border-[var(--mongo-border)]">
                      <FileText className="size-4 text-[#00ED64]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[var(--mongo-text-primary)] group-hover:text-white transition-colors">
                        {wf.title}
                      </h3>
                      <p className="text-xs text-[var(--mongo-text-muted)]">
                        {wf.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {wf.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--mongo-bg-medium)] text-[var(--mongo-text-secondary)] border border-[var(--mongo-border)]"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Info Banner */}
          <div className="rounded-lg border border-[#00ED64]/20 bg-[#00ED64]/5 p-4">
            <div className="flex gap-3">
              <Zap className="size-5 text-[#00ED64] shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-[#00ED64] mb-1">
                  Workflow → REST API
                </p>
                <p className="text-[var(--mongo-text-secondary)]">
                  n8n 스타일의 GUI에서 워크플로우를 디자인하세요. Splitter로 다수의 파일을 병렬 처리하고,
                  Merger로 결과를 통합하고, Google Sheets나 REST API로 결과를 전달할 수 있습니다.
                  배포하면 REST API로 자동 변환됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

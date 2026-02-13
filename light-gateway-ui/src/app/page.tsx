"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workflow, Plus, FileText, Zap } from "lucide-react";

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
];

const recentWorkflows = [
  { id: "1", title: "Invoice 정보 추출", lastUsed: "2024-01-15" },
  { id: "2", title: "계약서 분석", lastUsed: "2024-01-12" },
];

export default function HomePage() {
  const router = useRouter();

  const handleNewWorkflow = () => {
    router.push("/workflows/new/design");
  };

  const handleWorkflowClick = (id: string) => {
    router.push(`/workflows/${id}/design`);
  };

  return (
    <div className="h-screen flex flex-col bg-[#f9fafb]">
      <Header />

      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto py-12 px-8">
          {/* Hero */}
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-[#111827] mb-2">
              UIE Workflow Studio
            </h1>
            <p className="text-[#6b7280]">
              Upstage UIE API를 활용한 워크플로우를 디자인하고, API로 배포하세요.
            </p>
          </div>

          {/* My Workflows */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#111827]">
                내 워크플로우
              </h2>
              <Button onClick={handleNewWorkflow}>
                <Plus className="size-4" />
                새 워크플로우
              </Button>
            </div>

            <div className="border rounded-lg bg-white divide-y">
              {recentWorkflows.length > 0 ? (
                recentWorkflows.map((wf) => (
                  <div
                    key={wf.id}
                    onClick={() => handleWorkflowClick(wf.id)}
                    className="flex items-center justify-between px-4 py-3 hover:bg-[#f9fafb] cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Workflow className="size-4 text-[#6b7280]" />
                      <span className="text-sm font-medium text-[#111827]">
                        {wf.title}
                      </span>
                    </div>
                    <span className="text-xs text-[#6b7280]">{wf.lastUsed}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-12 text-center text-[#6b7280]">
                  <Workflow className="size-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">아직 워크플로우가 없습니다</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={handleNewWorkflow}
                  >
                    첫 워크플로우 만들기
                  </Button>
                </div>
              )}
            </div>
          </section>

          {/* Sample Workflows */}
          <section>
            <h2 className="text-xl font-semibold text-[#111827] mb-4">
              샘플 워크플로우
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sampleWorkflows.map((wf) => (
                <Card
                  key={wf.id}
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-amber-200"
                  onClick={() => handleWorkflowClick(wf.id)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="size-4 text-amber-500" />
                      <CardTitle className="text-base">{wf.title}</CardTitle>
                    </div>
                    <p className="text-sm text-[#6b7280]">{wf.description}</p>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-1 flex-wrap">
                      {wf.badges.map((badge) => (
                        <span
                          key={badge}
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Info */}
          <div className="mt-12 p-4 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex gap-3">
              <Zap className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">워크플로우 → API</p>
                <p>
                  GUI에서 워크플로우를 디자인하고 배포하면, 레거시 시스템에서
                  호출할 수 있는 REST API로 자동 변환됩니다. UIE 스키마/프롬프트
                 별 API를 하나의 엔드포인트로 통합하세요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

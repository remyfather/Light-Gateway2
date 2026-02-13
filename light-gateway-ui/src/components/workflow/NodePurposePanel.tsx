"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox, LogOut } from "lucide-react";

const NODE_PURPOSES: Record<string, { title: string; desc: string; icon: React.ReactNode; bg: string; border: string; text: string }> = {
  input: {
    title: "Input Node",
    desc: "워크플로우의 진입점입니다. 파일(문서)이 업로드되면 이 노드부터 실행이 시작됩니다.",
    icon: <Inbox className="size-4" />,
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-900",
  },
  output: {
    title: "Output Node",
    desc: "워크플로우의 종착점입니다. 파싱·변환된 최종 결과가 이 노드에서 API 응답으로 반환됩니다.",
    icon: <LogOut className="size-4" />,
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-900",
  },
};

interface NodePurposePanelProps {
  nodeType: string;
}

export function NodePurposePanel({ nodeType }: NodePurposePanelProps) {
  const info = NODE_PURPOSES[nodeType];
  if (!info) return null;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {info.icon}
          {info.title}
        </CardTitle>
        <div className={`mt-2 p-3 rounded-lg ${info.bg} border ${info.border} text-sm ${info.text}`}>
          <p className="font-medium">목적</p>
          <p className="mt-0.5">{info.desc}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-gray-500">이 노드는 별도 설정 없이 사용됩니다.</p>
      </CardContent>
    </Card>
  );
}

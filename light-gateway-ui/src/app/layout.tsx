import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Light Gateway - UIE Workflow Studio",
  description: "Upstage UIE 전용 게이트웨이 - 워크플로우 디자인 및 API 배포",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

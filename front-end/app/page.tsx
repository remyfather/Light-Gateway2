'use client';

import React, { useState } from 'react';
import ControlPanel from '@/components/ControlPanel';
import PageViewer from '@/components/PageViewer';
import ErrorMessage from '@/components/ErrorMessage';
import { parsePage, getPdfInfo } from '@/lib/api';

interface PageResult {
  image_url: string;
  elements?: Array<Record<string, unknown>>;
  html?: string;
  markdown?: string;
  text?: string;
  base64_images?: Array<{
    category: string;
    element_id: number;
    filename: string;
  }>;
}

export default function Home() {
  const [pdfPath, setPdfPath] = useState('samples/Samsung Display SR 2025_Kor.pdf');
  const [pdfInfo, setPdfInfo] = useState<{ page_count: number; file_name: string } | null>(null);
  const [params, setParams] = useState({
    ocr: true,
    merge_multipage_tables: false,
    base64_encoding: '',
    output_format: '',
  });
  const [model, setModel] = useState('document-parse-250618');
  const [mode, setMode] = useState<string | null>(null);
  const [results, setResults] = useState<Record<number, PageResult>>({});
  const [loading, setLoading] = useState(false);
  const [parsingProgress, setParsingProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('parse');

  const handleCheckPdf = async () => {
    if (!pdfPath) {
      setError('PDF 파일 경로를 입력하세요.');
      return;
    }

    try {
      const info = await getPdfInfo(pdfPath);
      setPdfInfo(info);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '파일 확인 중 오류가 발생했습니다.';
      setError(errorMessage);
      setPdfInfo(null);
    }
  };

  const handleParse = async () => {
    if (!pdfPath) {
      setError('PDF 파일 경로를 입력하세요.');
      return;
    }

    if (!pdfInfo) {
      setError('먼저 파일을 확인해주세요.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults({});
    setParsingProgress({ current: 0, total: pdfInfo.page_count });

    try {
      const apiParams: Record<string, string | boolean> = {};
      
      // 모델명 설정
      apiParams.model = model;
      
      // mode 파라미터 추가 (document-parse-vlm용)
      if (mode) {
        apiParams.mode = mode;
      }
      
      if (params.ocr) {
        apiParams.ocr = 'force';
      }
      
      if (params.merge_multipage_tables) {
        apiParams.merge_multipage_tables = 'true';
      }
      
      if (params.base64_encoding) {
        const items = params.base64_encoding.split(',').map(s => s.trim());
        if (items.length === 1) {
          apiParams.base64_encoding = `["${items[0]}"]`;
        } else {
          apiParams.base64_encoding = JSON.stringify(items);
        }
      }
      
      // output_format 설정: 항상 html, markdown, text 모두 요청
      if (params.output_format) {
        const items = params.output_format.split(',').map(s => s.trim());
        // Document Parse API는 JSON 배열 문자열을 기대함
        apiParams.output_format = items.length === 1 ? items[0] : JSON.stringify(items);
      } else {
        // 기본값: 모든 형식 요청
        apiParams.output_format = JSON.stringify(['html', 'markdown', 'text']);
      }

      // 페이지별로 순차적으로 파싱하며 실시간으로 결과 표시
      const totalPages = pdfInfo.page_count;
      const newResults: Record<number, PageResult> = {};

      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        try {
          setParsingProgress({ current: pageNum, total: totalPages });
          const pageResult = await parsePage(pdfPath, pageNum, apiParams);
          newResults[pageResult.page_num] = pageResult.page_data;
          
          // 실시간으로 결과 업데이트
          setResults({ ...newResults });
        } catch (err) {
          console.error(`페이지 ${pageNum} 파싱 실패:`, err);
          // 개별 페이지 실패는 계속 진행
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '파싱 중 오류가 발생했습니다.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setParsingProgress(null);
    }
  };

  const handleClear = () => {
    setResults({});
    setError(null);
    setParsingProgress(null);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f7fa' }}>
      {/* Header */}
      <header className="bg-white border-b" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded" style={{ backgroundColor: '#00ed64' }}></div>
              <span className="font-semibold text-lg" style={{ color: '#001e2b' }}>Document Parse</span>
            </div>
            <nav className="flex gap-6 ml-8">
              <a href="#" className="text-sm font-medium" style={{ color: '#00ed64', borderBottom: '2px solid #00ed64', paddingBottom: '4px' }}>
                Document Services
              </a>
              <a href="#" className="text-sm font-medium" style={{ color: '#6b7280' }}>
                Analytics
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm" style={{ color: '#6b7280' }}>Get Help</button>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium" style={{ color: '#6b7280' }}>U</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen" style={{ borderColor: '#e2e8f0' }}>
          <div className="p-4">
            <div className="flex items-center gap-2 p-2 rounded mb-4" style={{ backgroundColor: '#fef3c7' }}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#92400e' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: '#92400e' }}>Document Parse</span>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
                Overview
              </div>
              <a href="#" className="block py-2 px-3 text-sm rounded" style={{ color: '#6b7280' }}>
                Dashboard
              </a>
            </div>

            <div className="mt-6 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#6b7280' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                Document
              </div>
              <button
                onClick={() => {
                  setActiveSection('parse');
                  setModel('document-parse-250618');
                  setMode(null);
                }}
                className={`w-full text-left py-2 px-3 text-sm rounded flex items-center gap-2 ${
                  activeSection === 'parse' ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: activeSection === 'parse' ? '#f0fdf4' : 'transparent',
                  color: activeSection === 'parse' ? '#00ed64' : '#6b7280'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                document-parse
              </button>
              <button
                onClick={() => {
                  setActiveSection('parse-vlm');
                  setModel('document-parse-nightly');
                  setMode('enhanced');
                }}
                className={`w-full text-left py-2 px-3 text-sm rounded flex items-center gap-2 ${
                  activeSection === 'parse-vlm' ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: activeSection === 'parse-vlm' ? '#f0fdf4' : 'transparent',
                  color: activeSection === 'parse-vlm' ? '#00ed64' : '#6b7280'
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                document-parse-vlm
              </button>
            </div>

            <div className="mt-6 space-y-1">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#6b7280' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Security
              </div>
              <a href="#" className="block py-2 px-3 text-sm rounded" style={{ color: '#6b7280' }}>
                API Keys
              </a>
              <a href="#" className="block py-2 px-3 text-sm rounded" style={{ color: '#6b7280' }}>
                Access Control
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Breadcrumbs */}
          <div className="bg-white border-b px-6 py-3" style={{ borderColor: '#e2e8f0' }}>
            <div className="text-sm" style={{ color: '#6b7280' }}>
              <span>Document Parse</span>
              <span className="mx-2">/</span>
              <span className="font-medium" style={{ color: '#001e2b' }}>
                {activeSection === 'parse' ? 'document-parse' : 'document-parse-vlm'}
              </span>
            </div>
          </div>

          {/* Page Title */}
          <div className="bg-white px-6 py-6 border-b" style={{ borderColor: '#e2e8f0' }}>
            <h1 className="text-3xl font-bold" style={{ color: '#00ed64' }}>
              {activeSection === 'parse' ? 'document-parse' : 'document-parse-vlm'}
            </h1>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              Upload and parse documents to extract structured content
            </p>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <ControlPanel
              pdfPath={pdfPath}
              setPdfPath={setPdfPath}
              params={params}
              setParams={setParams}
              pdfInfo={pdfInfo}
              onCheckPdf={handleCheckPdf}
              onParse={handleParse}
              onClear={handleClear}
              loading={loading}
            />

            {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

            {loading && parsingProgress && (
              <div className="bg-white rounded-lg p-6 mb-6 border" style={{ borderColor: '#e2e8f0' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium" style={{ color: '#6b7280' }}>
                    파싱 진행 중...
                  </p>
                  <p className="text-sm font-medium" style={{ color: '#00ed64' }}>
                    {parsingProgress.current} / {parsingProgress.total} 페이지
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: '#00ed64',
                      width: `${(parsingProgress.current / parsingProgress.total) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
            )}

            {Object.keys(results).length > 0 && (
              <PageViewer results={results} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

'use client';

import React from 'react';

interface ControlPanelProps {
  pdfPath: string;
  setPdfPath: (path: string) => void;
  params: {
    ocr: boolean;
    merge_multipage_tables: boolean;
    base64_encoding: string;
    output_format: string;
  };
  setParams: (params: {
    ocr: boolean;
    merge_multipage_tables: boolean;
    base64_encoding: string;
    output_format: string;
  }) => void;
  pdfInfo: { page_count: number; file_name: string } | null;
  onCheckPdf: () => void;
  onParse: () => void;
  onClear: () => void;
  loading: boolean;
}

export default function ControlPanel({
  pdfPath,
  setPdfPath,
  params,
  setParams,
  pdfInfo,
  onCheckPdf,
  onParse,
  onClear,
  loading,
}: ControlPanelProps) {
  return (
    <div className="bg-white rounded-lg p-6 mb-6 border" style={{ 
      borderRadius: '8px',
      borderColor: '#e2e8f0'
    }}>
      <div className="space-y-6">
        {/* PDF 파일 경로 */}
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: '#555' }}>
            PDF 파일 경로
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={pdfPath}
              onChange={(e) => setPdfPath(e.target.value)}
              placeholder="PDF 파일 경로를 입력하세요"
              className="flex-1 px-4 py-2.5 border-2 rounded focus:outline-none text-sm"
              style={{ 
                borderColor: '#ddd',
                borderRadius: '4px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#00ed64'}
              onBlur={(e) => e.target.style.borderColor = '#ddd'}
            />
            <button
              onClick={onCheckPdf}
              disabled={loading}
              className="px-6 py-2.5 text-white rounded font-semibold transition-colors"
              style={{ 
                backgroundColor: loading ? '#9ca3af' : '#00ed64',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#00d956';
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#00ed64';
              }}
            >
              파일 확인
            </button>
          </div>
          {pdfInfo && (
            <div className="mt-2 p-3 rounded" style={{ 
              backgroundColor: '#e7f3ff',
              color: '#0066cc',
              borderRadius: '4px'
            }}>
              <p className="text-sm">
                ✓ 파일 확인 완료: {pdfInfo.file_name} ({pdfInfo.page_count}페이지)
              </p>
            </div>
          )}
        </div>

        {/* API 파라미터 */}
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: '#555' }}>
            API 파라미터
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ocr"
                checked={params.ocr}
                onChange={(e) => setParams({ ...params, ocr: e.target.checked })}
                className="cursor-pointer"
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="ocr" className="text-sm cursor-pointer" style={{ color: '#333' }}>
                OCR 강제 실행
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="mergeTables"
                checked={params.merge_multipage_tables}
                onChange={(e) =>
                  setParams({ ...params, merge_multipage_tables: e.target.checked })
                }
                className="cursor-pointer"
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="mergeTables" className="text-sm cursor-pointer" style={{ color: '#333' }}>
                다중 페이지 테이블 병합
              </label>
            </div>

            <div>
              <label htmlFor="base64Encoding" className="block text-xs mb-1" style={{ color: '#666' }}>
                Base64 인코딩:
              </label>
              <select
                id="base64Encoding"
                value={params.base64_encoding}
                onChange={(e) => setParams({ ...params, base64_encoding: e.target.value })}
                className="w-full px-3 py-2 border-2 rounded focus:outline-none text-sm"
                style={{ 
                  borderColor: '#ddd',
                  borderRadius: '4px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ed64'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              >
                <option value="">없음</option>
                <option value="table">테이블</option>
                <option value="figure">이미지</option>
                <option value="equation">수식</option>
                <option value="table,figure">테이블+이미지</option>
              </select>
            </div>

            <div>
              <label htmlFor="outputFormat" className="block text-xs mb-1" style={{ color: '#666' }}>
                출력 형식:
              </label>
              <select
                id="outputFormat"
                value={params.output_format}
                onChange={(e) => setParams({ ...params, output_format: e.target.value })}
                className="w-full px-3 py-2 border-2 rounded focus:outline-none text-sm"
                style={{ 
                  borderColor: '#ddd',
                  borderRadius: '4px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#00ed64'}
                onBlur={(e) => e.target.style.borderColor = '#ddd'}
              >
                <option value="">모두 (기본값)</option>
                <option value="html">HTML만</option>
                <option value="markdown">Markdown만</option>
                <option value="text">Text만</option>
                <option value="html,markdown">HTML+Markdown</option>
              </select>
            </div>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onParse}
            disabled={loading}
            className="flex-1 px-6 py-3 text-white rounded font-semibold transition-colors"
            style={{ 
              backgroundColor: loading ? '#9ca3af' : '#00ed64',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#00d956';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#00ed64';
            }}
          >
            {loading ? '파싱 중...' : '문서 파싱 시작'}
          </button>
          <button
            onClick={onClear}
            disabled={loading}
            className="px-6 py-3 text-white rounded font-semibold transition-colors"
            style={{ 
              backgroundColor: loading ? '#ccc' : '#6c757d',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#5a6268';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = '#6c757d';
            }}
          >
            결과 초기화
          </button>
        </div>
      </div>
    </div>
  );
}

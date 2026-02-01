'use client';

import React, { useState } from 'react';
import { getImageUrl, getFigureUrl, askQuestion } from '@/lib/api';

// 마크다운을 HTML로 변환하는 함수
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';
  
  let html = markdown;
  
  // 코드 블록 먼저 처리 (다른 변환에 영향받지 않도록)
  const codeBlocks: string[] = [];
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    const id = `CODE_BLOCK_${codeBlocks.length}`;
    codeBlocks.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
    return id;
  });
  
  // 인라인 코드 처리 (코드 블록 내부가 아닌 경우만)
  html = html.replace(/`([^`\n]+)`/g, '<code>$1</code>');
  
  // 줄 단위로 처리
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let inParagraph = false;
  let currentParagraph: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // 빈 줄 처리
    if (!line) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inParagraph && currentParagraph.length > 0) {
        processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
        inParagraph = false;
      }
      continue;
    }
    
    // 헤더 처리
    if (line.match(/^#### /)) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inParagraph && currentParagraph.length > 0) {
        processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
        inParagraph = false;
      }
      processedLines.push(`<h4>${line.replace(/^#### /, '')}</h4>`);
      continue;
    }
    if (line.match(/^### /)) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inParagraph && currentParagraph.length > 0) {
        processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
        inParagraph = false;
      }
      processedLines.push(`<h3>${line.replace(/^### /, '')}</h3>`);
      continue;
    }
    if (line.match(/^## /)) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inParagraph && currentParagraph.length > 0) {
        processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
        inParagraph = false;
      }
      processedLines.push(`<h2>${line.replace(/^## /, '')}</h2>`);
      continue;
    }
    if (line.match(/^# /)) {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (inParagraph && currentParagraph.length > 0) {
        processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
        inParagraph = false;
      }
      processedLines.push(`<h1>${line.replace(/^# /, '')}</h1>`);
      continue;
    }
    
    // 리스트 처리 (숫자 리스트도 포함)
    const unorderedListMatch = line.match(/^[\*\-\+] (.+)$/);
    const orderedListMatch = line.match(/^\d+\. (.+)$/);
    
    if (unorderedListMatch || orderedListMatch) {
      if (inParagraph && currentParagraph.length > 0) {
        processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
        currentParagraph = [];
        inParagraph = false;
      }
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      let listItem = unorderedListMatch ? unorderedListMatch[1] : orderedListMatch![1];
      // 리스트 항목 내부의 마크다운 처리
      listItem = processInlineMarkdown(listItem);
      processedLines.push(`<li>${listItem}</li>`);
      continue;
    }
    
    // 일반 텍스트 (문단)
    if (!inParagraph) {
      inParagraph = true;
    }
    const processedLine = processInlineMarkdown(line);
    currentParagraph.push(processedLine);
  }
  
  // 마지막 처리
  if (inList) {
    processedLines.push('</ul>');
  }
  if (inParagraph && currentParagraph.length > 0) {
    processedLines.push(`<p>${currentParagraph.join(' ')}</p>`);
  }
  
  html = processedLines.join('\n');
  
  // 코드 블록 복원
  codeBlocks.forEach((block, idx) => {
    html = html.replace(`CODE_BLOCK_${idx}`, block);
  });
  
  return html;
}

// 인라인 마크다운 처리 (볼드, 이탤릭, 링크 등)
function processInlineMarkdown(text: string): string {
  // 볼드 (이탤릭보다 먼저)
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // 이탤릭 (볼드가 아닌 단일 *)
  text = text.replace(/(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  text = text.replace(/(?<!_)_(?!_)([^_]+?)(?<!_)_(?!_)/g, '<em>$1</em>');
  
  // 링크
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // 인라인 코드
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  return text;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

interface PageData {
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

interface PageViewerProps {
  results: Record<number, PageData>;
}

type TabType = 'html' | 'markdown' | 'text' | 'elements' | 'figures';

export default function PageViewer({ results }: PageViewerProps) {
  const pages = Object.keys(results).map(Number).sort((a, b) => a - b);

  if (pages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      {pages.map((pageNum) => (
        <PageItem key={pageNum} pageNum={pageNum} pageData={results[pageNum]} />
      ))}
    </div>
  );
}

function PageItem({ pageNum, pageData }: { pageNum: number; pageData: PageData }) {
  const [activeTab, setActiveTab] = useState<TabType>('html');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // 카테고리별 개수 계산
  const categories: Record<string, number> = {};
  if (pageData.elements) {
    pageData.elements.forEach((el) => {
      const category = (el.category as string) || 'unknown';
      categories[category] = (categories[category] || 0) + 1;
    });
  }

  const hasBase64Images = pageData.base64_images && pageData.base64_images.length > 0;
  
  // 카테고리별로 그룹화
  const imagesByCategory: Record<string, typeof pageData.base64_images> = {};
  if (pageData.base64_images) {
    pageData.base64_images.forEach((img) => {
      const cat = img.category || 'unknown';
      if (!imagesByCategory[cat]) {
        imagesByCategory[cat] = [];
      }
      imagesByCategory[cat].push(img);
    });
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden mb-8" style={{ 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      padding: '20px'
    }}>
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4" style={{ 
        borderBottom: '2px solid #f0f0f0'
      }}>
        <h2 className="text-xl font-semibold" style={{ color: '#00ed64' }}>
          페이지 {pageNum}
        </h2>
        <div className="flex gap-4 flex-wrap">
          {Object.entries(categories).map(([cat, count]) => (
            <span
              key={cat}
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: '#f0f0f0',
                color: '#666',
                borderRadius: '12px'
              }}
            >
              {cat}: {count}
            </span>
          ))}
        </div>
      </div>

      {/* 페이지 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 원본 이미지 */}
        <div className="overflow-hidden" style={{ 
          border: '2px solid #e0e0e0',
          borderRadius: '6px'
        }}>
          <div className="px-4 py-3" style={{ 
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0',
            fontWeight: 600
          }}>
            <h3>원본 이미지</h3>
          </div>
          <div className="p-4 bg-white">
            <img
              src={getImageUrl(pageData.image_url)}
              alt={`Page ${pageNum}`}
              className="w-full h-auto"
              style={{ display: 'block' }}
            />
          </div>
        </div>

        {/* 파싱 결과 */}
        <div className="overflow-hidden" style={{ 
          border: '2px solid #e0e0e0',
          borderRadius: '6px'
        }}>
          <div className="px-4 py-3" style={{ 
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0',
            fontWeight: 600
          }}>
            <h3>파싱 결과</h3>
          </div>
          <div className="bg-white">
            {/* 탭 */}
            <div className="flex gap-1 mb-4 overflow-x-auto" style={{ 
              borderBottom: '2px solid #e0e0e0'
            }}>
              {(['html', 'markdown', 'text', 'elements'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-5 py-2.5 font-semibold text-sm cursor-pointer transition-all border-b-3 border-transparent"
                  style={{ 
                    color: activeTab === tab ? '#00ed64' : '#666',
                    borderBottomColor: activeTab === tab ? '#00ed64' : 'transparent',
                    borderBottomWidth: '3px'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              {hasBase64Images && (
                <button
                  onClick={() => setActiveTab('figures')}
                  className="px-5 py-2.5 font-semibold text-sm cursor-pointer transition-all border-b-3 border-transparent"
                  style={{ 
                    color: activeTab === 'figures' ? '#00ed64' : '#666',
                    borderBottomColor: activeTab === 'figures' ? '#00ed64' : 'transparent',
                    borderBottomWidth: '3px'
                  }}
                >
                  Base64 Images ({pageData.base64_images?.length || 0})
                </button>
              )}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-4 max-h-[800px] overflow-y-auto" style={{ 
              maxHeight: '800px'
            }}>
              {activeTab === 'html' && (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: pageData.html || '<p>결과가 없습니다.</p>' }}
                />
              )}

              {activeTab === 'markdown' && (
                <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {pageData.markdown || '결과가 없습니다.'}
                </pre>
              )}

              {activeTab === 'text' && (
                <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {pageData.text || '결과가 없습니다.'}
                </pre>
              )}

              {activeTab === 'elements' && (
                <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-50 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
                  {JSON.stringify(pageData.elements, null, 2)}
                </pre>
              )}

              {activeTab === 'figures' && hasBase64Images && pageData.base64_images && (
                <div className="space-y-6">
                  {Object.entries(imagesByCategory).map(([category, images]) => {
                    if (!images) return null;
                    return (
                      <div key={category} className="space-y-4">
                        <h4 className="font-semibold text-lg" style={{ color: '#00ed64' }}>
                          {category.charAt(0).toUpperCase() + category.slice(1)} ({images.length}개)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          {images.map((img) => (
                          <div
                            key={`${img.category}-${img.element_id}`}
                            className="overflow-hidden"
                            style={{ 
                              border: '2px solid #e0e0e0',
                              borderRadius: '6px'
                            }}
                          >
                            <div className="px-3 py-2" style={{ 
                              backgroundColor: '#f8f9fa',
                              borderBottom: '1px solid #e0e0e0',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#666'
                            }}>
                              {category.charAt(0).toUpperCase() + category.slice(1)} ID: {img.element_id}
                            </div>
                            <div className="p-2 bg-white">
                              <img
                                src={getFigureUrl(img.filename)}
                                alt={`${category} ${img.element_id}`}
                                className="w-full h-auto rounded cursor-pointer hover:opacity-90 transition-opacity"
                              />
                            </div>
                          </div>
                        ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {activeTab === 'figures' && !hasBase64Images && (
                <p className="text-gray-600">추출된 Base64 인코딩 이미지가 없습니다. Base64 인코딩 옵션을 확인하세요.</p>
              )}
            </div>
          </div>
        </div>

        {/* LLM 질문 및 답변 섹션 */}
        <div className="mt-6 border-2 border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3" style={{ 
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0',
            fontWeight: 600
          }}>
            <h3>AI 질문 및 답변</h3>
          </div>
          <div className="p-4 bg-white">
            {/* 질문 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#666' }}>
                질문 입력:
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="문서에 대해 궁금한 점을 질문하세요..."
                className="w-full px-3 py-2 border-2 rounded text-sm"
                style={{ 
                  borderColor: '#ddd',
                  minHeight: '100px'
                }}
                rows={4}
              />
            </div>

            {/* 질문하기 버튼 */}
            <div className="mb-4">
              <button
                onClick={async () => {
                  if (!question.trim()) {
                    alert('질문을 입력해주세요.');
                    return;
                  }

                  setLoadingAnswer(true);
                  setAnswer('');
                  try {
                    const elements = pageData.elements || [];
                    const result = await askQuestion(pageNum, question.trim(), elements);
                    setAnswer(result.answer);
                  } catch (err) {
                    console.error('답변 생성 실패:', err);
                    alert('답변 생성에 실패했습니다.');
                  } finally {
                    setLoadingAnswer(false);
                  }
                }}
                disabled={loadingAnswer || !question.trim()}
                className="px-4 py-2 rounded font-semibold text-sm transition-colors"
                style={{ 
                  backgroundColor: (loadingAnswer || !question.trim()) ? '#9ca3af' : '#00ed64',
                  color: 'white',
                  cursor: (loadingAnswer || !question.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {loadingAnswer ? '답변 생성 중...' : '질문하기'}
              </button>
            </div>

            {/* 답변 표시 (마크다운) */}
            {answer && (
              <div className="mt-4 p-4 rounded" style={{ backgroundColor: '#f0fdf4', border: '1px solid #00ed64' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: '#00ed64' }}>답변:</p>
                <div 
                  className="prose prose-sm max-w-none markdown-content"
                  dangerouslySetInnerHTML={{ __html: markdownToHtml(answer) }}
                  style={{ color: '#333' }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

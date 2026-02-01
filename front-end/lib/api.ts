const API_BASE_URL = 'http://localhost:8080';

export interface PdfInfo {
  page_count: number;
  file_name: string;
}

export interface PageData {
  image_path: string;
  image_url: string;
  result: Record<string, unknown>;
  elements: Array<Record<string, unknown>>;
  html: string;
  markdown: string;
  text: string;
  base64_images: Array<{
    category: string;
    element_id: number;
    filename: string;
    url: string;
    coordinates: unknown;
  }>;
}

export interface ParseResult {
  results: Record<number, PageData>;
}

export async function getPdfInfo(pdfPath: string): Promise<PdfInfo> {
  const response = await fetch(`${API_BASE_URL}/api/pdf/info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pdf_path: pdfPath }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'PDF 정보를 가져오는데 실패했습니다.');
  }

  const data = await response.json();
  return {
    page_count: data.page_count,
    file_name: data.file_name,
  };
}

export async function parseDocument(
  pdfPath: string,
  params: Record<string, string | boolean>
): Promise<ParseResult> {
  const response = await fetch(`${API_BASE_URL}/api/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdf_path: pdfPath,
      params: params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '문서 파싱에 실패했습니다.');
  }

  const data = await response.json();
  return {
    results: data.results,
  };
}

export async function parsePage(
  pdfPath: string,
  pageNum: number,
  params: Record<string, string | boolean>
): Promise<{ page_num: number; page_data: PageData }> {
  const response = await fetch(`${API_BASE_URL}/api/parse/page`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pdf_path: pdfPath,
      page_num: pageNum,
      params: params,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `페이지 ${pageNum} 파싱에 실패했습니다.`);
  }

  const data = await response.json();
  return {
    page_num: data.page_num,
    page_data: data.page_data as PageData,
  };
}

export function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${API_BASE_URL}${imagePath}`;
}

export function getFigureUrl(filename: string): string {
  return `${API_BASE_URL}/api/figures/${filename}`;
}

export async function generateQuestions(
  pageNum: number,
  elements: Array<Record<string, unknown>>,
  pageContent?: string
): Promise<{ questions: string[] }> {
  const response = await fetch(`${API_BASE_URL}/api/llm/generate-questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page_num: pageNum,
      elements: elements,
      page_content: pageContent || '',  // 참고용
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '질문 생성에 실패했습니다.');
  }

  const data = await response.json();
  return {
    questions: data.questions,
  };
}

export async function askQuestion(
  pageNum: number,
  question: string,
  elements: Array<Record<string, unknown>>
): Promise<{ answer: string }> {
  const response = await fetch(`${API_BASE_URL}/api/llm/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      page_num: pageNum,
      question: question,
      elements: elements,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '답변 생성에 실패했습니다.');
  }

  const data = await response.json();
  return {
    answer: data.answer,
  };
}

export { API_BASE_URL };



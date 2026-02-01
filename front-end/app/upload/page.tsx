"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

interface UploadedFile {
  file: File;
  preview: string | null;
  name: string;
  size: number;
  type: string;
}

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    multiple: true,
  });

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => {
      const newFiles = [...prev];
      const removed = newFiles[index];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleExtract = async () => {
    if (uploadedFiles.length === 0) return;

    setIsExtracting(true);
    try {
      // TODO: 백엔드 API 호출
      // const formData = new FormData();
      // uploadedFiles.forEach((fileObj) => {
      //   formData.append("files", fileObj.file);
      // });
      // const response = await fetch("/api/parse-product", {
      //   method: "POST",
      //   body: formData,
      // });

      // 임시: 2초 대기
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Extracting product information...", uploadedFiles);
    } catch (error) {
      console.error("Error extracting product info:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            보험상품 업로드
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            가입하신 보험상품 문서를 업로드하여 AI로 상품 정보를 추출하세요.
          </p>
        </div>

        {/* Upload Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              }
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                  파일을 여기에 놓아주세요
                </p>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    파일을 드래그 앤 드롭하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    PDF, 이미지 파일 지원 (최대 10MB)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              업로드된 파일 ({uploadedFiles.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedFiles.map((fileObj, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {fileObj.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatFileSize(fileObj.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="파일 삭제"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  {fileObj.preview ? (
                    <div className="mt-2 rounded overflow-hidden bg-gray-100 dark:bg-gray-700">
                      <Image
                        src={fileObj.preview}
                        alt={fileObj.name}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  ) : (
                    <div className="mt-2 rounded bg-gray-100 dark:bg-gray-700 p-8 flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extract Button */}
        {uploadedFiles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <button
              onClick={handleExtract}
              disabled={isExtracting}
              className={`
                w-full py-4 px-6 rounded-lg font-semibold text-lg
                transition-all duration-200
                ${
                  isExtracting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                }
                text-white shadow-md hover:shadow-lg
                flex items-center justify-center space-x-2
              `}
            >
              {isExtracting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>AI로 상품 정보 추출 중...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <span>AI로 상품 정보 추출하기</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


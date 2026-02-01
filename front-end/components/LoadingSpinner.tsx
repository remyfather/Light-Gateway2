import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ 
          borderColor: '#e5e7eb',
          borderTopColor: '#00ed64'
        }}></div>
      </div>
      <p className="mt-4 font-medium" style={{ color: '#6b7280' }}>문서를 파싱하는 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
}


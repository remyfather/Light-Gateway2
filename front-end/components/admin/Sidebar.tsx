'use client';

import React from 'react';

type ActiveView = 'dashboard' | 'endpoints' | 'logs' | 'routing' | 'services';

interface SidebarProps {
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r min-h-screen" style={{ borderColor: '#e2e8f0' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 p-2 rounded mb-4" style={{ backgroundColor: '#f0fdf4' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#00ed64' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-medium" style={{ color: '#00ed64' }}>API Gateway</span>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#6b7280' }}>
            Overview
          </div>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full text-left py-2 px-3 text-sm rounded flex items-center gap-2 ${
              activeView === 'dashboard' ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: activeView === 'dashboard' ? '#f0fdf4' : 'transparent',
              color: activeView === 'dashboard' ? '#00ed64' : '#6b7280'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Dashboard
          </button>
        </div>

        <div className="mt-6 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#6b7280' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
            API Management
          </div>
          <button
            onClick={() => setActiveView('endpoints')}
            className={`w-full text-left py-2 px-3 text-sm rounded flex items-center gap-2 ${
              activeView === 'endpoints' ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: activeView === 'endpoints' ? '#f0fdf4' : 'transparent',
              color: activeView === 'endpoints' ? '#00ed64' : '#6b7280'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Endpoints
          </button>
          <button
            onClick={() => setActiveView('services')}
            className={`w-full text-left py-2 px-3 text-sm rounded flex items-center gap-2 ${
              activeView === 'services' ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: activeView === 'services' ? '#f0fdf4' : 'transparent',
              color: activeView === 'services' ? '#00ed64' : '#6b7280'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            Services
          </button>
        </div>

        <div className="mt-6 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#6b7280' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Configuration
          </div>
          <button
            onClick={() => setActiveView('routing')}
            className={`w-full text-left py-2 px-3 text-sm rounded flex items-center gap-2 ${
              activeView === 'routing' ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: activeView === 'routing' ? '#f0fdf4' : 'transparent',
              color: activeView === 'routing' ? '#00ed64' : '#6b7280'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Routing
          </button>
        </div>

        <div className="mt-6 space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#6b7280' }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Monitoring
          </div>
          <button
            onClick={() => setActiveView('logs')}
            className={`w-full text-left py-2 px-3 text-sm rounded flex items-center gap-2 ${
              activeView === 'logs' ? 'font-medium' : ''
            }`}
            style={{
              backgroundColor: activeView === 'logs' ? '#f0fdf4' : 'transparent',
              color: activeView === 'logs' ? '#00ed64' : '#6b7280'
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            Request Logs
          </button>
        </div>
      </div>
    </aside>
  );
}


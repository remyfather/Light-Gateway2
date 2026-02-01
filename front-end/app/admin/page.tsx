'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Dashboard from '@/components/admin/Dashboard';
import EndpointsList from '@/components/admin/EndpointsList';
import RequestLogs from '@/components/admin/RequestLogs';
import RoutingConfig from '@/components/admin/RoutingConfig';
import ServicesList from '@/components/admin/ServicesList';

type ActiveView = 'dashboard' | 'endpoints' | 'logs' | 'routing' | 'services';

export default function AdminPage() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f6f7fa' }}>
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: '#00ed64' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="font-semibold text-lg" style={{ color: '#001e2b' }}>API Gateway</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm px-3 py-1.5 rounded hover:bg-gray-100" style={{ color: '#6b7280' }}>
              Help
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs font-medium" style={{ color: '#6b7280' }}>A</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content */}
        <main className="flex-1">
          {/* Breadcrumbs */}
          <div className="bg-white border-b px-6 py-3" style={{ borderColor: '#e2e8f0' }}>
            <div className="text-sm" style={{ color: '#6b7280' }}>
              <span>API Gateway</span>
              <span className="mx-2">/</span>
              <span className="font-medium" style={{ color: '#001e2b' }}>
                {activeView === 'dashboard' && 'Dashboard'}
                {activeView === 'endpoints' && 'Endpoints'}
                {activeView === 'logs' && 'Request Logs'}
                {activeView === 'routing' && 'Routing'}
                {activeView === 'services' && 'Services'}
              </span>
            </div>
          </div>

          {/* Page Title */}
          <div className="bg-white px-6 py-6 border-b" style={{ borderColor: '#e2e8f0' }}>
            <h1 className="text-3xl font-bold" style={{ color: '#00ed64' }}>
              {activeView === 'dashboard' && 'Dashboard'}
              {activeView === 'endpoints' && 'API Endpoints'}
              {activeView === 'logs' && 'Request Logs'}
              {activeView === 'routing' && 'Routing Configuration'}
              {activeView === 'services' && 'Services'}
            </h1>
            <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
              {activeView === 'dashboard' && 'Monitor your API Gateway performance and statistics'}
              {activeView === 'endpoints' && 'Manage and configure API endpoints'}
              {activeView === 'logs' && 'View and analyze API request logs'}
              {activeView === 'routing' && 'Configure routing rules and policies'}
              {activeView === 'services' && 'Manage backend services and their configurations'}
            </p>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'endpoints' && <EndpointsList />}
            {activeView === 'logs' && <RequestLogs />}
            {activeView === 'routing' && <RoutingConfig />}
            {activeView === 'services' && <ServicesList />}
          </div>
        </main>
      </div>
    </div>
  );
}


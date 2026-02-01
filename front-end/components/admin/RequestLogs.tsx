'use client';

import React, { useState } from 'react';

interface LogEntry {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  status: number;
  responseTime: number;
  ip: string;
  userAgent: string;
}

export default function RequestLogs() {
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2024-01-15 14:23:45',
      method: 'GET',
      path: '/api/v1/users',
      status: 200,
      responseTime: 120,
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:23:42',
      method: 'POST',
      path: '/api/v1/orders',
      status: 201,
      responseTime: 250,
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:23:38',
      method: 'GET',
      path: '/api/v1/products',
      status: 404,
      responseTime: 45,
      ip: '192.168.1.102',
      userAgent: 'curl/7.68.0',
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:23:35',
      method: 'PUT',
      path: '/api/v1/users/123',
      status: 200,
      responseTime: 180,
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:23:30',
      method: 'DELETE',
      path: '/api/v1/products/456',
      status: 500,
      responseTime: 1200,
      ip: '192.168.1.103',
      userAgent: 'PostmanRuntime/7.28.4',
    },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'success' && log.status < 400) ||
                         (filterStatus === 'error' && log.status >= 400);
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: number) => {
    if (status < 300) return '#10b981';
    if (status < 400) return '#3b82f6';
    if (status < 500) return '#f59e0b';
    return '#ef4444';
  };

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: '#10b981',
      POST: '#3b82f6',
      PUT: '#f59e0b',
      DELETE: '#ef4444',
      PATCH: '#8b5cf6',
    };
    return colors[method] || '#6b7280';
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg p-4 border" style={{ borderColor: '#e2e8f0' }}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search by path or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none"
              style={{ borderColor: '#e2e8f0', borderRadius: '4px' }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded focus:outline-none"
            style={{ borderColor: '#e2e8f0', borderRadius: '4px' }}
          >
            <option value="all">All Status</option>
            <option value="success">Success (2xx, 3xx)</option>
            <option value="error">Error (4xx, 5xx)</option>
          </select>
          <button
            className="px-6 py-2 text-white rounded font-semibold"
            style={{ backgroundColor: '#00ed64', borderRadius: '4px' }}
          >
            Export Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Logs List */}
        <div className="lg:col-span-2 bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
          <div className="p-4 border-b" style={{ borderColor: '#e2e8f0' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#001e2b' }}>
              Request Logs
            </h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto" style={{ borderColor: '#e2e8f0' }}>
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedLog?.id === log.id ? 'bg-green-50' : 'hover:bg-gray-50'
                }`}
                style={{
                  borderLeft: selectedLog?.id === log.id ? '4px solid #00ed64' : '4px solid transparent',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 text-xs font-semibold rounded text-white"
                      style={{ backgroundColor: getMethodColor(log.method) }}
                    >
                      {log.method}
                    </span>
                    <code className="text-sm font-mono" style={{ color: '#001e2b' }}>
                      {log.path}
                    </code>
                  </div>
                  <span
                    className="px-2 py-0.5 text-xs font-semibold rounded text-white"
                    style={{ backgroundColor: getStatusColor(log.status) }}
                  >
                    {log.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs" style={{ color: '#6b7280' }}>
                  <span>{log.timestamp}</span>
                  <span>{log.responseTime}ms</span>
                  <span>{log.ip}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Log Details */}
        <div className="bg-white rounded-lg border" style={{ borderColor: '#e2e8f0' }}>
          <div className="p-4 border-b" style={{ borderColor: '#e2e8f0' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#001e2b' }}>
              Log Details
            </h3>
          </div>
          {selectedLog ? (
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase mb-1" style={{ color: '#6b7280' }}>
                  Request
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: '#001e2b' }}>Method: </span>
                    <span style={{ color: '#6b7280' }}>{selectedLog.method}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#001e2b' }}>Path: </span>
                    <code className="font-mono" style={{ color: '#6b7280' }}>{selectedLog.path}</code>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#001e2b' }}>IP: </span>
                    <span style={{ color: '#6b7280' }}>{selectedLog.ip}</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#001e2b' }}>User Agent: </span>
                    <span className="text-xs" style={{ color: '#6b7280' }}>{selectedLog.userAgent}</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase mb-1" style={{ color: '#6b7280' }}>
                  Response
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium" style={{ color: '#001e2b' }}>Status: </span>
                    <span
                      className="px-2 py-0.5 rounded text-white text-xs"
                      style={{ backgroundColor: getStatusColor(selectedLog.status) }}
                    >
                      {selectedLog.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#001e2b' }}>Response Time: </span>
                    <span style={{ color: '#6b7280' }}>{selectedLog.responseTime}ms</span>
                  </div>
                  <div>
                    <span className="font-medium" style={{ color: '#001e2b' }}>Timestamp: </span>
                    <span style={{ color: '#6b7280' }}>{selectedLog.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm" style={{ color: '#6b7280' }}>
                Select a log entry to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


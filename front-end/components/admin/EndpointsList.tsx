'use client';

import React, { useState } from 'react';

interface Endpoint {
  id: string;
  path: string;
  method: string;
  service: string;
  status: 'active' | 'inactive';
  requests: number;
  avgResponseTime: number;
  errorRate: number;
}

export default function EndpointsList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const endpoints: Endpoint[] = [
    { id: '1', path: '/api/v1/users', method: 'GET', service: 'user-service', status: 'active', requests: 12345, avgResponseTime: 120, errorRate: 0.2 },
    { id: '2', path: '/api/v1/users', method: 'POST', service: 'user-service', status: 'active', requests: 5432, avgResponseTime: 180, errorRate: 0.5 },
    { id: '3', path: '/api/v1/products', method: 'GET', service: 'product-service', status: 'active', requests: 23456, avgResponseTime: 95, errorRate: 0.1 },
    { id: '4', path: '/api/v1/orders', method: 'POST', service: 'order-service', status: 'active', requests: 8765, avgResponseTime: 250, errorRate: 1.2 },
    { id: '5', path: '/api/v1/payments', method: 'POST', service: 'payment-service', status: 'inactive', requests: 0, avgResponseTime: 0, errorRate: 0 },
  ];

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = filterMethod === 'all' || endpoint.method === filterMethod;
    const matchesStatus = filterStatus === 'all' || endpoint.status === filterStatus;
    return matchesSearch && matchesMethod && matchesStatus;
  });

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
              placeholder="Search endpoints..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-offset-0"
              style={{ borderColor: '#e2e8f0', borderRadius: '4px' }}
            />
          </div>
          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="px-4 py-2 border rounded focus:outline-none"
            style={{ borderColor: '#e2e8f0', borderRadius: '4px' }}
          >
            <option value="all">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
            <option value="PATCH">PATCH</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded focus:outline-none"
            style={{ borderColor: '#e2e8f0', borderRadius: '4px' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button
            className="px-6 py-2 text-white rounded font-semibold"
            style={{ backgroundColor: '#00ed64', borderRadius: '4px' }}
          >
            + New Endpoint
          </button>
        </div>
      </div>

      {/* Endpoints Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Avg Response
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Error Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
              {filteredEndpoints.map((endpoint) => (
                <tr key={endpoint.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className="px-2 py-1 text-xs font-semibold rounded text-white"
                      style={{ backgroundColor: getMethodColor(endpoint.method) }}
                    >
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono" style={{ color: '#001e2b' }}>
                      {endpoint.path}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#6b7280' }}>
                      {endpoint.service}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        endpoint.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {endpoint.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm" style={{ color: '#001e2b' }}>
                      {endpoint.requests.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm" style={{ color: '#001e2b' }}>
                      {endpoint.avgResponseTime}ms
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`text-sm font-medium ${
                        endpoint.errorRate > 1 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {endpoint.errorRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      onClick={() => console.log('Edit', endpoint.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => console.log('Delete', endpoint.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEndpoints.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: '#6b7280' }}>
              No endpoints found matching your criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}


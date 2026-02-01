'use client';

import React, { useState } from 'react';

interface Route {
  id: string;
  path: string;
  method: string;
  targetService: string;
  targetPath: string;
  priority: number;
  enabled: boolean;
  rateLimit?: number;
  timeout?: number;
}

export default function RoutingConfig() {
  const [routes, setRoutes] = useState<Route[]>([
    {
      id: '1',
      path: '/api/v1/users',
      method: 'GET',
      targetService: 'user-service',
      targetPath: '/users',
      priority: 1,
      enabled: true,
      rateLimit: 1000,
      timeout: 5000,
    },
    {
      id: '2',
      path: '/api/v1/users',
      method: 'POST',
      targetService: 'user-service',
      targetPath: '/users',
      priority: 1,
      enabled: true,
      rateLimit: 500,
      timeout: 5000,
    },
    {
      id: '3',
      path: '/api/v1/products/*',
      method: 'ALL',
      targetService: 'product-service',
      targetPath: '/products/*',
      priority: 2,
      enabled: true,
      rateLimit: 2000,
      timeout: 3000,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const toggleRoute = (id: string) => {
    setRoutes(routes.map(route =>
      route.id === id ? { ...route, enabled: !route.enabled } : route
    ));
  };

  const deleteRoute = (id: string) => {
    if (confirm('Are you sure you want to delete this route?')) {
      setRoutes(routes.filter(route => route.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#001e2b' }}>
            Routing Rules
          </h3>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Configure how requests are routed to backend services
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-2 text-white rounded font-semibold"
          style={{ backgroundColor: '#00ed64', borderRadius: '4px' }}
        >
          + Add Route
        </button>
      </div>

      {/* Routes Table */}
      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#e2e8f0' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Path Pattern
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Target Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Target Path
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Rate Limit
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: '#6b7280' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e2e8f0' }}>
              {routes.map((route) => (
                <tr key={route.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono" style={{ color: '#001e2b' }}>
                      {route.path}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#6b7280' }}>
                      {route.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#6b7280' }}>
                      {route.targetService}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-sm font-mono" style={{ color: '#001e2b' }}>
                      {route.targetPath}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#001e2b' }}>
                      {route.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm" style={{ color: '#6b7280' }}>
                      {route.rateLimit ? `${route.rateLimit}/min` : 'Unlimited'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleRoute(route.id)}
                      className={`px-2 py-1 text-xs font-semibold rounded ${
                        route.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {route.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      onClick={() => setEditingRoute(route)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => deleteRoute(route.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {routes.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm" style={{ color: '#6b7280' }}>
              No routing rules configured. Add your first route to get started.
            </p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4" style={{ borderRadius: '8px' }}>
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold mb-1" style={{ color: '#1e40af' }}>
              Routing Priority
            </h4>
            <p className="text-sm" style={{ color: '#1e3a8a' }}>
              Routes are matched in order of priority (lower numbers = higher priority). Use wildcards (*) for path patterns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


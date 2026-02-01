'use client';

import React, { useState } from 'react';

interface Service {
  id: string;
  name: string;
  baseUrl: string;
  health: 'healthy' | 'degraded' | 'down';
  uptime: number;
  requests: number;
  avgResponseTime: number;
  lastCheck: string;
}

export default function ServicesList() {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      name: 'user-service',
      baseUrl: 'http://user-service:8080',
      health: 'healthy',
      uptime: 99.9,
      requests: 12345,
      avgResponseTime: 120,
      lastCheck: '2024-01-15 14:23:45',
    },
    {
      id: '2',
      name: 'product-service',
      baseUrl: 'http://product-service:8080',
      health: 'healthy',
      uptime: 99.8,
      requests: 23456,
      avgResponseTime: 95,
      lastCheck: '2024-01-15 14:23:45',
    },
    {
      id: '3',
      name: 'order-service',
      baseUrl: 'http://order-service:8080',
      health: 'degraded',
      uptime: 98.5,
      requests: 8765,
      avgResponseTime: 250,
      lastCheck: '2024-01-15 14:23:45',
    },
    {
      id: '4',
      name: 'payment-service',
      baseUrl: 'http://payment-service:8080',
      health: 'down',
      uptime: 0,
      requests: 0,
      avgResponseTime: 0,
      lastCheck: '2024-01-15 14:20:00',
    },
  ]);

  const getHealthColor = (health: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      healthy: { bg: '#d1fae5', text: '#065f46' },
      degraded: { bg: '#fef3c7', text: '#92400e' },
      down: { bg: '#fee2e2', text: '#991b1b' },
    };
    return colors[health] || colors.down;
  };

  const getHealthIcon = (health: string) => {
    if (health === 'healthy') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (health === 'degraded') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: '#001e2b' }}>
            Backend Services
          </h3>
          <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
            Monitor and manage backend services connected to the gateway
          </p>
        </div>
        <button
          className="px-6 py-2 text-white rounded font-semibold"
          style={{ backgroundColor: '#00ed64', borderRadius: '4px' }}
        >
          + Add Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const healthColors = getHealthColor(service.health);
          return (
            <div
              key={service.id}
              className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow"
              style={{ borderColor: '#e2e8f0' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: healthColors.bg }}
                  >
                    <div style={{ color: healthColors.text }}>
                      {getHealthIcon(service.health)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold" style={{ color: '#001e2b' }}>
                      {service.name}
                    </h4>
                    <code className="text-xs font-mono" style={{ color: '#6b7280' }}>
                      {service.baseUrl}
                    </code>
                  </div>
                </div>
                <span
                  className="px-3 py-1 text-xs font-semibold rounded"
                  style={{ backgroundColor: healthColors.bg, color: healthColors.text }}
                >
                  {service.health.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                    Uptime
                  </div>
                  <div className="text-lg font-semibold" style={{ color: '#001e2b' }}>
                    {service.uptime}%
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                    Requests
                  </div>
                  <div className="text-lg font-semibold" style={{ color: '#001e2b' }}>
                    {service.requests.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                    Avg Response
                  </div>
                  <div className="text-lg font-semibold" style={{ color: '#001e2b' }}>
                    {service.avgResponseTime}ms
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
                    Last Check
                  </div>
                  <div className="text-sm" style={{ color: '#6b7280' }}>
                    {service.lastCheck}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t" style={{ borderColor: '#e2e8f0' }}>
                <button
                  className="flex-1 px-4 py-2 text-sm border rounded hover:bg-gray-50"
                  style={{ borderColor: '#e2e8f0', borderRadius: '4px', color: '#6b7280' }}
                >
                  View Details
                </button>
                <button
                  className="px-4 py-2 text-sm border rounded hover:bg-gray-50"
                  style={{ borderColor: '#e2e8f0', borderRadius: '4px', color: '#6b7280' }}
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#e2e8f0' }}>
        <h4 className="text-sm font-semibold mb-4" style={{ color: '#001e2b' }}>
          Service Summary
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
              Total Services
            </div>
            <div className="text-2xl font-bold" style={{ color: '#001e2b' }}>
              {services.length}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
              Healthy
            </div>
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.health === 'healthy').length}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
              Degraded
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {services.filter(s => s.health === 'degraded').length}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium mb-1" style={{ color: '#6b7280' }}>
              Down
            </div>
            <div className="text-2xl font-bold text-red-600">
              {services.filter(s => s.health === 'down').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


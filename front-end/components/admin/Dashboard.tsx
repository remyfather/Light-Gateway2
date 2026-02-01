'use client';

import React from 'react';

export default function Dashboard() {
  const stats = [
    { label: 'Total Requests', value: '1,234,567', change: '+12.5%', trend: 'up' },
    { label: 'Success Rate', value: '99.2%', change: '+0.3%', trend: 'up' },
    { label: 'Avg Response Time', value: '145ms', change: '-8ms', trend: 'down' },
    { label: 'Active Endpoints', value: '42', change: '+3', trend: 'up' },
  ];

  const recentActivity = [
    { time: '2 minutes ago', action: 'New endpoint created', endpoint: '/api/v1/users', user: 'admin' },
    { time: '15 minutes ago', action: 'Routing rule updated', endpoint: '/api/v1/products', user: 'admin' },
    { time: '1 hour ago', action: 'Service health check failed', endpoint: 'user-service', user: 'system' },
    { time: '2 hours ago', action: 'Rate limit exceeded', endpoint: '/api/v1/orders', user: 'system' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 border" style={{ borderColor: '#e2e8f0' }}>
            <div className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>
              {stat.label}
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-bold" style={{ color: '#001e2b' }}>
                {stat.value}
              </div>
              <div
                className={`text-xs font-medium px-2 py-1 rounded ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {stat.change}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Volume Chart */}
        <div className="bg-white rounded-lg p-6 border" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#001e2b' }}>
            Request Volume (Last 24h)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = Math.random() * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      backgroundColor: '#00ed64',
                      height: `${height}%`,
                      minHeight: '4px',
                    }}
                    title={`${Math.round(height)}%`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between text-xs" style={{ color: '#6b7280' }}>
            <span>00:00</span>
            <span>12:00</span>
            <span>24:00</span>
          </div>
        </div>

        {/* Response Time Chart */}
        <div className="bg-white rounded-lg p-6 border" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#001e2b' }}>
            Response Time (Last 24h)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {Array.from({ length: 24 }).map((_, i) => {
              const height = Math.random() * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full rounded-t transition-all hover:opacity-80"
                    style={{
                      backgroundColor: '#3b82f6',
                      height: `${height}%`,
                      minHeight: '4px',
                    }}
                    title={`${Math.round(height)}ms`}
                  />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex justify-between text-xs" style={{ color: '#6b7280' }}>
            <span>00:00</span>
            <span>12:00</span>
            <span>24:00</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border" style={{ borderColor: '#e2e8f0' }}>
        <div className="p-6 border-b" style={{ borderColor: '#e2e8f0' }}>
          <h3 className="text-lg font-semibold" style={{ color: '#001e2b' }}>
            Recent Activity
          </h3>
        </div>
        <div className="divide-y" style={{ borderColor: '#e2e8f0' }}>
          {recentActivity.map((activity, index) => (
            <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium" style={{ color: '#001e2b' }}>
                      {activity.action}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#f3f4f6', color: '#6b7280' }}>
                      {activity.endpoint}
                    </span>
                  </div>
                  <div className="text-xs" style={{ color: '#6b7280' }}>
                    by {activity.user} • {activity.time}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


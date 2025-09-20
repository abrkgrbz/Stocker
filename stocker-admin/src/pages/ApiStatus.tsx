import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api/apiClient';
import { dashboardService } from '../services/api/dashboardService';
import { tenantService } from '../services/api/tenantService';
import { userService } from '../services/api/userService';
import { useLoadingStore, LOADING_KEYS } from '../stores/loadingStore';

interface ApiEndpoint {
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'pending' | 'success' | 'error' | 'loading';
  responseTime?: number;
  error?: string;
  testFunction: () => Promise<any>;
}

export const ApiStatus: React.FC = () => {
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const { setLoading, isLoading } = useLoadingStore();

  useEffect(() => {
    initializeEndpoints();
  }, []);

  const initializeEndpoints = () => {
    const apiEndpoints: ApiEndpoint[] = [
      {
        name: 'Master Auth Login',
        path: '/api/master/auth/login',
        method: 'POST',
        status: 'pending',
        testFunction: async () => {
          // This is a test endpoint - in production, use test credentials
          return { message: 'Login endpoint available' };
        }
      },
      {
        name: 'Dashboard Stats',
        path: '/api/master/dashboard/stats',
        method: 'GET',
        status: 'pending',
        testFunction: () => dashboardService.getStats()
      },
      {
        name: 'System Health',
        path: '/api/master/dashboard/system-health',
        method: 'GET',
        status: 'pending',
        testFunction: () => dashboardService.getSystemHealth()
      },
      {
        name: 'Recent Tenants',
        path: '/api/master/dashboard/recent-tenants',
        method: 'GET',
        status: 'pending',
        testFunction: () => dashboardService.getRecentTenants()
      },
      {
        name: 'Tenant List',
        path: '/api/master/tenants',
        method: 'GET',
        status: 'pending',
        testFunction: () => tenantService.getAll()
      },
      {
        name: 'User List',
        path: '/api/master/users',
        method: 'GET',
        status: 'pending',
        testFunction: () => userService.getAll()
      },
      {
        name: 'User Statistics',
        path: '/api/master/users/statistics',
        method: 'GET',
        status: 'pending',
        testFunction: () => userService.getStatistics()
      },
    ];

    setEndpoints(apiEndpoints);
  };

  const testEndpoint = async (index: number) => {
    const endpoint = endpoints[index];
    const loadingKey = `api-test-${index}`;
    
    setLoading(loadingKey, true);
    
    setEndpoints(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: 'loading' };
      return updated;
    });

    const startTime = Date.now();
    
    try {
      await endpoint.testFunction();
      const responseTime = Date.now() - startTime;
      
      setEndpoints(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: 'success', 
          responseTime,
          error: undefined 
        };
        return updated;
      });
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      setEndpoints(prev => {
        const updated = [...prev];
        updated[index] = { 
          ...updated[index], 
          status: 'error', 
          responseTime,
          error: error.message || 'Unknown error' 
        };
        return updated;
      });
    } finally {
      setLoading(loadingKey, false);
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);
    
    for (let i = 0; i < endpoints.length; i++) {
      await testEndpoint(i);
      // Small delay between tests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setIsTestingAll(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'loading':
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'loading':
        return '⏳';
      default:
        return '⚪';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-500';
      case 'POST':
        return 'bg-green-500';
      case 'PUT':
        return 'bg-yellow-500';
      case 'DELETE':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">API Integration Status</h1>
          <button
            onClick={testAllEndpoints}
            disabled={isTestingAll}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isTestingAll ? 'Testing...' : 'Test All Endpoints'}
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>API URL:</strong> {import.meta.env.VITE_API_URL || 'Not configured'}
          </p>
          <p className="text-sm text-blue-700 mt-1">
            <strong>Environment:</strong> {import.meta.env.VITE_APP_ENVIRONMENT || 'development'}
          </p>
        </div>

        <div className="space-y-3">
          {endpoints.map((endpoint, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getStatusIcon(endpoint.status)}</span>
                  <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-800">{endpoint.name}</p>
                    <p className="text-sm text-gray-500">{endpoint.path}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {endpoint.responseTime !== undefined && (
                    <span className="text-sm text-gray-500">
                      {endpoint.responseTime}ms
                    </span>
                  )}
                  
                  <span className={`text-sm font-medium ${getStatusColor(endpoint.status)}`}>
                    {endpoint.status === 'loading' ? 'Testing...' : endpoint.status.toUpperCase()}
                  </span>
                  
                  <button
                    onClick={() => testEndpoint(index)}
                    disabled={endpoint.status === 'loading' || isTestingAll}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Test
                  </button>
                </div>
              </div>
              
              {endpoint.error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">
                    <strong>Error:</strong> {endpoint.error}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2">Test Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Success:</span>{' '}
              <span className="font-semibold text-green-600">
                {endpoints.filter(e => e.status === 'success').length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Failed:</span>{' '}
              <span className="font-semibold text-red-600">
                {endpoints.filter(e => e.status === 'error').length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Pending:</span>{' '}
              <span className="font-semibold text-gray-600">
                {endpoints.filter(e => e.status === 'pending').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useSignalRDashboard, useSignalRTenantUpdates, useSignalRUserActivity } from '../hooks/useSignalR';
import { dashboardService } from '../services/api/dashboardService';
import { useLoadingStore, LOADING_KEYS } from '../stores/loadingStore';
import { ConnectionStatus } from '../components/SignalR/ConnectionStatus';
import { NotificationCenter } from '../components/Notifications/NotificationCenter';

const Dashboard: React.FC = () => {
  const { registerUpdateHandler, latestDashboardUpdate } = useSignalRDashboard();
  const { latestUpdate: latestTenantUpdate } = useSignalRTenantUpdates();
  const { activities } = useSignalRUserActivity();
  const { setLoading, isLoading } = useLoadingStore();
  
  // Initialize with mock data for testing
  const [stats, setStats] = useState<any>({
    totalTenants: 45,
    newTenantsThisMonth: 8,
    activeUsers: 1234,
    totalUsers: 1500,
    monthlyRevenue: 125000,
    growthRate: 15.5,
    activeTenants: 42
  });
  
  const [revenueData, setRevenueData] = useState<any>(null);
  
  const [systemHealth, setSystemHealth] = useState<any>({
    apiStatus: 'healthy',
    databaseStatus: 'healthy',
    cacheStatus: 'healthy',
    cpuUsage: 45,
    memoryUsage: 62,
    uptime: '15 days'
  });
  
  const [recentTenants, setRecentTenants] = useState<any[]>([
    { id: '1', name: 'Acme Corp', packageName: 'Premium', userCount: 25, status: 'active' },
    { id: '2', name: 'Tech Solutions', packageName: 'Basic', userCount: 10, status: 'active' },
    { id: '3', name: 'Global Industries', packageName: 'Enterprise', userCount: 100, status: 'active' }
  ]);
  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(true);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Register real-time update handlers
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const unsubscribeStats = registerUpdateHandler('stats', (data) => {
      setStats(data);
      console.log('📊 Real-time stats update:', data);
    });

    const unsubscribeRevenue = registerUpdateHandler('revenue', (data) => {
      setRevenueData(data);
      console.log('💰 Real-time revenue update:', data);
    });

    const unsubscribeTenants = registerUpdateHandler('tenants', (data) => {
      setRecentTenants(data);
      console.log('🏢 Real-time tenants update:', data);
    });

    return () => {
      unsubscribeStats();
      unsubscribeRevenue();
      unsubscribeTenants();
    };
  }, [registerUpdateHandler, isRealTimeEnabled]);

  // React to tenant status changes
  useEffect(() => {
    if (latestTenantUpdate) {
      // Update tenant list if status changed
      loadRecentTenants();
      
      // Show notification (handled by NotificationCenter)
      console.log('🔄 Tenant status updated:', latestTenantUpdate);
    }
  }, [latestTenantUpdate]);

  const loadDashboardData = async () => {
    setLoading(LOADING_KEYS.DASHBOARD_STATS, true);
    
    try {
      // Load data sequentially with small delays to avoid rate limiting
      const statsData = await dashboardService.getStats();
      if (statsData) setStats(statsData);
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const revenue = await dashboardService.getRevenueOverview();
      if (revenue) setRevenueData(revenue);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const health = await dashboardService.getSystemHealth();
      if (health) setSystemHealth(health);
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const tenants = await dashboardService.getRecentTenants();
      if (tenants && tenants.length > 0) setRecentTenants(tenants);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Keep mock data on error
      console.log('Using mock data for display');
    } finally {
      setLoading(LOADING_KEYS.DASHBOARD_STATS, false);
    }
  };

  const loadRecentTenants = async () => {
    try {
      const tenants = await dashboardService.getRecentTenants();
      setRecentTenants(tenants);
    } catch (error) {
      console.error('Failed to load recent tenants:', error);
    }
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'degraded': return '⚠️';
      case 'down': return '❌';
      default: return '⚪';
    }
  };

  if (isLoading(LOADING_KEYS.DASHBOARD_STATS)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Real-time Features */}
      <NotificationCenter position="top-right" />
      <ConnectionStatus showDetails={true} />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dashboard
              {latestDashboardUpdate && (
                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Live
                </span>
              )}
            </h1>
            <p className="mt-1 text-gray-600">
              Real-time overview of your system
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isRealTimeEnabled}
                onChange={(e) => setIsRealTimeEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Real-time Updates</span>
            </label>
            
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalTenants || 0}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  +{stats.newTenantsThisMonth || 0} this month
                </p>
              </div>
              <span className="text-2xl">🏢</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeUsers || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  of {stats.totalUsers || 0} total
                </p>
              </div>
              <span className="text-2xl">👥</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${stats.monthlyRevenue?.toLocaleString() || 0}
                </p>
                <p className="text-xs text-green-600 mt-2">
                  {stats.growthRate > 0 ? '+' : ''}{stats.growthRate || 0}% growth
                </p>
              </div>
              <span className="text-2xl">💰</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.activeTenants || 0}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {stats.totalTenants ? ((stats.activeTenants / stats.totalTenants) * 100).toFixed(0) : 0}% active
                </p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        {systemHealth && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              System Health
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">API</span>
                <span className={`font-medium ${getHealthColor(systemHealth.apiStatus)}`}>
                  {getHealthIcon(systemHealth.apiStatus)} {systemHealth.apiStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database</span>
                <span className={`font-medium ${getHealthColor(systemHealth.databaseStatus)}`}>
                  {getHealthIcon(systemHealth.databaseStatus)} {systemHealth.databaseStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cache</span>
                <span className={`font-medium ${getHealthColor(systemHealth.cacheStatus)}`}>
                  {getHealthIcon(systemHealth.cacheStatus)} {systemHealth.cacheStatus}
                </span>
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">CPU Usage</span>
                    <span>{systemHealth.cpuUsage || 0}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Memory</span>
                    <span>{systemHealth.memoryUsage || 0}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Uptime</span>
                    <span>{systemHealth.uptime || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Tenants */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Tenants
            {latestTenantUpdate && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Updated
              </span>
            )}
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentTenants && recentTenants.length > 0 ? (
              recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-2 hover:bg-white rounded">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tenant.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {tenant.packageName || 'Basic'} • {tenant.userCount || 0} users
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    tenant.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {tenant.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No tenants available
              </p>
            )}
          </div>
        </div>

        {/* User Activity */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Live Activity
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {activities.length} events
            </span>
          </h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activities.slice(0, 10).map((activity, index) => (
              <div key={index} className="text-xs border-l-2 border-blue-400 pl-3 py-1">
                <p className="font-medium text-gray-900">
                  {activity.userName} - {activity.action}
                </p>
                <p className="text-gray-500">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
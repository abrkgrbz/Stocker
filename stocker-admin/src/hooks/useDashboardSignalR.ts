import { useEffect, useState, useCallback } from 'react';
import { signalRService } from '../services/signalr/signalRService';
import { notification } from 'antd';

export interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  monthlyRevenue: number;
  growthRate: number;
  newTenantsThisMonth: number;
  activeSubscriptions: number;
  pendingPayments: number;
}

export interface SystemHealthUpdate {
  service: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: string;
  responseTime: number;
  timestamp: Date;
}

export interface RevenueUpdate {
  date: string;
  amount: number;
  type: 'payment' | 'subscription' | 'refund';
}

export const useDashboardSignalR = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthUpdate[]>([]);
  const [revenueUpdates, setRevenueUpdates] = useState<RevenueUpdate[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    // Connection state listener
    const handleConnectionChange = (state: any) => {
      setIsConnected(state.isConnected);
    };

    // Dashboard update listener
    const handleDashboardUpdate = (update: any) => {
      console.log('📊 Dashboard update received:', update);
      
      switch (update.type) {
        case 'stats':
          setStats(update.data);
          notification.success({
            message: 'İstatistikler Güncellendi',
            description: 'Dashboard istatistikleri güncellendi',
            placement: 'topRight',
            duration: 3,
          });
          break;
          
        case 'revenue':
          setRevenueUpdates(prev => [...prev, update.data].slice(-20)); // Keep last 20
          break;
          
        case 'tenants':
          if (update.data.stats) {
            setStats(prev => ({ ...prev, ...update.data.stats }));
          }
          break;
          
        case 'users':
          if (update.data.totalUsers) {
            setStats(prev => prev ? { ...prev, totalUsers: update.data.totalUsers } : null);
          }
          break;
      }
    };

    // Tenant status change listener
    const handleTenantStatusChange = (update: any) => {
      console.log('🏢 Tenant status changed:', update);
      
      // Update activity log
      setRecentActivity(prev => [{
        type: 'tenant_status',
        tenantName: update.tenantName,
        oldStatus: update.oldStatus,
        newStatus: update.newStatus,
        changedBy: update.changedBy,
        timestamp: update.timestamp
      }, ...prev].slice(0, 10)); // Keep last 10 activities
      
      // Show notification
      notification.info({
        message: 'Firma Durumu Değişti',
        description: `${update.tenantName} durumu ${update.oldStatus} → ${update.newStatus} olarak güncellendi`,
        placement: 'topRight',
        duration: 4,
      });
    };

    // User activity listener
    const handleUserActivity = (activity: any) => {
      console.log('👤 User activity:', activity);
      
      setRecentActivity(prev => [{
        type: 'user_activity',
        userName: activity.userName,
        action: activity.action,
        details: activity.details,
        timestamp: activity.timestamp
      }, ...prev].slice(0, 10));
    };

    // System alert listener
    const handleSystemAlert = (alert: any) => {
      console.log('🚨 System alert:', alert);
      
      // Update system health if alert contains health data
      if (alert.service) {
        setSystemHealth(prev => {
          const existing = prev.findIndex(h => h.service === alert.service);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = {
              service: alert.service,
              status: alert.status || 'degraded',
              uptime: alert.uptime || 'N/A',
              responseTime: alert.responseTime || 0,
              timestamp: new Date()
            };
            return updated;
          } else {
            return [...prev, {
              service: alert.service,
              status: alert.status || 'degraded',
              uptime: alert.uptime || 'N/A',
              responseTime: alert.responseTime || 0,
              timestamp: new Date()
            }];
          }
        });
      }
      
      // Show alert notification
      const alertType = alert.severity === 'critical' ? 'error' : 
                       alert.severity === 'warning' ? 'warning' : 'info';
      
      notification[alertType]({
        message: 'Sistem Uyarısı',
        description: alert.message || 'Sistem durumunda değişiklik tespit edildi',
        placement: 'topRight',
        duration: 0, // Don't auto close for system alerts
      });
    };

    // Register event listeners
    signalRService.on('connectionStateChanged', handleConnectionChange);
    signalRService.on('dashboardUpdate', handleDashboardUpdate);
    signalRService.on('tenantStatusChanged', handleTenantStatusChange);
    signalRService.on('userActivity', handleUserActivity);
    signalRService.on('systemAlert', handleSystemAlert);

    // Cleanup
    return () => {
      signalRService.off('connectionStateChanged', handleConnectionChange);
      signalRService.off('dashboardUpdate', handleDashboardUpdate);
      signalRService.off('tenantStatusChanged', handleTenantStatusChange);
      signalRService.off('userActivity', handleUserActivity);
      signalRService.off('systemAlert', handleSystemAlert);
    };
  }, []);

  // Manual refresh function
  const requestDashboardRefresh = useCallback(async () => {
    try {
      if (signalRService.isConnected()) {
        // Request fresh data from server
        await signalRService.sendNotification('dashboard', {
          type: 'refresh_request',
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Failed to request dashboard refresh:', error);
    }
  }, []);

  return {
    isConnected,
    stats,
    systemHealth,
    revenueUpdates,
    recentActivity,
    requestDashboardRefresh
  };
};

// Hook for real-time tenant updates
export const useRealtimeTenants = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const handleTenantUpdate = (update: any) => {
      setLastUpdate(new Date());
      
      // Update tenants list based on update type
      if (update.action === 'created') {
        setTenants(prev => [update.tenant, ...prev]);
      } else if (update.action === 'updated') {
        setTenants(prev => prev.map(t => 
          t.id === update.tenant.id ? update.tenant : t
        ));
      } else if (update.action === 'deleted') {
        setTenants(prev => prev.filter(t => t.id !== update.tenantId));
      }
    };

    signalRService.on('tenantStatusChanged', handleTenantUpdate);

    return () => {
      signalRService.off('tenantStatusChanged', handleTenantUpdate);
    };
  }, []);

  return { tenants, lastUpdate };
};

// Hook for real-time system health monitoring
export const useSystemHealthMonitor = () => {
  const [health, setHealth] = useState<Map<string, SystemHealthUpdate>>(new Map());
  const [overallStatus, setOverallStatus] = useState<'healthy' | 'degraded' | 'critical'>('healthy');

  useEffect(() => {
    const handleHealthUpdate = (update: SystemHealthUpdate) => {
      setHealth(prev => {
        const newHealth = new Map(prev);
        newHealth.set(update.service, update);
        
        // Calculate overall status
        const statuses = Array.from(newHealth.values()).map(h => h.status);
        if (statuses.some(s => s === 'down')) {
          setOverallStatus('critical');
        } else if (statuses.some(s => s === 'degraded')) {
          setOverallStatus('degraded');
        } else {
          setOverallStatus('healthy');
        }
        
        return newHealth;
      });
    };

    signalRService.on('systemAlert', handleHealthUpdate);

    return () => {
      signalRService.off('systemAlert', handleHealthUpdate);
    };
  }, []);

  return {
    health: Array.from(health.values()),
    overallStatus
  };
};
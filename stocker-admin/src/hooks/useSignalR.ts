import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  signalRService, 
  SignalRConnectionState, 
  NotificationMessage,
  TenantStatusUpdate,
  DashboardUpdate,
  UserActivity
} from '../services/signalr/signalRService';

// Hook for SignalR connection management
export function useSignalRConnection() {
  const [connectionState, setConnectionState] = useState<SignalRConnectionState>(
    signalRService.getConnectionState()
  );

  useEffect(() => {
    const handleStateChange = (newState: SignalRConnectionState) => {
      setConnectionState(newState);
    };

    signalRService.on('connectionStateChanged', handleStateChange);
    
    return () => {
      signalRService.off('connectionStateChanged', handleStateChange);
    };
  }, []);

  const connect = useCallback(async () => {
    await signalRService.connect();
  }, []);

  const disconnect = useCallback(async () => {
    await signalRService.disconnect();
  }, []);

  return {
    ...connectionState,
    connect,
    disconnect,
  };
}

// Hook for real-time notifications
export function useSignalRNotifications() {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [latestNotification, setLatestNotification] = useState<NotificationMessage | null>(null);

  useEffect(() => {
    const handleNotification = (notification: NotificationMessage) => {
      setLatestNotification(notification);
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
    };

    signalRService.on('notification', handleNotification);
    
    return () => {
      signalRService.off('notification', handleNotification);
    };
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setLatestNotification(null);
  }, []);

  const sendNotification = useCallback(async (userId: string, notification: Partial<NotificationMessage>) => {
    await signalRService.sendNotification(userId, notification);
  }, []);

  const broadcastNotification = useCallback(async (notification: Partial<NotificationMessage>) => {
    await signalRService.broadcastNotification(notification);
  }, []);

  return {
    notifications,
    latestNotification,
    clearNotifications,
    sendNotification,
    broadcastNotification,
  };
}

// Hook for tenant status updates
export function useSignalRTenantUpdates() {
  const [tenantUpdates, setTenantUpdates] = useState<TenantStatusUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<TenantStatusUpdate | null>(null);

  useEffect(() => {
    const handleTenantUpdate = (update: TenantStatusUpdate) => {
      setLatestUpdate(update);
      setTenantUpdates(prev => [update, ...prev].slice(0, 20)); // Keep last 20
    };

    signalRService.on('tenantStatusChanged', handleTenantUpdate);
    
    return () => {
      signalRService.off('tenantStatusChanged', handleTenantUpdate);
    };
  }, []);

  const joinTenantGroup = useCallback(async (tenantId: string) => {
    await signalRService.joinTenantGroup(tenantId);
  }, []);

  const leaveTenantGroup = useCallback(async (tenantId: string) => {
    await signalRService.leaveTenantGroup(tenantId);
  }, []);

  return {
    tenantUpdates,
    latestUpdate,
    joinTenantGroup,
    leaveTenantGroup,
  };
}

// Hook for dashboard real-time updates
export function useSignalRDashboard() {
  const [dashboardUpdates, setDashboardUpdates] = useState<DashboardUpdate[]>([]);
  const [latestDashboardUpdate, setLatestDashboardUpdate] = useState<DashboardUpdate | null>(null);
  const updateHandlersRef = useRef<Map<string, (data: any) => void>>(new Map());

  useEffect(() => {
    const handleDashboardUpdate = (update: DashboardUpdate) => {
      setLatestDashboardUpdate(update);
      setDashboardUpdates(prev => [update, ...prev].slice(0, 10));
      
      // Call specific handler if registered
      const handler = updateHandlersRef.current.get(update.type);
      if (handler) {
        handler(update.data);
      }
    };

    signalRService.on('dashboardUpdate', handleDashboardUpdate);
    
    return () => {
      signalRService.off('dashboardUpdate', handleDashboardUpdate);
    };
  }, []);

  const registerUpdateHandler = useCallback((type: string, handler: (data: any) => void) => {
    updateHandlersRef.current.set(type, handler);
    
    return () => {
      updateHandlersRef.current.delete(type);
    };
  }, []);

  return {
    dashboardUpdates,
    latestDashboardUpdate,
    registerUpdateHandler,
  };
}

// Hook for user activity tracking
export function useSignalRUserActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [latestActivity, setLatestActivity] = useState<UserActivity | null>(null);

  useEffect(() => {
    const handleUserActivity = (activity: UserActivity) => {
      setLatestActivity(activity);
      setActivities(prev => [activity, ...prev].slice(0, 100)); // Keep last 100
    };

    signalRService.on('userActivity', handleUserActivity);
    
    return () => {
      signalRService.off('userActivity', handleUserActivity);
    };
  }, []);

  const clearActivities = useCallback(() => {
    setActivities([]);
    setLatestActivity(null);
  }, []);

  return {
    activities,
    latestActivity,
    clearActivities,
  };
}

// Hook for system alerts
export function useSignalRSystemAlerts() {
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [latestAlert, setLatestAlert] = useState<any>(null);

  useEffect(() => {
    const handleSystemAlert = (alert: any) => {
      setLatestAlert(alert);
      setSystemAlerts(prev => [alert, ...prev].slice(0, 10)); // Keep last 10
    };

    signalRService.on('systemAlert', handleSystemAlert);
    
    return () => {
      signalRService.off('systemAlert', handleSystemAlert);
    };
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setSystemAlerts(prev => prev.filter(alert => alert.id !== alertId));
  }, []);

  return {
    systemAlerts,
    latestAlert,
    acknowledgeAlert,
  };
}

// Hook for real-time validation
export function useSignalRValidation() {
  const [validationResults, setValidationResults] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    const handleValidationResult = (result: any) => {
      setValidationResults(prev => {
        const next = new Map(prev);
        next.set(result.field, result);
        return next;
      });
    };

    signalRService.on('validationResult', handleValidationResult);
    
    return () => {
      signalRService.off('validationResult', handleValidationResult);
    };
  }, []);

  const validateField = useCallback(async (field: string, value: any) => {
    await signalRService.validateField(field, value);
  }, []);

  const clearValidation = useCallback((field?: string) => {
    if (field) {
      setValidationResults(prev => {
        const next = new Map(prev);
        next.delete(field);
        return next;
      });
    } else {
      setValidationResults(new Map());
    }
  }, []);

  return {
    validationResults,
    validateField,
    clearValidation,
  };
}

// Master hook that combines all SignalR features
export function useSignalR() {
  const connection = useSignalRConnection();
  const notifications = useSignalRNotifications();
  const tenantUpdates = useSignalRTenantUpdates();
  const dashboard = useSignalRDashboard();
  const userActivity = useSignalRUserActivity();
  const systemAlerts = useSignalRSystemAlerts();
  const validation = useSignalRValidation();

  return {
    connection,
    notifications,
    tenantUpdates,
    dashboard,
    userActivity,
    systemAlerts,
    validation,
  };
}
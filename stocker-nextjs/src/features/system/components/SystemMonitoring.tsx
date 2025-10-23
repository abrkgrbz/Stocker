'use client';

import { useEffect, useState } from 'react';
import { SystemMetrics } from './SystemMetrics';
import { ServiceStatusList } from './ServiceStatusList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Activity } from 'lucide-react';
import { systemMonitoringService } from '../api/systemMonitoringService';
import type {
  SystemMetrics as SystemMetricsType,
  ServiceStatus,
  SystemHealth,
} from '../types';
import { useToast } from '@/hooks/use-toast';

export function SystemMonitoring() {
  const [metrics, setMetrics] = useState<SystemMetricsType | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [metricsData, servicesData, healthData] = await Promise.all([
        systemMonitoringService.getSystemMetrics(),
        systemMonitoringService.getServiceStatus(),
        systemMonitoringService.getSystemHealth(),
      ]);
      setMetrics(metricsData);
      setServices(servicesData);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to fetch system data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch system monitoring data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (uptime: string) => {
    // Parse TimeSpan format from .NET
    const match = uptime.match(/(\d+)\.(\d+):(\d+):(\d+)/);
    if (!match) return uptime;

    const [, days, hours, minutes] = match;
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Activity className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">System Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Real-time system metrics and service status
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh' : 'Paused'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>
              {health.message} • Uptime: {formatUptime(health.uptime)} •
              Version: {health.version} • Environment: {health.environment}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {health.checks.map((check) => (
                <div
                  key={check.name}
                  className="flex flex-col space-y-1 border-l-4 border-l-green-500 pl-4"
                  style={{
                    borderLeftColor:
                      check.status === 0
                        ? 'rgb(34 197 94)'
                        : check.status === 1
                        ? 'rgb(234 179 8)'
                        : 'rgb(239 68 68)',
                  }}
                >
                  <p className="text-sm font-medium">{check.name}</p>
                  <p className="text-xs text-muted-foreground">{check.description}</p>
                  <p className="text-xs text-muted-foreground">{check.responseTimeMs}ms</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Metrics */}
      {metrics && <SystemMetrics metrics={metrics} />}

      {/* Service Status */}
      {services.length > 0 && <ServiceStatusList services={services} />}

      {/* Timestamp */}
      {metrics && (
        <p className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
        </p>
      )}
    </div>
  );
}

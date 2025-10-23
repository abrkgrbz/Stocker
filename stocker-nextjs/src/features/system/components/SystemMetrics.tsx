'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SystemMetrics as SystemMetricsType } from '../types';
import { Cpu, HardDrive, MemoryStick, Network } from 'lucide-react';

interface SystemMetricsProps {
  metrics: SystemMetricsType;
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 ** 3);
    return `${gb.toFixed(2)} GB`;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage < 70) return 'bg-green-500';
    if (percentage < 85) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* CPU Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.cpu.usagePercentage.toFixed(1)}%</div>
          <Progress
            value={metrics.cpu.usagePercentage}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.cpu.coreCount} cores • {metrics.cpu.processorName}
          </p>
        </CardContent>
      </Card>

      {/* Memory Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
          <MemoryStick className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.memory.usagePercentage.toFixed(1)}%</div>
          <Progress
            value={metrics.memory.usagePercentage}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {formatBytes(metrics.memory.usedBytes)} / {formatBytes(metrics.memory.totalBytes)}
          </p>
        </CardContent>
      </Card>

      {/* Disk Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.disk.totalUsagePercentage.toFixed(1)}%</div>
          <Progress
            value={metrics.disk.totalUsagePercentage}
            className="mt-2"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.disk.drives.length} drive(s)
          </p>
        </CardContent>
      </Card>

      {/* Network Metrics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network</CardTitle>
          <Network className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.network.receiveMbps.toFixed(1)} Mbps
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ↓ {formatBytes(metrics.network.bytesReceived)} •
            ↑ {formatBytes(metrics.network.bytesSent)}
          </p>
          <p className="text-xs text-muted-foreground">
            {metrics.network.interfaces.length} interface(s)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ServiceStatus } from '../types';
import { ServiceHealth } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';

interface ServiceStatusListProps {
  services: ServiceStatus[];
}

export function ServiceStatusList({ services }: ServiceStatusListProps) {
  const getStatusIcon = (status: ServiceHealth) => {
    switch (status) {
      case ServiceHealth.Online:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case ServiceHealth.Degraded:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case ServiceHealth.Offline:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case ServiceHealth.Maintenance:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: ServiceHealth) => {
    switch (status) {
      case ServiceHealth.Online:
        return <Badge variant="default" className="bg-green-500">Online</Badge>;
      case ServiceHealth.Degraded:
        return <Badge variant="default" className="bg-yellow-500">Degraded</Badge>;
      case ServiceHealth.Offline:
        return <Badge variant="destructive">Offline</Badge>;
      case ServiceHealth.Maintenance:
        return <Badge variant="secondary">Maintenance</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.serviceName}
              className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(service.status)}
                <div>
                  <p className="text-sm font-medium leading-none">{service.serviceName}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uptime: {service.uptimePercentage.toFixed(2)}% •
                    Response: {service.responseTimeMs}ms
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                {getStatusBadge(service.status)}
                {service.errorRate > 0 && (
                  <p className="text-xs text-red-500">
                    Error Rate: {service.errorRate.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

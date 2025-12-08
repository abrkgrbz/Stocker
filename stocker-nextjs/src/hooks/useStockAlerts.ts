'use client';

import { useEffect, useCallback, useState } from 'react';
import { useSignalRHub } from '@/lib/signalr/use-signalr';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import logger from '@/lib/utils/logger';

// Stock alert types matching backend DTOs
export type StockAlertType =
  | 'low_stock'
  | 'out_of_stock'
  | 'expiring_soon'
  | 'expired'
  | 'transfer_status'
  | 'stock_count_pending'
  | 'stock_adjustment'
  | 'batch_alerts';

export type StockAlertSeverity = 'info' | 'warning' | 'critical';

export interface StockAlertData {
  alertType: StockAlertType;
  productId?: number;
  productCode?: string;
  productName?: string;
  warehouseId?: number;
  warehouseName?: string;
  currentStock?: number;
  minStockLevel?: number;
  reorderPoint?: number;
  severity?: StockAlertSeverity;
  // Expiring stock specific
  lotBatchId?: number;
  lotNumber?: string;
  quantity?: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
  daysExpired?: number;
  // Transfer specific
  transferId?: number;
  transferNumber?: string;
  fromWarehouse?: string;
  toWarehouse?: string;
  oldStatus?: string;
  newStatus?: string;
  itemCount?: number;
  // Stock count specific
  stockCountId?: number;
  countNumber?: string;
  status?: string;
  discrepancyCount?: number;
  // Adjustment specific
  oldQuantity?: number;
  newQuantity?: number;
  adjustmentQuantity?: number;
  adjustmentType?: string;
  reason?: string;
  adjustedBy?: string;
  // Batch alerts
  totalCount?: number;
  criticalCount?: number;
  warningCount?: number;
  alerts?: Array<{
    productId: number;
    productCode: string;
    productName: string;
    currentStock: number;
    severity: string;
  }>;
}

export interface StockNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  icon?: string;
  data?: StockAlertData;
  createdAt: string;
}

interface UseStockAlertsOptions {
  enabled?: boolean;
  showToasts?: boolean;
  onAlert?: (notification: StockNotification) => void;
}

export function useStockAlerts(options: UseStockAlertsOptions = {}) {
  const { enabled = true, showToasts = true, onAlert } = options;
  const queryClient = useQueryClient();
  const [recentAlerts, setRecentAlerts] = useState<StockNotification[]>([]);

  // Handle incoming stock notifications
  const handleStockNotification = useCallback((notification: StockNotification) => {
    logger.info('Stock alert received', { metadata: { notification } });

    // Add to recent alerts (keep last 10)
    setRecentAlerts(prev => {
      const updated = [notification, ...prev].slice(0, 10);
      return updated;
    });

    // Call custom handler if provided
    onAlert?.(notification);

    // Show toast based on alert type and priority
    if (showToasts && notification.data) {
      const alertType = notification.data.alertType;

      switch (alertType) {
        case 'out_of_stock':
          toast.error(notification.title, {
            description: notification.message,
            duration: 10000,
            action: notification.actionUrl ? {
              label: 'Görüntüle',
              onClick: () => window.location.href = notification.actionUrl!,
            } : undefined,
          });
          break;

        case 'low_stock':
          toast.warning(notification.title, {
            description: notification.message,
            duration: 8000,
            action: notification.actionUrl ? {
              label: 'Görüntüle',
              onClick: () => window.location.href = notification.actionUrl!,
            } : undefined,
          });
          break;

        case 'expired':
          toast.error(notification.title, {
            description: notification.message,
            duration: 10000,
            action: notification.actionUrl ? {
              label: 'Görüntüle',
              onClick: () => window.location.href = notification.actionUrl!,
            } : undefined,
          });
          break;

        case 'expiring_soon':
          toast.warning(notification.title, {
            description: notification.message,
            duration: 6000,
            action: notification.actionUrl ? {
              label: 'Görüntüle',
              onClick: () => window.location.href = notification.actionUrl!,
            } : undefined,
          });
          break;

        case 'transfer_status':
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
            action: notification.actionUrl ? {
              label: 'Görüntüle',
              onClick: () => window.location.href = notification.actionUrl!,
            } : undefined,
          });
          break;

        case 'stock_count_pending':
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
            action: notification.actionUrl ? {
              label: 'Görüntüle',
              onClick: () => window.location.href = notification.actionUrl!,
            } : undefined,
          });
          break;

        case 'stock_adjustment':
          toast.info(notification.title, {
            description: notification.message,
            duration: 5000,
          });
          break;

        case 'batch_alerts':
          const criticalCount = notification.data.criticalCount || 0;
          if (criticalCount > 0) {
            toast.error(notification.title, {
              description: notification.message,
              duration: 10000,
              action: notification.actionUrl ? {
                label: 'Tümünü Gör',
                onClick: () => window.location.href = notification.actionUrl!,
              } : undefined,
            });
          } else {
            toast.warning(notification.title, {
              description: notification.message,
              duration: 8000,
              action: notification.actionUrl ? {
                label: 'Tümünü Gör',
                onClick: () => window.location.href = notification.actionUrl!,
              } : undefined,
            });
          }
          break;

        default:
          if (notification.priority === 'urgent' || notification.priority === 'high') {
            toast.warning(notification.title, {
              description: notification.message,
              duration: 6000,
            });
          } else {
            toast.info(notification.title, {
              description: notification.message,
              duration: 4000,
            });
          }
      }
    }

    // Invalidate relevant queries to refresh data
    if (notification.data) {
      const alertType = notification.data.alertType;

      // Always invalidate inventory alerts
      queryClient.invalidateQueries({ queryKey: ['inventory-alerts'] });

      // Invalidate specific queries based on alert type
      switch (alertType) {
        case 'low_stock':
        case 'out_of_stock':
        case 'stock_adjustment':
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          if (notification.data.productId) {
            queryClient.invalidateQueries({ queryKey: ['products', notification.data.productId] });
            queryClient.invalidateQueries({ queryKey: ['stock', 'product', notification.data.productId] });
          }
          break;

        case 'expiring_soon':
        case 'expired':
          queryClient.invalidateQueries({ queryKey: ['lot-batches'] });
          if (notification.data.lotBatchId) {
            queryClient.invalidateQueries({ queryKey: ['lot-batches', notification.data.lotBatchId] });
          }
          break;

        case 'transfer_status':
          queryClient.invalidateQueries({ queryKey: ['stock-transfers'] });
          if (notification.data.transferId) {
            queryClient.invalidateQueries({ queryKey: ['stock-transfers', notification.data.transferId] });
          }
          break;

        case 'stock_count_pending':
          queryClient.invalidateQueries({ queryKey: ['stock-counts'] });
          if (notification.data.stockCountId) {
            queryClient.invalidateQueries({ queryKey: ['stock-counts', notification.data.stockCountId] });
          }
          break;

        case 'batch_alerts':
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['inventory-dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['stock'] });
          break;
      }
    }
  }, [queryClient, showToasts, onAlert]);

  // Connect to SignalR hub for stock notifications
  const { isConnected, invoke } = useSignalRHub({
    hub: 'notification',
    events: {
      // Listen for stock-specific notifications (NotificationType.Stock from backend)
      ReceiveNotification: (notification: StockNotification) => {
        // Filter for stock-type notifications
        if (notification.data?.alertType && isStockAlertType(notification.data.alertType)) {
          handleStockNotification(notification);
        }
      },
      // Legacy event for backwards compatibility
      UpdateInventory: (data: { productId: string; stockLevel: number; message: string }) => {
        logger.info('Legacy inventory update received', { metadata: data });
        const notification: StockNotification = {
          id: `inventory-${Date.now()}`,
          title: 'Stok Güncellendi',
          message: data.message,
          type: data.stockLevel < 10 ? 'warning' : 'info',
          priority: data.stockLevel === 0 ? 'urgent' : data.stockLevel < 10 ? 'high' : 'normal',
          actionUrl: `/inventory/products/${data.productId}`,
          data: {
            alertType: data.stockLevel === 0 ? 'out_of_stock' : 'low_stock',
            productId: parseInt(data.productId),
            currentStock: data.stockLevel,
            severity: data.stockLevel === 0 ? 'critical' : data.stockLevel < 10 ? 'warning' : 'info',
          },
          createdAt: new Date().toISOString(),
        };
        handleStockNotification(notification);
      },
    },
    enabled,
  });

  // Clear recent alerts
  const clearRecentAlerts = useCallback(() => {
    setRecentAlerts([]);
  }, []);

  // Get alerts by severity
  const getCriticalAlerts = useCallback(() => {
    return recentAlerts.filter(a => a.data?.severity === 'critical' || a.priority === 'urgent');
  }, [recentAlerts]);

  const getWarningAlerts = useCallback(() => {
    return recentAlerts.filter(a => a.data?.severity === 'warning' || a.priority === 'high');
  }, [recentAlerts]);

  return {
    isConnected,
    recentAlerts,
    criticalAlerts: getCriticalAlerts(),
    warningAlerts: getWarningAlerts(),
    clearRecentAlerts,
    hasCritical: recentAlerts.some(a => a.data?.severity === 'critical' || a.priority === 'urgent'),
    hasWarning: recentAlerts.some(a => a.data?.severity === 'warning' || a.priority === 'high'),
  };
}

// Type guard for stock alert types
function isStockAlertType(type: string): type is StockAlertType {
  const validTypes: StockAlertType[] = [
    'low_stock',
    'out_of_stock',
    'expiring_soon',
    'expired',
    'transfer_status',
    'stock_count_pending',
    'stock_adjustment',
    'batch_alerts',
  ];
  return validTypes.includes(type as StockAlertType);
}

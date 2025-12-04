'use client';

import { useMemo } from 'react';
import { useProducts, useLotBatches, useStockTransfers, useStockCounts } from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

// Alert types
export type AlertType = 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'pending_transfer' | 'pending_count';
export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface InventoryAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  entityType: 'product' | 'lot' | 'transfer' | 'count';
  entityId: number;
  entityName: string;
  link?: string;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Alert thresholds configuration
export interface AlertThresholds {
  lowStockDays: number; // Days of stock remaining
  expiringDays: number; // Days until expiry to warn
  pendingTransferDays: number; // Days transfer has been pending
  pendingCountDays: number; // Days count has been pending
}

const DEFAULT_THRESHOLDS: AlertThresholds = {
  lowStockDays: 7,
  expiringDays: 30,
  pendingTransferDays: 3,
  pendingCountDays: 7,
};

// Helper to generate alert ID
const generateAlertId = (type: AlertType, entityId: number) => `${type}_${entityId}`;

export function useInventoryAlerts(thresholds: Partial<AlertThresholds> = {}) {
  const config = { ...DEFAULT_THRESHOLDS, ...thresholds };

  const { data: products = [] } = useProducts();
  const { data: lotBatches = [] } = useLotBatches();
  const { data: transfers = [] } = useStockTransfers();
  const { data: stockCounts = [] } = useStockCounts();

  const alerts = useMemo(() => {
    const allAlerts: InventoryAlert[] = [];
    const now = dayjs();

    // 1. Low Stock Alerts
    products.forEach((product) => {
      const currentStock = (product as any).currentStock || 0;
      const minStockLevel = (product as any).minStockLevel || 0;
      const reorderPoint = (product as any).reorderPoint || minStockLevel;

      // Out of stock - Critical
      if (currentStock === 0 && (product as any).isActive !== false) {
        allAlerts.push({
          id: generateAlertId('out_of_stock', product.id),
          type: 'out_of_stock',
          severity: 'critical',
          title: 'Stok Tükendi',
          description: `${product.name} ürününün stoku tükendi.`,
          entityType: 'product',
          entityId: product.id,
          entityName: product.name,
          link: `/inventory/products/${product.id}`,
          data: { currentStock, minStockLevel },
          createdAt: now.toISOString(),
        });
      }
      // Low stock - Warning
      else if (currentStock > 0 && currentStock <= reorderPoint) {
        allAlerts.push({
          id: generateAlertId('low_stock', product.id),
          type: 'low_stock',
          severity: 'warning',
          title: 'Düşük Stok',
          description: `${product.name} ürününün stoku düşük (${currentStock} adet). Minimum: ${minStockLevel}`,
          entityType: 'product',
          entityId: product.id,
          entityName: product.name,
          link: `/inventory/products/${product.id}`,
          data: { currentStock, minStockLevel, reorderPoint },
          createdAt: now.toISOString(),
        });
      }
    });

    // 2. Expiring Stock Alerts (Lot Batches)
    lotBatches.forEach((lot) => {
      if (!lot.expiryDate) return;

      const expiryDateObj = dayjs(lot.expiryDate as string);
      const daysUntilExpiry = expiryDateObj.diff(now, 'day');

      // Already expired - Critical
      if (daysUntilExpiry < 0 && lot.currentQuantity > 0) {
        allAlerts.push({
          id: generateAlertId('expired', lot.id),
          type: 'expired',
          severity: 'critical',
          title: 'Süresi Dolmuş Lot',
          description: `${lot.lotNumber} lot numaralı ürünün son kullanma tarihi ${Math.abs(daysUntilExpiry)} gün önce doldu.`,
          entityType: 'lot',
          entityId: lot.id,
          entityName: lot.lotNumber,
          link: `/inventory/lot-batches/${lot.id}`,
          data: { expiryDate: lot.expiryDate, daysExpired: Math.abs(daysUntilExpiry) },
          createdAt: now.toISOString(),
        });
      }
      // Expiring soon - Warning
      else if (daysUntilExpiry >= 0 && daysUntilExpiry <= config.expiringDays && lot.currentQuantity > 0) {
        allAlerts.push({
          id: generateAlertId('expiring_soon', lot.id),
          type: 'expiring_soon',
          severity: daysUntilExpiry <= 7 ? 'warning' : 'info',
          title: 'Son Kullanma Tarihi Yaklaşıyor',
          description: `${lot.lotNumber} lot numaralı ürünün son kullanma tarihi ${daysUntilExpiry} gün içinde dolacak.`,
          entityType: 'lot',
          entityId: lot.id,
          entityName: lot.lotNumber,
          link: `/inventory/lot-batches/${lot.id}`,
          data: { expiryDate: lot.expiryDate, daysRemaining: daysUntilExpiry },
          createdAt: now.toISOString(),
        });
      }
    });

    // 3. Pending Transfers
    transfers.forEach((transfer) => {
      if (transfer.status !== 'Pending' && transfer.status !== 'InTransit') return;

      const transferDate = dayjs(transfer.transferDate);
      const daysPending = now.diff(transferDate, 'day');

      if (daysPending >= config.pendingTransferDays) {
        allAlerts.push({
          id: generateAlertId('pending_transfer', transfer.id),
          type: 'pending_transfer',
          severity: daysPending >= config.pendingTransferDays * 2 ? 'warning' : 'info',
          title: 'Bekleyen Transfer',
          description: `${transfer.transferNumber} transferi ${daysPending} gündür ${transfer.status === 'Pending' ? 'onay bekliyor' : 'yolda'}.`,
          entityType: 'transfer',
          entityId: transfer.id,
          entityName: transfer.transferNumber,
          link: `/inventory/stock-transfers/${transfer.id}`,
          data: { status: transfer.status, daysPending },
          createdAt: now.toISOString(),
        });
      }
    });

    // 4. Pending Stock Counts
    stockCounts.forEach((count) => {
      if (count.status !== 'Draft' && count.status !== 'InProgress' && count.status !== 'Completed') return;

      const countDate = dayjs(count.countDate);
      const daysPending = now.diff(countDate, 'day');

      if (daysPending >= config.pendingCountDays) {
        let statusText = '';
        switch (count.status) {
          case 'Draft':
            statusText = 'başlatılmayı bekliyor';
            break;
          case 'InProgress':
            statusText = 'devam ediyor';
            break;
          case 'Completed':
            statusText = 'onay bekliyor';
            break;
        }

        allAlerts.push({
          id: generateAlertId('pending_count', count.id),
          type: 'pending_count',
          severity: daysPending >= config.pendingCountDays * 2 ? 'warning' : 'info',
          title: 'Bekleyen Sayım',
          description: `${count.countNumber} sayımı ${daysPending} gündür ${statusText}.`,
          entityType: 'count',
          entityId: count.id,
          entityName: count.countNumber,
          link: `/inventory/stock-counts/${count.id}`,
          data: { status: count.status, daysPending },
          createdAt: now.toISOString(),
        });
      }
    });

    // Sort by severity (critical first) then by date
    return allAlerts.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return dayjs(b.createdAt).diff(dayjs(a.createdAt));
    });
  }, [products, lotBatches, transfers, stockCounts, config]);

  // Group alerts by type
  const alertsByType = useMemo(() => {
    const grouped: Record<AlertType, InventoryAlert[]> = {
      out_of_stock: [],
      low_stock: [],
      expired: [],
      expiring_soon: [],
      pending_transfer: [],
      pending_count: [],
    };

    alerts.forEach((alert) => {
      grouped[alert.type].push(alert);
    });

    return grouped;
  }, [alerts]);

  // Group alerts by severity
  const alertsBySeverity = useMemo(() => {
    const grouped: Record<AlertSeverity, InventoryAlert[]> = {
      critical: [],
      warning: [],
      info: [],
    };

    alerts.forEach((alert) => {
      grouped[alert.severity].push(alert);
    });

    return grouped;
  }, [alerts]);

  // Summary counts
  const summary = useMemo(() => ({
    total: alerts.length,
    critical: alertsBySeverity.critical.length,
    warning: alertsBySeverity.warning.length,
    info: alertsBySeverity.info.length,
    outOfStock: alertsByType.out_of_stock.length,
    lowStock: alertsByType.low_stock.length,
    expired: alertsByType.expired.length,
    expiringSoon: alertsByType.expiring_soon.length,
    pendingTransfers: alertsByType.pending_transfer.length,
    pendingCounts: alertsByType.pending_count.length,
  }), [alerts, alertsBySeverity, alertsByType]);

  return {
    alerts,
    alertsByType,
    alertsBySeverity,
    summary,
    hasAlerts: alerts.length > 0,
    hasCritical: alertsBySeverity.critical.length > 0,
    hasWarning: alertsBySeverity.warning.length > 0,
  };
}

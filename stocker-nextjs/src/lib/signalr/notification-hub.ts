'use client';

import { useEffect } from 'react';
import { useSignalRHub } from './use-signalr';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { Notification } from '@/features/notifications/types/notification.types';
import { toast } from 'sonner';

import logger from '../utils/logger';
export function useNotificationHub() {
  const { addNotification, fetchUnreadCount } = useNotifications();

  const { isConnected } = useSignalRHub({
    hub: 'notification',
    events: {
      // Receive new notification
      ReceiveNotification: (notification: Notification) => {
        logger.info('Received notification:', notification);
        addNotification(notification);

        // Show toast for important notifications
        if (notification.type === 'error' || notification.type === 'warning') {
          toast[notification.type](notification.title, {
            description: notification.message,
          });
        }
      },

      // Inventory update notification
      UpdateInventory: (data: { productId: string; stockLevel: number; message: string }) => {
        logger.info('Inventory updated:', data);
        addNotification({
          id: `inventory-${Date.now()}`,
          title: 'Stok Güncellendi',
          message: data.message,
          type: 'info',
          category: 'inventory',
          isRead: false,
          createdAt: new Date(),
          metadata: { productId: data.productId, stockLevel: data.stockLevel },
        });

        // Show toast for low stock warnings
        if (data.stockLevel < 10) {
          toast.warning('Düşük Stok Seviyesi', {
            description: data.message,
          });
        }
      },

      // Order status changed notification
      OrderStatusChanged: (data: { orderId: string; status: string; message: string }) => {
        logger.info('Order status changed:', data);
        addNotification({
          id: `order-${Date.now()}`,
          title: 'Sipariş Durumu Değişti',
          message: data.message,
          type: 'success',
          category: 'order',
          isRead: false,
          createdAt: new Date(),
          metadata: { orderId: data.orderId, status: data.status },
          link: `/orders/${data.orderId}`,
        });

        // Show success toast for order updates
        toast.success('Sipariş Güncellendi', {
          description: data.message,
          action: {
            label: 'Görüntüle',
            onClick: () => {
              window.location.href = `/orders/${data.orderId}`;
            },
          },
        });
      },

      // System alert notification
      SystemAlert: (data: { severity: 'info' | 'warning' | 'error'; message: string }) => {
        logger.info('System alert:', data);
        addNotification({
          id: `system-${Date.now()}`,
          title: 'Sistem Bildirimi',
          message: data.message,
          type: data.severity === 'error' ? 'error' : data.severity === 'warning' ? 'warning' : 'info',
          category: 'system',
          isRead: false,
          createdAt: new Date(),
        });

        // Always show toast for system alerts
        const toastType = data.severity === 'error' ? 'error' : data.severity === 'warning' ? 'warning' : 'info';
        toast[toastType]('Sistem Bildirimi', {
          description: data.message,
        });
      },
    },
  });

  // Fetch unread count when connected
  useEffect(() => {
    if (isConnected) {
      fetchUnreadCount();
    }
  }, [isConnected, fetchUnreadCount]);

  return { isConnected };
}

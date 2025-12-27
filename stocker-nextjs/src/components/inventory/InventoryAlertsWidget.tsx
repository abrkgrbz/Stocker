'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, List, Tag, Typography, Button, Empty, Tabs, Tooltip, Drawer, Divider, Switch, message } from 'antd';
import {
  ArrowsRightLeftIcon,
  BellAlertIcon,
  BellIcon,
  CalendarDaysIcon,
  ChevronRightIcon,
  ClockIcon,
  DocumentMagnifyingGlassIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  InformationCircleIcon,
  ShoppingBagIcon,
  SpeakerWaveIcon,
  WifiIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useInventoryAlerts, type InventoryAlert, type AlertType, type AlertSeverity } from '@/hooks/useInventoryAlerts';
import { useStockAlerts } from '@/hooks/useStockAlerts';

const { Text, Title } = Typography;

// Alert type icons and labels
const alertTypeConfig: Record<AlertType, { icon: React.ReactNode; label: string; color: string }> = {
  out_of_stock: { icon: <InboxIcon className="w-4 h-4" />, label: 'Stok Tükendi', color: 'red' },
  low_stock: { icon: <ShoppingBagIcon className="w-4 h-4" />, label: 'Düşük Stok', color: 'orange' },
  expired: { icon: <CalendarDaysIcon className="w-4 h-4" />, label: 'Süresi Doldu', color: 'red' },
  expiring_soon: { icon: <ClockIcon className="w-4 h-4" />, label: 'SKT Yaklaşıyor', color: 'gold' },
  pending_transfer: { icon: <ArrowsRightLeftIcon className="w-4 h-4" />, label: 'Bekleyen Transfer', color: 'blue' },
  pending_count: { icon: <DocumentMagnifyingGlassIcon className="w-4 h-4" />, label: 'Bekleyen Sayım', color: 'purple' },
};

// Severity icons and colors
const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; color: string; bgColor: string }> = {
  critical: { icon: <ExclamationCircleIcon className="w-4 h-4" />, color: '#ff4d4f', bgColor: '#fff2f0' },
  warning: { icon: <ExclamationTriangleIcon className="w-4 h-4" />, color: '#faad14', bgColor: '#fffbe6' },
  info: { icon: <InformationCircleIcon className="w-4 h-4" />, color: '#1890ff', bgColor: '#e6f7ff' },
};

interface AlertItemProps {
  alert: InventoryAlert;
  onClick: (alert: InventoryAlert) => void;
  showType?: boolean;
}

function AlertItem({ alert, onClick, showType = true }: AlertItemProps) {
  const severityStyle = severityConfig[alert.severity];
  const typeStyle = alertTypeConfig[alert.type];

  return (
    <List.Item
      className="cursor-pointer hover:bg-gray-50 transition-colors px-3 py-2 rounded-lg"
      onClick={() => onClick(alert)}
    >
      <div className="flex items-start gap-3 w-full">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: severityStyle.bgColor, color: severityStyle.color }}
        >
          {severityStyle.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Text strong className="truncate">{alert.title}</Text>
            {showType && (
              <Tag color={typeStyle.color} className="text-xs">
                {typeStyle.label}
              </Tag>
            )}
          </div>
          <Text type="secondary" className="text-sm block truncate">
            {alert.description}
          </Text>
        </div>
        <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>
    </List.Item>
  );
}

interface InventoryAlertsWidgetProps {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

// Browser notification helper
const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

const showBrowserNotification = (title: string, body: string, icon?: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/logo.png',
      badge: '/logo.png',
      tag: 'inventory-alert',
      requireInteraction: true,
    });
  }
};

export default function InventoryAlertsWidget({
  maxItems = 5,
  showHeader = true,
  compact = false,
}: InventoryAlertsWidgetProps) {
  const router = useRouter();
  const { alerts, summary, hasCritical } = useInventoryAlerts();
  const { isConnected: isSignalRConnected, recentAlerts: realTimeAlerts } = useStockAlerts({
    showToasts: true, // Show toast notifications for real-time alerts
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [lastNotifiedAlerts, setLastNotifiedAlerts] = useState<Set<string>>(new Set());

  // Load notification preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const enabled = localStorage.getItem('inventoryNotificationsEnabled') === 'true';
      setNotificationsEnabled(enabled);

      // Load previously notified alerts
      const notified = localStorage.getItem('inventoryNotifiedAlerts');
      if (notified) {
        setLastNotifiedAlerts(new Set(JSON.parse(notified)));
      }
    }
  }, []);

  // Send browser notification for new critical alerts
  useEffect(() => {
    if (!notificationsEnabled || !hasCritical) return;

    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const newCriticalAlerts = criticalAlerts.filter(a => !lastNotifiedAlerts.has(a.id));

    if (newCriticalAlerts.length > 0) {
      // Show browser notification for new critical alerts
      const alertCount = newCriticalAlerts.length;
      const title = `⚠️ ${alertCount} Kritik Envanter Uyarısı`;
      const body = newCriticalAlerts.slice(0, 3).map(a => a.title).join(', ');

      showBrowserNotification(title, body);

      // Update notified alerts set
      const updatedNotified = new Set(lastNotifiedAlerts);
      newCriticalAlerts.forEach(a => updatedNotified.add(a.id));
      setLastNotifiedAlerts(updatedNotified);
      localStorage.setItem('inventoryNotifiedAlerts', JSON.stringify([...updatedNotified]));
    }
  }, [alerts, notificationsEnabled, hasCritical, lastNotifiedAlerts]);

  // Toggle notifications
  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const hasPermission = await requestNotificationPermission();
      if (!hasPermission) {
        message.warning('Tarayıcı bildirim izni reddedildi. Ayarlardan izin vermeniz gerekiyor.');
        return;
      }
      message.success('Kritik stok uyarıları için bildirimler aktif edildi');
    } else {
      message.info('Bildirimler kapatıldı');
    }

    setNotificationsEnabled(enabled);
    localStorage.setItem('inventoryNotificationsEnabled', String(enabled));
  };

  // Test notification
  const handleTestNotification = () => {
    if (notificationsEnabled) {
      showBrowserNotification(
        '🔔 Test Bildirimi',
        'Envanter bildirimleri düzgün çalışıyor!'
      );
      message.success('Test bildirimi gönderildi');
    }
  };

  const handleAlertClick = (alert: InventoryAlert) => {
    if (alert.link) {
      router.push(alert.link);
    }
  };

  const displayedAlerts = alerts.slice(0, maxItems);

  // Tab items for drawer
  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          Tümü <Badge count={summary.total} size="small" className="ml-1" />
        </span>
      ),
      children: (
        <List
          dataSource={alerts}
          renderItem={(alert) => (
            <AlertItem alert={alert} onClick={handleAlertClick} />
          )}
          locale={{ emptyText: <Empty description="Bildirim yok" /> }}
        />
      ),
    },
    {
      key: 'critical',
      label: (
        <span>
          Kritik <Badge count={summary.critical} size="small" color="#ff4d4f" className="ml-1" />
        </span>
      ),
      children: (
        <List
          dataSource={alerts.filter((a) => a.severity === 'critical')}
          renderItem={(alert) => (
            <AlertItem alert={alert} onClick={handleAlertClick} />
          )}
          locale={{ emptyText: <Empty description="Kritik bildirim yok" /> }}
        />
      ),
    },
    {
      key: 'stock',
      label: (
        <span>
          Stok <Badge count={summary.outOfStock + summary.lowStock} size="small" color="#fa8c16" className="ml-1" />
        </span>
      ),
      children: (
        <List
          dataSource={alerts.filter((a) => a.type === 'out_of_stock' || a.type === 'low_stock')}
          renderItem={(alert) => (
            <AlertItem alert={alert} onClick={handleAlertClick} showType={false} />
          )}
          locale={{ emptyText: <Empty description="Stok bildirimi yok" /> }}
        />
      ),
    },
    {
      key: 'expiry',
      label: (
        <span>
          SKT <Badge count={summary.expired + summary.expiringSoon} size="small" color="#faad14" className="ml-1" />
        </span>
      ),
      children: (
        <List
          dataSource={alerts.filter((a) => a.type === 'expired' || a.type === 'expiring_soon')}
          renderItem={(alert) => (
            <AlertItem alert={alert} onClick={handleAlertClick} showType={false} />
          )}
          locale={{ emptyText: <Empty description="SKT bildirimi yok" /> }}
        />
      ),
    },
    {
      key: 'pending',
      label: (
        <span>
          Bekleyen <Badge count={summary.pendingTransfers + summary.pendingCounts} size="small" color="#1890ff" className="ml-1" />
        </span>
      ),
      children: (
        <List
          dataSource={alerts.filter((a) => a.type === 'pending_transfer' || a.type === 'pending_count')}
          renderItem={(alert) => (
            <AlertItem alert={alert} onClick={handleAlertClick} showType={false} />
          )}
          locale={{ emptyText: <Empty description="Bekleyen işlem yok" /> }}
        />
      ),
    },
  ];

  if (compact) {
    return (
      <>
        <Tooltip title={`${summary.total} bildirim${hasCritical ? ' (kritik var!)' : ''}`}>
          <Badge count={summary.total} size="small" offset={[-5, 5]}>
            <Button
              type="text"
              icon={<BellIcon className={`w-4 h-4 ${hasCritical ? 'text-red-500' : ''}`} />}
              onClick={() => setDrawerOpen(true)}
            />
          </Badge>
        </Tooltip>

        <Drawer
          title="Envanter Bildirimleri"
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={400}
        >
          {/* SignalR Connection Status */}
          <div className={`mb-3 p-2 rounded-lg flex items-center gap-2 ${isSignalRConnected ? 'bg-green-50' : 'bg-gray-100'}`}>
            <WifiIcon className={`w-4 h-4 ${isSignalRConnected ? 'text-green-500' : 'text-gray-400'}`} />
            <Text type={isSignalRConnected ? 'success' : 'secondary'} className="text-xs">
              {isSignalRConnected ? 'Anlık bildirimler aktif' : 'Anlık bildirimler bağlanıyor...'}
            </Text>
            {realTimeAlerts.length > 0 && (
              <Badge count={realTimeAlerts.length} size="small" className="ml-auto" />
            )}
          </div>

          {/* Notification Settings */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <BellAlertIcon className="w-4 h-4 text-blue-500" />
                <Text strong>Tarayıcı Bildirimleri</Text>
              </div>
              <Switch
                checked={notificationsEnabled}
                onChange={handleToggleNotifications}
                size="small"
              />
            </div>
            <Text type="secondary" className="text-xs block mb-2">
              Kritik stok uyarıları için anlık bildirim alın
            </Text>
            {notificationsEnabled && (
              <Button
                size="small"
                icon={<SpeakerWaveIcon className="w-4 h-4" />}
                onClick={handleTestNotification}
              >
                Test Et
              </Button>
            )}
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="small"
          />
        </Drawer>
      </>
    );
  }

  return (
    <>
      <Card
        title={
          showHeader ? (
            <div className="flex items-center gap-2">
              <BellIcon className={`w-4 h-4 ${hasCritical ? 'text-red-500' : 'text-blue-500'}`} />
              <span>Bildirimler</span>
              <Badge count={summary.total} size="small" />
            </div>
          ) : undefined
        }
        extra={
          alerts.length > maxItems ? (
            <Button type="link" onClick={() => setDrawerOpen(true)}>
              Tümünü Gör
            </Button>
          ) : undefined
        }
        className="h-full"
        bodyStyle={{ padding: alerts.length === 0 ? '24px' : '8px' }}
      >
        {alerts.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Tüm stoklar normal seviyede"
          />
        ) : (
          <>
            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-3 px-2">
              {summary.critical > 0 && (
                <Tag color="error" icon={<ExclamationCircleIcon className="w-3 h-3" />}>
                  {summary.critical} Kritik
                </Tag>
              )}
              {summary.warning > 0 && (
                <Tag color="warning" icon={<ExclamationTriangleIcon className="w-3 h-3" />}>
                  {summary.warning} Uyarı
                </Tag>
              )}
              {summary.info > 0 && (
                <Tag color="processing" icon={<InformationCircleIcon className="w-3 h-3" />}>
                  {summary.info} Bilgi
                </Tag>
              )}
            </div>

            <List
              dataSource={displayedAlerts}
              renderItem={(alert) => (
                <AlertItem alert={alert} onClick={handleAlertClick} />
              )}
              split={false}
            />
          </>
        )}
      </Card>

      <Drawer
        title="Envanter Bildirimleri"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={400}
      >
        {/* SignalR Connection Status */}
        <div className={`mb-3 p-2 rounded-lg flex items-center gap-2 ${isSignalRConnected ? 'bg-green-50' : 'bg-gray-100'}`}>
          <WifiIcon className={`w-4 h-4 ${isSignalRConnected ? 'text-green-500' : 'text-gray-400'}`} />
          <Text type={isSignalRConnected ? 'success' : 'secondary'} className="text-xs">
            {isSignalRConnected ? 'Anlık bildirimler aktif' : 'Anlık bildirimler bağlanıyor...'}
          </Text>
          {realTimeAlerts.length > 0 && (
            <Badge count={realTimeAlerts.length} size="small" className="ml-auto" />
          )}
        </div>

        {/* Notification Settings */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BellAlertIcon className="w-4 h-4 text-blue-500" />
              <Text strong>Tarayıcı Bildirimleri</Text>
            </div>
            <Switch
              checked={notificationsEnabled}
              onChange={handleToggleNotifications}
              size="small"
            />
          </div>
          <Text type="secondary" className="text-xs block mb-2">
            Kritik stok uyarıları için anlık bildirim alın
          </Text>
          {notificationsEnabled && (
            <Button
              size="small"
              icon={<SpeakerWaveIcon className="w-4 h-4" />}
              onClick={handleTestNotification}
            >
              Test Et
            </Button>
          )}
        </div>
        <Divider style={{ margin: '8px 0' }} />
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="small"
        />
      </Drawer>
    </>
  );
}

// Header notification button component
export function InventoryAlertsButton() {
  return <InventoryAlertsWidget compact />;
}

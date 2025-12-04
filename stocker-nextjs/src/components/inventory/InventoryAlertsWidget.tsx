'use client';

import React, { useState } from 'react';
import { Card, Badge, List, Tag, Typography, Button, Empty, Tabs, Tooltip, Drawer, Space, Divider } from 'antd';
import {
  BellOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
  RightOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  CalendarOutlined,
  SwapOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useInventoryAlerts, type InventoryAlert, type AlertType, type AlertSeverity } from '@/hooks/useInventoryAlerts';

const { Text, Title } = Typography;

// Alert type icons and labels
const alertTypeConfig: Record<AlertType, { icon: React.ReactNode; label: string; color: string }> = {
  out_of_stock: { icon: <InboxOutlined />, label: 'Stok Tükendi', color: 'red' },
  low_stock: { icon: <ShoppingOutlined />, label: 'Düşük Stok', color: 'orange' },
  expired: { icon: <CalendarOutlined />, label: 'Süresi Doldu', color: 'red' },
  expiring_soon: { icon: <ClockCircleOutlined />, label: 'SKT Yaklaşıyor', color: 'gold' },
  pending_transfer: { icon: <SwapOutlined />, label: 'Bekleyen Transfer', color: 'blue' },
  pending_count: { icon: <FileSearchOutlined />, label: 'Bekleyen Sayım', color: 'purple' },
};

// Severity icons and colors
const severityConfig: Record<AlertSeverity, { icon: React.ReactNode; color: string; bgColor: string }> = {
  critical: { icon: <ExclamationCircleOutlined />, color: '#ff4d4f', bgColor: '#fff2f0' },
  warning: { icon: <WarningOutlined />, color: '#faad14', bgColor: '#fffbe6' },
  info: { icon: <InfoCircleOutlined />, color: '#1890ff', bgColor: '#e6f7ff' },
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
        <RightOutlined className="text-gray-400 flex-shrink-0" />
      </div>
    </List.Item>
  );
}

interface InventoryAlertsWidgetProps {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export default function InventoryAlertsWidget({
  maxItems = 5,
  showHeader = true,
  compact = false,
}: InventoryAlertsWidgetProps) {
  const router = useRouter();
  const { alerts, summary, hasCritical } = useInventoryAlerts();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

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
              icon={<BellOutlined className={hasCritical ? 'text-red-500' : ''} />}
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
              <BellOutlined className={hasCritical ? 'text-red-500' : 'text-blue-500'} />
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
                <Tag color="error" icon={<ExclamationCircleOutlined />}>
                  {summary.critical} Kritik
                </Tag>
              )}
              {summary.warning > 0 && (
                <Tag color="warning" icon={<WarningOutlined />}>
                  {summary.warning} Uyarı
                </Tag>
              )}
              {summary.info > 0 && (
                <Tag color="processing" icon={<InfoCircleOutlined />}>
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

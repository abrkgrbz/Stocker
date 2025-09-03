import React, { memo, useMemo } from 'react';
import { Card, Row, Col, Statistic, Progress, Badge, Space, Typography, Tooltip, Skeleton } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  InfoCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

const { Text, Title } = Typography;

interface WidgetProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  icon?: React.ReactNode;
  color?: string;
  loading?: boolean;
  description?: string;
  onClick?: () => void;
  progress?: number;
  extra?: React.ReactNode;
}

// Optimize edilmiş StatWidget komponenti
export const StatWidget = memo<WidgetProps>(({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendValue,
  icon,
  color = '#1890ff',
  loading = false,
  description,
  onClick,
  progress,
  extra
}) => {
  const trendIcon = useMemo(() => {
    if (!trend) return null;
    if (trend === 'up') return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    if (trend === 'down') return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
    return null;
  }, [trend]);

  const trendColor = useMemo(() => {
    if (trend === 'up') return '#52c41a';
    if (trend === 'down') return '#ff4d4f';
    return '#faad14';
  }, [trend]);

  if (loading) {
    return (
      <Card className="stat-widget-loading">
        <Skeleton active paragraph={{ rows: 2 }} />
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        className="stat-widget"
        hoverable={!!onClick}
        onClick={onClick}
        style={{
          borderTop: `3px solid ${color}`,
          cursor: onClick ? 'pointer' : 'default'
        }}
      >
        <div className="widget-header">
          <Space>
            {icon && (
              <div className="widget-icon" style={{ color, fontSize: 24 }}>
                {icon}
              </div>
            )}
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {title}
              </Text>
              {description && (
                <Tooltip title={description}>
                  <InfoCircleOutlined style={{ marginLeft: 8, fontSize: 12 }} />
                </Tooltip>
              )}
            </div>
          </Space>
          {extra}
        </div>

        <div className="widget-value" style={{ margin: '16px 0' }}>
          <Space align="baseline">
            {prefix && <Text style={{ fontSize: 20, color }}>{prefix}</Text>}
            <Text style={{ fontSize: 32, fontWeight: 700, color }}>
              <CountUp
                end={value}
                duration={1.5}
                separator=","
                decimals={suffix === '%' ? 1 : 0}
              />
            </Text>
            {suffix && <Text style={{ fontSize: 20, color }}>{suffix}</Text>}
          </Space>
        </div>

        {(trend || progress !== undefined) && (
          <div className="widget-footer">
            {trend && trendValue !== undefined && (
              <Space style={{ fontSize: 12 }}>
                {trendIcon}
                <Text style={{ color: trendColor }}>
                  {trendValue > 0 ? '+' : ''}{trendValue}%
                </Text>
                <Text type="secondary">son 30 gün</Text>
              </Space>
            )}
            {progress !== undefined && (
              <Progress
                percent={progress}
                size="small"
                strokeColor={color}
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
});

StatWidget.displayName = 'StatWidget';

// Mini istatistik widget'ı
export const MiniStatWidget = memo<{
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: string;
  trend?: 'up' | 'down';
}>(({ title, value, icon, color = '#1890ff', trend }) => (
  <div className="mini-stat-widget">
    <Space size="small">
      {icon && (
        <div className="mini-icon" style={{ color, fontSize: 20 }}>
          {icon}
        </div>
      )}
      <div>
        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>
          {title}
        </Text>
        <Space size={4} align="baseline">
          <Text strong style={{ fontSize: 16 }}>
            {typeof value === 'number' ? (
              <CountUp end={value} duration={1} separator="," />
            ) : value}
          </Text>
          {trend && (
            trend === 'up' 
              ? <ArrowUpOutlined style={{ fontSize: 10, color: '#52c41a' }} />
              : <ArrowDownOutlined style={{ fontSize: 10, color: '#ff4d4f' }} />
          )}
        </Space>
      </div>
    </Space>
  </div>
));

MiniStatWidget.displayName = 'MiniStatWidget';

// Sistem durumu widget'ı
export const SystemStatusWidget = memo<{
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  loading?: boolean;
}>(({ cpu, memory, disk, network, loading }) => {
  const getStatusColor = (value: number) => {
    if (value < 50) return '#52c41a';
    if (value < 80) return '#faad14';
    return '#ff4d4f';
  };

  const getStatus = (value: number) => {
    if (value < 50) return 'success';
    if (value < 80) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <Card title="Sistem Durumu" extra={<SyncOutlined spin />}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    );
  }

  const metrics = [
    { label: 'CPU', value: cpu, unit: '%' },
    { label: 'Bellek', value: memory, unit: '%' },
    { label: 'Disk', value: disk, unit: '%' },
    { label: 'Network', value: network, unit: 'Mbps' }
  ];

  return (
    <Card 
      title="Sistem Durumu" 
      extra={
        <Badge 
          status={getStatus(Math.max(cpu, memory, disk))} 
          text="Çalışıyor" 
        />
      }
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>{metric.label}</Text>
              <Text strong>
                {metric.value}{metric.unit}
              </Text>
            </div>
            <Progress
              percent={metric.unit === '%' ? metric.value : Math.min(metric.value / 100 * 100, 100)}
              strokeColor={getStatusColor(metric.value)}
              size="small"
              status={metric.value >= 95 ? 'exception' : 'active'}
            />
          </div>
        ))}
      </Space>
    </Card>
  );
});

SystemStatusWidget.displayName = 'SystemStatusWidget';

// Activity widget'ı
export const ActivityWidget = memo<{
  activities: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    time: string;
    user?: string;
  }>;
  loading?: boolean;
}>(({ activities, loading }) => {
  if (loading) {
    return (
      <Card title="Son Aktiviteler">
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  return (
    <Card 
      title="Son Aktiviteler"
      bodyStyle={{ padding: '12px 24px' }}
      extra={
        <Badge count={activities.length} style={{ backgroundColor: '#52c41a' }} />
      }
    >
      <div className="activity-list">
        {activities.map((activity) => (
          <div key={activity.id} className="activity-item">
            <Badge 
              status={
                activity.type === 'success' ? 'success' :
                activity.type === 'error' ? 'error' :
                activity.type === 'warning' ? 'warning' :
                'processing'
              }
            />
            <div className="activity-content">
              <div>
                <Text strong>{activity.title}</Text>
                {activity.description && (
                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                    {activity.description}
                  </Text>
                )}
              </div>
              <Space size="small" style={{ fontSize: 11 }}>
                <Text type="secondary">{activity.time}</Text>
                {activity.user && (
                  <>
                    <span>•</span>
                    <Text type="secondary">{activity.user}</Text>
                  </>
                )}
              </Space>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
});

ActivityWidget.displayName = 'ActivityWidget';

// CSS stilleri için
const styles = `
.stat-widget {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
}

.stat-widget:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.widget-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(24, 144, 255, 0.1);
}

.mini-stat-widget {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
  transition: all 0.3s;
}

.mini-stat-widget:hover {
  background: #f0f0f0;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
`;

// Style tag ekle
if (typeof document !== 'undefined' && !document.getElementById('dashboard-widgets-styles')) {
  const styleTag = document.createElement('style');
  styleTag.id = 'dashboard-widgets-styles';
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}

export default {
  StatWidget,
  MiniStatWidget,
  SystemStatusWidget,
  ActivityWidget
};
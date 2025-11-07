'use client';

import React from 'react';
import { Typography, Space, Tag, Empty, Badge } from 'antd';
import {
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { AnimatedCard } from '../shared/AnimatedCard';
import type { Activity } from '@/lib/api/services/crm.service';

const { Text, Link } = Typography;

interface TodaysActivitiesProps {
  activities: Activity[];
  loading?: boolean;
}

const activityIcons: Record<string, any> = {
  Call: PhoneOutlined,
  Email: MailOutlined,
  Meeting: TeamOutlined,
  Task: FileTextOutlined,
};

const activityColors: Record<string, string> = {
  Call: 'blue',
  Email: 'cyan',
  Meeting: 'purple',
  Task: 'green',
};

export function TodaysActivities({
  activities,
  loading = false,
}: TodaysActivitiesProps) {
  // Filter activities for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysActivities = activities
    .filter(a => {
      const activityDate = new Date(a.scheduledAt);
      return activityDate >= today && activityDate < tomorrow;
    })
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const completedCount = todaysActivities.filter(a => a.status === 'Completed').length;
  const pendingCount = todaysActivities.filter(a => a.status === 'Pending').length;

  if (!loading && todaysActivities.length === 0) {
    return (
      <AnimatedCard title="Bugünün Aktiviteleri" loading={loading}>
        <Empty
          image={<CalendarOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />}
          imageStyle={{ height: 60 }}
          description={
            <div className="text-center">
              <div className="text-base text-gray-600 mb-2">
                Bugün için planlanmış aktivite yok
              </div>
              <Link href="/crm/activities">
                Aktivite planla
              </Link>
            </div>
          }
        />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard
      title={
        <div className="flex items-center gap-2">
          <span>Bugünün Aktiviteleri</span>
          <Badge count={pendingCount} style={{ backgroundColor: '#1890ff' }} />
        </div>
      }
      loading={loading}
      extra={<Link href="/crm/activities">Tümünü Gör</Link>}
    >
      <div className="mb-3 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircleOutlined className="text-green-500" />
          <Text type="secondary">{completedCount} Tamamlandı</Text>
        </div>
        <div className="flex items-center gap-2">
          <ClockCircleOutlined className="text-blue-500" />
          <Text type="secondary">{pendingCount} Bekliyor</Text>
        </div>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {todaysActivities.slice(0, 8).map((activity) => {
          const Icon = activityIcons[activity.type] || FileTextOutlined;
          const color = activityColors[activity.type] || 'default';
          const time = new Date(activity.scheduledAt).toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          const isCompleted = activity.status === 'Completed';

          return (
            <div
              key={activity.id}
              className={`p-3 border rounded-lg hover:shadow-sm transition-all ${
                isCompleted ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-gray-200' : `bg-${color}-100`}`}>
                  <Icon className={`text-lg ${isCompleted ? 'text-gray-500' : `text-${color}-600`}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Text
                      strong={!isCompleted}
                      className={`truncate ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900'}`}
                    >
                      {activity.subject}
                    </Text>
                    {isCompleted && (
                      <CheckCircleOutlined className="text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ClockCircleOutlined />
                    <span>{time}</span>
                    {activity.relatedToName && (
                      <>
                        <span>•</span>
                        <span className="truncate">{activity.relatedToName}</span>
                      </>
                    )}
                  </div>
                </div>
                <Tag color={color}>{activity.type}</Tag>
              </div>
            </div>
          );
        })}
      </Space>

      {todaysActivities.length > 8 && (
        <div className="mt-3 text-center">
          <Link href="/crm/activities">
            +{todaysActivities.length - 8} aktivite daha
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
}

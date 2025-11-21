'use client';

import React from 'react';
import { Typography, Space, Tag, Empty, Alert } from 'antd';
import {
  WarningOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { AnimatedCard } from '../shared/AnimatedCard';
import type { Activity } from '@/lib/api/services/crm.service';

const { Text, Link } = Typography;

interface OverdueTasksProps {
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

export function OverdueTasks({
  activities,
  loading = false,
}: OverdueTasksProps) {
  // Filter overdue activities (not completed and past due date)
  const now = new Date();
  const overdueActivities = activities
    .filter(a => {
      if (a.status === 'Completed' || a.status === 'Cancelled') return false;
      if (!a.scheduledAt) return false;
      const dueDate = new Date(a.scheduledAt);
      return dueDate < now;
    })
    .sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime());

  const getDaysOverdue = (scheduledAt: string) => {
    const dueDate = new Date(scheduledAt);
    const diffTime = Math.abs(now.getTime() - dueDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!loading && overdueActivities.length === 0) {
    return (
      <AnimatedCard title="Gecikmiş Görevler" loading={loading}>
        <Empty
          image={<CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />}
          imageStyle={{ height: 60 }}
          description={
            <div className="text-center">
              <div className="text-base text-green-600 font-medium mb-2">
                Harika! Gecikmiş görev yok
              </div>
              <Text type="secondary">Tüm görevler zamanında tamamlanıyor</Text>
            </div>
          }
        />
      </AnimatedCard>
    );
  }

  const criticalCount = overdueActivities.filter(a => a.scheduledAt && getDaysOverdue(a.scheduledAt) > 7).length;

  return (
    <AnimatedCard
      title={
        <div className="flex items-center gap-2">
          <WarningOutlined className="text-orange-500" />
          <span>Gecikmiş Görevler</span>
          <Tag color="error">{overdueActivities.length}</Tag>
        </div>
      }
      loading={loading}
      extra={<Link href="/crm/activities?filter=overdue">Tümünü Gör</Link>}
    >
      {criticalCount > 0 && (
        <Alert
          message={`${criticalCount} kritik görev 7 günden fazla gecikmiş!`}
          type="error"
          showIcon
          icon={<WarningOutlined />}
          className="mb-3"
        />
      )}

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {overdueActivities.slice(0, 6).map((activity) => {
          const Icon = activityIcons[activity.type] || FileTextOutlined;
          const color = activityColors[activity.type] || 'default';
          const daysOverdue = activity.scheduledAt ? getDaysOverdue(activity.scheduledAt) : 0;
          const isCritical = daysOverdue > 7;
          const dueDate = activity.scheduledAt ? new Date(activity.scheduledAt).toLocaleDateString('tr-TR') : 'N/A';

          return (
            <div
              key={activity.id}
              className={`p-3 border rounded-lg hover:shadow-md transition-all ${
                isCritical
                  ? 'border-red-300 bg-red-50'
                  : 'border-orange-200 bg-orange-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-200' : 'bg-orange-200'}`}>
                  <Icon className={`text-lg ${isCritical ? 'text-red-600' : 'text-orange-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Text strong className="truncate text-gray-900">
                      {activity.subject}
                    </Text>
                    <Tag color={isCritical ? 'error' : 'warning'} className="flex-shrink-0">
                      {daysOverdue} gün
                    </Tag>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <CalendarOutlined />
                    <span>Termin: {dueDate}</span>
                    {activity.relatedToName && (
                      <>
                        <span>•</span>
                        <span className="truncate">{activity.relatedToName}</span>
                      </>
                    )}
                  </div>
                  {activity.description && (
                    <Text type="secondary" className="text-xs line-clamp-1">
                      {activity.description}
                    </Text>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  <Tag color={color}>{activity.type}</Tag>
                  <Tag color={activity.priority === 'High' ? 'red' : activity.priority === 'Medium' ? 'orange' : 'default'}>
                    {activity.priority}
                  </Tag>
                </div>
              </div>
            </div>
          );
        })}
      </Space>

      {overdueActivities.length > 6 && (
        <div className="mt-3 text-center">
          <Link href="/crm/activities?filter=overdue" className="text-orange-600 hover:text-orange-700">
            +{overdueActivities.length - 6} gecikmiş görev daha
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
}

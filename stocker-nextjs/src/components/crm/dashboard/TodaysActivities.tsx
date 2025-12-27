'use client';

import React from 'react';
import { Typography, Space, Empty, Badge, Button } from 'antd';
import {
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { AnimatedCard } from '../shared/AnimatedCard';
import type { Activity } from '@/lib/api/services/crm.service';

const { Text, Link } = Typography;

interface TodaysActivitiesProps {
  activities: Activity[];
  loading?: boolean;
}

const activityIcons: Record<string, any> = {
  Call: PhoneIcon,
  Email: EnvelopeIcon,
  Meeting: UserGroupIcon,
  Task: DocumentTextIcon,
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
      if (!a.scheduledAt) return false;
      const activityDate = new Date(a.scheduledAt);
      return activityDate >= today && activityDate < tomorrow;
    })
    .sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime());

  const completedCount = todaysActivities.filter(a => a.status === 'Completed').length;
  const pendingCount = todaysActivities.filter(a => a.status === 'Scheduled').length;

  if (!loading && todaysActivities.length === 0) {
    return (
      <AnimatedCard title="Bugünün Aktiviteleri" loading={loading}>
        <Empty
          image={
            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
              <CalendarIcon className="w-5 h-5 text-slate-300" />
            </div>
          }
          imageStyle={{ height: 60 }}
          description={
            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Bugün planlanmış aktivite yok
              </div>
              <div className="text-xs text-slate-400 mb-4">
                Yeni bir görev veya toplantı oluşturun
              </div>
              <Link href="/crm/activities">
                <Button
                  type="primary"
                  icon={<PlusIcon className="w-4 h-4" />}
                  className="!bg-slate-900 !border-slate-900 hover:!bg-slate-800"
                >
                  Aktivite Planla
                </Button>
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
          <Badge count={pendingCount} style={{ backgroundColor: '#0f172a' }} />
        </div>
      }
      loading={loading}
      extra={<Link href="/crm/activities" className="!text-slate-500 hover:!text-slate-700">Tümünü Gör</Link>}
    >
      <div className="mb-3 flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4 text-slate-400" />
          <Text type="secondary">{completedCount} Tamamlandı</Text>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 text-slate-600" />
          <Text type="secondary">{pendingCount} Bekliyor</Text>
        </div>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {todaysActivities.slice(0, 8).map((activity) => {
          const Icon = activityIcons[activity.type] || DocumentTextIcon;
          const time = new Intl.DateTimeFormat('tr-TR', {
            hour: '2-digit',
            minute: '2-digit'
          }).format(new Date(activity.scheduledAt || new Date()));
          const isCompleted = activity.status === 'Completed';

          return (
            <div
              key={activity.id}
              className={`p-3 border rounded-lg hover:shadow-sm transition-all ${
                isCompleted ? 'border-slate-100 bg-slate-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isCompleted ? 'bg-slate-100' : 'bg-slate-100'}`}>
                  <Icon className={`w-4 h-4 ${isCompleted ? 'text-slate-400' : 'text-slate-600'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Text
                      strong={!isCompleted}
                      className={`truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}
                    >
                      {activity.subject}
                    </Text>
                    {isCompleted && (
                      <CheckCircleIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <ClockIcon className="w-3 h-3" />
                    <span>{time}</span>
                    {activity.relatedToName && (
                      <>
                        <span>•</span>
                        <span className="truncate">{activity.relatedToName}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                  {activity.type}
                </span>
              </div>
            </div>
          );
        })}
      </Space>

      {todaysActivities.length > 8 && (
        <div className="mt-3 text-center">
          <Link href="/crm/activities" className="text-slate-500 hover:text-slate-700">
            +{todaysActivities.length - 8} aktivite daha
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
}

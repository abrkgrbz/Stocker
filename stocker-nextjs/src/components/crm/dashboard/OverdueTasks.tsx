'use client';

import React from 'react';
import { Typography, Space, Empty, Alert } from 'antd';
import {
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { AnimatedCard } from '../shared/AnimatedCard';
import type { Activity } from '@/lib/api/services/crm.service';

const { Text, Link } = Typography;

interface OverdueTasksProps {
  activities: Activity[];
  loading?: boolean;
}

const activityIcons: Record<string, any> = {
  Call: PhoneIcon,
  Email: EnvelopeIcon,
  Meeting: UserGroupIcon,
  Task: DocumentTextIcon,
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
          image={
            <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-5 h-5 text-slate-300" />
            </div>
          }
          imageStyle={{ height: 60 }}
          description={
            <div className="text-center">
              <div className="text-sm font-medium text-slate-600 mb-1">
                Gecikmiş görev yok
              </div>
              <Text type="secondary" className="text-xs text-slate-400">Tüm görevler zamanında</Text>
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
          <ExclamationTriangleIcon className="w-5 h-5 text-slate-500" />
          <span>Gecikmiş Görevler</span>
          <span className="px-2 py-0.5 text-xs rounded-full bg-slate-900 text-white">
            {overdueActivities.length}
          </span>
        </div>
      }
      loading={loading}
      extra={<Link href="/crm/activities?filter=overdue" className="!text-slate-500 hover:!text-slate-700">Tümünü Gör</Link>}
    >
      {criticalCount > 0 && (
        <Alert
          message={`${criticalCount} kritik görev 7 günden fazla gecikmiş`}
          type="warning"
          showIcon
          icon={<ExclamationTriangleIcon className="w-5 h-5" />}
          className="mb-3 !bg-slate-50 !border-slate-200"
        />
      )}

      <Space direction="vertical" style={{ width: '100%' }} size="small">
        {overdueActivities.slice(0, 6).map((activity) => {
          const Icon = activityIcons[activity.type] || DocumentTextIcon;
          const daysOverdue = activity.scheduledAt ? getDaysOverdue(activity.scheduledAt) : 0;
          const isCritical = daysOverdue > 7;
          const dueDate = activity.scheduledAt ? new Date(activity.scheduledAt).toLocaleDateString('tr-TR') : 'N/A';

          return (
            <div
              key={activity.id}
              className={`p-3 border rounded-lg hover:shadow-sm transition-all ${
                isCritical
                  ? 'border-slate-300 bg-slate-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isCritical ? 'bg-slate-200' : 'bg-slate-100'}`}>
                  <Icon className={`w-4 h-4 ${isCritical ? 'text-slate-700' : 'text-slate-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Text strong className="truncate text-slate-900">
                      {activity.subject}
                    </Text>
                    <span className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                      isCritical ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {daysOverdue} gün
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <CalendarIcon className="w-3 h-3" />
                    <span>Termin: {dueDate}</span>
                    {activity.relatedToName && (
                      <>
                        <span>•</span>
                        <span className="truncate">{activity.relatedToName}</span>
                      </>
                    )}
                  </div>
                  {activity.description && (
                    <Text type="secondary" className="text-xs line-clamp-1 text-slate-400">
                      {activity.description}
                    </Text>
                  )}
                </div>
                <div className="flex flex-col gap-1 items-end flex-shrink-0">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                    {activity.type}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activity.priority === 'High' ? 'bg-slate-900 text-white' :
                    activity.priority === 'Medium' ? 'bg-slate-200 text-slate-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {activity.priority}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </Space>

      {overdueActivities.length > 6 && (
        <div className="mt-3 text-center">
          <Link href="/crm/activities?filter=overdue" className="text-slate-500 hover:text-slate-700">
            +{overdueActivities.length - 6} gecikmiş görev daha
          </Link>
        </div>
      )}
    </AnimatedCard>
  );
}

'use client';

/**
 * Activity Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { useActivity } from '@/lib/api/hooks/useCRM';
import { ActivityType, ActivityStatus, ActivityPriority } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const typeLabels: Record<ActivityType, { label: string; color: string; icon: React.ReactNode }> = {
  [ActivityType.Call]: { label: 'Arama', color: 'blue', icon: <PhoneOutlined /> },
  [ActivityType.Email]: { label: 'E-posta', color: 'cyan', icon: <MailOutlined /> },
  [ActivityType.Meeting]: { label: 'Toplantı', color: 'purple', icon: <TeamOutlined /> },
  [ActivityType.Task]: { label: 'Görev', color: 'orange', icon: <CheckCircleOutlined /> },
  [ActivityType.Note]: { label: 'Not', color: 'default', icon: <FileTextOutlined /> },
};

const statusLabels: Record<ActivityStatus, { label: string; color: string }> = {
  [ActivityStatus.Scheduled]: { label: 'Planlandı', color: 'default' },
  [ActivityStatus.InProgress]: { label: 'Devam Ediyor', color: 'processing' },
  [ActivityStatus.Completed]: { label: 'Tamamlandı', color: 'success' },
  [ActivityStatus.Cancelled]: { label: 'İptal Edildi', color: 'error' },
};

const priorityLabels: Record<ActivityPriority, { label: string; color: string }> = {
  [ActivityPriority.Low]: { label: 'Düşük', color: 'default' },
  [ActivityPriority.Normal]: { label: 'Normal', color: 'blue' },
  [ActivityPriority.High]: { label: 'Yüksek', color: 'orange' },
  [ActivityPriority.Urgent]: { label: 'Acil', color: 'red' },
};

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;

  const { data: activity, isLoading, error } = useActivity(activityId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Aktivite bulunamadı" />
      </div>
    );
  }

  const typeInfo = typeLabels[activity.type] || { label: activity.type, color: 'default', icon: <FileTextOutlined /> };
  const statusInfo = statusLabels[activity.status] || { label: activity.status, color: 'default' };
  const priorityInfo = priorityLabels[activity.priority] || { label: activity.priority, color: 'default' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/activities')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftOutlined />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  activity.isOverdue ? 'bg-red-100' : 'bg-blue-100'
                }`}
              >
                <span className={`text-lg ${activity.isOverdue ? 'text-red-600' : 'text-blue-600'}`}>
                  {typeInfo.icon}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {activity.subject || activity.title}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                  {activity.isOverdue && (
                    <Tag color="red" icon={<ExclamationCircleOutlined />}>
                      Gecikmiş
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">{typeInfo.label}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/activities/${activity.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <EditOutlined />
            Düzenle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Info Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Aktivite Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Konu</p>
                  <p className="text-sm font-medium text-slate-900">
                    {activity.subject || activity.title}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tip</p>
                  <Tag color={typeInfo.color} icon={typeInfo.icon}>
                    {typeInfo.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Öncelik</p>
                  <Tag color={priorityInfo.color}>{priorityInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Planlanan Tarih</p>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {activity.scheduledAt
                        ? dayjs(activity.scheduledAt).format('DD/MM/YYYY HH:mm')
                        : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bitiş Tarihi</p>
                  <div className="flex items-center gap-1">
                    <ClockCircleOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {activity.dueAt
                        ? dayjs(activity.dueAt).format('DD/MM/YYYY HH:mm')
                        : '-'}
                    </span>
                  </div>
                </div>
                {activity.completedAt && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Tamamlanma Tarihi</p>
                    <div className="flex items-center gap-1">
                      <CheckCircleOutlined className="text-emerald-500" />
                      <span className="text-sm font-medium text-slate-900">
                        {dayjs(activity.completedAt).format('DD/MM/YYYY HH:mm')}
                      </span>
                    </div>
                  </div>
                )}
                {activity.location && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Konum</p>
                    <div className="flex items-center gap-1">
                      <EnvironmentOutlined className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{activity.location}</span>
                    </div>
                  </div>
                )}
              </div>

              {activity.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{activity.description}</p>
                </div>
              )}

              {activity.notes && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Notlar</p>
                  <p className="text-sm text-slate-700">{activity.notes}</p>
                </div>
              )}

              {activity.outcome && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Sonuç</p>
                  <p className="text-sm text-slate-700">{activity.outcome}</p>
                </div>
              )}
            </div>
          </div>

          {/* Assignment Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Atama Bilgileri
              </p>
              <div className="space-y-4">
                {activity.ownerName && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <UserOutlined className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.ownerName}</p>
                      <p className="text-xs text-slate-500">Sahibi</p>
                    </div>
                  </div>
                )}
                {activity.assignedToName && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <UserOutlined className="text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.assignedToName}</p>
                      <p className="text-xs text-slate-500">Atanan Kişi</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Related Entities Card */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İlişkili Kayıtlar
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {activity.leadId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/leads/${activity.leadId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Lead</p>
                    <p className="text-sm font-medium text-blue-600">{activity.leadName || 'Görüntüle'}</p>
                  </div>
                )}
                {activity.customerId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/customers/${activity.customerId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Müşteri</p>
                    <p className="text-sm font-medium text-blue-600">{activity.customerName || 'Görüntüle'}</p>
                  </div>
                )}
                {activity.contactId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/contacts/${activity.contactId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Kişi</p>
                    <p className="text-sm font-medium text-blue-600">{activity.contactName || 'Görüntüle'}</p>
                  </div>
                )}
                {activity.opportunityId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/opportunities/${activity.opportunityId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Fırsat</p>
                    <p className="text-sm font-medium text-blue-600">{activity.opportunityName || 'Görüntüle'}</p>
                  </div>
                )}
                {activity.dealId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/deals/${activity.dealId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Deal</p>
                    <p className="text-sm font-medium text-blue-600">{activity.dealTitle || 'Görüntüle'}</p>
                  </div>
                )}
                {!activity.leadId && !activity.customerId && !activity.contactId && !activity.opportunityId && !activity.dealId && (
                  <p className="text-sm text-slate-400 col-span-full text-center py-4">
                    İlişkili kayıt bulunmuyor
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

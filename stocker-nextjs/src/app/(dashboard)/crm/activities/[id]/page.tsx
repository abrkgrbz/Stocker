'use client';

/**
 * Activity Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  PencilIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useActivity } from '@/lib/api/hooks/useCRM';
import type { Activity } from '@/lib/api/services/crm.service';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

type ActivityTypeStr = Activity['type'];
type ActivityStatusStr = Activity['status'];
type ActivityPriorityStr = NonNullable<Activity['priority']>;

const typeLabels: Record<ActivityTypeStr, { label: string; color: string; icon: React.ReactNode }> = {
  Call: { label: 'Arama', color: 'blue', icon: <PhoneIcon className="w-4 h-4" /> },
  Email: { label: 'E-posta', color: 'cyan', icon: <EnvelopeIcon className="w-4 h-4" /> },
  Meeting: { label: 'Toplantı', color: 'purple', icon: <UsersIcon className="w-4 h-4" /> },
  Task: { label: 'Görev', color: 'orange', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Note: { label: 'Not', color: 'default', icon: <DocumentTextIcon className="w-4 h-4" /> },
};

const statusLabels: Record<ActivityStatusStr, { label: string; color: string }> = {
  Scheduled: { label: 'Planlandı', color: 'default' },
  Completed: { label: 'Tamamlandı', color: 'success' },
  Cancelled: { label: 'İptal Edildi', color: 'error' },
};

const priorityLabels: Record<ActivityPriorityStr, { label: string; color: string }> = {
  Low: { label: 'Düşük', color: 'default' },
  Medium: { label: 'Normal', color: 'blue' },
  High: { label: 'Yüksek', color: 'orange' },
};

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const activityId = params.id as string;
  const { data: activity, isLoading, error } = useActivity(activityId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
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

  const typeInfo = typeLabels[activity.type] || { label: activity.type, color: 'default', icon: <DocumentTextIcon className="w-4 h-4" /> };
  const statusInfo = statusLabels[activity.status] || { label: activity.status, color: 'default' };
  const priorityInfo = activity.priority ? (priorityLabels[activity.priority] || { label: activity.priority, color: 'default' }) : { label: '-', color: 'default' };

  return (
    <div className="min-h-screen bg-slate-50">
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
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-blue-100">
                <span className="text-lg text-blue-600">{typeInfo.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {activity.subject || activity.title}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{typeInfo.label}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push('/crm/activities/' + activity.id + '/edit')}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Düzenle
          </button>
        </div>
      </div>

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
                  <p className="text-xs text-slate-400 mb-1">Başlangıç</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {activity.startTime
                        ? dayjs(activity.startTime).format('DD/MM/YYYY HH:mm')
                        : activity.scheduledAt
                        ? dayjs(activity.scheduledAt).format('DD/MM/YYYY HH:mm')
                        : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bitiş</p>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {activity.endTime
                        ? dayjs(activity.endTime).format('DD/MM/YYYY HH:mm')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {activity.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{activity.description}</p>
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
                      <UserIcon className="w-5 h-5 text-blue-600" />
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
                      <UserIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.assignedToName}</p>
                      <p className="text-xs text-slate-500">Atanan Kişi</p>
                    </div>
                  </div>
                )}
                {activity.relatedToName && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{activity.relatedToName}</p>
                      <p className="text-xs text-slate-500">İlişkili Kişi</p>
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
                    onClick={() => router.push('/crm/leads/' + activity.leadId)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Lead</p>
                    <p className="text-sm font-medium text-blue-600">
                      {activity.leadName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {activity.customerId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push('/crm/customers/' + activity.customerId)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Müşteri</p>
                    <p className="text-sm font-medium text-blue-600">
                      {activity.customerName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {activity.contactId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push('/crm/contacts/' + activity.contactId)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Kişi</p>
                    <p className="text-sm font-medium text-blue-600">
                      {activity.contactName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {activity.opportunityId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push('/crm/opportunities/' + activity.opportunityId)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Fırsat</p>
                    <p className="text-sm font-medium text-blue-600">
                      {activity.opportunityName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {activity.dealId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push('/crm/deals/' + activity.dealId)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Deal</p>
                    <p className="text-sm font-medium text-blue-600">
                      {activity.dealTitle || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {!activity.leadId &&
                  !activity.customerId &&
                  !activity.contactId &&
                  !activity.opportunityId &&
                  !activity.dealId && (
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

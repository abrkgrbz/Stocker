'use client';

/**
 * Campaign Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag, Progress } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  PencilIcon,
  TrophyIcon,
  UserGroupIcon,
  UserPlusIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCampaign } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  Planned: { label: 'Planlandı', color: 'default', icon: <CalendarIcon className="w-4 h-4" /> },
  InProgress: { label: 'Devam Ediyor', color: 'processing', icon: <PlayCircleOutlined /> },
  Completed: { label: 'Tamamlandı', color: 'success', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Aborted: { label: 'İptal Edildi', color: 'error', icon: <XCircleIcon className="w-4 h-4" /> },
  OnHold: { label: 'Beklemede', color: 'warning', icon: <PauseCircleOutlined /> },
};

const typeLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  Email: { label: 'E-posta', icon: <EnvelopeIcon className="w-4 h-4" /> },
  SocialMedia: { label: 'Sosyal Medya', icon: <UserPlusIcon className="w-4 h-4" /> },
  Webinar: { label: 'Webinar', icon: <PlayCircleOutlined /> },
  Event: { label: 'Etkinlik', icon: <CheckCircleIcon className="w-4 h-4" /> },
  Conference: { label: 'Konferans', icon: <UserGroupIcon className="w-4 h-4" /> },
  Advertisement: { label: 'Reklam', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  Banner: { label: 'Banner', icon: <CurrencyDollarIcon className="w-4 h-4" /> },
  Telemarketing: { label: 'Telefonla Pazarlama', icon: <EnvelopeIcon className="w-4 h-4" /> },
  PublicRelations: { label: 'Halkla İlişkiler', icon: <UserPlusIcon className="w-4 h-4" /> },
};

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const { data: campaign, isLoading, error } = useCampaign(campaignId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Kampanya bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusLabels[campaign.status] || { label: campaign.status, color: 'default', icon: null };
  const typeInfo = typeLabels[campaign.type] || { label: campaign.type, icon: <EnvelopeIcon className="w-4 h-4" /> };
  const responseRate = campaign.sentCount > 0 ? Math.round((campaign.responseCount / campaign.sentCount) * 100) : 0;
  const roi = campaign.actualCost > 0 ? Math.round(((campaign.revenue - campaign.actualCost) / campaign.actualCost) * 100) : 0;

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
              onClick={() => router.push('/crm/campaigns')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center">
                {typeInfo.icon && <span className="text-purple-600 text-lg">{typeInfo.icon}</span>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{campaign.name}</h1>
                  <Tag color={statusInfo.color} icon={statusInfo.icon}>
                    {statusInfo.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{typeInfo.label}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/campaigns/${campaign.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
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
                Kampanya Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kampanya Adı</p>
                  <p className="text-sm font-medium text-slate-900">{campaign.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kampanya Tipi</p>
                  <Tag color="purple">{typeInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag color={statusInfo.color} icon={statusInfo.icon}>
                    {statusInfo.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Başlangıç Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {campaign.startDate ? dayjs(campaign.startDate).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bitiş Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4" className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {campaign.endDate ? dayjs(campaign.endDate).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Hedef Kitle</p>
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {campaign.targetAudience || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {campaign.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{campaign.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Performans
              </p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500">Yanıt Oranı</span>
                    <span className="text-sm font-medium text-slate-900">%{responseRate}</span>
                  </div>
                  <Progress
                    percent={responseRate}
                    strokeColor={responseRate > 20 ? '#10b981' : responseRate > 10 ? '#f59e0b' : '#ef4444'}
                    showInfo={false}
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Gönderilen</span>
                    <span className="font-medium text-slate-900">{campaign.sentCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Yanıt</span>
                    <span className="font-medium text-slate-900">{campaign.responseCount || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Dönüşüm</span>
                    <span className="font-medium text-slate-900">{campaign.convertedCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="w-4 h-4" className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Bütçe
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Planlanan Bütçe</p>
                  <p className="text-xl font-semibold text-slate-900">
                    ₺{(campaign.budget || 0).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Gerçekleşen Maliyet</p>
                  <p className="text-xl font-semibold text-slate-900">
                    ₺{(campaign.actualCost || 0).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ROI Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-4 h-4" className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Yatırım Getirisi
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Gelir</p>
                  <p className="text-xl font-semibold text-emerald-600">
                    ₺{(campaign.revenue || 0).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">ROI</p>
                  <p className={`text-xl font-semibold ${roi >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    %{roi}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

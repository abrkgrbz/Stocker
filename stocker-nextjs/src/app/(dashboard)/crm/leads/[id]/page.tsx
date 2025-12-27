'use client';

/**
 * Lead Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag, Progress } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  EnvelopeIcon,
  FireIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  TrophyIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useLead } from '@/lib/api/hooks/useCRM';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const statusLabels: Record<string, { label: string; color: string }> = {
  New: { label: 'Yeni', color: 'blue' },
  Contacted: { label: 'İletişime Geçildi', color: 'cyan' },
  Qualified: { label: 'Nitelikli', color: 'green' },
  Unqualified: { label: 'Niteliksiz', color: 'red' },
  Converted: { label: 'Dönüştürüldü', color: 'purple' },
};

const sourceLabels: Record<string, string> = {
  Website: 'Website',
  Referral: 'Referans',
  SocialMedia: 'Sosyal Medya',
  Advertisement: 'Reklam',
  Email: 'E-posta',
  Phone: 'Telefon',
  Event: 'Etkinlik',
  Other: 'Diğer',
};

export default function LeadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const leadId = params.id as string;

  const { data: lead, isLoading, error } = useLead(leadId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Potansiyel müşteri bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusLabels[lead.status] || { label: lead.status, color: 'default' };
  const fullName = `${lead.firstName} ${lead.lastName}`;

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
              onClick={() => router.push('/crm/leads')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{fullName}</h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{lead.company || lead.email}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/leads/${lead.id}/edit`)}
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
                Kişi Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ad Soyad</p>
                  <p className="text-sm font-medium text-slate-900">{fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">E-posta</p>
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Telefon</p>
                  {lead.phone ? (
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      {lead.phone}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Firma</p>
                  <p className="text-sm font-medium text-slate-900">{lead.company || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pozisyon</p>
                  <p className="text-sm font-medium text-slate-900">{lead.title || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kaynak</p>
                  <Tag color="blue">{sourceLabels[lead.source] || lead.source}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sektör</p>
                  <p className="text-sm font-medium text-slate-900">{lead.industry || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {lead.createdAt ? dayjs(lead.createdAt).format('DD/MM/YYYY') : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {lead.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Notlar</p>
                  <p className="text-sm text-slate-700">{lead.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Score Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Lead Skoru
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                    (lead.score || 0) >= 70
                      ? 'bg-emerald-100 text-emerald-600'
                      : (lead.score || 0) >= 40
                      ? 'bg-amber-100 text-amber-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {lead.score || 0}
                </div>
                <p className="text-sm font-medium text-slate-700 mt-3">
                  {(lead.score || 0) >= 70 ? 'Sıcak Lead' : (lead.score || 0) >= 40 ? 'Ilık Lead' : 'Soğuk Lead'}
                </p>
                <Progress
                  percent={lead.score || 0}
                  showInfo={false}
                  strokeColor={
                    (lead.score || 0) >= 70 ? '#10b981' : (lead.score || 0) >= 40 ? '#f59e0b' : '#ef4444'
                  }
                  className="w-full mt-4"
                />
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Tahmini Değer</span>
                  <span className="font-medium text-slate-900">
                    ₺{(lead.estimatedValue || 0).toLocaleString('tr-TR')}
                  </span>
                </div>
                {lead.assignedToName && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Atanan Kişi</span>
                    <span className="font-medium text-slate-900">{lead.assignedToName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Address Card */}
          {(lead.address || lead.city || lead.country) && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPinIcon className="w-5 h-5 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Adres Bilgileri
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {lead.address && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Adres</p>
                      <p className="text-sm font-medium text-slate-900">{lead.address}</p>
                    </div>
                  )}
                  {lead.city && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Şehir</p>
                      <p className="text-sm font-medium text-slate-900">{lead.city}</p>
                    </div>
                  )}
                  {lead.state && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">İlçe</p>
                      <p className="text-sm font-medium text-slate-900">{lead.state}</p>
                    </div>
                  )}
                  {lead.country && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Ülke</p>
                      <p className="text-sm font-medium text-slate-900">{lead.country}</p>
                    </div>
                  )}
                  {lead.postalCode && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Posta Kodu</p>
                      <p className="text-sm font-medium text-slate-900">{lead.postalCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Competitor Detail Page
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
  CursorArrowRaysIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  PencilIcon,
  TrophyIcon,
  UserGroupIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useCompetitor } from '@/lib/api/hooks/useCRM';
import { ThreatLevel } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const threatLevelLabels: Record<ThreatLevel, { label: string; color: string }> = {
  [ThreatLevel.VeryLow]: { label: 'Çok Düşük', color: 'green' },
  [ThreatLevel.Low]: { label: 'Düşük', color: 'lime' },
  [ThreatLevel.Medium]: { label: 'Orta', color: 'orange' },
  [ThreatLevel.High]: { label: 'Yüksek', color: 'red' },
  [ThreatLevel.VeryHigh]: { label: 'Çok Yüksek', color: 'purple' },
};

export default function CompetitorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const competitorId = params.id as string;

  const { data: competitor, isLoading, error } = useCompetitor(competitorId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !competitor) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Rakip bulunamadı" />
      </div>
    );
  }

  const threatInfo = threatLevelLabels[competitor.threatLevel] || { label: 'Bilinmiyor', color: 'default' };
  const winRate = competitor.encounterCount > 0
    ? Math.round((competitor.winCount / competitor.encounterCount) * 100)
    : 0;

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
              onClick={() => router.push('/crm/competitors')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  competitor.isActive ? 'bg-red-100' : 'bg-slate-100'
                }`}
              >
                <CursorArrowRaysIcon className="w-4 h-4" className={`text-lg ${competitor.isActive ? 'text-red-600' : 'text-slate-400'}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{competitor.name}</h1>
                  <Tag color={threatInfo.color}>
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {threatInfo.label}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {competitor.industry || 'Sektör belirtilmemiş'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/competitors/${competitor.id}/edit`)}
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
                Rakip Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rakip Adı</p>
                  <p className="text-sm font-medium text-slate-900">{competitor.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Sektör</p>
                  <p className="text-sm font-medium text-slate-900">{competitor.industry || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Tehdit Seviyesi</p>
                  <Tag color={threatInfo.color}>
                    <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                    {threatInfo.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={competitor.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    color={competitor.isActive ? 'success' : 'default'}
                  >
                    {competitor.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Pazar Payı</p>
                  <p className="text-sm font-medium text-slate-900">
                    %{competitor.marketShare || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {competitor.createdAt
                        ? dayjs(competitor.createdAt).format('DD/MM/YYYY')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {competitor.website && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <GlobeAltIcon className="w-4 h-4 text-slate-400" />
                    <p className="text-xs text-slate-400 m-0">Website</p>
                  </div>
                  <a
                    href={competitor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {competitor.website}
                  </a>
                </div>
              )}

              {competitor.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{competitor.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Win Rate Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Karşılaşma Performansı
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                    winRate >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  %{winRate}
                </div>
                <p className="text-sm font-medium text-slate-700 mt-3">Kazanma Oranı</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Toplam Karşılaşma</span>
                  <span className="font-medium text-slate-900">{competitor.encounterCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Kazandık</span>
                  <span className="font-medium text-emerald-600">{competitor.winCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Kaybettik</span>
                  <span className="font-medium text-red-600">{competitor.lossCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Güçlü Yönleri
                </p>
              </div>
              {competitor.strengths ? (
                <p className="text-sm text-slate-700">{competitor.strengths}</p>
              ) : (
                <p className="text-sm text-slate-400">Belirtilmemiş</p>
              )}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Zayıf Yönleri
                </p>
              </div>
              {competitor.weaknesses ? (
                <p className="text-sm text-slate-700">{competitor.weaknesses}</p>
              ) : (
                <p className="text-sm text-slate-400">Belirtilmemiş</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

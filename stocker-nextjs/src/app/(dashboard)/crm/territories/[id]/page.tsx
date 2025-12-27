'use client';

/**
 * Territory Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag } from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  MapPinIcon,
  PencilIcon,
  UserGroupIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useTerritory } from '@/lib/api/hooks/useCRM';
import { TerritoryType } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const typeLabels: Record<TerritoryType, { label: string; color: string }> = {
  [TerritoryType.Country]: { label: 'Ülke', color: 'blue' },
  [TerritoryType.Region]: { label: 'Bölge', color: 'green' },
  [TerritoryType.City]: { label: 'Şehir', color: 'cyan' },
  [TerritoryType.District]: { label: 'İlçe', color: 'purple' },
  [TerritoryType.PostalCode]: { label: 'Posta Kodu', color: 'orange' },
  [TerritoryType.Custom]: { label: 'Özel', color: 'default' },
  [TerritoryType.Industry]: { label: 'Sektör', color: 'gold' },
  [TerritoryType.CustomerSegment]: { label: 'Müşteri Segmenti', color: 'magenta' },
};

export default function TerritoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const territoryId = params.id as string;

  const { data: territory, isLoading, error } = useTerritory(territoryId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !territory) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Bölge bulunamadı" />
      </div>
    );
  }

  const typeInfo = typeLabels[territory.type] || { label: territory.type, color: 'default' };

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
              onClick={() => router.push('/crm/territories')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  territory.isActive ? 'bg-emerald-100' : 'bg-slate-100'
                }`}
              >
                <GlobeAltIcon className={`w-5 h-5 ${territory.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{territory.name}</h1>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{territory.code || 'Kod belirtilmemiş'}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/territories/${territory.id}/edit`)}
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
                Bölge Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bölge Adı</p>
                  <p className="text-sm font-medium text-slate-900">{territory.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bölge Kodu</p>
                  <p className="text-sm font-medium text-slate-900">{territory.code || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Bölge Tipi</p>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={territory.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    color={territory.isActive ? 'success' : 'default'}
                  >
                    {territory.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Müşteri Sayısı</p>
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {territory.customerCount || 0}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {territory.createdAt
                        ? dayjs(territory.createdAt).format('DD/MM/YYYY')
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {territory.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{territory.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özet
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center ${
                    territory.isActive ? 'bg-emerald-100' : 'bg-slate-100'
                  }`}
                >
                  <MapPinIcon className={`w-8 h-8 ${territory.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                </div>
                <p className="text-lg font-semibold text-slate-900 mt-3">{territory.name}</p>
                <Tag color={typeInfo.color} className="mt-2">
                  {typeInfo.label}
                </Tag>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Müşteri Sayısı</span>
                  <span className="font-medium text-slate-900">{territory.customerCount || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Durum</span>
                  <span
                    className={`font-medium ${territory.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {territory.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Territory */}
          {territory.parentTerritoryId && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Üst Bölge
                </p>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <GlobeAltIcon className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {territory.parentTerritoryName || 'Üst Bölge'}
                    </p>
                    <p className="text-xs text-slate-500">Üst bölge bağlantısı</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

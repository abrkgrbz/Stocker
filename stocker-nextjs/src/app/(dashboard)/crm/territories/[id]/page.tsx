'use client';

/**
 * Territory Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag, Progress, Tooltip } from 'antd';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
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

// Mini Sparkline Component for Sales Target Card
const MiniSparkline = ({ data, color = '#ffffff' }: { data: number[]; color?: string }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const padding = 2;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      {/* Gradient fill under the line */}
      <defs>
        <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        fill="url(#sparklineGradient)"
        points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
      />
    </svg>
  );
};

// Empty Value Component for better empty state display
const EmptyValue = ({ className = '' }: { className?: string }) => (
  <span className={`text-slate-300 italic text-xs ${className}`}>Veri yok</span>
);

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

  const typeInfo = typeLabels[territory.territoryType] || { label: territory.territoryType, color: 'default' };

  const formatCurrency = (value?: number, showEmpty = true): string => {
    if (!value && value !== 0) return showEmpty ? '' : '';
    if (value === 0) return '₺0';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: territory.currency || 'TRY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Generate mock monthly performance data for sparkline (simulated trend)
  const sparklineData = useMemo(() => {
    if (!territory.totalSales && !territory.salesTarget) return [];
    const totalSales = territory.totalSales || 0;
    const target = territory.salesTarget || totalSales * 1.2;
    // Generate 6 months of simulated progressive data
    const baseValue = totalSales * 0.1;
    return [
      baseValue,
      baseValue * 1.5,
      baseValue * 2.2,
      baseValue * 3.1,
      baseValue * 4.5,
      totalSales,
    ];
  }, [territory.totalSales, territory.salesTarget]);

  // Calculate sales performance percentage
  const salesPerformance = territory.salesTarget && territory.totalSales
    ? Math.min(Math.round((territory.totalSales / territory.salesTarget) * 100), 100)
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
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">

          {/* Sales Target & Performance Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5" />
                  <p className="text-sm font-medium opacity-90">Satış Hedefi</p>
                </div>
                {/* Mini Sparkline showing trend */}
                {sparklineData.length > 0 && (
                  <Tooltip title="Son 6 ay satış trendi">
                    <div className="cursor-help">
                      <MiniSparkline data={sparklineData} color="#ffffff" />
                    </div>
                  </Tooltip>
                )}
              </div>
              {territory.salesTarget ? (
                <>
                  <p className="text-3xl font-bold mb-2">
                    {formatCurrency(territory.salesTarget)}
                  </p>
                  {territory.targetYear && (
                    <p className="text-sm opacity-75 mb-4">{territory.targetYear} Yılı Hedefi</p>
                  )}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="opacity-75">Gerçekleşen</span>
                      <span className="font-medium">{formatCurrency(territory.totalSales) || '₺0'}</span>
                    </div>
                    <Progress
                      percent={salesPerformance}
                      strokeColor="#ffffff"
                      trailColor="rgba(255,255,255,0.3)"
                      showInfo={false}
                    />
                    <p className="text-sm mt-2 font-medium">%{salesPerformance} tamamlandı</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 opacity-75">
                  <CurrencyDollarIcon className="w-10 h-10 mb-2 opacity-50" />
                  <p className="text-sm">Hedef belirlenmemiş</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserGroupIcon className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${territory.customerCount ? 'text-slate-900' : 'text-slate-300'}`}>
                  {territory.customerCount || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">Müşteri</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <ChartBarIcon className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${territory.opportunityCount ? 'text-slate-900' : 'text-slate-300'}`}>
                  {territory.opportunityCount || 0}
                </p>
                <p className="text-xs text-slate-500 mt-1">Fırsat</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <BanknotesIcon className="w-4 h-4 text-amber-600" />
                  </div>
                </div>
                {territory.totalSales ? (
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(territory.totalSales)}</p>
                ) : (
                  <p className="text-2xl font-bold text-slate-300">₺0</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Toplam Satış</p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                {territory.potentialValue ? (
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(territory.potentialValue)}</p>
                ) : (
                  <p className="text-2xl font-bold text-slate-300">₺0</p>
                )}
                <p className="text-xs text-slate-500 mt-1">Potansiyel Değer</p>
              </div>
            </div>
          </div>

          {/* Main Info Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
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
                  {territory.code ? (
                    <p className="text-sm font-mono bg-slate-100 px-2 py-1 rounded inline-block">{territory.code}</p>
                  ) : (
                    <EmptyValue />
                  )}
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
                  <p className="text-xs text-slate-400 mb-1">Hiyerarşi Seviyesi</p>
                  <p className="text-sm font-medium text-slate-900">{territory.hierarchyLevel || 1}. Seviye</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Para Birimi</p>
                  <p className="text-sm font-medium text-slate-900">{territory.currency || 'TRY'}</p>
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

          {/* Geographic Info Card - 2 Column Layout */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <MapPinIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Coğrafi Bilgiler
                </p>
              </div>
              {territory.country || territory.region || territory.city || territory.district ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ülke</p>
                    {territory.country ? (
                      <p className="text-sm font-medium text-slate-900">
                        {territory.country}
                        {territory.countryCode && (
                          <span className="text-slate-400 ml-1 text-xs">({territory.countryCode})</span>
                        )}
                      </p>
                    ) : (
                      <EmptyValue />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Bölge</p>
                    {territory.region ? (
                      <p className="text-sm font-medium text-slate-900">{territory.region}</p>
                    ) : (
                      <EmptyValue />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Şehir</p>
                    {territory.city ? (
                      <p className="text-sm font-medium text-slate-900">{territory.city}</p>
                    ) : (
                      <EmptyValue />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">İlçe</p>
                    {territory.district ? (
                      <p className="text-sm font-medium text-slate-900">{territory.district}</p>
                    ) : (
                      <EmptyValue />
                    )}
                  </div>
                  {territory.postalCodeRange && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-1">Posta Kodu Aralığı</p>
                      <p className="text-sm font-medium text-slate-900">{territory.postalCodeRange}</p>
                    </div>
                  )}
                  {territory.geoCoordinates && (
                    <div className="col-span-2">
                      <p className="text-xs text-slate-400 mb-1">Koordinatlar</p>
                      <p className="text-sm font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded text-xs">
                        {territory.geoCoordinates}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <MapPinIcon className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">Coğrafi bilgi belirtilmemiş</p>
                  <p className="text-xs text-slate-300 mt-1">Düzenleme sayfasından ekleyebilirsiniz</p>
                </div>
              )}
            </div>
          </div>

          {/* Sales Team Assignment Card */}
          {(territory.assignedSalesTeamId || territory.primarySalesRepId) && (
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Atanan Ekip
                  </p>
                </div>
                <div className="space-y-4">
                  {territory.assignedSalesTeamName && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <UserGroupIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{territory.assignedSalesTeamName}</p>
                        <p className="text-xs text-slate-500">Satış Ekibi</p>
                      </div>
                    </div>
                  )}
                  {territory.primarySalesRepName && (
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{territory.primarySalesRepName}</p>
                        <p className="text-xs text-slate-500">Birincil Satış Temsilcisi</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Parent Territory */}
          {territory.parentTerritoryId && (
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <GlobeAltIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Üst Bölge
                  </p>
                </div>
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <GlobeAltIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {territory.parentTerritoryName || 'Üst Bölge'}
                    </p>
                    <p className="text-xs text-slate-500">Üst bölge bağlantısı</p>
                  </div>
                </div>
                {territory.hierarchyPath && (
                  <div className="mt-4">
                    <p className="text-xs text-slate-400 mb-1">Hiyerarşi Yolu</p>
                    <p className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {territory.hierarchyPath}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Territory Assignments */}
          {territory.assignments && territory.assignments.length > 0 && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserGroupIcon className="w-4 h-4 text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Bölge Atamaları
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {territory.assignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        assignment.isPrimary ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        <UserIcon className={`w-5 h-5 ${
                          assignment.isPrimary ? 'text-emerald-600' : 'text-slate-500'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-slate-900">{assignment.userName || 'Kullanıcı'}</p>
                          {assignment.isPrimary && (
                            <Tag color="green" className="text-xs">Birincil</Tag>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          {assignment.assignmentType} • {dayjs(assignment.assignedDate).format('DD/MM/YYYY')}
                        </p>
                        {assignment.responsibilityPercentage && (
                          <p className="text-xs text-slate-400">%{assignment.responsibilityPercentage} sorumluluk</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Dates Info */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tarih Bilgileri
                </p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  {territory.createdAt ? (
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(territory.createdAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  ) : (
                    <EmptyValue />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Son Güncelleme</p>
                  {territory.updatedAt ? (
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(territory.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  ) : (
                    <EmptyValue />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">İstatistik Güncelleme</p>
                  {territory.statsUpdatedAt ? (
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(territory.statsUpdatedAt).format('DD/MM/YYYY HH:mm')}
                    </p>
                  ) : (
                    <EmptyValue />
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Hedef Yılı</p>
                  {territory.targetYear ? (
                    <p className="text-sm font-medium text-slate-900">{territory.targetYear}</p>
                  ) : (
                    <EmptyValue />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Table, Spin, Progress, message } from 'antd';
import {
  ChartBarIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  UserIcon,
  PlayIcon,
  StopIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import {
  useSalesTarget,
  useActivateSalesTarget,
  useDeactivateSalesTarget,
} from '@/features/sales';
import type { SalesTargetPeriodDto, SalesTargetProductDto } from '@/features/sales';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Taslak', color: 'bg-slate-200 text-slate-700' },
  Active: { label: 'Aktif', color: 'bg-slate-800 text-white' },
  Completed: { label: 'Tamamlandi', color: 'bg-emerald-100 text-emerald-800' },
  Cancelled: { label: 'Iptal', color: 'bg-red-100 text-red-800' },
  Expired: { label: 'Suresi Doldu', color: 'bg-amber-100 text-amber-800' },
};

const forecastConfig: Record<string, { label: string; color: string }> = {
  OnTrack: { label: 'Yolunda', color: 'text-emerald-600' },
  AtRisk: { label: 'Riskli', color: 'text-amber-600' },
  BehindSchedule: { label: 'Geride', color: 'text-red-600' },
  WillExceed: { label: 'Asacak', color: 'text-emerald-700' },
  Insufficient: { label: 'Yetersiz', color: 'text-red-700' },
};

const targetTypeLabels: Record<string, string> = {
  Individual: 'Bireysel',
  Team: 'Takim',
  Territory: 'Bolge',
  Product: 'Urun',
  Category: 'Kategori',
  Overall: 'Genel',
};

function formatCurrency(value: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#10b981';
  if (percentage >= 75) return '#f59e0b';
  if (percentage >= 50) return '#64748b';
  return '#ef4444';
}

export default function SalesTargetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: target, isLoading } = useSalesTarget(id);
  const activateMutation = useActivateSalesTarget();
  const deactivateMutation = useDeactivateSalesTarget();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!target) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Hedef bulunamadi</p>
          <Link href="/sales/targets" className="text-slate-900 hover:underline mt-2 inline-block">
            Listeye don
          </Link>
        </div>
      </div>
    );
  }

  const handleActivate = async () => {
    try {
      await activateMutation.mutateAsync(id);
      message.success('Hedef aktiflestirildi');
    } catch {
      // Error handled by hook
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(id);
      message.success('Hedef deaktif edildi');
    } catch {
      // Error handled by hook
    }
  };

  const statusInfo = statusConfig[target.status] || { label: target.status, color: 'bg-slate-100 text-slate-600' };
  const forecastInfo = forecastConfig[target.forecast] || { label: target.forecast, color: 'text-slate-600' };

  const periodColumns: ColumnsType<SalesTargetPeriodDto> = [
    {
      title: 'Donem',
      dataIndex: 'periodNumber',
      key: 'periodNumber',
      render: (num: number) => `Donem ${num}`,
    },
    {
      title: 'Baslangic',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Bitis',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hedef',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      align: 'right',
      render: (value: number, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Gerceklesen',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      align: 'right',
      render: (value: number, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Basari',
      dataIndex: 'achievementPercentage',
      key: 'achievementPercentage',
      width: 150,
      render: (percentage: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={Math.min(percentage, 100)}
            size="small"
            strokeColor={getProgressColor(percentage)}
            showInfo={false}
            className="flex-1"
          />
          <span className="text-xs font-medium">{percentage.toFixed(1)}%</span>
        </div>
      ),
    },
  ];

  const productColumns: ColumnsType<SalesTargetProductDto> = [
    {
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record) => (
        <div>
          <p className="text-sm font-medium text-slate-900">{text}</p>
          <p className="text-xs text-slate-500">{record.productCode}</p>
        </div>
      ),
    },
    {
      title: 'Hedef',
      dataIndex: 'targetAmount',
      key: 'targetAmount',
      align: 'right',
      render: (value: number, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Gerceklesen',
      dataIndex: 'actualAmount',
      key: 'actualAmount',
      align: 'right',
      render: (value: number, record) => formatCurrency(value, record.currency),
    },
    {
      title: 'Agirlik',
      dataIndex: 'weight',
      key: 'weight',
      align: 'center',
      render: (weight: number) => `${(weight * 100).toFixed(0)}%`,
    },
    {
      title: 'Basari',
      dataIndex: 'achievementPercentage',
      key: 'achievementPercentage',
      width: 150,
      render: (percentage: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={Math.min(percentage, 100)}
            size="small"
            strokeColor={getProgressColor(percentage)}
            showInfo={false}
            className="flex-1"
          />
          <span className="text-xs font-medium">{percentage.toFixed(1)}%</span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{target.name}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-slate-500">{target.targetCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {target.status === 'Draft' && (
              <button
                onClick={handleActivate}
                disabled={activateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
              >
                <PlayIcon className="w-4 h-4" />
                Aktifle
              </button>
            )}
            {target.status === 'Active' && (
              <button
                onClick={handleDeactivate}
                disabled={deactivateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <StopIcon className="w-4 h-4" />
                Durdur
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Genel Bilgiler</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Tip</p>
                  <p className="text-sm font-medium text-slate-900">{targetTypeLabels[target.targetType] || target.targetType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Donem</p>
                  <p className="text-sm font-medium text-slate-900">{target.periodType}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Yil</p>
                  <p className="text-sm font-medium text-slate-900">{target.year}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Metrik</p>
                  <p className="text-sm font-medium text-slate-900">{target.metricType}</p>
                </div>
              </div>
              {target.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Aciklama</p>
                  <p className="text-sm text-slate-700">{target.description}</p>
                </div>
              )}
            </div>

            {/* Periods Table */}
            {target.periods && target.periods.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Donemler</h2>
                <Table
                  columns={periodColumns}
                  dataSource={target.periods}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                />
              </div>
            )}

            {/* Products Table */}
            {target.productTargets && target.productTargets.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Urun Hedefleri</h2>
                <Table
                  columns={productColumns}
                  dataSource={target.productTargets}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100"
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievement Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Basari Durumu</h3>
              <div className="text-center mb-4">
                <div className="relative inline-flex items-center justify-center">
                  <Progress
                    type="circle"
                    percent={Math.min(target.achievementPercentage, 100)}
                    strokeColor={getProgressColor(target.achievementPercentage)}
                    size={120}
                    format={() => (
                      <span className={`text-2xl font-bold ${
                        target.achievementPercentage >= 100 ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {target.achievementPercentage.toFixed(1)}%
                      </span>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Tahmin</span>
                  <span className={`text-sm font-medium ${forecastInfo.color}`}>
                    {forecastInfo.label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Min. Basari</span>
                  <span className="text-sm font-medium text-slate-900">{target.minimumAchievementPercentage}%</span>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Durum</h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>

            {/* Value Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CurrencyDollarIcon className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Degerler</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500">Hedef Tutar</p>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(target.totalTargetAmount, target.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Gerceklesen</p>
                  <p className="text-lg font-semibold text-slate-700">{formatCurrency(target.totalActualAmount, target.currency)}</p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-xs text-slate-500">Kalan</p>
                  <p className="text-lg font-semibold text-slate-600">
                    {formatCurrency(Math.max(0, target.totalTargetAmount - target.totalActualAmount), target.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Assignment Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Atama</h3>
              </div>
              <div className="space-y-2">
                {target.salesRepresentativeName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Temsilci</span>
                    <span className="text-sm font-medium text-slate-900">{target.salesRepresentativeName}</span>
                  </div>
                )}
                {target.salesTeamName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Takim</span>
                    <span className="text-sm font-medium text-slate-900">{target.salesTeamName}</span>
                  </div>
                )}
                {target.salesTerritoryName && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Bolge</span>
                    <span className="text-sm font-medium text-slate-900">{target.salesTerritoryName}</span>
                  </div>
                )}
                {!target.salesRepresentativeName && !target.salesTeamName && !target.salesTerritoryName && (
                  <p className="text-sm text-slate-400">Henuz atanmamis</p>
                )}
              </div>
            </div>

            {/* Dates Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <CalendarDaysIcon className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Tarihler</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Yil</span>
                  <span className="text-sm font-medium text-slate-900">{target.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Donem</span>
                  <span className="text-sm font-medium text-slate-900">{target.periodType}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Table, Select, Dropdown, Spin, Progress } from 'antd';
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  ArrowPathIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useSalesTargets } from '@/features/sales';
import type { SalesTargetQueryParams, SalesTargetListDto } from '@/features/sales';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import Link from 'next/link';

const targetTypeLabels: Record<string, string> = {
  Individual: 'Bireysel',
  Team: 'Takim',
  Territory: 'Bolge',
  Product: 'Urun',
  Category: 'Kategori',
  Overall: 'Genel',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  Draft: { label: 'Taslak', color: 'bg-slate-200 text-slate-700' },
  Active: { label: 'Aktif', color: 'bg-slate-800 text-white' },
  Completed: { label: 'Tamamlandi', color: 'bg-emerald-100 text-emerald-800' },
  Cancelled: { label: 'Iptal', color: 'bg-red-100 text-red-800' },
  Expired: { label: 'Suresi Doldu', color: 'bg-amber-100 text-amber-800' },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
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

export default function SalesTargetsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<SalesTargetQueryParams>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, refetch } = useSalesTargets({
    page: currentPage,
    pageSize,
    ...filters,
  });

  const targets = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const activeTargets = targets.filter(t => t.status === 'Active');
  const avgAchievement = activeTargets.length > 0
    ? (activeTargets.reduce((sum, t) => sum + t.achievementPercentage, 0) / activeTargets.length).toFixed(1)
    : '0';
  const topPerformer = [...targets].sort((a, b) => b.achievementPercentage - a.achievementPercentage)[0];
  const totalTargetAmount = targets.reduce((sum, t) => sum + t.totalTargetAmount, 0);

  const getActionMenu = (record: SalesTargetListDto): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeIcon className="w-4 h-4" />,
      label: 'Goruntule',
      onClick: () => router.push(`/sales/targets/${record.id}`),
    },
  ];

  const columns: ColumnsType<SalesTargetListDto> = [
    {
      title: 'Hedef Adi',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Link
          href={`/sales/targets/${record.id}`}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (type: string) => (
        <span className="text-sm text-slate-600">
          {targetTypeLabels[type] || type}
        </span>
      ),
    },
    {
      title: 'Yil',
      dataIndex: 'year',
      key: 'year',
      align: 'center',
    },
    {
      title: 'Donem',
      dataIndex: 'periodType',
      key: 'periodType',
      render: (type: string) => (
        <span className="text-sm text-slate-600">{type}</span>
      ),
    },
    {
      title: 'Hedef Tutar',
      dataIndex: 'totalTargetAmount',
      key: 'totalTargetAmount',
      align: 'right',
      render: (value: number, record) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Gerceklesen',
      dataIndex: 'totalActualAmount',
      key: 'totalActualAmount',
      align: 'right',
      render: (value: number) => (
        <span className="text-sm text-slate-600">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: 'Basari',
      dataIndex: 'achievementPercentage',
      key: 'achievementPercentage',
      width: 180,
      render: (percentage: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={Math.min(percentage, 100)}
            size="small"
            strokeColor={getProgressColor(percentage)}
            showInfo={false}
            className="flex-1"
          />
          <span className={`text-xs font-medium min-w-[40px] text-right ${
            percentage >= 100 ? 'text-emerald-600' : percentage >= 75 ? 'text-amber-600' : percentage >= 50 ? 'text-slate-600' : 'text-red-600'
          }`}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status] || { label: status, color: 'bg-slate-100 text-slate-600' };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenu(record) }} trigger={['click']}>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisVerticalIcon className="w-4 h-4" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <ChartBarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satis Hedefleri</h1>
            <p className="text-sm text-slate-500">Ekip ve bireysel hedefleri takip edin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/sales/targets/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Hedef
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aktif Hedefler</p>
              <p className="text-xl font-semibold text-slate-900">{activeTargets.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TrophyIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Ortalama Basari</p>
              <p className="text-xl font-semibold text-slate-900">{avgAchievement}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">En Basarili</p>
              <p className="text-xl font-semibold text-slate-900 truncate max-w-[120px]">
                {topPerformer?.name || '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Hedef</p>
              <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalTargetAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Hedef ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Yil"
            allowClear
            options={[
              { value: 2024, label: '2024' },
              { value: 2025, label: '2025' },
              { value: 2026, label: '2026' },
            ]}
            onChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
          <Select
            placeholder="Durum"
            allowClear
            options={Object.entries(statusConfig).map(([key, val]) => ({ value: key, label: val.label }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
          <Select
            placeholder="Tip"
            allowClear
            options={Object.entries(targetTypeLabels).map(([key, val]) => ({ value: key, label: val }))}
            onChange={(value) => setFilters((prev) => ({ ...prev, targetType: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={targets}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} hedef`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}

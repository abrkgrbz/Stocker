'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Table, Select, Dropdown, Spin } from 'antd';
import {
  LightBulbIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  ArrowPathIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useOpportunities } from '@/features/sales';
import type { OpportunityQueryParams, OpportunityListDto } from '@/features/sales';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const stageLabels: Record<string, { label: string; color: string }> = {
  Lead: { label: 'Aday', color: 'bg-slate-200 text-slate-700' },
  Qualified: { label: 'Nitelikli', color: 'bg-amber-100 text-amber-800' },
  Proposal: { label: 'Teklif', color: 'bg-blue-100 text-blue-800' },
  Negotiation: { label: 'Muzakere', color: 'bg-purple-100 text-purple-800' },
  ClosedWon: { label: 'Kazanildi', color: 'bg-emerald-100 text-emerald-800' },
  ClosedLost: { label: 'Kaybedildi', color: 'bg-red-100 text-red-800' },
};

const sourceOptions = [
  { value: 'Website', label: 'Web Sitesi' },
  { value: 'Referral', label: 'Referans' },
  { value: 'ColdCall', label: 'Soguk Arama' },
  { value: 'Email', label: 'E-posta' },
  { value: 'SocialMedia', label: 'Sosyal Medya' },
  { value: 'Exhibition', label: 'Fuar' },
  { value: 'Partner', label: 'Partner' },
  { value: 'Other', label: 'Diger' },
];

const stageOptions = [
  { value: 'Lead', label: 'Aday' },
  { value: 'Qualified', label: 'Nitelikli' },
  { value: 'Proposal', label: 'Teklif' },
  { value: 'Negotiation', label: 'Muzakere' },
  { value: 'ClosedWon', label: 'Kazanildi' },
  { value: 'ClosedLost', label: 'Kaybedildi' },
];

function formatCurrency(value: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function OpportunitiesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<OpportunityQueryParams>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, refetch } = useOpportunities({
    page: currentPage,
    pageSize,
    ...filters,
    ...(debouncedSearch ? { customerId: debouncedSearch } : {}),
  });

  const opportunities = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const openCount = opportunities.filter(o => !o.isWon && !o.isLost).length;
  const wonCount = opportunities.filter(o => o.isWon).length;
  const lostCount = opportunities.filter(o => o.isLost).length;
  const totalValue = opportunities.reduce((sum, o) => sum + (o.estimatedValue || 0), 0);

  const getActionMenu = (record: OpportunityListDto): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeIcon className="w-4 h-4" />,
      label: 'Goruntule',
      onClick: () => router.push(`/sales/opportunities/${record.id}`),
    },
  ];

  const columns: ColumnsType<OpportunityListDto> = [
    {
      title: 'Baslik',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <Link
          href={`/sales/opportunities/${record.id}`}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Musteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => text || '-',
    },
    {
      title: 'Asama',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => {
        const config = stageLabels[stage] || { label: stage, color: 'bg-slate-100 text-slate-600' };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Deger',
      dataIndex: 'estimatedValue',
      key: 'estimatedValue',
      align: 'right',
      render: (value: number, record) => (
        <span className="font-medium text-slate-900">
          {formatCurrency(value, record.currency)}
        </span>
      ),
    },
    {
      title: 'Olasilik',
      dataIndex: 'probability',
      key: 'probability',
      align: 'center',
      render: (value: number) => (
        <span className="text-sm text-slate-600">{value}%</span>
      ),
    },
    {
      title: 'Tahmini Kapanis',
      dataIndex: 'expectedCloseDate',
      key: 'expectedCloseDate',
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY') : '-',
    },
    {
      title: 'Durum',
      key: 'status',
      render: (_, record) => {
        if (record.isWon) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Kazanildi
            </span>
          );
        }
        if (record.isLost) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              Kaybedildi
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Acik
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
            <LightBulbIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Firsatlar</h1>
            <p className="text-sm text-slate-500">Satis firsatlarinizi takip edin</p>
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
            href="/sales/opportunities/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Firsat
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <LightBulbIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam</p>
              <p className="text-xl font-semibold text-slate-900">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <FunnelIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Acik</p>
              <p className="text-xl font-semibold text-slate-900">{openCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Kazanilan</p>
              <p className="text-xl font-semibold text-slate-900">{wonCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Kaybedilen</p>
              <p className="text-xl font-semibold text-slate-900">{lostCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Deger</p>
              <p className="text-xl font-semibold text-slate-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Firsat ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Asama"
            allowClear
            options={stageOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, stage: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
          <Select
            placeholder="Kaynak"
            allowClear
            options={sourceOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, source: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
          <Select
            placeholder="Oncelik"
            allowClear
            options={[
              { value: 'Low', label: 'Dusuk' },
              { value: 'Medium', label: 'Orta' },
              { value: 'High', label: 'Yuksek' },
              { value: 'Critical', label: 'Kritik' },
            ]}
            onChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
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
            dataSource={opportunities}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} firsat`,
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

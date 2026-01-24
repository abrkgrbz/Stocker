'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Table, Select, Dropdown, Spin } from 'antd';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useSegments } from '@/features/sales';
import type { CustomerSegmentQueryParams, CustomerSegmentListDto } from '@/features/sales';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import Link from 'next/link';

const priorityConfig: Record<string, { label: string; color: string }> = {
  VeryHigh: { label: 'Platinum', color: 'bg-slate-900 text-white' },
  High: { label: 'Gold', color: 'bg-amber-100 text-amber-800' },
  Medium: { label: 'Silver', color: 'bg-slate-300 text-slate-800' },
  Low: { label: 'Bronze', color: 'bg-orange-100 text-orange-800' },
  VeryLow: { label: 'Standard', color: 'bg-slate-100 text-slate-600' },
};

const priorityOptions = [
  { value: 'VeryHigh', label: 'Platinum' },
  { value: 'High', label: 'Gold' },
  { value: 'Medium', label: 'Silver' },
  { value: 'Low', label: 'Bronze' },
  { value: 'VeryLow', label: 'Standard' },
];

export default function CustomerSegmentsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<CustomerSegmentQueryParams>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data, isLoading, refetch } = useSegments({
    page: currentPage,
    pageSize,
    ...filters,
  });

  const segments = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const activeCount = segments.filter(s => s.isActive).length;
  const defaultSegment = segments.find(s => s.isDefault);

  const getActionMenu = (record: CustomerSegmentListDto): MenuProps['items'] => [
    {
      key: 'view',
      icon: <EyeIcon className="w-4 h-4" />,
      label: 'Goruntule',
      onClick: () => router.push(`/sales/segments/${record.id}`),
    },
  ];

  const columns: ColumnsType<CustomerSegmentListDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record) => (
        <Link
          href={`/sales/segments/${record.id}`}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </Link>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const config = priorityConfig[priority] || { label: priority, color: 'bg-slate-100 text-slate-600' };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Musteri Sayisi',
      dataIndex: 'customerCount',
      key: 'customerCount',
      align: 'center',
      render: (count: number) => <span className="text-sm text-slate-700">{count}</span>,
    },
    {
      title: 'Varsayilan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      align: 'center',
      render: (isDefault: boolean) =>
        isDefault ? (
          <CheckIcon className="w-5 h-5 text-slate-900 mx-auto" />
        ) : null,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
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
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Musteri Segmentleri</h1>
            <p className="text-sm text-slate-500">Musteri gruplarinizi yonetin</p>
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
            href="/sales/segments/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Segment
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <UserGroupIcon className="w-5 h-5 text-slate-600" />
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
              <CheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Aktif</p>
              <p className="text-xl font-semibold text-slate-900">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Varsayilan</p>
              <p className="text-xl font-semibold text-slate-900">{defaultSegment?.name || '-'}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <XMarkIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pasif</p>
              <p className="text-xl font-semibold text-slate-900">{totalCount - activeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="Segment ara... (kod, ad)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Oncelik"
            allowClear
            options={priorityOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, priority: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
          <Select
            placeholder="Durum"
            allowClear
            options={[
              { value: true, label: 'Aktif' },
              { value: false, label: 'Pasif' },
            ]}
            onChange={(value) => setFilters((prev) => ({ ...prev, isActive: value }))}
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
            dataSource={segments}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} segment`,
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

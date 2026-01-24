'use client';

/**
 * Back Orders List Page
 * Bekleyen siparisleri yonetin - Monochrome Design System
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClockIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  InboxStackIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Table, Dropdown, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useBackOrders } from '@/features/sales';
import type { BackOrderListDto, BackOrderQueryParams } from '@/features/sales';

dayjs.locale('tr');

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Created: { label: 'Bekliyor', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  PartiallyFulfilled: { label: 'Kismi Karsilandi', bgColor: 'bg-slate-400', textColor: 'text-white' },
  Fulfilled: { label: 'Karsilandi', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Cancelled: { label: 'Iptal', bgColor: 'bg-slate-900', textColor: 'text-white' },
};

const priorityConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Low: { label: 'Dusuk', bgColor: 'bg-slate-100', textColor: 'text-slate-500' },
  Normal: { label: 'Normal', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  High: { label: 'Yuksek', bgColor: 'bg-slate-600', textColor: 'text-white' },
  Urgent: { label: 'Kritik', bgColor: 'bg-slate-900', textColor: 'text-white' },
};

export default function BackOrdersPage() {
  const router = useRouter();
  const [params, setParams] = useState<BackOrderQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useBackOrders(params);
  const backOrders = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const waitingCount = backOrders.filter((b) => b.status === 'Created').length;
  const partialCount = backOrders.filter((b) => b.status === 'PartiallyFulfilled').length;
  const criticalCount = backOrders.filter((b) => {
    const daysSinceOrder = dayjs().diff(dayjs(b.backOrderDate), 'day');
    return daysSinceOrder > 7 && b.status === 'Created';
  }).length;

  const columns: ColumnsType<BackOrderListDto> = [
    {
      title: 'Siparis No',
      dataIndex: 'backOrderNumber',
      key: 'backOrderNumber',
      width: 150,
      render: (number: string) => (
        <span className="font-mono text-sm font-medium text-slate-900">{number}</span>
      ),
    },
    {
      title: 'Musteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (name: string | undefined, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{name || '-'}</div>
          <div className="text-xs text-slate-500 font-mono">{record.salesOrderNumber}</div>
        </div>
      ),
    },
    {
      title: 'Tahmini Tedarik',
      dataIndex: 'estimatedRestockDate',
      key: 'estimatedRestockDate',
      width: 130,
      render: (date: string | undefined) => (
        date ? (
          <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
        ) : (
          <span className="text-sm text-slate-400">Belirsiz</span>
        )
      ),
    },
    {
      title: 'Kalem',
      dataIndex: 'totalItemCount',
      key: 'totalItemCount',
      width: 70,
      align: 'center',
      render: (count: number) => (
        <span className="text-sm text-slate-600">{count}</span>
      ),
    },
    {
      title: 'Bekleyen Miktar',
      dataIndex: 'totalPendingQuantity',
      key: 'totalPendingQuantity',
      width: 130,
      align: 'right',
      render: (qty: number) => (
        <span className="text-sm font-semibold text-slate-900">{qty}</span>
      ),
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const config = priorityConfig[priority] || priorityConfig.Normal;
        return (
          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.Created;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Bekleme',
      key: 'waitingDays',
      width: 90,
      align: 'center',
      render: (_, record) => {
        const days = dayjs().diff(dayjs(record.backOrderDate), 'day');
        return (
          <span className={`text-sm font-medium ${days > 7 ? 'text-slate-900' : 'text-slate-500'}`}>
            {days} gun
          </span>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => router.push(`/sales/backorders/${record.id}`),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Bekleyen Siparisler</h1>
              <p className="text-sm text-slate-500">Stokta olmayan siparisleri takip edin</p>
            </div>
          </div>
          <Link
            href="/sales/backorders/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Kayit
          </Link>
        </div>

        {/* Critical Alert */}
        {criticalCount > 0 && (
          <div className="bg-slate-900 text-white rounded-xl p-4 mb-6 flex items-center gap-3">
            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              {criticalCount} kritik bekleyen siparis var! (7 gunden fazla bekliyor)
            </p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InboxStackIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Toplam</p>
                <p className="text-xl font-bold text-slate-900">{totalCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Bekliyor</p>
                <p className="text-xl font-bold text-slate-900">{waitingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Kismi Hazir</p>
                <p className="text-xl font-bold text-slate-900">{partialCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Kritik (&gt;7 gun)</p>
                <p className="text-xl font-bold text-slate-900">{criticalCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Siparis no veya musteri ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            <Select
              placeholder="Durum"
              allowClear
              className="min-w-[150px]"
              onChange={(value) => setParams((prev) => ({ ...prev, status: value, page: 1 }))}
              options={[
                { value: 'Created', label: 'Bekliyor' },
                { value: 'PartiallyFulfilled', label: 'Kismi Karsilandi' },
                { value: 'Fulfilled', label: 'Karsilandi' },
                { value: 'Cancelled', label: 'Iptal' },
              ]}
            />
            <Select
              placeholder="Oncelik"
              allowClear
              className="min-w-[130px]"
              onChange={(value) => setParams((prev) => ({ ...prev, priority: value, page: 1 }))}
              options={[
                { value: 'Low', label: 'Dusuk' },
                { value: 'Normal', label: 'Normal' },
                { value: 'High', label: 'Yuksek' },
                { value: 'Urgent', label: 'Kritik' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <Table
            className="enterprise-table"
            columns={columns}
            dataSource={backOrders}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: params.page,
              pageSize: params.pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayit`,
              onChange: (page, pageSize) => setParams((prev) => ({ ...prev, page, pageSize })),
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/sales/backorders/${record.id}`),
              className: 'cursor-pointer hover:bg-slate-50',
            })}
          />
        </div>
      </div>
    </div>
  );
}

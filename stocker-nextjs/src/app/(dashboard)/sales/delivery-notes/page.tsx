'use client';

/**
 * Delivery Notes List Page
 * Irsaliyeleri yonetin - Monochrome Design System
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DocumentTextIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  PaperAirplaneIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Table, Dropdown, Select, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';
import { useDeliveryNotes } from '@/features/sales';
import type { DeliveryNoteListDto, DeliveryNoteQueryParams } from '@/features/sales';

dayjs.locale('tr');

const { RangePicker } = DatePicker;

const statusConfig: Record<string, { label: string; bgColor: string; textColor: string }> = {
  Draft: { label: 'Taslak', bgColor: 'bg-slate-100', textColor: 'text-slate-600' },
  Dispatched: { label: 'Sevk Edildi', bgColor: 'bg-slate-300', textColor: 'text-slate-800' },
  InTransit: { label: 'Yolda', bgColor: 'bg-slate-500', textColor: 'text-white' },
  Delivered: { label: 'Teslim Edildi', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Cancelled: { label: 'Iptal', bgColor: 'bg-slate-900', textColor: 'text-white' },
};

const typeLabels: Record<string, string> = {
  Sales: 'Satis',
  Return: 'Iade',
  Transfer: 'Transfer',
  Sample: 'Numune',
  Other: 'Diger',
};

export default function DeliveryNotesPage() {
  const router = useRouter();
  const [params, setParams] = useState<DeliveryNoteQueryParams>({
    page: 1,
    pageSize: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useDeliveryNotes(params);
  const deliveryNotes = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const dispatchedCount = deliveryNotes.filter((d) => d.status === 'Dispatched').length;
  const inTransitCount = deliveryNotes.filter((d) => d.status === 'InTransit').length;
  const deliveredCount = deliveryNotes.filter((d) => d.status === 'Delivered' || d.isDelivered).length;

  const columns: ColumnsType<DeliveryNoteListDto> = [
    {
      title: 'Irsaliye No',
      dataIndex: 'deliveryNoteNumber',
      key: 'deliveryNoteNumber',
      width: 160,
      render: (number: string) => (
        <span className="font-mono text-sm font-medium text-slate-900">{number}</span>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'deliveryNoteDate',
      key: 'deliveryNoteDate',
      width: 120,
      render: (date: string) => (
        <span className="text-sm text-slate-600">{dayjs(date).format('DD.MM.YYYY')}</span>
      ),
    },
    {
      title: 'Alici',
      dataIndex: 'receiverName',
      key: 'receiverName',
      render: (name: string) => (
        <span className="text-sm font-medium text-slate-900">{name}</span>
      ),
    },
    {
      title: 'Siparis No',
      dataIndex: 'salesOrderNumber',
      key: 'salesOrderNumber',
      width: 150,
      render: (orderNumber: string | undefined) => (
        orderNumber ? (
          <span className="text-sm text-slate-600 font-mono">{orderNumber}</span>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'deliveryNoteType',
      key: 'deliveryNoteType',
      width: 100,
      render: (type: string) => (
        <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {typeLabels[type] || type}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => {
        const config = statusConfig[status] || statusConfig.Draft;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Kalem',
      dataIndex: 'totalLineCount',
      key: 'totalLineCount',
      width: 70,
      align: 'center',
      render: (count: number) => (
        <span className="text-sm text-slate-600">{count}</span>
      ),
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
                onClick: () => router.push(`/sales/delivery-notes/${record.id}`),
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
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Irsaliyeler</h1>
              <p className="text-sm text-slate-500">Sevkiyat irsaliyelerini yonetin</p>
            </div>
          </div>
          <Link
            href="/sales/delivery-notes/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Irsaliye
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <DocumentTextIcon className="w-5 h-5 text-slate-600" />
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
                <PaperAirplaneIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Sevk Edildi</p>
                <p className="text-xl font-bold text-slate-900">{dispatchedCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TruckIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Yolda</p>
                <p className="text-xl font-bold text-slate-900">{inTransitCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Teslim Edildi</p>
                <p className="text-xl font-bold text-slate-900">{deliveredCount}</p>
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
                placeholder="Irsaliye no, alici veya siparis no ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
            <Select
              placeholder="Durum"
              allowClear
              className="min-w-[140px]"
              onChange={(value) => setParams((prev) => ({ ...prev, status: value, page: 1 }))}
              options={[
                { value: 'Draft', label: 'Taslak' },
                { value: 'Dispatched', label: 'Sevk Edildi' },
                { value: 'InTransit', label: 'Yolda' },
                { value: 'Delivered', label: 'Teslim Edildi' },
                { value: 'Cancelled', label: 'Iptal' },
              ]}
            />
            <Select
              placeholder="Tip"
              allowClear
              className="min-w-[120px]"
              onChange={(value) => setParams((prev) => ({ ...prev, deliveryNoteType: value, page: 1 }))}
              options={[
                { value: 'Sales', label: 'Satis' },
                { value: 'Return', label: 'Iade' },
                { value: 'Transfer', label: 'Transfer' },
                { value: 'Sample', label: 'Numune' },
              ]}
            />
            <RangePicker
              placeholder={['Baslangic', 'Bitis']}
              format="DD.MM.YYYY"
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setParams((prev) => ({
                    ...prev,
                    fromDate: dates[0]!.format('YYYY-MM-DD'),
                    toDate: dates[1]!.format('YYYY-MM-DD'),
                    page: 1,
                  }));
                } else {
                  setParams((prev) => ({ ...prev, fromDate: undefined, toDate: undefined, page: 1 }));
                }
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <Table
            className="enterprise-table"
            columns={columns}
            dataSource={deliveryNotes}
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
              onClick: () => router.push(`/sales/delivery-notes/${record.id}`),
              className: 'cursor-pointer hover:bg-slate-50',
            })}
          />
        </div>
      </div>
    </div>
  );
}

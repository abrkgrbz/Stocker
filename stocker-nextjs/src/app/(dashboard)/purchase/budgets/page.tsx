'use client';

import React, { useState } from 'react';
import { Table, Input, Select, Dropdown, Modal, Spin } from 'antd';
import {
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import { usePurchaseBudgets, useDeletePurchaseBudget } from '@/lib/api/hooks/usePurchase';
import type { PurchaseBudgetListDto, PurchaseBudgetStatus } from '@/lib/api/services/purchase.types';

const statusConfig: Record<PurchaseBudgetStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  PendingApproval: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aktif' },
  Frozen: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Donduruldu' },
  Exhausted: { bg: 'bg-red-100', text: 'text-red-700', label: 'Tükendi' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatıldı' },
  Rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Reddedildi' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal Edildi' },
};

export default function PurchaseBudgetsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseBudgetStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePurchaseBudgets({
    page: currentPage,
    pageSize,
    search: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeletePurchaseBudget();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Bütçe Silinecek',
      content: 'Bu bütçeyi silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const columns: ColumnsType<PurchaseBudgetListDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text, record) => (
        <button
          onClick={() => router.push(`/purchase/budgets/${record.id}`)}
          className="text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Bütçe Adı',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => <span className="text-sm font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: PurchaseBudgetStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Toplam Bütçe',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 150,
      align: 'right',
      render: (amount, record) => (
        <span className="text-sm font-semibold text-slate-900">
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Kullanım',
      key: 'usage',
      width: 180,
      render: (_, record) => {
        const usedPercent = record.totalAmount > 0
          ? (record.usedAmount / record.totalAmount) * 100
          : 0;
        const barColor = usedPercent > 90 ? 'bg-red-500' : usedPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500';
        return (
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">{usedPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${barColor} rounded-full transition-all`}
                style={{ width: `${Math.min(usedPercent, 100)}%` }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {record.usedAmount.toLocaleString('tr-TR')} / {record.totalAmount.toLocaleString('tr-TR')}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Kalan',
      dataIndex: 'remainingAmount',
      key: 'remainingAmount',
      width: 130,
      align: 'right',
      render: (amount, record) => (
        <span className={`text-sm font-medium ${amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {record.currency}
        </span>
      ),
    },
    {
      title: 'Dönem',
      key: 'period',
      width: 160,
      render: (_, record) => (
        <div>
          <div className="text-sm text-slate-900">{new Date(record.periodStart).toLocaleDateString('tr-TR')}</div>
          <div className="text-xs text-slate-500">{new Date(record.periodEnd).toLocaleDateString('tr-TR')}</div>
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Görüntüle',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => router.push(`/purchase/budgets/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                disabled: record.status !== 'Draft',
                onClick: () => router.push(`/purchase/budgets/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                disabled: record.status !== 'Draft',
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-1 hover:bg-slate-100 rounded transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5 text-slate-400" />
          </button>
        </Dropdown>
      ),
    },
  ];

  // Calculate total stats
  const totalBudget = data?.items?.reduce((sum, item) => sum + item.totalAmount, 0) || 0;
  const totalUsed = data?.items?.reduce((sum, item) => sum + item.usedAmount, 0) || 0;
  const totalRemaining = data?.items?.reduce((sum, item) => sum + item.remainingAmount, 0) || 0;
  const activeBudgets = data?.items?.filter(i => i.status === 'Active').length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Satın Alma Bütçeleri</h1>
              <p className="text-sm text-slate-500 mt-1">Departman ve kategori bazlı bütçeleri yönetin</p>
            </div>
            <Link href="/purchase/budgets/new">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                <PlusIcon className="w-4 h-4" />
                Yeni Bütçe
              </button>
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/purchase/budgets?status=Active">
            <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <WalletIcon className="w-4 h-4 text-slate-500" />
                </div>
                <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </div>
              <div className="text-2xl font-semibold text-slate-900 mb-1">
                {totalBudget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
              </div>
              <div className="text-sm text-slate-500">Toplam Bütçe</div>
            </div>
          </Link>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kullanılan</span>
            </div>
            <div className="text-2xl font-semibold text-slate-900">
              {totalUsed.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
            </div>
            <div className="text-sm text-slate-500">Harcanan Tutar</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kalan</span>
            </div>
            <div className="text-2xl font-semibold text-emerald-600">
              {totalRemaining.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
            </div>
            <div className="text-sm text-slate-500">Kullanılabilir</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aktif</span>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{activeBudgets}</div>
            <div className="text-sm text-slate-500">Aktif Bütçe</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Kod veya ad ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="Durum"
              className="w-40"
              allowClear
              value={statusFilter}
              onChange={setStatusFilter}
              options={Object.entries(statusConfig).map(([key, value]) => ({
                value: key,
                label: value.label,
              }))}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <Table
            columns={columns}
            dataSource={data?.items || []}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize,
              total: data?.totalCount || 0,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayıt`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            scroll={{ x: 1100 }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wide"
          />
        </div>
      </div>
    </div>
  );
}

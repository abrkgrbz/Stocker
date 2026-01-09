'use client';

import React, { useState } from 'react';
import { Table, Input, Select, Dropdown, Modal, Spin, Button, Tooltip } from 'antd';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
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
  PendingApproval: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Onaylandı' },
  Active: { bg: 'bg-slate-900', text: 'text-white', label: 'Aktif' },
  Frozen: { bg: 'bg-slate-400', text: 'text-white', label: 'Donduruldu' },
  Exhausted: { bg: 'bg-slate-700', text: 'text-white', label: 'Tükendi' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Kapatıldı' },
  Rejected: { bg: 'bg-slate-600', text: 'text-white', label: 'Reddedildi' },
  Cancelled: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'İptal Edildi' },
};

export default function PurchaseBudgetsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PurchaseBudgetStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, refetch } = usePurchaseBudgets({
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
      okButtonProps: { className: '!bg-red-600 hover:!bg-red-700 !border-red-600' },
      cancelButtonProps: { className: '!border-slate-300 !text-slate-600' },
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
        const barColor = usedPercent > 90 ? 'bg-slate-900' : usedPercent > 70 ? 'bg-slate-600' : 'bg-slate-400';
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
        <span className={`text-sm font-medium ${amount > 0 ? 'text-slate-900' : 'text-slate-500'}`}>
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
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-4 h-4" />
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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <WalletIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Satın Alma Bütçeleri</h1>
              <p className="text-sm text-slate-500">Departman ve kategori bazlı bütçeleri yönetin</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip title="Dışa Aktar">
              <Button
                icon={<ArrowDownTrayIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
              />
            </Tooltip>
            <Tooltip title="Yenile">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={() => refetch()}
                loading={isLoading}
              />
            </Tooltip>
            <Link href="/purchase/budgets/new">
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Yeni Bütçe
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Bütçe</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalBudget.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Kullanılan</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalUsed.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Kalan</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {totalRemaining.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Aktif</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{activeBudgets}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <WalletIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
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
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={data?.items || []}
            rowKey="id"
            loading={isLoading}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
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
          />
        </div>
      </Spin>
    </div>
  );
}

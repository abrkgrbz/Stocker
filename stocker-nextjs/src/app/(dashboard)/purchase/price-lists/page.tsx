'use client';

import React, { useState } from 'react';
import { Table, Input, Select, Dropdown, Modal, Spin, Switch } from 'antd';
import {
  BuildingStorefrontIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ColumnsType } from 'antd/es/table';
import {
  usePriceLists,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
} from '@/lib/api/hooks/usePurchase';
import type { PriceListListDto, PriceListStatus } from '@/lib/api/services/purchase.types';

const statusConfig: Record<PriceListStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  PendingApproval: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-slate-300', text: 'text-slate-800', label: 'Onaylandı' },
  Active: { bg: 'bg-slate-800', text: 'text-white', label: 'Aktif' },
  Inactive: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Pasif' },
  Expired: { bg: 'bg-slate-400', text: 'text-white', label: 'Süresi Doldu' },
  Superseded: { bg: 'bg-slate-200', text: 'text-slate-600', label: 'Yenilendi' },
  Rejected: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Reddedildi' },
};

export default function PriceListsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<PriceListStatus | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = usePriceLists({
    page: currentPage,
    pageSize,
    search: searchText || undefined,
    status: statusFilter,
  });

  const deleteMutation = useDeletePriceList();
  const activateMutation = useActivatePriceList();
  const deactivateMutation = useDeactivatePriceList();

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Fiyat Listesi Silinecek',
      content: 'Bu fiyat listesini silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: () => deleteMutation.mutateAsync(id),
    });
  };

  const handleToggleStatus = (id: string, isActive: boolean) => {
    if (isActive) {
      deactivateMutation.mutate(id);
    } else {
      activateMutation.mutate(id);
    }
  };

  const columns: ColumnsType<PriceListListDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text, record) => (
        <button
          onClick={() => router.push(`/purchase/price-lists/${record.id}`)}
          className="text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Liste Adı',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text}</div>
          {record.isDefault && (
            <span className="text-xs text-slate-500">Varsayılan</span>
          )}
        </div>
      ),
    },
    {
      title: 'Tedarikçi',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 180,
      render: (text) => text ? (
        <div className="flex items-center gap-2">
          <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-600">{text}</span>
        </div>
      ) : (
        <span className="text-sm text-slate-400">-</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: PriceListStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Para Birimi',
      dataIndex: 'currency',
      key: 'currency',
      width: 100,
      align: 'center',
      render: (text) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'itemCount',
      key: 'itemCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700">
          {count} ürün
        </span>
      ),
    },
    {
      title: 'Geçerlilik',
      key: 'validity',
      width: 180,
      render: (_, record) => (
        <div className="text-sm">
          <div className="text-slate-600">
            {record.effectiveFrom ? new Date(record.effectiveFrom).toLocaleDateString('tr-TR') : '-'}
          </div>
          <div className="text-xs text-slate-400">
            {record.effectiveTo ? new Date(record.effectiveTo).toLocaleDateString('tr-TR') : 'Süresiz'}
          </div>
        </div>
      ),
    },
    {
      title: 'Aktif',
      key: 'active',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Switch
          checked={record.status === 'Active'}
          onChange={() => handleToggleStatus(record.id, record.status === 'Active')}
          loading={activateMutation.isPending || deactivateMutation.isPending}
          disabled={record.status === 'Expired'}
          size="small"
        />
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
                onClick: () => router.push(`/purchase/price-lists/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                disabled: record.status !== 'Draft' && record.status !== 'Inactive',
                onClick: () => router.push(`/purchase/price-lists/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </Dropdown>
      ),
    },
  ];

  const stats = {
    total: data?.totalCount || 0,
    active: data?.items?.filter(i => i.status === 'Active').length || 0,
    inactive: data?.items?.filter(i => i.status === 'Inactive').length || 0,
    expired: data?.items?.filter(i => i.status === 'Expired').length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <CurrencyDollarIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Fiyat Listeleri</h1>
            <p className="text-sm text-slate-500">Tedarikçi fiyat listelerini yönetin</p>
          </div>
        </div>
        <Link href="/purchase/price-lists/new">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
            <PlusIcon className="w-4 h-4" />
            Yeni Fiyat Listesi
          </button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Liste</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
              <CheckCircleIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Liste</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.inactive}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Pasif Liste</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
              <ClockIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.expired}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Süresi Dolmuş</div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            placeholder="Kod veya ad ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-72"
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
          scroll={{ x: 1200 }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

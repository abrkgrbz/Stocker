'use client';

/**
 * Fixed Assets (Duran Varlıklar) List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Dropdown, Modal, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  PlusIcon,
  ArrowPathIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useFixedAssets, useDeleteFixedAsset, useRunDepreciation } from '@/lib/api/hooks/useFinance';
import type { FixedAssetDto, FixedAssetFilterDto } from '@/lib/api/services/finance.types';
import { showSuccess, showApiError } from '@/lib/utils/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Table styles for monochrome design
const tableClassName = "[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50";

// Status configuration
const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  Active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aktif' },
  Disposed: { bg: 'bg-slate-300', text: 'text-slate-700', label: 'Elden Çıkarıldı' },
  Sold: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Satıldı' },
  Scrapped: { bg: 'bg-red-100', text: 'text-red-700', label: 'Hurda' },
  UnderMaintenance: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Bakımda' },
};

// Depreciation method configuration
const methodConfig: Record<string, { label: string }> = {
  StraightLine: { label: 'Doğrusal' },
  DecliningBalance: { label: 'Azalan Bakiye' },
  DoubleDeclining: { label: 'Çift Azalan' },
  SumOfYears: { label: 'Yıl Toplamı' },
  Units: { label: 'Birim Bazlı' },
};

export default function FixedAssetsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState<string | undefined>(undefined);

  // Mutations
  const deleteAsset = useDeleteFixedAsset();
  const runDepreciation = useRunDepreciation();

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Build filter
  const filters: FixedAssetFilterDto = {
    pageNumber: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    status: status as any,
  };

  // Fetch fixed assets from API
  const { data, isLoading, error, refetch } = useFixedAssets(filters);

  const assets = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Calculate stats
  const stats = {
    total: totalCount,
    active: assets.filter((a) => a.status === 'Active').length,
    totalValue: assets.reduce((sum, a) => sum + (a.acquisitionCost || 0), 0),
    totalDepreciation: assets.reduce((sum, a) => sum + (a.accumulatedDepreciation || 0), 0),
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount);
  };

  const handleDelete = async (assetId: number) => {
    try {
      await deleteAsset.mutateAsync(assetId);
      showSuccess('Varlık başarıyla silindi!');
    } catch (err) {
      showApiError(err, 'Varlık silinirken bir hata oluştu');
      throw err;
    }
  };

  const handleRunDepreciation = async () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    Modal.confirm({
      title: 'Amortisman Hesapla',
      content: `${month}/${year} dönemi için tüm aktif varlıkların amortismanı hesaplanacak. Devam etmek istiyor musunuz?`,
      okText: 'Hesapla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await runDepreciation.mutateAsync({ month, year });
          showSuccess('Amortisman hesaplandı!');
        } catch (err) {
          showApiError(err, 'Amortisman hesaplanırken bir hata oluştu');
        }
      },
    });
  };

  const handleDeleteClick = (asset: FixedAssetDto) => {
    Modal.confirm({
      title: 'Varlığı Sil',
      content: `${asset.assetName} varlığı silinecek. Bu işlem geri alınamaz.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        await handleDelete(asset.id);
      },
    });
  };

  const handleCreate = () => {
    router.push('/finance/fixed-assets/new');
  };

  const handleView = (assetId: number) => {
    router.push(`/finance/fixed-assets/${assetId}`);
  };

  const statusOptions = [
    { value: '', label: 'Tüm Durumlar' },
    { value: 'Active', label: 'Aktif' },
    { value: 'Disposed', label: 'Elden Çıkarıldı' },
    { value: 'Sold', label: 'Satıldı' },
    { value: 'Scrapped', label: 'Hurda' },
    { value: 'UnderMaintenance', label: 'Bakımda' },
  ];

  const columns: ColumnsType<FixedAssetDto> = [
    {
      title: 'Varlık',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">{record.assetCode || ''}</div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => (
        <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700">
          {text || '-'}
        </span>
      ),
    },
    {
      title: 'Edinme Bedeli',
      dataIndex: 'acquisitionCost',
      key: 'acquisitionCost',
      align: 'right',
      render: (cost, record) => (
        <span className="text-sm font-medium text-slate-900">
          {formatCurrency(cost || 0, record.currency || 'TRY')}
        </span>
      ),
    },
    {
      title: 'Birikmiş Amort.',
      dataIndex: 'accumulatedDepreciation',
      key: 'accumulatedDepreciation',
      align: 'right',
      render: (amount, record) => (
        <span className="text-sm text-slate-600">
          {formatCurrency(amount || 0, record.currency || 'TRY')}
        </span>
      ),
    },
    {
      title: 'Net Değer',
      key: 'netValue',
      align: 'right',
      render: (_, record) => {
        const netValue = (record.acquisitionCost || 0) - (record.accumulatedDepreciation || 0);
        return (
          <span className="text-sm font-semibold text-slate-900">
            {formatCurrency(netValue, record.currency || 'TRY')}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = statusConfig[status] || statusConfig.Active;
        return (
          <span className={`px-2.5 py-1 text-xs font-medium rounded-md ${config.bg} ${config.text}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDeleteClick(record),
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

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <BuildingOfficeIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Duran Varlıklar</h1>
              <p className="text-sm text-slate-500">Sabit kıymet ve amortismanları yönetin</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon={<ChartBarIcon className="w-4 h-4" />}
                onClick={handleRunDepreciation}
                loading={runDepreciation.isPending}
                className="!border-blue-300 !text-blue-700 hover:!border-blue-400 !bg-blue-50"
              >
                Amortisman Hesapla
              </Button>
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                onClick={() => refetch()}
                loading={isLoading}
                className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
              >
                Yenile
              </Button>
              <Button
                type="primary"
                icon={<PlusIcon className="w-4 h-4" />}
                onClick={handleCreate}
                className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              >
                Varlık Ekle
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <BuildingOfficeIcon className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Varlık</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalValue)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Değer</div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
              <ChartBarIcon className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(stats.totalDepreciation)}</div>
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Birikmiş Amort.</div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-slate-300 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
              <XCircleIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Varlıklar yüklenemedi</h3>
              <p className="text-xs text-slate-500">
                {error instanceof Error ? error.message : 'Varlıklar getirilirken bir hata oluştu.'}
              </p>
            </div>
            <Button
              size="small"
              onClick={() => refetch()}
              className="!border-slate-300 !text-slate-600"
            >
              Tekrar Dene
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Varlık ara... (ad, kod)"
              prefix={<MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              size="large"
              className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
            />
          </div>
          <Select
            value={status || undefined}
            onChange={(value) => setStatus(value || undefined)}
            options={statusOptions}
            placeholder="Durum"
            allowClear
            size="large"
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
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
            dataSource={assets}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} varlık`,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onRow={(record) => ({
              onClick: () => handleView(record.id),
              className: 'cursor-pointer',
            })}
            className={tableClassName}
          />
        )}
      </div>
    </div>
  );
}

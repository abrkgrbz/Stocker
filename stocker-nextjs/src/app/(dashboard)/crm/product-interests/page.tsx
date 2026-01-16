'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Input, Select, Tooltip, Spin, Empty } from 'antd';
import {
  ArrowPathIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { ProductInterestDto } from '@/lib/api/services/crm.types';
import { InterestStatus, InterestLevel } from '@/lib/api/services/crm.types';
import { useProductInterests, useDeleteProductInterest } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

const interestLevelLabels: Record<InterestLevel, { label: string; color: string }> = {
  [InterestLevel.Low]: { label: 'Dusuk', color: 'bg-slate-100 text-slate-600' },
  [InterestLevel.Medium]: { label: 'Orta', color: 'bg-blue-100 text-blue-600' },
  [InterestLevel.High]: { label: 'Yuksek', color: 'bg-amber-100 text-amber-600' },
  [InterestLevel.VeryHigh]: { label: 'Cok Yuksek', color: 'bg-emerald-100 text-emerald-600' },
};

const interestStatusLabels: Record<InterestStatus, { label: string; color: string }> = {
  [InterestStatus.New]: { label: 'Yeni', color: 'bg-blue-100 text-blue-600' },
  [InterestStatus.Active]: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-600' },
  [InterestStatus.Followed]: { label: 'Takip', color: 'bg-amber-100 text-amber-600' },
  [InterestStatus.Purchased]: { label: 'Satin Alindi', color: 'bg-slate-900 text-white' },
  [InterestStatus.Lost]: { label: 'Kaybedildi', color: 'bg-red-100 text-red-600' },
};

export default function ProductInterestsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<InterestStatus | undefined>();
  const [levelFilter, setLevelFilter] = useState<InterestLevel | undefined>();

  // API Hooks
  const { data, isLoading, refetch } = useProductInterests({
    status: statusFilter,
    level: levelFilter,
    page: currentPage,
    pageSize,
  });
  const deleteInterest = useDeleteProductInterest();

  const interests = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Stats calculations
  const totalInterests = interests.length;
  const activeInterests = interests.filter((i) => i.status === InterestStatus.Active).length;
  const purchasedInterests = interests.filter((i) => i.status === InterestStatus.Purchased).length;
  const totalBudget = interests.reduce((sum, i) => sum + (i.budget || 0), 0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/product-interests/new');
  };

  const handleView = (interest: ProductInterestDto) => {
    router.push(`/crm/product-interests/${interest.id}`);
  };

  const handleEdit = (interest: ProductInterestDto) => {
    router.push(`/crm/product-interests/${interest.id}/edit`);
  };

  const handleDelete = async (id: string, interest: ProductInterestDto) => {
    const confirmed = await confirmDelete(
      'Urun Ilgisi',
      interest.productName
    );

    if (confirmed) {
      try {
        await deleteInterest.mutateAsync(id);
        showDeleteSuccess('urun ilgisi');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  const columns: ColumnsType<ProductInterestDto> = [
    {
      title: 'Urun',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record) => (
        <div>
          <span className="font-medium text-slate-900">{text}</span>
          <div className="text-xs text-slate-500">ID: {record.productId}</div>
        </div>
      ),
    },
    {
      title: 'Musteri/Lead',
      key: 'customerOrLead',
      render: (_: unknown, record: ProductInterestDto) => (
        <span className="text-slate-700">
          {record.customerName || record.leadName || '-'}
        </span>
      ),
    },
    {
      title: 'Ilgi Seviyesi',
      dataIndex: 'interestLevel',
      key: 'interestLevel',
      width: 120,
      render: (level: InterestLevel) => {
        const info = interestLevelLabels[level];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info?.color || 'bg-slate-100 text-slate-600'}`}>
            {info?.label || level}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: InterestStatus) => {
        const info = interestStatusLabels[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${info?.color || 'bg-slate-100 text-slate-600'}`}>
            {info?.label || status}
          </span>
        );
      },
    },
    {
      title: 'Miktar',
      key: 'quantity',
      width: 100,
      render: (_: unknown, record: ProductInterestDto) => (
        <span className="text-slate-700">
          {record.quantity ? `${record.quantity} ${record.unit || ''}` : '-'}
        </span>
      ),
    },
    {
      title: 'Butce',
      dataIndex: 'budget',
      key: 'budget',
      width: 120,
      render: (value: number) => (
        <span className="text-slate-700 font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: ProductInterestDto) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Goruntule">
            <Button
              type="text"
              size="small"
              icon={<EyeIcon className="w-4 h-4" />}
              onClick={() => handleView(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Tooltip title="Duzenle">
            <Button
              type="text"
              size="small"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => handleEdit(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleDelete(record.id, record)}
            className="!text-red-500 hover:!text-red-600"
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShoppingBagIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Urun Ilgileri</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Musteri ve lead urun ilgilerini takip edin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              disabled={isLoading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Yenile
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleCreate}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Yeni Ilgi
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ShoppingBagIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Ilgi</p>
              <p className="text-2xl font-bold text-slate-900">{totalInterests}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Aktif</p>
              <p className="text-2xl font-bold text-slate-900">{activeInterests}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Satin Alinan</p>
              <p className="text-2xl font-bold text-slate-900">{purchasedInterests}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Butce</p>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalBudget)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Urun ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="Ilgi Seviyesi"
              value={levelFilter}
              onChange={setLevelFilter}
              className="w-40"
              allowClear
              options={Object.entries(interestLevelLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
            <Select
              placeholder="Durum"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-40"
              allowClear
              options={Object.entries(interestStatusLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={interests}
            rowKey="id"
            loading={deleteInterest.isPending}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayit`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <ShoppingBagIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Henuz urun ilgisi bulunmuyor
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Musteri veya lead urun ilgilerini kaydedin
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Ilgiyi Olustur
                      </Button>
                    </div>
                  }
                />
              ),
            }}
          />
        </div>
      </Spin>
    </div>
  );
}

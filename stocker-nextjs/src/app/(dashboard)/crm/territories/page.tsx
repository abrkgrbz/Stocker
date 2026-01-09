'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Tag, Input, Select, Tooltip, Spin } from 'antd';
import {
  ArrowPathIcon,
  EyeIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { TerritoryDto } from '@/lib/api/services/crm.types';
import { TerritoryType } from '@/lib/api/services/crm.types';
import { useTerritories, useDeleteTerritory } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

const typeLabels: Record<TerritoryType, { label: string }> = {
  [TerritoryType.Country]: { label: 'Ulke' },
  [TerritoryType.Region]: { label: 'Bolge' },
  [TerritoryType.City]: { label: 'Sehir' },
  [TerritoryType.District]: { label: 'Ilce' },
  [TerritoryType.PostalCode]: { label: 'Posta Kodu' },
  [TerritoryType.Custom]: { label: 'Ozel' },
  [TerritoryType.Industry]: { label: 'Sektor' },
  [TerritoryType.CustomerSegment]: { label: 'Musteri Segmenti' },
};

export default function TerritoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [typeFilter, setTypeFilter] = useState<TerritoryType | undefined>();
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>(true);

  // API Hooks
  const { data, isLoading, refetch } = useTerritories({
    page: currentPage,
    pageSize,
    territoryType: typeFilter,
    isActive: activeFilter,
  });
  const deleteTerritory = useDeleteTerritory();

  const territories = data || [];
  const totalCount = territories.length;

  // Stats calculations
  const totalTerritories = territories.length;
  const activeTerritories = territories.filter(t => t.isActive).length;
  const totalCustomers = territories.reduce((sum, t) => sum + (t.customerCount || 0), 0);
  const territoriesWithReps = territories.filter(t => (t as any).assignedToId).length;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/territories/new');
  };

  const handleView = (territory: TerritoryDto) => {
    router.push(`/crm/territories/${territory.id}`);
  };

  const handleEdit = (territory: TerritoryDto) => {
    router.push(`/crm/territories/${territory.id}/edit`);
  };

  const handleDelete = async (id: string, territory: TerritoryDto) => {
    const confirmed = await confirmDelete(
      'Bolge',
      territory.name
    );

    if (confirmed) {
      try {
        await deleteTerritory.mutateAsync(id);
        showDeleteSuccess('bolge');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const columns: ColumnsType<TerritoryDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (text: string) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">{text}</span>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'territoryType',
      key: 'territoryType',
      width: 130,
      render: (type: TerritoryType) => {
        const info = typeLabels[type];
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {info?.label || type}
          </span>
        );
      },
    },
    {
      title: 'Konum',
      key: 'location',
      render: (_: unknown, record: TerritoryDto) => {
        const parts = [record.city, record.region, record.country].filter(Boolean);
        return <span className="text-slate-600">{parts.join(', ') || '-'}</span>;
      },
    },
    {
      title: 'Satis Hedefi',
      dataIndex: 'salesTarget',
      key: 'salesTarget',
      width: 140,
      render: (value: number) => <span className="text-slate-900 font-medium">{formatCurrency(value)}</span>,
    },
    {
      title: 'Musteri',
      dataIndex: 'customerCount',
      key: 'customerCount',
      width: 90,
      align: 'center',
      render: (count: number) => (
        <div className="flex items-center justify-center gap-1">
          <UserIcon className="w-4 h-4 text-slate-400" />
          <span className="text-slate-900">{count || 0}</span>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
        }`}>
          {isActive ? (
            <CheckCircleIcon className="w-3.5 h-3.5" />
          ) : (
            <XCircleIcon className="w-3.5 h-3.5" />
          )}
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 180,
      render: (_: unknown, record: TerritoryDto) => (
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
                <GlobeAltIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Bolgeler</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Satis bolgelerini yonetin ve ekip performansini takip edin
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
              Yeni Bolge
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <GlobeAltIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Bolge</p>
              <p className="text-2xl font-bold text-slate-900">{totalTerritories}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircleIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Aktif</p>
              <p className="text-2xl font-bold text-slate-900">{activeTerritories}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Atanan Musteri</p>
              <p className="text-2xl font-bold text-slate-900">{totalCustomers.toLocaleString('tr-TR')}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Atanan Temsilci</p>
              <p className="text-2xl font-bold text-slate-900">{territoriesWithReps}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Bolge ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Tip"
              value={typeFilter}
              onChange={setTypeFilter}
              style={{ width: 150 }}
              allowClear
              options={Object.entries(typeLabels).map(([key, val]) => ({
                value: key,
                label: val.label,
              }))}
            />
            <Select
              placeholder="Durum"
              value={activeFilter}
              onChange={setActiveFilter}
              style={{ width: 120 }}
              allowClear
              options={[
                { value: true, label: 'Aktif' },
                { value: false, label: 'Pasif' },
              ]}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={territories}
            rowKey="id"
            loading={deleteTerritory.isPending}
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
          />
        </div>
      </Spin>
    </div>
  );
}

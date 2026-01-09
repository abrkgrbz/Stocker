'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Table, Select, Modal, Dropdown, Spin } from 'antd';
import {
  ArrowPathIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useSalesTerritories,
  useActivateSalesTerritory,
  useDeactivateSalesTerritory,
  useDeleteSalesTerritory,
} from '@/lib/api/hooks/useSales';
import type { SalesTerritoryQueryParams, TerritoryType, TerritoryStatus, SalesTerritoryListDto } from '@/lib/api/services/sales.service';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const statusConfig: Record<TerritoryStatus, { label: string; bgColor: string; textColor: string }> = {
  Active: { label: 'Aktif', bgColor: 'bg-slate-800', textColor: 'text-white' },
  Inactive: { label: 'Pasif', bgColor: 'bg-slate-200', textColor: 'text-slate-700' },
  Suspended: { label: 'Askıda', bgColor: 'bg-slate-400', textColor: 'text-slate-800' },
};

const typeLabels: Record<TerritoryType, string> = {
  Country: 'Ülke',
  Region: 'Bölge',
  City: 'Şehir',
  District: 'İlçe',
  Zone: 'Zon',
  Custom: 'Özel',
};

const typeOptions: { value: TerritoryType; label: string }[] = Object.entries(typeLabels).map(
  ([value, label]) => ({ value: value as TerritoryType, label })
);

const statusOptions: { value: TerritoryStatus; label: string }[] = Object.entries(statusConfig).map(
  ([value, config]) => ({ value: value as TerritoryStatus, label: config.label })
);

export default function TerritoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<SalesTerritoryQueryParams>({});

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // Fetch territories
  const { data, isLoading, error, refetch } = useSalesTerritories({
    page: currentPage,
    pageSize,
    searchTerm: debouncedSearch || undefined,
    ...filters,
  });

  const activateMutation = useActivateSalesTerritory();
  const deactivateMutation = useDeactivateSalesTerritory();
  const deleteMutation = useDeleteSalesTerritory();

  const territories = data?.items || [];
  const totalCount = data?.totalCount || 0;

  const handleCreate = () => {
    router.push('/sales/territories/new');
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateMutation.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Bölgeyi Sil',
      content: 'Bu bölgeyi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'Vazgeç',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  const getActionMenu = (record: SalesTerritoryListDto): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'view',
        icon: <EyeIcon className="w-4 h-4" />,
        label: 'Görüntüle',
        onClick: () => router.push(`/sales/territories/${record.id}`),
      },
      {
        key: 'edit',
        icon: <PencilIcon className="w-4 h-4" />,
        label: 'Düzenle',
        onClick: () => router.push(`/sales/territories/${record.id}/edit`),
      },
    ];

    if (record.status === 'Active') {
      items.push({
        key: 'deactivate',
        icon: <XMarkIcon className="w-4 h-4" />,
        label: 'Pasifleştir',
        onClick: () => handleDeactivate(record.id),
      });
    } else {
      items.push({
        key: 'activate',
        icon: <CheckIcon className="w-4 h-4" />,
        label: 'Aktifleştir',
        onClick: () => handleActivate(record.id),
      });
    }

    items.push({
      key: 'delete',
      icon: <TrashIcon className="w-4 h-4" />,
      label: 'Sil',
      danger: true,
      onClick: () => handleDelete(record.id),
    });

    return items;
  };

  const columns: ColumnsType<SalesTerritoryListDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      render: (text: string, record) => (
        <button
          onClick={() => router.push(`/sales/territories/${record.id}`)}
          className="text-slate-900 hover:text-slate-600 font-medium"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Tür',
      dataIndex: 'territoryType',
      key: 'territoryType',
      render: (type: TerritoryType) => typeLabels[type],
    },
    {
      title: 'Üst Bölge',
      dataIndex: 'parentTerritoryName',
      key: 'parentTerritoryName',
      render: (text: string) => text || '-',
    },
    {
      title: 'Satış Temsilcisi',
      dataIndex: 'assignedSalesPersonCount',
      key: 'assignedSalesPersonCount',
      align: 'center',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      render: (status: TerritoryStatus) => {
        const config = statusConfig[status];
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
            {config.label}
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

  // Calculate stats
  const activeCount = territories.filter(t => t.status === 'Active').length;
  const inactiveCount = territories.filter(t => t.status === 'Inactive').length;

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <GlobeAltIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satış Bölgeleri</h1>
            <p className="text-sm text-slate-500">Satış bölgelerini yönetin</p>
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
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Bölge
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Toplam Bölge</p>
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
              <XMarkIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Pasif</p>
              <p className="text-xl font-semibold text-slate-900">{inactiveCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <GlobeAltIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bölge Türü</p>
              <p className="text-xl font-semibold text-slate-900">{typeOptions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-white border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="text-red-600">
              <XMarkIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Bölgeler yüklenemedi</p>
              <p className="text-sm text-red-600">
                {error instanceof Error ? error.message : 'Bölgeler getirilirken bir hata oluştu.'}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Bölge ara... (kod, ad)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-10"
          />
          <Select
            placeholder="Tür"
            allowClear
            options={typeOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, territoryType: value }))}
            className="h-10"
            style={{ width: '100%' }}
          />
          <Select
            placeholder="Durum"
            allowClear
            options={statusOptions}
            onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
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
            dataSource={territories}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: totalCount,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} bölge`,
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

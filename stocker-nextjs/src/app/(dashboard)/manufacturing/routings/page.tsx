'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Button,
  Space,
  Dropdown,
  Empty,
  Tag,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  DocumentCheckIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import {
  useRoutings,
  useDeleteRouting,
  useApproveRouting,
  useActivateRouting,
} from '@/lib/api/hooks/useManufacturing';
import type { RoutingListDto, RoutingStatus } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import { confirmDelete } from '@/lib/utils/sweetalert';

// Routing status configuration
const statusConfig: Record<RoutingStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-3 h-3" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <DocumentCheckIcon className="w-3 h-3" /> },
  Active: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Aktif', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Obsolete: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Geçersiz', icon: <ArchiveBoxIcon className="w-3 h-3" /> },
};

interface FilterState {
  searchText: string;
  status?: RoutingStatus;
  isDefault?: boolean;
}

const defaultFilters: FilterState = {
  searchText: '',
  status: undefined,
  isDefault: undefined,
};

export default function RoutingsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // API Hooks
  const { data: routings = [], isLoading, refetch } = useRoutings({
    status: filters.status,
    defaultOnly: filters.isDefault,
  });
  const deleteRouting = useDeleteRouting();
  const approveRouting = useApproveRouting();
  const activateRouting = useActivateRouting();

  // Filter routings
  const filteredRoutings = useMemo(() => {
    return routings.filter((r) => {
      const matchesSearch = !debouncedSearch ||
        r.routingNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        r.productName.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [routings, debouncedSearch]);

  // Stats
  const stats = useMemo(() => ({
    total: routings.length,
    active: routings.filter(r => r.status === 'Active').length,
    draft: routings.filter(r => r.status === 'Draft').length,
    defaults: routings.filter(r => r.isDefault).length,
  }), [routings]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchText !== '' || filters.status !== undefined || filters.isDefault !== undefined;
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Action handlers
  const handleView = (id: string) => {
    router.push(`/manufacturing/routings/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/manufacturing/routings/${id}/edit`);
  };

  const handleDelete = async (r: RoutingListDto) => {
    const confirmed = await confirmDelete('Rota', r.routingNumber);
    if (confirmed) {
      try {
        await deleteRouting.mutateAsync(r.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveRouting.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateRouting.mutateAsync(id);
    } catch {
      // Error handled by hook
    }
  };

  // Table columns
  const columns: ColumnsType<RoutingListDto> = [
    {
      title: 'Rota No',
      key: 'routingNumber',
      width: 140,
      render: (_, record) => (
        <span
          className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
          onClick={() => handleView(record.id)}
        >
          {record.routingNumber}
        </span>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">v{record.version}</div>
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: RoutingStatus) => {
        const config = statusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status, icon: null };
        return (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.icon}
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 100,
      render: (isDefault) => (
        isDefault ? (
          <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">
            Varsayılan
          </Tag>
        ) : null
      ),
    },
    {
      title: 'Operasyonlar',
      dataIndex: 'operationCount',
      key: 'operationCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="font-medium text-slate-900">{count}</span>
      ),
    },
    {
      title: 'Süre',
      key: 'time',
      width: 160,
      render: (_, record) => (
        <div className="text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Hazırlık:</span>
            <span className="font-medium text-slate-700">{record.totalSetupTime} dk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Çalışma:</span>
            <span className="font-medium text-slate-700">{record.totalRunTime} dk</span>
          </div>
        </div>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems: MenuProps['items'] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
            disabled: record.status === 'Active' || record.status === 'Obsolete',
          },
          { type: 'divider' as const },
        ];

        if (record.status === 'Draft') {
          menuItems.push({
            key: 'approve',
            icon: <DocumentCheckIcon className="w-4 h-4" />,
            label: 'Onayla',
            onClick: () => handleApprove(record.id),
          });
        }

        if (record.status === 'Approved') {
          menuItems.push({
            key: 'activate',
            icon: <CheckCircleIcon className="w-4 h-4" />,
            label: 'Aktifleştir',
            onClick: () => handleActivate(record.id),
          });
        }

        if (record.status === 'Draft') {
          menuItems.push({
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          });
        }

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <Button
              type="text"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
              className="text-slate-600 hover:text-slate-900"
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rotalar</h1>
          <p className="text-slate-500 mt-1">Üretim rotalarını ve operasyonları yönetin</p>
        </div>
        <Space>
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
            onClick={() => router.push('/manufacturing/routings/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Rota
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.draft}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Taslak</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Cog6ToothIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.defaults}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Varsayılan</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Rota no veya ürün ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ width: 280 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            value={filters.status}
            onChange={(v) => updateFilter('status', v)}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 'Draft', label: 'Taslak' },
              { value: 'Approved', label: 'Onaylı' },
              { value: 'Active', label: 'Aktif' },
              { value: 'Obsolete', label: 'Geçersiz' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Varsayılan"
            value={filters.isDefault}
            onChange={(v) => updateFilter('isDefault', v)}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: true, label: 'Varsayılan' },
              { value: false, label: 'Diğer' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              icon={<XMarkIcon className="w-4 h-4" />}
              className="!border-slate-300 ml-auto"
            >
              Filtreleri Temizle
            </Button>
          )}
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredRoutings}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredRoutings.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} rota`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Rota bulunamadı"
              />
            ),
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

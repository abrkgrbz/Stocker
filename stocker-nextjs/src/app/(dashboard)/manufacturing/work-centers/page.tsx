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
  Progress,
} from 'antd';
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
  WrenchScrewdriverIcon,
  UserGroupIcon,
  TruckIcon,
  Cog6ToothIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import {
  useWorkCenters,
  useDeleteWorkCenter,
  useActivateWorkCenter,
  useDeactivateWorkCenter,
} from '@/lib/api/hooks/useManufacturing';
import type { WorkCenterListDto, WorkCenterType } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import { confirmDelete } from '@/lib/utils/sweetalert';

// Work center type configuration
const typeConfig: Record<WorkCenterType, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Machine: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Makine', icon: <Cog6ToothIcon className="w-3 h-3" /> },
  Labor: { color: '#334155', bgColor: '#f1f5f9', label: 'İşçilik', icon: <UserGroupIcon className="w-3 h-3" /> },
  Subcontract: { color: '#475569', bgColor: '#f8fafc', label: 'Fason', icon: <TruckIcon className="w-3 h-3" /> },
  Mixed: { color: '#64748b', bgColor: '#f1f5f9', label: 'Karma', icon: <WrenchScrewdriverIcon className="w-3 h-3" /> },
};

interface FilterState {
  searchText: string;
  type?: WorkCenterType;
  isActive?: boolean;
}

const defaultFilters: FilterState = {
  searchText: '',
  type: undefined,
  isActive: undefined,
};

export default function WorkCentersPage() {
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
  const { data: workCenters = [], isLoading, refetch } = useWorkCenters({
    type: filters.type,
    activeOnly: filters.isActive,
  });
  const deleteWorkCenter = useDeleteWorkCenter();
  const activateWorkCenter = useActivateWorkCenter();
  const deactivateWorkCenter = useDeactivateWorkCenter();

  // Filter work centers
  const filteredWorkCenters = useMemo(() => {
    return workCenters.filter((wc) => {
      const matchesSearch = !debouncedSearch ||
        wc.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        wc.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [workCenters, debouncedSearch]);

  // Stats
  const stats = useMemo(() => ({
    total: workCenters.length,
    active: workCenters.filter(wc => wc.isActive).length,
    machines: workCenters.filter(wc => wc.type === 'Machine').length,
    labor: workCenters.filter(wc => wc.type === 'Labor').length,
  }), [workCenters]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchText !== '' || filters.type !== undefined || filters.isActive !== undefined;
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Action handlers
  const handleView = (id: string) => {
    router.push(`/manufacturing/work-centers/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/manufacturing/work-centers/${id}/edit`);
  };

  const handleDelete = async (wc: WorkCenterListDto) => {
    const confirmed = await confirmDelete('İş Merkezi', wc.name);
    if (confirmed) {
      try {
        await deleteWorkCenter.mutateAsync(wc.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleToggleActive = async (wc: WorkCenterListDto) => {
    try {
      if (wc.isActive) {
        await deactivateWorkCenter.mutateAsync(wc.id);
      } else {
        await activateWorkCenter.mutateAsync(wc.id);
      }
    } catch {
      // Error handled by hook
    }
  };

  // Table columns
  const columns: ColumnsType<WorkCenterListDto> = [
    {
      title: 'Kod',
      key: 'code',
      width: 120,
      render: (_, record) => (
        <span
          className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
          onClick={() => handleView(record.id)}
        >
          {record.code}
        </span>
      ),
    },
    {
      title: 'Ad',
      key: 'name',
      width: 220,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.name}</div>
        </div>
      ),
    },
    {
      title: 'Tür',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: WorkCenterType) => {
        const config = typeConfig[type] || { color: '#64748b', bgColor: '#f1f5f9', label: type, icon: null };
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
      title: 'Kapasite',
      key: 'capacity',
      width: 140,
      render: (_, record) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900">{record.capacityPerHour}</span>
            <span className="text-xs text-slate-500">/ saat</span>
          </div>
          <div className="text-xs text-slate-500">
            Verimlilik: {record.efficiency}%
          </div>
        </div>
      ),
    },
    {
      title: 'Maliyet/Saat',
      key: 'cost',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <span className="font-medium text-slate-900">
          ₺{record.hourlyRate.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium"
          style={{
            backgroundColor: isActive ? '#e2e8f0' : '#f1f5f9',
            color: isActive ? '#1e293b' : '#64748b'
          }}
        >
          {isActive ? <CheckCircleIcon className="w-3 h-3" /> : <StopIcon className="w-3 h-3" />}
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
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
          },
          { type: 'divider' as const },
          {
            key: 'toggle',
            icon: record.isActive ? <StopIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
            label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
            onClick: () => handleToggleActive(record),
          },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

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
          <h1 className="text-2xl font-bold text-slate-900">İş Merkezleri</h1>
          <p className="text-slate-500 mt-1">Üretim iş merkezlerini yönetin</p>
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
            onClick={() => router.push('/manufacturing/work-centers/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni İş Merkezi
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <WrenchScrewdriverIcon className="w-5 h-5 text-slate-600" />
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
                <Cog6ToothIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.machines}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Makine</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UserGroupIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.labor}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">İşçilik</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Kod veya isim ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={filters.searchText}
            onChange={(e) => updateFilter('searchText', e.target.value)}
            allowClear
            style={{ width: 280 }}
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Tür"
            value={filters.type}
            onChange={(v) => updateFilter('type', v)}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 'Machine', label: 'Makine' },
              { value: 'Labor', label: 'İşçilik' },
              { value: 'Subcontract', label: 'Fason' },
              { value: 'Mixed', label: 'Karma' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Durum"
            value={filters.isActive}
            onChange={(v) => updateFilter('isActive', v)}
            allowClear
            style={{ width: 130 }}
            options={[
              { value: true, label: 'Aktif' },
              { value: false, label: 'Pasif' },
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
          dataSource={filteredWorkCenters}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredWorkCenters.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} iş merkezi`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="İş merkezi bulunamadı"
              />
            ),
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

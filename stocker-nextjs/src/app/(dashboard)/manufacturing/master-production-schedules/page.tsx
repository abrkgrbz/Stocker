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
  DocumentCheckIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import {
  useMasterProductionSchedules,
  useDeleteMasterProductionSchedule,
} from '@/lib/api/hooks/useManufacturing';
import type { MasterProductionScheduleListDto, MpsStatus, PeriodType } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// MPS status configuration
const statusConfig: Record<MpsStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-3 h-3" /> },
  Approved: { color: '#334155', bgColor: '#e2e8f0', label: 'Onaylı', icon: <DocumentCheckIcon className="w-3 h-3" /> },
  Active: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Aktif', icon: <CheckCircleIcon className="w-3 h-3" /> },
  Completed: { color: '#475569', bgColor: '#f8fafc', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3 h-3" /> },
};

const periodTypeLabels: Record<PeriodType, string> = {
  Daily: 'Günlük',
  Weekly: 'Haftalık',
  Monthly: 'Aylık',
};

interface FilterState {
  searchText: string;
  status?: MpsStatus;
  periodType?: PeriodType;
}

const defaultFilters: FilterState = {
  searchText: '',
  status: undefined,
  periodType: undefined,
};

export default function MasterProductionSchedulesPage() {
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
  const { data: schedules = [], isLoading, refetch } = useMasterProductionSchedules({
    status: filters.status,
  });
  const deleteSchedule = useDeleteMasterProductionSchedule();

  // Filter schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesSearch = !debouncedSearch ||
        s.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [schedules, debouncedSearch]);

  // Stats
  const stats = useMemo(() => ({
    total: schedules.length,
    active: schedules.filter(s => s.status === 'Active').length,
    draft: schedules.filter(s => s.status === 'Draft').length,
    completed: schedules.filter(s => s.status === 'Completed').length,
  }), [schedules]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchText !== '' || filters.status !== undefined || filters.periodType !== undefined;
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Action handlers
  const handleView = (id: string) => {
    router.push(`/manufacturing/master-production-schedules/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/manufacturing/master-production-schedules/${id}/edit`);
  };

  const handleDelete = async (s: MasterProductionScheduleListDto) => {
    const confirmed = await confirmDelete('Ana Üretim Planı', s.name);
    if (confirmed) {
      try {
        await deleteSchedule.mutateAsync(s.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  // Table columns
  const columns: ColumnsType<MasterProductionScheduleListDto> = [
    {
      title: 'Ad',
      key: 'name',
      width: 240,
      render: (_, record) => (
        <span
          className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
          onClick={() => handleView(record.id)}
        >
          {record.name}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: MpsStatus) => {
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
      title: 'Periyot',
      dataIndex: 'periodType',
      key: 'periodType',
      width: 100,
      render: (periodType: PeriodType) => (
        <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">
          {periodTypeLabels[periodType]}
        </Tag>
      ),
    },
    {
      title: 'Planlama Dönemi',
      key: 'planningHorizon',
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          <span className="text-slate-600">
            {dayjs(record.planningHorizonStart).format('DD.MM.YYYY')}
          </span>
          <span className="text-slate-400 mx-2">→</span>
          <span className="text-slate-600">
            {dayjs(record.planningHorizonEnd).format('DD.MM.YYYY')}
          </span>
        </div>
      ),
    },
    {
      title: 'Satır',
      dataIndex: 'lineCount',
      key: 'lineCount',
      width: 80,
      align: 'center',
      render: (count) => (
        <span className="font-medium text-slate-900">{count}</span>
      ),
    },
    {
      title: 'Oluşturma',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <span className="text-sm text-slate-500">
          {dayjs(date).format('DD.MM.YYYY')}
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
            disabled: record.status === 'Completed',
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
            disabled: record.status !== 'Draft',
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
          <h1 className="text-2xl font-bold text-slate-900">Ana Üretim Planları</h1>
          <p className="text-slate-500 mt-1">Master Production Schedule (MPS) yönetimi</p>
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
            onClick={() => router.push('/manufacturing/master-production-schedules/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Plan
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CalendarDaysIcon className="w-5 h-5 text-slate-600" />
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
                <ChartBarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlandı</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Plan adı ara..."
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
              { value: 'Completed', label: 'Tamamlandı' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Periyot"
            value={filters.periodType}
            onChange={(v) => updateFilter('periodType', v)}
            allowClear
            style={{ width: 140 }}
            options={[
              { value: 'Daily', label: 'Günlük' },
              { value: 'Weekly', label: 'Haftalık' },
              { value: 'Monthly', label: 'Aylık' },
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
          dataSource={filteredSchedules}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredSchedules.length,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} plan`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Plan bulunamadı"
              />
            ),
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

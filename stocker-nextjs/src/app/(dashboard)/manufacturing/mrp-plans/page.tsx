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
  PlayIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  CalculatorIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  useMrpPlans,
  useDeleteMrpPlan,
  useExecuteMrpPlan,
} from '@/lib/api/hooks/useManufacturing';
import type { MrpPlanListDto, MrpPlanStatus, MrpPlanType } from '@/lib/api/services/manufacturing.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { confirmDelete } from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';

// MRP Plan status configuration
const statusConfig: Record<MrpPlanStatus, { color: string; bgColor: string; label: string; icon: React.ReactNode }> = {
  Draft: { color: '#64748b', bgColor: '#f1f5f9', label: 'Taslak', icon: <ClockIcon className="w-3 h-3" /> },
  Executed: { color: '#334155', bgColor: '#e2e8f0', label: 'Çalıştırıldı', icon: <PlayIcon className="w-3 h-3" /> },
  Approved: { color: '#1e293b', bgColor: '#cbd5e1', label: 'Onaylı', icon: <DocumentCheckIcon className="w-3 h-3" /> },
  Completed: { color: '#475569', bgColor: '#f8fafc', label: 'Tamamlandı', icon: <CheckCircleIcon className="w-3 h-3" /> },
};

const planTypeLabels: Record<MrpPlanType, string> = {
  Regenerative: 'Yeniden Oluşturma',
  NetChange: 'Net Değişim',
};

interface FilterState {
  searchText: string;
  status?: MrpPlanStatus;
  planType?: MrpPlanType;
}

const defaultFilters: FilterState = {
  searchText: '',
  status: undefined,
  planType: undefined,
};

export default function MrpPlansPage() {
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
  const { data: plans = [], isLoading, refetch } = useMrpPlans({
    status: filters.status,
    type: filters.planType,
  });
  const deletePlan = useDeleteMrpPlan();
  const executePlan = useExecuteMrpPlan();

  // Filter plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchesSearch = !debouncedSearch ||
        p.planNumber.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchesSearch;
    });
  }, [plans, debouncedSearch]);

  // Stats
  const stats = useMemo(() => ({
    total: plans.length,
    executed: plans.filter(p => p.status === 'Executed').length,
    draft: plans.filter(p => p.status === 'Draft').length,
    totalOrders: plans.reduce((sum, p) => sum + p.plannedOrderCount, 0),
  }), [plans]);

  const hasActiveFilters = useMemo(() => {
    return filters.searchText !== '' || filters.status !== undefined || filters.planType !== undefined;
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
  };

  // Action handlers
  const handleView = (id: string) => {
    router.push(`/manufacturing/mrp-plans/${id}`);
  };

  const handleDelete = async (p: MrpPlanListDto) => {
    const confirmed = await confirmDelete('MRP Planı', p.name);
    if (confirmed) {
      try {
        await deletePlan.mutateAsync(p.id);
      } catch {
        // Error handled by hook
      }
    }
  };

  const handleExecute = async (id: string) => {
    try {
      await executePlan.mutateAsync({ id, data: {} });
    } catch {
      // Error handled by hook
    }
  };

  // Table columns
  const columns: ColumnsType<MrpPlanListDto> = [
    {
      title: 'Plan No',
      key: 'planNumber',
      width: 140,
      render: (_, record) => (
        <span
          className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
          onClick={() => handleView(record.id)}
        >
          {record.planNumber}
        </span>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: MrpPlanStatus) => {
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
      title: 'Tip',
      dataIndex: 'planType',
      key: 'planType',
      width: 140,
      render: (planType: MrpPlanType) => (
        <Tag color="default" className="!bg-slate-100 !text-slate-700 !border-slate-200">
          {planTypeLabels[planType]}
        </Tag>
      ),
    },
    {
      title: 'Dönem',
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
      title: 'Emirler',
      dataIndex: 'plannedOrderCount',
      key: 'plannedOrderCount',
      width: 80,
      align: 'center',
      render: (count) => <span className="font-medium text-slate-900">{count}</span>,
    },
    {
      title: 'İstisnalar',
      dataIndex: 'exceptionCount',
      key: 'exceptionCount',
      width: 100,
      align: 'center',
      render: (count) => (
        count > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-xs font-medium">
            <ExclamationTriangleIcon className="w-3 h-3" />
            {count}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        )
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
        ];

        if (record.status === 'Draft') {
          menuItems.push({
            key: 'execute',
            icon: <PlayIcon className="w-4 h-4" />,
            label: 'Çalıştır',
            onClick: () => handleExecute(record.id),
          });
          menuItems.push({ type: 'divider' as const } as any);
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
          <h1 className="text-2xl font-bold text-slate-900">MRP Planları</h1>
          <p className="text-slate-500 mt-1">Material Requirements Planning - Malzeme ihtiyaç planlaması</p>
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
            onClick={() => router.push('/manufacturing/mrp-plans/new')}
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
                <CalculatorIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Plan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <PlayIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.executed}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Çalıştırıldı</div>
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
                <DocumentCheckIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.totalOrders}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Planlanan Emir</div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Input
            placeholder="Plan no veya ad ara..."
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
            style={{ width: 150 }}
            options={[
              { value: 'Draft', label: 'Taslak' },
              { value: 'Executed', label: 'Çalıştırıldı' },
              { value: 'Approved', label: 'Onaylı' },
              { value: 'Completed', label: 'Tamamlandı' },
            ]}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Tip"
            value={filters.planType}
            onChange={(v) => updateFilter('planType', v)}
            allowClear
            style={{ width: 170 }}
            options={[
              { value: 'Regenerative', label: 'Yeniden Oluşturma' },
              { value: 'NetChange', label: 'Net Değişim' },
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
          dataSource={filteredPlans}
          rowKey="id"
          loading={isLoading}
          scroll={{ x: 1200 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredPlans.length,
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
                description="MRP planı bulunamadı"
              />
            ),
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

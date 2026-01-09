'use client';

/**
 * Opportunities List Page
 * Monochrome design system following inventory/HR patterns
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, Button, Dropdown, Spin } from 'antd';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  TrophyIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import {
  useOpportunities,
  useDeleteOpportunity,
  useWinOpportunity,
  useLoseOpportunity,
  usePipelines,
} from '@/lib/api/hooks/useCRM';
import type { OpportunityDto } from '@/lib/api/services/crm.types';
import { OpportunityStatus } from '@/lib/api/services/crm.types';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
  confirmAction,
  showUpdateSuccess,
  showInfo,
} from '@/lib/utils/sweetalert';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

// Monochrome opportunity status configuration
const opportunityStatusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Open: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Acik' },
  Won: { color: '#334155', bgColor: '#cbd5e1', label: 'Kazanildi' },
  Lost: { color: '#64748b', bgColor: '#f1f5f9', label: 'Kaybedildi' },
  OnHold: { color: '#475569', bgColor: '#e2e8f0', label: 'Beklemede' },
};

// Monochrome priority configuration
const priorityConfig: Record<string, { color: string; bgColor: string; label: string }> = {
  Low: { color: '#94a3b8', bgColor: '#f8fafc', label: 'Dusuk' },
  Medium: { color: '#64748b', bgColor: '#f1f5f9', label: 'Orta' },
  High: { color: '#1e293b', bgColor: '#e2e8f0', label: 'Yuksek' },
};

export default function OpportunitiesPage() {
  const router = useRouter();

  // Filter state
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OpportunityStatus | undefined>();
  const [selectedPipeline, setSelectedPipeline] = useState<string | undefined>();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // API Hooks
  const { data, isLoading, refetch } = useOpportunities({
    page: currentPage,
    pageSize,
    search: debouncedSearch || undefined,
    status: selectedStatus,
    pipelineId: selectedPipeline,
  });
  const { data: pipelines = [] } = usePipelines();
  const deleteOpportunity = useDeleteOpportunity();
  const winOpportunity = useWinOpportunity();
  const loseOpportunity = useLoseOpportunity();

  const opportunities = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Use opportunities directly (filtering is done by API)
  const filteredOpportunities = opportunities;

  // Calculate stats
  const stats = useMemo(() => {
    const total = opportunities.length;
    const open = opportunities.filter((o) => o.status === 'Open').length;
    const won = opportunities.filter((o) => o.status === 'Won').length;
    const totalValue = opportunities.filter((o) => o.status === 'Open').reduce((sum, o) => sum + o.amount, 0);
    return { total, open, won, totalValue };
  }, [opportunities]);

  // CRUD Handlers
  const handleView = (id: string) => {
    router.push(`/crm/opportunities/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/crm/opportunities/${id}/edit`);
  };

  const handleDelete = async (opp: OpportunityDto) => {
    const confirmed = await confirmDelete('Firsat', opp.name);
    if (confirmed) {
      try {
        await deleteOpportunity.mutateAsync(opp.id);
        showDeleteSuccess('firsat');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const handleWin = async (opp: OpportunityDto) => {
    const confirmed = await confirmAction(
      'Firsati Kazanildi Olarak Isaretle',
      `"${opp.name}" firsatini kazanildi olarak isaretlemek istediginizden emin misiniz?`,
      'Kazanildi Isaretle'
    );
    if (confirmed) {
      try {
        await winOpportunity.mutateAsync({
          id: opp.id,
          actualAmount: opp.amount,
          closedDate: new Date().toISOString(),
        });
        showUpdateSuccess('firsat', 'kazanildi olarak isaretlendi');
      } catch (error: any) {
        showError(error.response?.data?.detail || 'Islem basarisiz');
      }
    }
  };

  const handleLose = async (opp: OpportunityDto) => {
    const confirmed = await confirmAction(
      'Firsati Kaybedildi Olarak Isaretle',
      `"${opp.name}" firsatini kaybedildi olarak isaretlemek istediginizden emin misiniz?`,
      'Kaybedildi Isaretle'
    );
    if (confirmed) {
      try {
        await loseOpportunity.mutateAsync({
          id: opp.id,
          lostReason: 'Kullanici tarafindan kapatildi',
          closedDate: new Date().toISOString(),
        });
        showInfo('Firsat Isaretlendi', 'Firsat kaybedildi olarak isaretlendi');
      } catch (error: any) {
        showError(error.response?.data?.detail || 'Islem basarisiz');
      }
    }
  };

  const handleCreate = () => {
    router.push('/crm/opportunities/new');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText('');
    setSelectedStatus(undefined);
    setSelectedPipeline(undefined);
  };

  // Table columns
  const columns: ColumnsType<OpportunityDto> = [
    {
      title: 'Firsat',
      key: 'opportunity',
      width: 280,
      render: (_, record) => (
        <div className="space-y-1">
          <span
            className="font-semibold text-slate-900 cursor-pointer hover:text-slate-600"
            onClick={() => handleView(record.id)}
          >
            {record.name}
          </span>
          <div className="text-xs text-slate-500">
            {record.customerName && `${record.customerName}`}
            {record.stageName && ` - ${record.stageName}`}
          </div>
        </div>
      ),
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (amount) => (
        <span className="font-semibold text-slate-900">
          ₺{(amount || 0).toLocaleString('tr-TR')}
        </span>
      ),
    },
    {
      title: 'Olasilik',
      dataIndex: 'probability',
      key: 'probability',
      width: 100,
      align: 'center',
      render: (prob) => <span className="text-slate-600">{prob || 0}%</span>,
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => {
        const config = priorityConfig[priority] || { color: '#64748b', bgColor: '#f1f5f9', label: priority };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Tahmini Kapanis',
      dataIndex: 'expectedCloseDate',
      key: 'expectedCloseDate',
      width: 140,
      render: (date) => (
        <span className="text-slate-600">
          {date ? dayjs(date).format('DD/MM/YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = opportunityStatusConfig[status] || { color: '#64748b', bgColor: '#f1f5f9', label: status };
        return (
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
            style={{ backgroundColor: config.bgColor, color: config.color }}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilSquareIcon className="w-4 h-4" />,
            label: 'Duzenle',
            onClick: () => handleEdit(record.id),
          },
          { type: 'divider' as const },
          ...(record.status === 'Open' ? [
            {
              key: 'win',
              icon: <TrophyIcon className="w-4 h-4" />,
              label: 'Kazanildi Isaretle',
              onClick: () => handleWin(record),
            },
            {
              key: 'lose',
              icon: <NoSymbolIcon className="w-4 h-4" />,
              label: 'Kaybedildi Isaretle',
              onClick: () => handleLose(record),
            },
            { type: 'divider' as const },
          ] : []),
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
            <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} className="text-slate-600 hover:text-slate-900" />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <LightBulbIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Satis Firsatlari</h1>
            <p className="text-sm text-slate-500">Satis firsatlarinizi takip edin ve yonetin</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            Yeni Firsat
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <LightBulbIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Firsat</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.open}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Acik Firsat</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.won}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Kazanilan</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">₺{stats.totalValue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Pipeline Degeri</div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Firsat ara... (isim, musteri)"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
          <Select
            placeholder="Durum"
            allowClear
            style={{ width: 160 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={Object.entries(opportunityStatusConfig).map(([value, config]) => ({
              value,
              label: config.label,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Select
            placeholder="Pipeline"
            allowClear
            style={{ width: 180 }}
            value={selectedPipeline}
            onChange={setSelectedPipeline}
            options={pipelines.map((p) => ({ value: p.id, label: p.name }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Button onClick={clearFilters} className="!border-slate-300 !text-slate-600">
            Temizle
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Results count */}
        <div className="text-sm text-slate-500 mb-4">
          {filteredOpportunities.length} firsat listeleniyor
        </div>

        <Table
          columns={columns}
          dataSource={filteredOpportunities}
          rowKey="id"
          loading={isLoading || deleteOpportunity.isPending}
          scroll={{ x: 1100 }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalCount,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} firsat`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

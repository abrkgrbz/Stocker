'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, Button, Dropdown, Progress } from 'antd';
import {
  ArrowPathIcon,
  CalculatorIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  PlayIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useCycleCounts,
  useWarehouses,
  useStartCycleCount,
  useCompleteCycleCount,
} from '@/lib/api/hooks/useInventory';
import type { CycleCountDto } from '@/lib/api/services/inventory.types';
import { CycleCountStatus, CycleCountType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { confirmAction } from '@/lib/utils/sweetalert';

interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}

const statusConfig: Record<CycleCountStatus, StatusConfig> = {
  [CycleCountStatus.Planned]: {
    color: '#64748b',
    bgColor: '#f1f5f9',
    label: 'Planlandi',
    icon: <ClockIcon className="w-3.5 h-3.5" />,
  },
  [CycleCountStatus.InProgress]: {
    color: '#1e293b',
    bgColor: '#e2e8f0',
    label: 'Devam Ediyor',
    icon: <ArrowPathIcon className="w-3.5 h-3.5" />,
  },
  [CycleCountStatus.Completed]: {
    color: '#1e293b',
    bgColor: '#cbd5e1',
    label: 'Tamamlandi',
    icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
  },
  [CycleCountStatus.Approved]: {
    color: '#ffffff',
    bgColor: '#475569',
    label: 'Onaylandi',
    icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
  },
  [CycleCountStatus.Processed]: {
    color: '#ffffff',
    bgColor: '#334155',
    label: 'Islendi',
    icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
  },
  [CycleCountStatus.Cancelled]: {
    color: '#475569',
    bgColor: '#f1f5f9',
    label: 'Iptal Edildi',
    icon: <XCircleIcon className="w-3.5 h-3.5" />,
  },
};

const countTypeLabels: Record<CycleCountType, string> = {
  [CycleCountType.Standard]: 'Standart',
  [CycleCountType.AbcBased]: 'ABC Bazli',
  [CycleCountType.ZoneBased]: 'Bolge Bazli',
  [CycleCountType.CategoryBased]: 'Kategori Bazli',
  [CycleCountType.Random]: 'Rastgele',
  [CycleCountType.MovementBased]: 'Hareket Bazli',
};

export default function CycleCountsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<CycleCountStatus | undefined>();
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>();

  // API Hooks
  const { data: warehouses = [] } = useWarehouses();
  const { data: cycleCounts = [], isLoading, refetch } = useCycleCounts({ status: selectedStatus, warehouseId: selectedWarehouse });
  const startCount = useStartCycleCount();
  const completeCount = useCompleteCycleCount();

  // Stats
  const stats = useMemo(() => {
    const total = cycleCounts.length;
    const scheduled = cycleCounts.filter(c => c.status === CycleCountStatus.Planned).length;
    const inProgress = cycleCounts.filter(c => c.status === CycleCountStatus.InProgress).length;
    const completed = cycleCounts.filter(c => c.status === CycleCountStatus.Completed).length;
    return { total, scheduled, inProgress, completed };
  }, [cycleCounts]);

  // Handlers
  const handleStart = async (count: CycleCountDto) => {
    const confirmed = await confirmAction(
      'Sayimi Baslat',
      `"${count.planNumber}" sayimini baslatmak istediginizden emin misiniz?`,
      'Baslat'
    );
    if (confirmed) {
      try {
        await startCount.mutateAsync(count.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleComplete = async (count: CycleCountDto) => {
    const confirmed = await confirmAction(
      'Sayimi Tamamla',
      `"${count.planNumber}" sayimini tamamlamak istediginizden emin misiniz?`,
      'Tamamla'
    );
    if (confirmed) {
      try {
        await completeCount.mutateAsync(count.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  // Table columns
  const columns: ColumnsType<CycleCountDto> = [
    {
      title: 'Sayim No',
      dataIndex: 'planNumber',
      key: 'planNumber',
      width: 130,
      render: (text: string, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/cycle-counts/${record.id}`);
          }}
          className="font-mono font-semibold text-slate-900 hover:text-slate-600 transition-colors text-left"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      width: 150,
      render: (text: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {text}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: CycleCountStatus) => {
        const config = statusConfig[status];
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
      title: 'Sayim Turu',
      dataIndex: 'countType',
      key: 'countType',
      width: 130,
      render: (text: CycleCountType) => (
        <span className="text-slate-600">
          {text ? (countTypeLabels[text] || text) : '-'}
        </span>
      ),
    },
    {
      title: 'Planlanan Tarih',
      dataIndex: 'scheduledStartDate',
      key: 'scheduledStartDate',
      width: 130,
      render: (date: string) => (
        <span className="text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Ilerleme',
      key: 'progress',
      width: 150,
      render: (_, record) => {
        if (!record.totalItems) return <span className="text-slate-400">-</span>;
        const percent = Math.round((record.countedItems || 0) / record.totalItems * 100);
        return (
          <div>
            <Progress
              percent={percent}
              size="small"
              strokeColor="#475569"
              trailColor="#e2e8f0"
            />
            <div className="text-xs text-slate-500">{record.countedItems || 0} / {record.totalItems}</div>
          </div>
        );
      },
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => {
        const items: any[] = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Goruntule',
            onClick: () => router.push(`/inventory/cycle-counts/${record.id}`),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Duzenle',
            onClick: () => router.push(`/inventory/cycle-counts/${record.id}/edit`),
          },
        ];

        if (record.status === CycleCountStatus.Planned) {
          items.push(
            { type: 'divider' },
            {
              key: 'start',
              icon: <PlayIcon className="w-4 h-4" />,
              label: 'Baslat',
              onClick: () => handleStart(record),
            }
          );
        }

        if (record.status === CycleCountStatus.InProgress) {
          items.push(
            { type: 'divider' },
            {
              key: 'complete',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Tamamla',
              onClick: () => handleComplete(record),
            }
          );
        }

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button
              type="text"
              icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
              onClick={(e) => e.stopPropagation()}
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
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CalculatorIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Donemsel Sayimlar</h1>
              <p className="text-slate-500 mt-1">Planli envanter sayimlarini yonetin ve takip edin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/cycle-counts/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Sayim
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CalculatorIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Sayim
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.scheduled}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Planlandi
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.inProgress}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Devam Ediyor
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Tamamlandi
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select
            placeholder="Depo secin"
            allowClear
            style={{ width: 200 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {warehouses.map((w) => (
              <Select.Option key={w.id} value={w.id}>
                {w.code} - {w.name}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Duruma gore filtrele"
            allowClear
            style={{ width: 180 }}
            value={selectedStatus}
            onChange={setSelectedStatus}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {Object.entries(statusConfig).map(([key, config]) => (
              <Select.Option key={key} value={key}>
                <span
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                  style={{ backgroundColor: config.bgColor, color: config.color }}
                >
                  {config.label}
                </span>
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={cycleCounts}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: cycleCounts.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
          }}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/cycle-counts/${record.id}`),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, Button, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  useQualityControls,
  useApproveQualityControl,
  useRejectQualityControl,
} from '@/lib/api/hooks/useInventory';
import type { QualityControlDto } from '@/lib/api/services/inventory.types';
import { QualityControlStatus } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { TableEmptyState } from '@/components/primitives';
import dayjs from 'dayjs';
import { confirmAction } from '@/lib/utils/sweetalert';

interface StatusConfig {
  color: string;
  bgColor: string;
  label: string;
  icon: React.ReactNode;
}

const statusConfig: Record<QualityControlStatus, StatusConfig> = {
  [QualityControlStatus.Pending]: {
    color: '#64748b',
    bgColor: '#f1f5f9',
    label: 'Beklemede',
    icon: <ClockIcon className="w-3.5 h-3.5" />,
  },
  [QualityControlStatus.InProgress]: {
    color: '#1e293b',
    bgColor: '#e2e8f0',
    label: 'Devam Ediyor',
    icon: <ArrowPathIcon className="w-3.5 h-3.5" />,
  },
  [QualityControlStatus.Completed]: {
    color: '#ffffff',
    bgColor: '#475569',
    label: 'Tamamlandı',
    icon: <CheckCircleIcon className="w-3.5 h-3.5" />,
  },
  [QualityControlStatus.Cancelled]: {
    color: '#475569',
    bgColor: '#f1f5f9',
    label: 'İptal',
    icon: <XCircleIcon className="w-3.5 h-3.5" />,
  },
};

export default function QualityControlPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<QualityControlStatus | undefined>();

  // API Hooks
  const { data: qualityControls = [], isLoading, refetch } = useQualityControls({ status: selectedStatus });
  const approveQC = useApproveQualityControl();
  const rejectQC = useRejectQualityControl();

  // Stats
  const stats = useMemo(() => {
    const total = qualityControls.length;
    const pending = qualityControls.filter(q => q.status === QualityControlStatus.Pending).length;
    const inProgress = qualityControls.filter(q => q.status === QualityControlStatus.InProgress).length;
    const completed = qualityControls.filter(q => q.status === QualityControlStatus.Completed).length;
    const cancelled = qualityControls.filter(q => q.status === QualityControlStatus.Cancelled).length;
    return { total, pending, inProgress, completed, cancelled };
  }, [qualityControls]);

  // Handlers
  const handleApprove = async (qc: QualityControlDto) => {
    const confirmed = await confirmAction(
      'Kalite Kontrol Onayla',
      `Bu kalite kontrol kaydini onaylamak istediginizden emin misiniz?`,
      'Onayla'
    );
    if (confirmed) {
      try {
        await approveQC.mutateAsync({ id: qc.id, notes: 'Onaylandi' });
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  const handleReject = async (qc: QualityControlDto) => {
    const confirmed = await confirmAction(
      'Kalite Kontrol Reddet',
      `Bu kalite kontrol kaydini reddetmek istediginizden emin misiniz?`,
      'Reddet'
    );
    if (confirmed) {
      try {
        await rejectQC.mutateAsync({ id: qc.id, reason: 'Kalite standartlarini karsilamiyor' });
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  // Table columns
  const columns: ColumnsType<QualityControlDto> = [
    {
      title: 'Kontrol No',
      dataIndex: 'qcNumber',
      key: 'qcNumber',
      width: 130,
      render: (text: string, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/quality-control/${record.id}`);
          }}
          className="font-mono font-semibold text-slate-900 hover:text-slate-600 transition-colors text-left"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Ürün',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <div className="text-xs text-slate-500">{record.productCode}</div>
        </div>
      ),
    },
    {
      title: 'Lot/Parti',
      dataIndex: 'lotNumber',
      key: 'lotNumber',
      width: 130,
      render: (text: string) => text ? (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {text}
        </span>
      ) : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: QualityControlStatus) => {
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
      title: 'Denetim Tarihi',
      dataIndex: 'inspectionDate',
      key: 'inspectionDate',
      width: 130,
      render: (date: string) => (
        <span className="text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY') : '-'}
        </span>
      ),
    },
    {
      title: 'Denetci',
      dataIndex: 'inspectorName',
      key: 'inspectorName',
      width: 150,
      render: (text: string) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
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
            label: 'Görüntüle',
            onClick: () => router.push(`/inventory/quality-control/${record.id}`),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => router.push(`/inventory/quality-control/${record.id}/edit`),
          },
        ];

        if (record.status === QualityControlStatus.Pending || record.status === QualityControlStatus.InProgress) {
          items.push(
            { type: 'divider' },
            {
              key: 'approve',
              icon: <CheckCircleIcon className="w-4 h-4" />,
              label: 'Onayla',
              onClick: () => handleApprove(record),
            },
            {
              key: 'reject',
              icon: <XCircleIcon className="w-4 h-4" />,
              label: 'Reddet',
              danger: true,
              onClick: () => handleReject(record),
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
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kalite Kontrol</h1>
              <p className="text-slate-500 mt-1">Ürün kalite kontrollerini yönetin ve takip edin</p>
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
            onClick={() => router.push('/inventory/quality-control/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Kontrol
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Kontrol
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-2">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.pending}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Beklemede
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-2">
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
        <div className="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.completed}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Basarili
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3 xl:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-400 flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-600">{stats.cancelled}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Basarisiz
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
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
          dataSource={qualityControls}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: qualityControls.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: (e) => {
              const target = e.target as HTMLElement;
              if (target.closest('.ant-dropdown-trigger') || target.closest('.ant-dropdown')) {
                return;
              }
              router.push(`/inventory/quality-control/${record.id}`);
            },
            className: 'cursor-pointer hover:bg-slate-50',
          })}
          locale={{
            emptyText: <TableEmptyState
              icon={ClipboardDocumentCheckIcon}
              title="Kalite kontrolu bulunamadi"
              description="Henuz kalite kontrolu eklenmemis veya filtrelere uygun kayit yok."
            />
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

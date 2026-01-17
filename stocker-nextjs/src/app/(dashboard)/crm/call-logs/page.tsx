'use client';

import { ProtectedRoute } from '@/components/auth';

/**
 * Call Logs List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Spin, Button, Space, Dropdown } from 'antd';
import {
  ArrowDownIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  PlusIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { PhoneIcon as PhoneIconSolid } from '@heroicons/react/24/solid';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { CallLogDto } from '@/lib/api/services/crm.types';
import { CallDirection, CallOutcome } from '@/lib/api/services/crm.types';
import { useCallLogs, useDeleteCallLog } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const directionLabels: Record<CallDirection, string> = {
  [CallDirection.Inbound]: 'Gelen',
  [CallDirection.Outbound]: 'Giden',
  [CallDirection.Internal]: 'Dahili',
};

const outcomeLabels: Record<CallOutcome, string> = {
  [CallOutcome.Successful]: 'Basarili',
  [CallOutcome.LeftVoicemail]: 'Sesli Mesaj',
  [CallOutcome.NoAnswer]: 'Cevapsiz',
  [CallOutcome.Busy]: 'Mesgul',
  [CallOutcome.WrongNumber]: 'Yanlis Numara',
  [CallOutcome.CallbackRequested]: 'Geri Arama Istendi',
  [CallOutcome.NotInterested]: 'Ilgilenmedi',
  [CallOutcome.InformationProvided]: 'Bilgi Verildi',
  [CallOutcome.AppointmentScheduled]: 'Randevu Alindi',
  [CallOutcome.SaleMade]: 'Satis Yapildi',
  [CallOutcome.ComplaintReceived]: 'Sikayet Alindi',
  [CallOutcome.IssueResolved]: 'Sorun Cozuldu',
  [CallOutcome.Abandoned]: 'Iptal Edildi',
  [CallOutcome.Transferred]: 'Transfer Edildi',
};

const getDirectionStyle = (direction: CallDirection): string => {
  switch (direction) {
    case CallDirection.Inbound:
      return 'bg-slate-700 text-white';
    case CallDirection.Outbound:
      return 'bg-slate-900 text-white';
    default:
      return 'bg-slate-400 text-white';
  }
};

const getOutcomeStyle = (outcome: CallOutcome): string => {
  switch (outcome) {
    case CallOutcome.Successful:
    case CallOutcome.SaleMade:
    case CallOutcome.IssueResolved:
    case CallOutcome.AppointmentScheduled:
      return 'bg-slate-900 text-white';
    case CallOutcome.NoAnswer:
    case CallOutcome.Busy:
    case CallOutcome.NotInterested:
      return 'bg-slate-400 text-white';
    default:
      return 'bg-slate-200 text-slate-600';
  }
};

function CallLogsPageContent() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [directionFilter, setDirectionFilter] = useState<CallDirection | undefined>();

  // API Hooks
  const { data, isLoading, refetch } = useCallLogs({
    page: currentPage,
    pageSize,
    direction: directionFilter,
  });
  const deleteCallLog = useDeleteCallLog();

  // Backend returns { callLogs: CallLogDto[], totalCount: number }
  const callLogs = data?.callLogs || [];
  const totalCount = data?.totalCount || 0;

  // Stats calculation
  const stats = useMemo(() => ({
    total: callLogs.length,
    inbound: callLogs.filter(log => log.direction === CallDirection.Inbound).length,
    outbound: callLogs.filter(log => log.direction === CallDirection.Outbound).length,
    successful: callLogs.filter(log => log.outcome === CallOutcome.Successful).length,
  }), [callLogs]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/call-logs/new');
  };

  const handleView = (id: string) => {
    router.push(`/crm/call-logs/${id}`);
  };

  const handleDelete = async (id: string, callLog: CallLogDto) => {
    const confirmed = await confirmDelete(
      'Arama Kaydi',
      `${callLog.callerNumber} -> ${callLog.calledNumber}`
    );

    if (confirmed) {
      try {
        await deleteCallLog.mutateAsync(id);
        showDeleteSuccess('arama kaydi');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const columns: ColumnsType<CallLogDto> = [
    {
      title: 'Yon',
      dataIndex: 'direction',
      key: 'direction',
      width: 100,
      render: (direction: CallDirection) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getDirectionStyle(direction)}`}>
          {directionLabels[direction] || direction}
        </span>
      ),
    },
    {
      title: 'Arayan',
      dataIndex: 'callerNumber',
      key: 'callerNumber',
      render: (text: string) => (
        <span className="text-sm font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Aranan',
      dataIndex: 'calledNumber',
      key: 'calledNumber',
      render: (text: string) => (
        <span className="text-sm font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Musteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => (
        <span className="text-sm text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'Sure',
      dataIndex: 'durationSeconds',
      key: 'durationSeconds',
      width: 100,
      render: (durationSeconds: number) => (
        <span className="text-sm text-slate-600 font-mono">{formatDuration(durationSeconds)}</span>
      ),
    },
    {
      title: 'Sonuc',
      dataIndex: 'outcome',
      key: 'outcome',
      width: 140,
      render: (outcome: CallOutcome) => {
        if (!outcome) return <span className="text-slate-400">-</span>;
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getOutcomeStyle(outcome)}`}>
            {outcomeLabels[outcome] || outcome}
          </span>
        );
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (date: string) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-'}
        </span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_: unknown, record: CallLogDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Goruntule',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => handleView(record.id),
              },
              { type: 'divider' as const },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDelete(record.id, record),
              },
            ],
          }}
          trigger={['click']}
        >
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5" />
          </button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <PhoneIcon className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Arama Kayitlari</h1>
            <p className="text-sm text-slate-500">Telefon gorusmelerini takip edin</p>
          </div>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
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
            Yeni Arama
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <PhoneIconSolid className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Arama</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowDownIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.inbound}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Gelen</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowUpIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.outbound}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Giden</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.successful}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Basarili</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Numara ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 240 }}
            allowClear
            className="!rounded-lg !border-slate-300"
          />
          <Select
            placeholder="Yon"
            value={directionFilter}
            onChange={setDirectionFilter}
            style={{ width: 130 }}
            allowClear
            options={[
              { value: CallDirection.Inbound, label: 'Gelen' },
              { value: CallDirection.Outbound, label: 'Giden' },
            ]}
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={callLogs}
            rowKey="id"
            loading={deleteCallLog.isPending}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayit`,
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}


export default function CallLogsPage() {
  return (
    <ProtectedRoute permission="CRM.CallLogs:View">
      <CallLogsPageContent />
    </ProtectedRoute>
  );
}

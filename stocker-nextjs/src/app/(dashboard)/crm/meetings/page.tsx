'use client';

/**
 * Meetings List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Input, Select, Spin, Button, Space, Dropdown, Tooltip } from 'antd';
import {
  PlusIcon,
  ArrowPathIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  showSuccess,
  confirmDelete,
  confirmAction,
} from '@/lib/utils/sweetalert';
import type { MeetingDto } from '@/lib/api/services/crm.types';
import { MeetingStatus, MeetingType, MeetingPriority } from '@/lib/api/services/crm.types';
import { useMeetings, useDeleteMeeting } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusLabels: Record<MeetingStatus, { label: string }> = {
  [MeetingStatus.Scheduled]: { label: 'Planlandi' },
  [MeetingStatus.Confirmed]: { label: 'Onaylandi' },
  [MeetingStatus.InProgress]: { label: 'Devam Ediyor' },
  [MeetingStatus.Completed]: { label: 'Tamamlandi' },
  [MeetingStatus.Cancelled]: { label: 'Iptal Edildi' },
  [MeetingStatus.Rescheduled]: { label: 'Yeniden Planlandi' },
  [MeetingStatus.NoShow]: { label: 'Katilim Yok' },
};

const typeLabels: Record<MeetingType, string> = {
  [MeetingType.General]: 'Genel',
  [MeetingType.Sales]: 'Satis',
  [MeetingType.Demo]: 'Demo',
  [MeetingType.Presentation]: 'Sunum',
  [MeetingType.Negotiation]: 'Muzakere',
  [MeetingType.Contract]: 'Sozlesme',
  [MeetingType.Kickoff]: 'Baslangic',
  [MeetingType.Review]: 'Inceleme',
  [MeetingType.Planning]: 'Planlama',
  [MeetingType.Training]: 'Egitim',
  [MeetingType.Workshop]: 'Workshop',
  [MeetingType.Webinar]: 'Webinar',
  [MeetingType.Conference]: 'Konferans',
  [MeetingType.OneOnOne]: 'Birebir',
  [MeetingType.TeamMeeting]: 'Ekip Toplantisi',
  [MeetingType.BusinessLunch]: 'Is Yemegi',
  [MeetingType.SiteVisit]: 'Saha Ziyareti',
};

const priorityLabels: Record<MeetingPriority, string> = {
  [MeetingPriority.Low]: 'Dusuk',
  [MeetingPriority.Normal]: 'Normal',
  [MeetingPriority.High]: 'Yuksek',
  [MeetingPriority.Urgent]: 'Acil',
};

const getStatusStyle = (status: MeetingStatus): string => {
  switch (status) {
    case MeetingStatus.Completed:
      return 'bg-slate-900 text-white';
    case MeetingStatus.InProgress:
      return 'bg-slate-700 text-white';
    case MeetingStatus.Scheduled:
    case MeetingStatus.Confirmed:
      return 'bg-slate-500 text-white';
    case MeetingStatus.Cancelled:
    case MeetingStatus.NoShow:
      return 'bg-slate-300 text-slate-700';
    default:
      return 'bg-slate-200 text-slate-600';
  }
};

const getPriorityStyle = (priority: MeetingPriority): string => {
  switch (priority) {
    case MeetingPriority.Urgent:
      return 'bg-slate-900 text-white';
    case MeetingPriority.High:
      return 'bg-slate-700 text-white';
    case MeetingPriority.Normal:
      return 'bg-slate-400 text-white';
    default:
      return 'bg-slate-200 text-slate-600';
  }
};

export default function MeetingsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<MeetingStatus | undefined>();
  const [typeFilter, setTypeFilter] = useState<MeetingType | undefined>();

  // API Hooks
  const { data, isLoading, refetch } = useMeetings({
    page: currentPage,
    pageSize,
    status: statusFilter,
    meetingType: typeFilter,
  });
  const deleteMeeting = useDeleteMeeting();

  const meetings = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Stats calculation
  const stats = useMemo(() => {
    const today = dayjs().startOf('day');
    return {
      total: meetings.length,
      scheduled: meetings.filter(m => m.status === MeetingStatus.Scheduled || m.status === MeetingStatus.Confirmed).length,
      completed: meetings.filter(m => m.status === MeetingStatus.Completed).length,
      today: meetings.filter(m => {
        const meetingDate = dayjs(m.startTime).startOf('day');
        return meetingDate.isSame(today);
      }).length,
    };
  }, [meetings]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/meetings/new');
  };

  const handleView = (id: string) => {
    router.push(`/crm/meetings/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/crm/meetings/${id}/edit`);
  };

  const handleComplete = async (id: string, meeting: MeetingDto) => {
    const confirmed = await confirmAction(
      'Toplantiyi Tamamla',
      `"${meeting.title}" toplantisini tamamlandi olarak isaretlemek istediginize emin misiniz?`,
      'Evet, Tamamla',
      'success'
    );

    if (confirmed) {
      try {
        showSuccess('Toplanti basariyla tamamlandi');
        refetch();
      } catch (error) {
        showError('Islem basarisiz');
      }
    }
  };

  const handleCancel = async (id: string, meeting: MeetingDto) => {
    const confirmed = await confirmAction(
      'Toplantiyi Iptal Et',
      `"${meeting.title}" toplantisini iptal etmek istediginize emin misiniz?`,
      'Evet, Iptal Et',
      'warning'
    );

    if (confirmed) {
      try {
        showSuccess('Toplanti basariyla iptal edildi');
        refetch();
      } catch (error) {
        showError('Islem basarisiz');
      }
    }
  };

  const handleDelete = async (id: string, meeting: MeetingDto) => {
    const confirmed = await confirmDelete('Toplanti', meeting.title);

    if (confirmed) {
      try {
        await deleteMeeting.mutateAsync(id);
        showDeleteSuccess('toplanti');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const columns: ColumnsType<MeetingDto> = [
    {
      title: 'Baslik',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <span className="text-sm font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'meetingType',
      key: 'meetingType',
      width: 130,
      render: (type: MeetingType) => (
        <span className="text-sm text-slate-600">{typeLabels[type] || type}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: MeetingStatus) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusStyle(status)}`}>
          {statusLabels[status]?.label || status}
        </span>
      ),
    },
    {
      title: 'Oncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: MeetingPriority) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getPriorityStyle(priority)}`}>
          {priorityLabels[priority] || priority}
        </span>
      ),
    },
    {
      title: 'Baslangic',
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
      title: 'Bitis',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (date: string) => (
        <span className="text-sm text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-'}
        </span>
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
      title: '',
      key: 'actions',
      width: 80,
      align: 'right',
      render: (_: unknown, record: MeetingDto) => {
        const isCompleted = record.status === MeetingStatus.Completed;
        const isCancelled = record.status === MeetingStatus.Cancelled;
        const canComplete = !isCompleted && !isCancelled;
        const canCancel = !isCompleted && !isCancelled;

        return (
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'Goruntule',
                  icon: <EyeIcon className="w-4 h-4" />,
                  onClick: () => handleView(record.id),
                },
                {
                  key: 'edit',
                  label: 'Duzenle',
                  icon: <PencilIcon className="w-4 h-4" />,
                  onClick: () => handleEdit(record.id),
                },
                { type: 'divider' as const },
                ...(canComplete ? [{
                  key: 'complete',
                  label: 'Tamamla',
                  icon: <CheckCircleIcon className="w-4 h-4" />,
                  onClick: () => handleComplete(record.id, record),
                }] : []),
                ...(canCancel ? [{
                  key: 'cancel',
                  label: 'Iptal Et',
                  icon: <XCircleIcon className="w-4 h-4" />,
                  onClick: () => handleCancel(record.id, record),
                }] : []),
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
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <CalendarIcon className="w-7 h-7 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Toplantilar</h1>
            <p className="text-sm text-slate-500">Toplantilari planlayin ve takip edin</p>
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
            Yeni Toplanti
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Toplanti</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.scheduled}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Planlandi</div>
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
              <div className="text-2xl font-bold text-slate-900">{stats.completed}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tamamlandi</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CalendarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            {isLoading ? (
              <div className="h-8 w-16 bg-slate-100 animate-pulse rounded" />
            ) : (
              <div className="text-2xl font-bold text-slate-900">{stats.today}</div>
            )}
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Bugun</div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap mb-6">
          <Input
            placeholder="Toplanti ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 280 }}
            allowClear
            className="!rounded-lg !border-slate-300"
          />
          <Select
            placeholder="Durum"
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 150 }}
            allowClear
            options={Object.entries(statusLabels).map(([key, val]) => ({
              value: key,
              label: val.label,
            }))}
          />
          <Select
            placeholder="Tip"
            value={typeFilter}
            onChange={setTypeFilter}
            style={{ width: 150 }}
            allowClear
            options={Object.entries(typeLabels).map(([key, val]) => ({
              value: key,
              label: val,
            }))}
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
            dataSource={meetings}
            rowKey="id"
            loading={deleteMeeting.isPending}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} toplanti`,
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}

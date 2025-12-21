'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Table, Tag, Input, Select, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, CalendarOutlined, SearchOutlined, CheckCircleOutlined, ClockCircleOutlined, TeamOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  showSuccess,
  confirmDelete,
  confirmAction,
} from '@/lib/utils/sweetalert';
import { RowActions, createAction } from '@/components/ui/RowActions';
import type { MeetingDto } from '@/lib/api/services/crm.types';
import { MeetingStatus, MeetingType, MeetingPriority } from '@/lib/api/services/crm.types';
import { useMeetings, useDeleteMeeting } from '@/lib/api/hooks/useCRM';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const statusLabels: Record<MeetingStatus, { label: string; color: string }> = {
  [MeetingStatus.Scheduled]: { label: 'Planlandı', color: 'blue' },
  [MeetingStatus.Confirmed]: { label: 'Onaylandı', color: 'cyan' },
  [MeetingStatus.InProgress]: { label: 'Devam Ediyor', color: 'processing' },
  [MeetingStatus.Completed]: { label: 'Tamamlandı', color: 'green' },
  [MeetingStatus.Cancelled]: { label: 'İptal Edildi', color: 'red' },
  [MeetingStatus.Rescheduled]: { label: 'Yeniden Planlandı', color: 'orange' },
  [MeetingStatus.NoShow]: { label: 'Katılım Yok', color: 'default' },
};

const typeLabels: Record<MeetingType, string> = {
  [MeetingType.General]: 'Genel',
  [MeetingType.Sales]: 'Satış',
  [MeetingType.Demo]: 'Demo',
  [MeetingType.Presentation]: 'Sunum',
  [MeetingType.Negotiation]: 'Müzakere',
  [MeetingType.Contract]: 'Sözleşme',
  [MeetingType.Kickoff]: 'Başlangıç',
  [MeetingType.Review]: 'İnceleme',
  [MeetingType.Planning]: 'Planlama',
  [MeetingType.Training]: 'Eğitim',
  [MeetingType.Workshop]: 'Workshop',
  [MeetingType.Webinar]: 'Webinar',
  [MeetingType.Conference]: 'Konferans',
  [MeetingType.OneOnOne]: 'Birebir',
  [MeetingType.TeamMeeting]: 'Ekip Toplantısı',
  [MeetingType.BusinessLunch]: 'İş Yemeği',
  [MeetingType.SiteVisit]: 'Saha Ziyareti',
};

const priorityLabels: Record<MeetingPriority, { label: string; color: string }> = {
  [MeetingPriority.Low]: { label: 'Düşük', color: 'green' },
  [MeetingPriority.Normal]: { label: 'Normal', color: 'blue' },
  [MeetingPriority.High]: { label: 'Yüksek', color: 'orange' },
  [MeetingPriority.Urgent]: { label: 'Acil', color: 'red' },
};

interface MeetingsStatsProps {
  meetings: MeetingDto[];
  loading: boolean;
}

function MeetingsStats({ meetings, loading }: MeetingsStatsProps) {
  const today = dayjs().startOf('day');

  const stats = {
    total: meetings.length,
    scheduled: meetings.filter(m => m.status === MeetingStatus.Scheduled || m.status === MeetingStatus.Confirmed).length,
    completed: meetings.filter(m => m.status === MeetingStatus.Completed).length,
    today: meetings.filter(m => {
      const meetingDate = dayjs(m.startTime).startOf('day');
      return meetingDate.isSame(today);
    }).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Toplam Toplantı</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            )}
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <TeamOutlined className="text-xl text-slate-600" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Planlandı</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
            )}
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <ClockCircleOutlined className="text-xl text-blue-600" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Tamamlandı</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            )}
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <CheckCircleOutlined className="text-xl text-green-600" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Bugün</p>
            {loading ? (
              <div className="h-8 w-20 bg-slate-100 animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
            )}
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <CalendarOutlined className="text-xl text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function MeetingsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/meetings/new');
  };

  const handleEdit = (id: string) => {
    router.push(`/crm/meetings/${id}/edit`);
  };

  const handleComplete = async (id: string, meeting: MeetingDto) => {
    const confirmed = await confirmAction(
      'Toplantıyı Tamamla',
      `"${meeting.title}" toplantısını tamamlandı olarak işaretlemek istediğinize emin misiniz?`,
      'Evet, Tamamla',
      'success'
    );

    if (confirmed) {
      try {
        // TODO: API call for completing meeting
        // await completeMeeting.mutateAsync(id);
        showSuccess('Toplantı başarıyla tamamlandı');
        refetch();
      } catch (error) {
        showError('İşlem başarısız');
      }
    }
  };

  const handleCancel = async (id: string, meeting: MeetingDto) => {
    const confirmed = await confirmAction(
      'Toplantıyı İptal Et',
      `"${meeting.title}" toplantısını iptal etmek istediğinize emin misiniz?`,
      'Evet, İptal Et',
      'warning'
    );

    if (confirmed) {
      try {
        // TODO: API call for cancelling meeting
        // await cancelMeeting.mutateAsync(id);
        showSuccess('Toplantı başarıyla iptal edildi');
        refetch();
      } catch (error) {
        showError('İşlem başarısız');
      }
    }
  };

  const handleDelete = async (id: string, meeting: MeetingDto) => {
    const confirmed = await confirmDelete(
      'Toplantı',
      meeting.title
    );

    if (confirmed) {
      try {
        await deleteMeeting.mutateAsync(id);
        showDeleteSuccess('toplantı');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const columns: ColumnsType<MeetingDto> = [
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <span className="font-medium text-slate-900">{text}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'meetingType',
      key: 'meetingType',
      width: 130,
      render: (type: MeetingType) => (
        <span className="text-slate-600">{typeLabels[type] || type}</span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: MeetingStatus) => {
        const info = statusLabels[status];
        return <Tag color={info?.color}>{info?.label || status}</Tag>;
      },
    },
    {
      title: 'Öncelik',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: MeetingPriority) => {
        const info = priorityLabels[priority];
        return <Tag color={info?.color}>{info?.label || priority}</Tag>;
      },
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (date: string) => (
        <span className="text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-'}
        </span>
      ),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (date: string) => (
        <span className="text-slate-600">
          {date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-'}
        </span>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => (
        <span className="text-slate-600">{text || '-'}</span>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_: unknown, record: MeetingDto) => {
        // Durum bazlı eylem görünürlüğü
        const isCompleted = record.status === MeetingStatus.Completed;
        const isCancelled = record.status === MeetingStatus.Cancelled;
        const canComplete = !isCompleted && !isCancelled;
        const canCancel = !isCompleted && !isCancelled;

        return (
          <RowActions
            id={record.id}
            quickActions={[
              createAction.edit(() => handleEdit(record.id)),
            ]}
            menuActions={[
              createAction.complete(
                () => handleComplete(record.id, record),
                {
                  visible: canComplete,
                  disabled: isCompleted,
                  disabledReason: 'Bu toplantı zaten tamamlandı',
                }
              ),
              createAction.cancel(
                () => handleCancel(record.id, record),
                {
                  visible: canCancel,
                  disabled: isCancelled,
                  disabledReason: 'Bu toplantı zaten iptal edildi',
                }
              ),
              createAction.delete(() => handleDelete(record.id, record)),
            ]}
          />
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <MeetingsStats meetings={meetings} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<CalendarOutlined />}
        iconColor="#0f172a"
        title="Toplantılar"
        description="Toplantıları planlayın ve takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Toplantı',
          onClick: handleCreate,
          icon: <PlusOutlined />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            placeholder="Toplantı ara..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            allowClear
          />
          <Select
            placeholder="Durum"
            value={statusFilter}
            onChange={setStatusFilter}
            className="w-40"
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
            className="w-40"
            allowClear
            options={Object.entries(typeLabels).map(([key, val]) => ({
              value: key,
              label: val,
            }))}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
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
              showTotal: (total) => `Toplam ${total} kayıt`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

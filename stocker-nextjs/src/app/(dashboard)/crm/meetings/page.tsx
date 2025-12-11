'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography, Table, Tag, Input, Select } from 'antd';
import { PlusOutlined, ReloadOutlined, CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { MeetingDto } from '@/lib/api/services/crm.types';
import { MeetingStatus, MeetingType, MeetingPriority } from '@/lib/api/services/crm.types';
import { useMeetings, useDeleteMeeting } from '@/lib/api/hooks/useCRM';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;

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
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'meetingType',
      key: 'meetingType',
      width: 130,
      render: (type: MeetingType) => typeLabels[type] || type,
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
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-',
    },
    {
      title: 'Bitiş',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 150,
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-',
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => text || '-',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: MeetingDto) => (
        <Space>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleDelete(record.id, record)}
          >
            Sil
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="!mb-0">
          <CalendarOutlined className="mr-2" />
          Toplantılar
        </Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Yeni Toplantı
          </Button>
        </Space>
      </div>

      {/* Filters & Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Toplantı ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
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
          </Space>

          <Table
            columns={columns}
            dataSource={meetings}
            rowKey="id"
            loading={isLoading || deleteMeeting.isPending}
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
        </Space>
      </AnimatedCard>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Typography, Table, Tag, Input, Select, DatePicker } from 'antd';
import { PlusOutlined, ReloadOutlined, PhoneOutlined, SearchOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { CallLogDto } from '@/lib/api/services/crm.types';
import { CallDirection, CallOutcome } from '@/lib/api/services/crm.types';
import { useCallLogs, useDeleteCallLog } from '@/lib/api/hooks/useCRM';
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const directionLabels: Record<CallDirection, { label: string; color: string }> = {
  [CallDirection.Inbound]: { label: 'Gelen', color: 'blue' },
  [CallDirection.Outbound]: { label: 'Giden', color: 'green' },
  [CallDirection.Internal]: { label: 'Dahili', color: 'purple' },
};

const outcomeLabels: Record<CallOutcome, { label: string; color: string }> = {
  [CallOutcome.Successful]: { label: 'Başarılı', color: 'green' },
  [CallOutcome.LeftVoicemail]: { label: 'Sesli Mesaj', color: 'purple' },
  [CallOutcome.NoAnswer]: { label: 'Cevapsız', color: 'orange' },
  [CallOutcome.Busy]: { label: 'Meşgul', color: 'red' },
  [CallOutcome.WrongNumber]: { label: 'Yanlış Numara', color: 'red' },
  [CallOutcome.CallbackRequested]: { label: 'Geri Arama İstendi', color: 'blue' },
  [CallOutcome.NotInterested]: { label: 'İlgilenmedi', color: 'default' },
  [CallOutcome.InformationProvided]: { label: 'Bilgi Verildi', color: 'cyan' },
  [CallOutcome.AppointmentScheduled]: { label: 'Randevu Alındı', color: 'green' },
  [CallOutcome.SaleMade]: { label: 'Satış Yapıldı', color: 'gold' },
  [CallOutcome.ComplaintReceived]: { label: 'Şikayet Alındı', color: 'volcano' },
  [CallOutcome.IssueResolved]: { label: 'Sorun Çözüldü', color: 'lime' },
  [CallOutcome.Abandoned]: { label: 'İptal Edildi', color: 'default' },
  [CallOutcome.Transferred]: { label: 'Transfer Edildi', color: 'geekblue' },
};

export default function CallLogsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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

  const callLogs = data || [];
  const totalCount = callLogs.length;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/call-logs/new');
  };

  const handleDelete = async (id: string, callLog: CallLogDto) => {
    const confirmed = await confirmDelete(
      'Arama Kaydı',
      `${callLog.callerNumber} → ${callLog.calledNumber}`
    );

    if (confirmed) {
      try {
        await deleteCallLog.mutateAsync(id);
        showDeleteSuccess('arama kaydı');
      } catch (error) {
        showError('Silme işlemi başarısız');
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
      title: 'Yön',
      dataIndex: 'direction',
      key: 'direction',
      width: 100,
      render: (direction: CallDirection) => {
        const info = directionLabels[direction];
        return <Tag color={info?.color}>{info?.label || direction}</Tag>;
      },
    },
    {
      title: 'Arayan',
      dataIndex: 'callerNumber',
      key: 'callerNumber',
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Aranan',
      dataIndex: 'calledNumber',
      key: 'calledNumber',
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: 'Müşteri',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text: string) => text || '-',
    },
    {
      title: 'Süre',
      dataIndex: 'durationSeconds',
      key: 'durationSeconds',
      width: 100,
      render: (durationSeconds: number) => formatDuration(durationSeconds),
    },
    {
      title: 'Sonuç',
      dataIndex: 'outcome',
      key: 'outcome',
      width: 120,
      render: (outcome: CallOutcome) => {
        if (!outcome) return '-';
        const info = outcomeLabels[outcome];
        return <Tag color={info?.color}>{info?.label || outcome}</Tag>;
      },
    },
    {
      title: 'Tarih',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 150,
      render: (date: string) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '-',
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 100,
      render: (_: unknown, record: CallLogDto) => (
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
          <PhoneOutlined className="mr-2" />
          Arama Kayıtları
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
            Yeni Arama Kaydı
          </Button>
        </Space>
      </div>

      {/* Filters & Table */}
      <AnimatedCard>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space wrap>
            <Input
              placeholder="Numara ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              placeholder="Yön"
              value={directionFilter}
              onChange={setDirectionFilter}
              style={{ width: 120 }}
              allowClear
              options={[
                { value: CallDirection.Inbound, label: 'Gelen' },
                { value: CallDirection.Outbound, label: 'Giden' },
              ]}
            />
          </Space>

          <Table
            columns={columns}
            dataSource={callLogs}
            rowKey="id"
            loading={isLoading || deleteCallLog.isPending}
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

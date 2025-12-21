'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Space, Table, Tag, Input, Select, Spin } from 'antd';
import { PlusOutlined, ReloadOutlined, PhoneOutlined, SearchOutlined, ArrowDownOutlined, ArrowUpOutlined, CheckCircleOutlined, PhoneFilled, EyeOutlined } from '@ant-design/icons';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { CallLogDto } from '@/lib/api/services/crm.types';
import { CallDirection, CallOutcome } from '@/lib/api/services/crm.types';
import { useCallLogs, useDeleteCallLog } from '@/lib/api/hooks/useCRM';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/ui/enterprise-page';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

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

interface CallLogsStatsProps {
  callLogs: CallLogDto[];
  loading: boolean;
}

function CallLogsStats({ callLogs, loading }: CallLogsStatsProps) {
  const totalCalls = callLogs.length;
  const inboundCalls = callLogs.filter(log => log.direction === CallDirection.Inbound).length;
  const outboundCalls = callLogs.filter(log => log.direction === CallDirection.Outbound).length;
  const successfulCalls = callLogs.filter(log => log.outcome === CallOutcome.Successful).length;

  const stats = [
    {
      title: 'Toplam Arama',
      value: totalCalls,
      icon: <PhoneFilled className="text-2xl" />,
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
    {
      title: 'Gelen',
      value: inboundCalls,
      icon: <ArrowDownOutlined className="text-2xl" />,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Giden',
      value: outboundCalls,
      icon: <ArrowUpOutlined className="text-2xl" />,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Başarılı',
      value: successfulCalls,
      icon: <CheckCircleOutlined className="text-2xl" />,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded animate-pulse mb-2 w-24"></div>
                <div className="h-8 bg-slate-200 rounded animate-pulse w-16"></div>
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-lg animate-pulse"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center ${stat.iconColor}`}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

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

  // Backend returns { callLogs: CallLogDto[], totalCount: number }
  const callLogs = data?.callLogs || [];
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
      width: 150,
      render: (_: unknown, record: CallLogDto) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/crm/call-logs/${record.id}`)}
            className="text-blue-600 hover:text-blue-700"
          >
            Görüntüle
          </Button>
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
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <CallLogsStats callLogs={callLogs} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<PhoneOutlined />}
        iconColor="#0f172a"
        title="Arama Kayıtları"
        description="Telefon görüşmelerini takip edin"
        itemCount={totalCount}
        primaryAction={{
          label: 'Yeni Arama',
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
        <div className="flex items-center gap-4">
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
              showTotal: (total) => `Toplam ${total} kayıt`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

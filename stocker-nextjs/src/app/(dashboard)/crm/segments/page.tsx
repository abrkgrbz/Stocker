'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Space, Tag, Modal, message, Avatar, Dropdown, Empty, Input } from 'antd';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  UserIcon,
  ArrowPathIcon,
  BuildingOffice2Icon,
  EllipsisVerticalIcon,
  DocumentDuplicateIcon,
  EnvelopeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import type { CustomerSegment } from '@/lib/api/services/crm.service';
import { useCustomerSegments, useDeleteCustomerSegment, useCreateCustomerSegment } from '@/lib/api/hooks/useCRM';
import { SegmentsStats } from '@/components/crm/segments/SegmentsStats';
import { PageContainer, ListPageHeader, Card, DataTableWrapper } from '@/components/patterns';
import { Spinner } from '@/components/primitives';

const segmentTypeLabels: Record<string, string> = {
  Static: 'Statik',
  Dynamic: 'Dinamik',
};

const segmentColors: Record<string, string> = {
  blue: '#1890ff',
  green: '#52c41a',
  red: '#ff4d4f',
  orange: '#fa8c16',
  purple: '#722ed1',
  cyan: '#13c2c2',
  magenta: '#eb2f96',
  volcano: '#fa541c',
  gold: '#faad14',
  lime: '#a0d911',
};

export default function CustomerSegmentsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: segments = [], isLoading, refetch } = useCustomerSegments();
  const deleteSegment = useDeleteCustomerSegment();
  const createSegment = useCreateCustomerSegment();

  // Filter segments based on search text
  const filteredSegments = segments.filter((segment) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      segment.name.toLowerCase().includes(searchLower) ||
      segment.description?.toLowerCase().includes(searchLower) ||
      segmentTypeLabels[segment.type]?.toLowerCase().includes(searchLower)
    );
  });

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Segment Sil',
      content: 'Bu segmenti silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteSegment.mutateAsync(id);
        } catch (error: any) {
          const apiError = error.response?.data;
          const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Silme işlemi başarısız';
          message.error(errorMessage);
        }
      },
    });
  };

  const handleEdit = (segment: CustomerSegment) => {
    router.push(`/crm/segments/${segment.id}/edit`);
  };

  const handleCreate = () => {
    router.push('/crm/segments/new');
  };

  const handleClone = async (segment: CustomerSegment) => {
    try {
      const clonedData = {
        name: `${segment.name} (Kopya)`,
        description: segment.description,
        type: segment.type,
        color: segment.color,
        isActive: false, // Cloned segments start as inactive
      };
      await createSegment.mutateAsync(clonedData as any);
      message.success('Segment başarıyla kopyalandı');
    } catch (error: any) {
      const apiError = error.response?.data;
      const errorMessage = apiError?.detail || apiError?.errors?.[0]?.message || apiError?.title || error.message || 'Kopyalama işlemi başarısız';
      message.error(errorMessage);
    }
  };

  const handleExport = async (segment: CustomerSegment) => {
    try {
      const response = await fetch(`/api/crm/CustomerSegments/${segment.id}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch?.[1] || `${segment.name}_members.csv`;

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      message.success(`${segment.name} üyeleri başarıyla dışa aktarıldı`);
    } catch (error: any) {
      message.error('CSV export işlemi başarısız oldu');
      console.error('Export error:', error);
    }
  };

  const handleSendCampaign = (segment: CustomerSegment) => {
    // Navigate to campaign creation with pre-selected segment
    // Note: Campaign modal needs to be updated to accept targetSegmentId parameter
    router.push(`/crm/campaigns?createNew=true&targetSegmentId=${segment.id}&targetSegmentName=${encodeURIComponent(segment.name)}`);
    message.success(`Kampanya oluşturma sayfasına yönlendiriliyorsunuz: ${segment.name}`);
  };

  const columns: ColumnsType<CustomerSegment> = [
    {
      title: 'Segment',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${record.color || '#1890ff'}, ${record.color || '#1890ff'}dd)`,
            }}
            icon={<BuildingOffice2Icon className="w-5 h-5" />}
          >
            {text.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 truncate">{text}</div>
            {record.description && (
              <div className="text-xs text-slate-500 truncate">{record.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => (
        <Tag color={type === 'Dynamic' ? 'processing' : 'default'}>
          {segmentTypeLabels[type] || type}
        </Tag>
      ),
    },
    {
      title: 'Üye Sayısı',
      dataIndex: 'memberCount',
      key: 'memberCount',
      width: 120,
      align: 'center',
      render: (count) => (
        <Tag icon={<UserIcon className="w-4 h-4" />} color="blue">
          {count || 0}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive) =>
        isActive ? (
          <Tag icon={<CheckCircleIcon className="w-4 h-4" />} color="success">
            Aktif
          </Tag>
        ) : (
          <Tag icon={<XCircleIcon className="w-4 h-4" />} color="default">
            Pasif
          </Tag>
        ),
    },
    {
      title: 'Oluşturma Tarihi',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('tr-TR'),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'Görüntüle',
                icon: <EyeIcon className="w-4 h-4" />,
                onClick: () => router.push(`/crm/segments/${record.id}`),
              },
              {
                key: 'edit',
                label: 'Düzenle',
                icon: <PencilIcon className="w-4 h-4" />,
                onClick: () => handleEdit(record),
              },
              {
                key: 'clone',
                label: 'Kopyala',
                icon: <DocumentDuplicateIcon className="w-4 h-4" />,
                onClick: () => handleClone(record),
                disabled: createSegment.isPending,
              },
              { type: 'divider' as const },
              {
                key: 'export',
                label: 'Üyeleri Dışa Aktar (.csv)',
                icon: <ArrowDownTrayIcon className="w-4 h-4" />,
                onClick: () => handleExport(record),
              },
              {
                key: 'campaign',
                label: 'Bu Segmente Kampanya Gönder',
                icon: <EnvelopeIcon className="w-4 h-4" />,
                onClick: () => handleSendCampaign(record),
              },
              { type: 'divider' as const },
              {
                key: 'delete',
                label: 'Sil',
                icon: <TrashIcon className="w-4 h-4" />,
                danger: true,
                onClick: () => handleDelete(record.id),
                disabled: deleteSegment.isPending,
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisVerticalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="mb-8">
        <SegmentsStats segments={segments} loading={isLoading} />
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<UserGroupIcon className="w-5 h-5" />}
        iconColor="#0f172a"
        title="Müşteri Segmentleri"
        description="Müşteri segmentlerinizi yönetin"
        itemCount={filteredSegments.length}
        primaryAction={{
          label: 'Yeni Segment',
          onClick: handleCreate,
          icon: <PlusIcon className="w-5 h-5" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Segment ara..."
          prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          className="max-w-md !bg-slate-50 hover:!bg-slate-50 focus-within:!bg-white focus-within:!ring-2 focus-within:!ring-slate-900 focus-within:!border-transparent transition-all"
        />
      </div>

      {/* Segments Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredSegments}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} segment`,
            }}
            locale={{
              emptyText: searchText ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Sonuç bulunamadı
                      </div>
                      <div className="text-sm text-slate-500">
                        &quot;{searchText}&quot; ile eşleşen segment bulunamadı
                      </div>
                    </div>
                  }
                />
              ) : (
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-2xl font-bold text-slate-800 mb-4">
                        Müşterilerinizi Anlamlı Gruplara Ayırın
                      </div>
                      <div className="text-base text-slate-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                        Müşteri Segmentleri, doğru kişilere doğru mesajı göndermenizi sağlar.
                        &apos;İstanbul&apos;daki VIP Müşteriler&apos; veya &apos;Son 6 ayda alışveriş yapmayanlar&apos;
                        gibi dinamik segmentler oluşturun.
                      </div>
                      <button
                        onClick={handleCreate}
                        className="h-12 px-8 text-base font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                      >
                        <PlusIcon className="w-5 h-5" />
                        İlk Segmentini Oluştur
                      </button>
                    </div>
                  }
                />
              ),
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

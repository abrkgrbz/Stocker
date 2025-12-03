'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Modal, message, Avatar, Dropdown, Empty } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  UserOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  MoreOutlined,
  CopyOutlined,
  MailOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CustomerSegment } from '@/lib/api/services/crm.service';
import { useCustomerSegments, useDeleteCustomerSegment, useCreateCustomerSegment } from '@/lib/api/hooks/useCRM';
import { SegmentsStats } from '@/components/crm/segments/SegmentsStats';

const { Title } = Typography;

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

  // API Hooks
  const { data: segments = [], isLoading, refetch } = useCustomerSegments();
  const deleteSegment = useDeleteCustomerSegment();
  const createSegment = useCreateCustomerSegment();

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
            icon={<ApartmentOutlined />}
          >
            {text.charAt(0)}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-gray-900 truncate">{text}</div>
            {record.description && (
              <div className="text-xs text-gray-500 truncate">{record.description}</div>
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
        <Tag icon={<UserOutlined />} color="blue">
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
          <Tag icon={<CheckCircleOutlined />} color="success">
            Aktif
          </Tag>
        ) : (
          <Tag icon={<CloseCircleOutlined />} color="default">
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
                key: 'edit',
                label: 'Düzenle',
                icon: <EditOutlined />,
                onClick: () => handleEdit(record),
              },
              {
                key: 'clone',
                label: 'Kopyala',
                icon: <CopyOutlined />,
                onClick: () => handleClone(record),
                disabled: createSegment.isPending,
              },
              { type: 'divider' as const },
              {
                key: 'export',
                label: 'Üyeleri Dışa Aktar (.csv)',
                icon: <DownloadOutlined />,
                onClick: () => handleExport(record),
              },
              {
                key: 'campaign',
                label: 'Bu Segmente Kampanya Gönder',
                icon: <MailOutlined />,
                onClick: () => handleSendCampaign(record),
              },
              { type: 'divider' as const },
              {
                key: 'delete',
                label: 'Sil',
                icon: <DeleteOutlined />,
                danger: true,
                onClick: () => handleDelete(record.id),
                disabled: deleteSegment.isPending,
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];


  return (
    <div className="p-6">
      {/* Header */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <div className="flex justify-between items-center">
            <Title level={2} className="!mb-0">
              <TeamOutlined className="mr-2" />
              Müşteri Segmentleri
            </Title>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
                Yenile
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                Yeni Segment
              </Button>
            </Space>
          </div>
        </Col>
      </Row>

      {/* Statistics */}
      <div className="mb-6">
        <SegmentsStats segments={segments} loading={isLoading} />
      </div>

      {/* Segments Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={segments}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} segment`,
          }}
          locale={{
            emptyText: (
              <Empty
                image={<TeamOutlined style={{ fontSize: 80, color: '#d9d9d9' }} />}
                imageStyle={{ height: 100 }}
                description={
                  <div className="py-8">
                    <div className="text-2xl font-bold text-gray-800 mb-4">
                      Müşterilerinizi Anlamlı Gruplara Ayırın
                    </div>
                    <div className="text-base text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
                      Müşteri Segmentleri, doğru kişilere doğru mesajı göndermenizi sağlar.
                      &apos;İstanbul&apos;daki VIP Müşteriler&apos; veya &apos;Son 6 ayda alışveriş yapmayanlar&apos;
                      gibi dinamik segmentler oluşturun.
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={handleCreate}
                      className="h-12 px-8 text-base font-semibold"
                    >
                      İlk Segmentini Oluştur
                    </Button>
                  </div>
                }
              />
            ),
          }}
        />
      </Card>

    </div>
  );
}

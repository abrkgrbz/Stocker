'use client';

import React, { useState } from 'react';
import { Card, Button, Table, Space, Tag, Typography, Row, Col, Modal, message, Avatar, Dropdown } from 'antd';
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
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { CustomerSegment } from '@/lib/api/services/crm.service';
import { useCustomerSegments, useDeleteCustomerSegment } from '@/hooks/useCRM';
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
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null);

  // API Hooks
  const { data: segments = [], isLoading, refetch } = useCustomerSegments();
  const deleteSegment = useDeleteCustomerSegment();

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
        } catch (error) {
          message.error('Silme işlemi başarısız');
        }
      },
    });
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
                onClick: () => {
                  // TODO: Implement edit
                },
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

  // Calculate statistics
  const stats = {
    total: segments.length,
    active: segments.filter((s) => s.isActive).length,
    totalMembers: segments.reduce((sum, s) => sum + (s.memberCount || 0), 0),
    dynamic: segments.filter((s) => s.type === 'Dynamic').length,
  };

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
              <Button type="primary" icon={<PlusOutlined />}>
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
        />
      </Card>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Card,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Dropdown,
  Modal,
  Select,
  Rate,
} from 'antd';
import {
  PlusOutlined,
  TrophyOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePerformanceReviews, useDeletePerformanceReview, useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceReviewDto, PerformanceReviewFilterDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function PerformancePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<PerformanceReviewFilterDto>({});

  // API Hooks
  const { data: reviews = [], isLoading } = usePerformanceReviews(filters);
  const { data: employees = [] } = useEmployees();
  const deleteReview = useDeletePerformanceReview();

  // Stats
  const totalReviews = reviews.length;
  const avgScore = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.overallScore || 0), 0) / reviews.length).toFixed(1)
    : 0;
  const pendingReviews = reviews.filter((r) => r.status === 'Draft' || r.status === 'InProgress').length;
  const completedReviews = reviews.filter((r) => r.status === 'Completed').length;

  const handleDelete = (review: PerformanceReviewDto) => {
    Modal.confirm({
      title: 'Performans Değerlendirmesini Sil',
      content: 'Bu değerlendirmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteReview.mutateAsync(review.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Draft: { color: 'default', text: 'Taslak' },
      InProgress: { color: 'blue', text: 'Devam Ediyor' },
      Completed: { color: 'green', text: 'Tamamlandı' },
      Cancelled: { color: 'red', text: 'İptal' },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-' };
  };

  const columns: ColumnsType<PerformanceReviewDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      render: (_, record: PerformanceReviewDto) => (
        <Space>
          <UserOutlined style={{ color: '#8b5cf6' }} />
          <span>{record.employeeName || `Çalışan #${record.employeeId}`}</span>
        </Space>
      ),
    },
    {
      title: 'Dönem',
      dataIndex: 'reviewPeriod',
      key: 'period',
      width: 150,
    },
    {
      title: 'Tarih',
      dataIndex: 'reviewDate',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.reviewDate).unix() - dayjs(b.reviewDate).unix(),
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Puan',
      dataIndex: 'overallScore',
      key: 'score',
      width: 150,
      render: (score: number) => (
        <Space>
          <Rate disabled value={score / 2} allowHalf style={{ fontSize: 14 }} />
          <span>({score?.toFixed(1) || '-'})</span>
        </Space>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: PerformanceReviewDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/performance/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/performance/${record.id}/edit`),
                disabled: record.status === 'Completed',
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
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
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          <TrophyOutlined className="mr-2" />
          Performans Değerlendirme
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/performance/new')}>
          Yeni Değerlendirme
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Değerlendirme"
              value={totalReviews}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Ortalama Puan"
              value={avgScore}
              prefix={<StarOutlined />}
              suffix="/ 10"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Devam Eden"
              value={pendingReviews}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tamamlanan"
              value={completedReviews}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Çalışan seçin"
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, employeeId: value }))}
              options={employees.map((e) => ({
                value: e.id,
                label: `${e.firstName} ${e.lastName}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: 'Draft', label: 'Taslak' },
                { value: 'InProgress', label: 'Devam Ediyor' },
                { value: 'Completed', label: 'Tamamlandı' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={reviews}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} değerlendirme`,
          }}
        />
      </Card>
    </div>
  );
}

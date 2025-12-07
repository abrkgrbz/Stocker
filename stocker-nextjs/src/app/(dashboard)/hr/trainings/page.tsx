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
  Input,
  Select,
} from 'antd';
import {
  PlusOutlined,
  BookOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useTrainings, useDeleteTraining } from '@/lib/api/hooks/useHR';
import type { TrainingDto } from '@/lib/api/services/hr.types';
import { TrainingStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function TrainingsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: trainings = [], isLoading } = useTrainings();
  const deleteTraining = useDeleteTraining();

  // Filter trainings by search text
  const filteredTrainings = trainings.filter(
    (t) =>
      t.title.toLowerCase().includes(searchText.toLowerCase()) ||
      t.provider?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const totalTrainings = trainings.length;
  const activeTrainings = trainings.filter((t) => t.status === TrainingStatus.InProgress || t.status === TrainingStatus.Scheduled).length;
  const upcomingTrainings = trainings.filter((t) => t.status === TrainingStatus.Scheduled).length;

  const handleDelete = (training: TrainingDto) => {
    Modal.confirm({
      title: 'Eğitimi Sil',
      content: `"${training.title}" eğitimini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteTraining.mutateAsync(training.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getStatusConfig = (status: TrainingStatus) => {
    const statusMap: Record<TrainingStatus, { color: string; text: string }> = {
      [TrainingStatus.Scheduled]: { color: 'blue', text: 'Planlandı' },
      [TrainingStatus.InProgress]: { color: 'green', text: 'Devam Ediyor' },
      [TrainingStatus.Completed]: { color: 'default', text: 'Tamamlandı' },
      [TrainingStatus.Cancelled]: { color: 'red', text: 'İptal Edildi' },
      [TrainingStatus.Postponed]: { color: 'orange', text: 'Ertelendi' },
    };
    return statusMap[status] || { color: 'default', text: '-' };
  };

  const columns: ColumnsType<TrainingDto> = [
    {
      title: 'Eğitim Adı',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (title: string, record: TrainingDto) => (
        <Space>
          <BookOutlined style={{ color: '#8b5cf6' }} />
          <a onClick={() => router.push(`/hr/trainings/${record.id}`)}>{title}</a>
        </Space>
      ),
    },
    {
      title: 'Sağlayıcı',
      dataIndex: 'provider',
      key: 'provider',
      width: 150,
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date: string) => (date ? dayjs(date).format('DD.MM.YYYY') : '-'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('DD.MM.YYYY') : '-'),
    },
    {
      title: 'Kapasite',
      dataIndex: 'maxParticipants',
      key: 'capacity',
      width: 100,
      render: (max: number, record: TrainingDto) => (
        <span>
          {record.currentParticipants || 0}/{max || '-'}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: TrainingStatus) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: TrainingDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/trainings/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/trainings/${record.id}/edit`),
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
          <BookOutlined className="mr-2" />
          Eğitim Yönetimi
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/trainings/new')}>
          Yeni Eğitim
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Eğitim"
              value={totalTrainings}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Aktif Eğitim"
              value={activeTrainings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Yaklaşan"
              value={upcomingTrainings}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Eğitim ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredTrainings}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} eğitim`,
          }}
        />
      </Card>
    </div>
  );
}

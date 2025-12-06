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
  Progress,
} from 'antd';
import {
  PlusOutlined,
  AimOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { usePerformanceGoals, useDeletePerformanceGoal, useEmployees } from '@/lib/api/hooks/useHR';
import type { PerformanceGoalDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function GoalsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<{ employeeId?: number; year?: number }>({});

  // API Hooks
  const { data: goals = [], isLoading } = usePerformanceGoals(filters.employeeId, filters.year);
  const { data: employees = [] } = useEmployees();
  const deleteGoal = useDeletePerformanceGoal();

  // Stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'Completed').length;
  const inProgressGoals = goals.filter((g) => g.status === 'InProgress').length;
  const overdueGoals = goals.filter((g) => g.isOverdue).length;

  const handleDelete = (goal: PerformanceGoalDto) => {
    Modal.confirm({
      title: 'Hedefi Sil',
      content: `"${goal.title}" hedefini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteGoal.mutateAsync(goal.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getStatusConfig = (status?: string, isOverdue?: boolean) => {
    if (isOverdue && status !== 'Completed' && status !== 'Cancelled') {
      return { color: 'red', text: 'Gecikmiş', icon: <ExclamationCircleOutlined /> };
    }
    const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
      NotStarted: { color: 'default', text: 'Başlamadı', icon: <ClockCircleOutlined /> },
      InProgress: { color: 'blue', text: 'Devam Ediyor', icon: <ClockCircleOutlined /> },
      Completed: { color: 'green', text: 'Tamamlandı', icon: <CheckCircleOutlined /> },
      Cancelled: { color: 'red', text: 'İptal', icon: <ExclamationCircleOutlined /> },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-', icon: null };
  };

  const columns: ColumnsType<PerformanceGoalDto> = [
    {
      title: 'Hedef',
      key: 'title',
      render: (_, record: PerformanceGoalDto) => (
        <div>
          <div className="font-medium">{record.title}</div>
          <div className="text-xs text-gray-500">{record.employeeName}</div>
        </div>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => category || '-',
    },
    {
      title: 'İlerleme',
      key: 'progress',
      width: 180,
      render: (_, record: PerformanceGoalDto) => (
        <div>
          <Progress
            percent={record.progressPercentage || 0}
            size="small"
            status={record.isOverdue ? 'exception' : undefined}
          />
        </div>
      ),
    },
    {
      title: 'Hedef Tarihi',
      dataIndex: 'targetDate',
      key: 'targetDate',
      width: 120,
      sorter: (a, b) => dayjs(a.targetDate).unix() - dayjs(b.targetDate).unix(),
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_, record: PerformanceGoalDto) => {
        const config = getStatusConfig(record.status, record.isOverdue);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: PerformanceGoalDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/goals/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/goals/${record.id}/edit`),
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
          <AimOutlined className="mr-2" />
          Performans Hedefleri
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/goals/new')}>
          Yeni Hedef
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Hedef"
              value={totalGoals}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Devam Eden"
              value={inProgressGoals}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Tamamlanan"
              value={completedGoals}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Gecikmiş"
              value={overdueGoals}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
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
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Yıl"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, year: value }))}
              options={[
                { value: 2024, label: '2024' },
                { value: 2025, label: '2025' },
                { value: 2026, label: '2026' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={goals}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} hedef`,
          }}
        />
      </Card>
    </div>
  );
}

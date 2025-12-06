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
} from 'antd';
import {
  PlusOutlined,
  ClockCircleOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  StopOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useShifts, useDeleteShift, useActivateShift, useDeactivateShift } from '@/lib/api/hooks/useHR';
import type { ShiftDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;

export default function ShiftsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: shifts = [], isLoading } = useShifts();
  const deleteShift = useDeleteShift();
  const activateShift = useActivateShift();
  const deactivateShift = useDeactivateShift();

  // Filter shifts by search text
  const filteredShifts = shifts.filter(
    (s) =>
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      s.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const totalShifts = shifts.length;
  const activeShifts = shifts.filter((s) => s.isActive).length;
  const nightShifts = shifts.filter((s) => {
    const start = parseInt(s.startTime?.split(':')[0] || '0');
    return start >= 18 || start < 6;
  }).length;

  const handleDelete = (shift: ShiftDto) => {
    Modal.confirm({
      title: 'Vardiyayı Sil',
      content: `"${shift.name}" vardiyasını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteShift.mutateAsync(shift.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (shift: ShiftDto) => {
    try {
      if (shift.isActive) {
        await deactivateShift.mutateAsync(shift.id);
      } else {
        await activateShift.mutateAsync(shift.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const columns: ColumnsType<ShiftDto> = [
    {
      title: 'Vardiya Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: ShiftDto) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8b5cf6' }} />
          <a onClick={() => router.push(`/hr/shifts/${record.id}`)}>{name}</a>
        </Space>
      ),
    },
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      render: (time: string) => formatTime(time),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      render: (time: string) => formatTime(time),
    },
    {
      title: 'Mola (dk)',
      dataIndex: 'breakDurationMinutes',
      key: 'breakDuration',
      width: 100,
      render: (minutes: number) => minutes || '-',
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: ShiftDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/shifts/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/shifts/${record.id}/edit`),
              },
              {
                key: 'toggle',
                icon: record.isActive ? <StopOutlined /> : <CheckCircleOutlined />,
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                onClick: () => handleToggleActive(record),
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
          <ClockCircleOutlined className="mr-2" />
          Vardiya Yönetimi
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/shifts/new')}>
          Yeni Vardiya
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Vardiya"
              value={totalShifts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Aktif Vardiya"
              value={activeShifts}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Gece Vardiyası"
              value={nightShifts}
              prefix={<ClockCircleOutlined />}
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
              placeholder="Vardiya ara..."
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
          dataSource={filteredShifts}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} vardiya`,
          }}
        />
      </Card>
    </div>
  );
}

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
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  FieldTimeOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAttendances, useDeleteAttendance, useEmployees } from '@/lib/api/hooks/useHR';
import type { AttendanceDto, AttendanceFilterDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function AttendancePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<AttendanceFilterDto>({});

  // API Hooks
  const { data: attendances = [], isLoading } = useAttendances(filters);
  const { data: employees = [] } = useEmployees();
  const deleteAttendance = useDeleteAttendance();

  // Stats
  const totalRecords = attendances.length;
  const presentCount = attendances.filter((a) => a.status === 'Present').length;
  const lateCount = attendances.filter((a) => a.status === 'Late').length;
  const absentCount = attendances.filter((a) => a.status === 'Absent').length;

  const handleDelete = (attendance: AttendanceDto) => {
    Modal.confirm({
      title: 'Yoklama Kaydını Sil',
      content: 'Bu yoklama kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteAttendance.mutateAsync(attendance.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const getStatusConfig = (status?: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      Present: { color: 'green', text: 'Mevcut' },
      Absent: { color: 'red', text: 'Yok' },
      Late: { color: 'orange', text: 'Geç' },
      HalfDay: { color: 'blue', text: 'Yarım Gün' },
      OnLeave: { color: 'purple', text: 'İzinli' },
    };
    return statusMap[status || ''] || { color: 'default', text: status || '-' };
  };

  const columns: ColumnsType<AttendanceDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      render: (_, record: AttendanceDto) => (
        <Space>
          <UserOutlined style={{ color: '#8b5cf6' }} />
          <span>{record.employeeName || `Çalışan #${record.employeeId}`}</span>
        </Space>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Giriş',
      dataIndex: 'checkInTime',
      key: 'checkIn',
      width: 100,
      render: (time: string) => formatTime(time),
    },
    {
      title: 'Çıkış',
      dataIndex: 'checkOutTime',
      key: 'checkOut',
      width: 100,
      render: (time: string) => formatTime(time),
    },
    {
      title: 'Çalışma Süresi',
      dataIndex: 'workedHours',
      key: 'workedHours',
      width: 120,
      render: (hours: number) => (hours ? `${hours.toFixed(1)} saat` : '-'),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: AttendanceDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/attendance/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/attendance/${record.id}/edit`),
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
          <FieldTimeOutlined className="mr-2" />
          Yoklama Takibi
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/attendance/new')}>
          Yeni Kayıt
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Kayıt"
              value={totalRecords}
              prefix={<FieldTimeOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Mevcut"
              value={presentCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Geç Kalan"
              value={lateCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Yok"
              value={absentCount}
              prefix={<ClockCircleOutlined />}
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
                label: `${e.firstName} ${e.lastName}`,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD.MM.YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
              onChange={(dates) => {
                if (dates) {
                  setFilters((prev) => ({
                    ...prev,
                    startDate: dates[0]?.format('YYYY-MM-DD'),
                    endDate: dates[1]?.format('YYYY-MM-DD'),
                  }));
                } else {
                  setFilters((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
                }
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: 'Present', label: 'Mevcut' },
                { value: 'Absent', label: 'Yok' },
                { value: 'Late', label: 'Geç' },
                { value: 'HalfDay', label: 'Yarım Gün' },
                { value: 'OnLeave', label: 'İzinli' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={attendances}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kayıt`,
          }}
        />
      </Card>
    </div>
  );
}

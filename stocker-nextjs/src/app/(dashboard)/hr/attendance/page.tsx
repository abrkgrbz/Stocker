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
  Select,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  FieldTimeOutlined,
  MoreOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAttendance, useEmployees } from '@/lib/api/hooks/useHR';
import type { AttendanceDto, AttendanceFilterDto } from '@/lib/api/services/hr.types';
import { AttendanceStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function AttendancePage() {
  const router = useRouter();
  const [filters, setFilters] = useState<AttendanceFilterDto>({});

  // API Hooks
  const { data: attendances = [], isLoading } = useAttendance(filters);
  const { data: employees = [] } = useEmployees();

  // Stats
  const totalRecords = attendances.length;
  const presentCount = attendances.filter((a) => a.status === AttendanceStatus.Present).length;
  const lateCount = attendances.filter((a) => a.status === AttendanceStatus.Late).length;
  const absentCount = attendances.filter((a) => a.status === AttendanceStatus.Absent).length;

  const formatTime = (time?: string) => {
    if (!time) return '-';
    return time.substring(0, 5);
  };

  const getStatusConfig = (status?: AttendanceStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [AttendanceStatus.Present]: { color: 'green', text: 'Mevcut' },
      [AttendanceStatus.Absent]: { color: 'red', text: 'Yok' },
      [AttendanceStatus.Late]: { color: 'orange', text: 'Geç' },
      [AttendanceStatus.HalfDay]: { color: 'blue', text: 'Yarım Gün' },
      [AttendanceStatus.OnLeave]: { color: 'purple', text: 'İzinli' },
      [AttendanceStatus.EarlyDeparture]: { color: 'cyan', text: 'Erken Ayrılış' },
      [AttendanceStatus.Holiday]: { color: 'gold', text: 'Tatil' },
      [AttendanceStatus.Weekend]: { color: 'default', text: 'Hafta Sonu' },
      [AttendanceStatus.RemoteWork]: { color: 'geekblue', text: 'Uzaktan Çalışma' },
      [AttendanceStatus.Overtime]: { color: 'lime', text: 'Fazla Mesai' },
      [AttendanceStatus.Training]: { color: 'magenta', text: 'Eğitim' },
      [AttendanceStatus.FieldWork]: { color: 'volcano', text: 'Saha Çalışması' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
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
      render: (status: AttendanceStatus) => {
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
                label: e.fullName,
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
                { value: AttendanceStatus.Present, label: 'Mevcut' },
                { value: AttendanceStatus.Absent, label: 'Yok' },
                { value: AttendanceStatus.Late, label: 'Geç' },
                { value: AttendanceStatus.HalfDay, label: 'Yarım Gün' },
                { value: AttendanceStatus.OnLeave, label: 'İzinli' },
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

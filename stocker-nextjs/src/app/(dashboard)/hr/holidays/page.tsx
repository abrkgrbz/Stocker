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
  CalendarOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  GiftOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useHolidays, useDeleteHoliday } from '@/lib/api/hooks/useHR';
import type { HolidayDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;

export default function HolidaysPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [yearFilter, setYearFilter] = useState<number | undefined>(dayjs().year());

  // API Hooks
  const { data: holidays = [], isLoading } = useHolidays({ year: yearFilter });
  const deleteHoliday = useDeleteHoliday();

  // Filter holidays by search text
  const filteredHolidays = holidays.filter(
    (h) => h.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const totalHolidays = holidays.length;
  const upcomingHolidays = holidays.filter((h) => dayjs(h.date).isAfter(dayjs())).length;
  const passedHolidays = holidays.filter((h) => dayjs(h.date).isBefore(dayjs())).length;

  const handleDelete = (holiday: HolidayDto) => {
    Modal.confirm({
      title: 'Tatil Gününü Sil',
      content: `"${holiday.name}" tatil gününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteHoliday.mutateAsync(holiday.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const columns: ColumnsType<HolidayDto> = [
    {
      title: 'Tatil Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: HolidayDto) => (
        <Space>
          <GiftOutlined style={{ color: '#8b5cf6' }} />
          <a onClick={() => router.push(`/hr/holidays/${record.id}`)}>{name}</a>
        </Space>
      ),
    },
    {
      title: 'Tarih',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      render: (date: string) => dayjs(date).format('DD MMMM YYYY'),
    },
    {
      title: 'Gün',
      dataIndex: 'date',
      key: 'dayOfWeek',
      width: 100,
      render: (date: string) => dayjs(date).format('dddd'),
    },
    {
      title: 'Tür',
      dataIndex: 'isRecurring',
      key: 'type',
      width: 120,
      render: (isRecurring: boolean) => (
        <Tag color={isRecurring ? 'blue' : 'default'}>
          {isRecurring ? 'Yıllık' : 'Tek Seferlik'}
        </Tag>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 100,
      render: (_, record: HolidayDto) => {
        const isPassed = dayjs(record.date).isBefore(dayjs(), 'day');
        const isToday = dayjs(record.date).isSame(dayjs(), 'day');
        return (
          <Tag color={isToday ? 'green' : isPassed ? 'default' : 'blue'}>
            {isToday ? 'Bugün' : isPassed ? 'Geçti' : 'Yaklaşan'}
          </Tag>
        );
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: HolidayDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/holidays/${record.id}`),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/holidays/${record.id}/edit`),
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

  const currentYear = dayjs().year();
  const yearOptions = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - 2 + i,
    label: `${currentYear - 2 + i}`,
  }));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          <CalendarOutlined className="mr-2" />
          Resmi Tatiller
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/hr/holidays/new')}>
          Yeni Tatil
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Tatil"
              value={totalHolidays}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Yaklaşan"
              value={upcomingHolidays}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Geçen"
              value={passedHolidays}
              valueStyle={{ color: '#8c8c8c' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Tatil ara..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Yıl seçin"
              style={{ width: '100%' }}
              value={yearFilter}
              onChange={(value) => setYearFilter(value)}
              allowClear
              options={yearOptions}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredHolidays}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} tatil günü`,
          }}
        />
      </Card>
    </div>
  );
}

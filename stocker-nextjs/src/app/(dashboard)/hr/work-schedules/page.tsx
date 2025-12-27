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
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useWorkSchedules, useDeleteWorkSchedule, useEmployees, useShifts } from '@/lib/api/hooks/useHR';
import type { WorkScheduleDto } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function WorkSchedulesPage() {
  const router = useRouter();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const startDate = dateRange?.[0]?.format('YYYY-MM-DD');
  const endDate = dateRange?.[1]?.format('YYYY-MM-DD');

  // API Hooks
  const { data: schedules = [], isLoading } = useWorkSchedules(selectedEmployeeId, startDate, endDate);
  const { data: employees = [] } = useEmployees();
  const { data: shifts = [] } = useShifts();
  const deleteSchedule = useDeleteWorkSchedule();

  // Stats
  const totalSchedules = schedules.length;
  const workDays = schedules.filter((s) => s.isWorkDay).length;
  const holidays = schedules.filter((s) => s.isHoliday).length;

  const handleDelete = (schedule: WorkScheduleDto) => {
    Modal.confirm({
      title: 'Çalışma Programını Sil',
      content: `Bu çalışma programı kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteSchedule.mutateAsync(schedule.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const columns: ColumnsType<WorkScheduleDto> = [
    {
      title: 'Çalışan',
      dataIndex: 'employeeName',
      key: 'employeeName',
      sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
      render: (name: string, record: WorkScheduleDto) => (
        <Space>
          <UserIcon className="w-4 h-4" style={{ color: '#1890ff' }} />
          <a onClick={() => router.push(`/hr/work-schedules/${record.id}`)}>{name}</a>
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
      title: 'Vardiya',
      dataIndex: 'shiftName',
      key: 'shiftName',
      width: 150,
      render: (name: string) => (
        <Space>
          <ClockIcon className="w-4 h-4 text-violet-500" />
          {name || '-'}
        </Space>
      ),
    },
    {
      title: 'Çalışma Günü',
      dataIndex: 'isWorkDay',
      key: 'isWorkDay',
      width: 120,
      render: (isWorkDay: boolean) => (
        <Tag color={isWorkDay ? 'green' : 'default'}>{isWorkDay ? 'Evet' : 'Hayır'}</Tag>
      ),
    },
    {
      title: 'Tatil',
      dataIndex: 'isHoliday',
      key: 'isHoliday',
      width: 100,
      render: (isHoliday: boolean, record: WorkScheduleDto) =>
        isHoliday ? (
          <Tag color="red">{record.holidayName || 'Tatil'}</Tag>
        ) : (
          <Tag color="default">-</Tag>
        ),
    },
    {
      title: 'Özel Saatler',
      key: 'customTime',
      width: 150,
      render: (_, record: WorkScheduleDto) =>
        record.customStartTime || record.customEndTime ? (
          <span>
            {record.customStartTime?.substring(0, 5)} - {record.customEndTime?.substring(0, 5)}
          </span>
        ) : (
          '-'
        ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: WorkScheduleDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/work-schedules/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/work-schedules/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<EllipsisHorizontalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          <CalendarIcon className="w-4 h-4 mr-2" />
          Çalışma Programları
        </Title>
        <Space>
          <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/work-schedules/new')}>
            Yeni Program
          </Button>
          <Button onClick={() => router.push('/hr/work-schedules/assign')}>
            Toplu Atama
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Kayıt"
              value={totalSchedules}
              prefix={<CalendarIcon className="w-4 h-4" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Çalışma Günü"
              value={workDays}
              prefix={<CheckCircleIcon className="w-4 h-4" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Tatil Günü"
              value={holidays}
              prefix={<CalendarIcon className="w-4 h-4" />}
              valueStyle={{ color: '#fa541c' }}
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
              optionFilterProp="label"
              style={{ width: '100%' }}
              value={selectedEmployeeId}
              onChange={setSelectedEmployeeId}
              options={employees.map((e) => ({
                value: e.id,
                label: e.fullName,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => setDateRange(dates)}
              format="DD.MM.YYYY"
              placeholder={['Başlangıç', 'Bitiş']}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={schedules}
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

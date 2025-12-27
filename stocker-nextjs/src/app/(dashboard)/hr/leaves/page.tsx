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
  message,
} from 'antd';
import {
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import {
  useLeaves,
  useDeleteLeave,
  useApproveLeave,
  useRejectLeave,
  useEmployees,
  useLeaveTypes,
} from '@/lib/api/hooks/useHR';
import type { LeaveDto, LeaveFilterDto } from '@/lib/api/services/hr.types';
import { LeaveStatus } from '@/lib/api/services/hr.types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export default function LeavesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<LeaveFilterDto>({});

  // API Hooks
  const { data: leaves = [], isLoading } = useLeaves(filters);
  const { data: employees = [] } = useEmployees();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const deleteLeave = useDeleteLeave();
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();

  // Stats
  const totalLeaves = leaves.length;
  const pendingLeaves = leaves.filter((l) => l.status === LeaveStatus.Pending).length;
  const approvedLeaves = leaves.filter((l) => l.status === LeaveStatus.Approved).length;
  const rejectedLeaves = leaves.filter((l) => l.status === LeaveStatus.Rejected).length;

  const handleDelete = (leave: LeaveDto) => {
    Modal.confirm({
      title: 'İzin Talebini Sil',
      content: 'Bu izin talebini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLeave.mutateAsync(leave.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleApprove = async (leave: LeaveDto) => {
    try {
      await approveLeave.mutateAsync({ id: leave.id });
      message.success('İzin talebi onaylandı');
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleReject = async (leave: LeaveDto) => {
    Modal.confirm({
      title: 'İzin Talebini Reddet',
      content: 'Bu izin talebini reddetmek istediğinizden emin misiniz?',
      okText: 'Reddet',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await rejectLeave.mutateAsync({ id: leave.id, data: { reason: 'Reddedildi' } });
          message.success('İzin talebi reddedildi');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const getStatusConfig = (status?: LeaveStatus) => {
    const statusMap: Record<number, { color: string; text: string }> = {
      [LeaveStatus.Pending]: { color: 'orange', text: 'Beklemede' },
      [LeaveStatus.Approved]: { color: 'green', text: 'Onaylandı' },
      [LeaveStatus.Rejected]: { color: 'red', text: 'Reddedildi' },
      [LeaveStatus.Cancelled]: { color: 'default', text: 'İptal Edildi' },
      [LeaveStatus.Taken]: { color: 'blue', text: 'Kullanıldı' },
      [LeaveStatus.PartiallyTaken]: { color: 'cyan', text: 'Kısmen Kullanıldı' },
    };
    const defaultConfig = { color: 'default', text: '-' };
    if (status === undefined || status === null) return defaultConfig;
    return statusMap[status] || defaultConfig;
  };

  const columns: ColumnsType<LeaveDto> = [
    {
      title: 'Çalışan',
      key: 'employee',
      render: (_, record: LeaveDto) => (
        <Space>
          <UserIcon className="w-4 h-4" style={{ color: '#8b5cf6' }} />
          <span>{record.employeeName || `Çalışan #${record.employeeId}`}</span>
        </Space>
      ),
    },
    {
      title: 'İzin Türü',
      dataIndex: 'leaveTypeName',
      key: 'leaveType',
      render: (name: string) => name || '-',
    },
    {
      title: 'Başlangıç',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Bitiş',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) => dayjs(date).format('DD.MM.YYYY'),
    },
    {
      title: 'Gün',
      dataIndex: 'totalDays',
      key: 'days',
      width: 80,
      render: (days: number) => `${days} gün`,
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: LeaveStatus) => {
        const config = getStatusConfig(status);
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      render: (_, record: LeaveDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/leaves/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/leaves/${record.id}/edit`),
                disabled: record.status !== LeaveStatus.Pending,
              },
              { type: 'divider' },
              ...(record.status === LeaveStatus.Pending
                ? [
                    {
                      key: 'approve',
                      icon: <CheckCircleIcon className="w-4 h-4" />,
                      label: 'Onayla',
                      onClick: () => handleApprove(record),
                    },
                    {
                      key: 'reject',
                      icon: <XCircleIcon className="w-4 h-4" />,
                      label: 'Reddet',
                      onClick: () => handleReject(record),
                    },
                    { type: 'divider' as const },
                  ]
                : []),
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
          <Button type="text" icon={<EllipsisVerticalIcon className="w-4 h-4" />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Title level={2} style={{ margin: 0 }}>
          <CalendarIcon className="w-6 h-6 mr-2 inline" />
          İzin Yönetimi
        </Title>
        <Space>
          <Button onClick={() => router.push('/hr/leave-types')}>İzin Türleri</Button>
          <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/leaves/new')}>
            Yeni İzin Talebi
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Toplam Talep"
              value={totalLeaves}
              prefix={<CalendarIcon className="w-5 h-5" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Beklemede"
              value={pendingLeaves}
              prefix={<ClockIcon className="w-5 h-5" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Onaylanan"
              value={approvedLeaves}
              prefix={<CheckCircleIcon className="w-5 h-5" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Reddedilen"
              value={rejectedLeaves}
              prefix={<XCircleIcon className="w-5 h-5" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
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
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="İzin Türü"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, leaveTypeId: value }))}
              options={leaveTypes.map((lt) => ({
                value: lt.id,
                label: lt.name,
              }))}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Durum"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: LeaveStatus.Pending, label: 'Beklemede' },
                { value: LeaveStatus.Approved, label: 'Onaylanan' },
                { value: LeaveStatus.Rejected, label: 'Reddedilen' },
                { value: LeaveStatus.Cancelled, label: 'İptal Edilen' },
                { value: LeaveStatus.Taken, label: 'Kullanıldı' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
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
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={leaves}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} izin talebi`,
          }}
        />
      </Card>
    </div>
  );
}

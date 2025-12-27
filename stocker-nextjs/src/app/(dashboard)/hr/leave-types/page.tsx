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
  CheckCircleIcon,
  DocumentTextIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  StopCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useLeaveTypes, useDeleteLeaveType, useActivateLeaveType, useDeactivateLeaveType } from '@/lib/api/hooks/useHR';
import type { LeaveTypeDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;

export default function LeaveTypesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: leaveTypes = [], isLoading } = useLeaveTypes();
  const deleteLeaveType = useDeleteLeaveType();
  const activateLeaveType = useActivateLeaveType();
  const deactivateLeaveType = useDeactivateLeaveType();

  // Filter leave types by search text
  const filteredLeaveTypes = leaveTypes.filter(
    (lt) =>
      lt.name.toLowerCase().includes(searchText.toLowerCase()) ||
      lt.code?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const totalTypes = leaveTypes.length;
  const activeTypes = leaveTypes.filter((lt) => lt.isActive).length;
  const paidTypes = leaveTypes.filter((lt) => lt.isPaid).length;

  const handleDelete = (leaveType: LeaveTypeDto) => {
    Modal.confirm({
      title: 'İzin Türünü Sil',
      content: `"${leaveType.name}" izin türünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLeaveType.mutateAsync(leaveType.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (leaveType: LeaveTypeDto) => {
    try {
      if (leaveType.isActive) {
        await deactivateLeaveType.mutateAsync(leaveType.id);
      } else {
        await activateLeaveType.mutateAsync(leaveType.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const columns: ColumnsType<LeaveTypeDto> = [
    {
      title: 'İzin Türü',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: LeaveTypeDto) => (
        <Space>
          <DocumentTextIcon className="w-4 h-4 text-violet-500" />
          <a onClick={() => router.push(`/hr/leave-types/${record.id}`)}>{name}</a>
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
      title: 'Yıllık Hak',
      dataIndex: 'defaultDays',
      key: 'defaultDays',
      width: 120,
      render: (days: number) => `${days} gün`,
    },
    {
      title: 'Ücretli',
      dataIndex: 'isPaid',
      key: 'isPaid',
      width: 100,
      render: (isPaid: boolean) => (
        <Tag color={isPaid ? 'green' : 'default'}>{isPaid ? 'Evet' : 'Hayır'}</Tag>
      ),
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
      render: (_, record: LeaveTypeDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/leave-types/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/leave-types/${record.id}/edit`),
              },
              {
                key: 'toggle',
                icon: record.isActive ? <StopCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />,
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                onClick: () => handleToggleActive(record),
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
          <DocumentTextIcon className="w-4 h-4 mr-2" />
          İzin Türleri
        </Title>
        <Space>
          <Button onClick={() => router.push('/hr/leaves')}>İzin Talepleri</Button>
          <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/leave-types/new')}>
            Yeni İzin Türü
          </Button>
        </Space>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Toplam Tür"
              value={totalTypes}
              prefix={<DocumentTextIcon className="w-4 h-4" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Aktif Tür"
              value={activeTypes}
              prefix={<CheckCircleIcon className="w-4 h-4" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card size="small">
            <Statistic
              title="Ücretli İzin"
              value={paidTypes}
              prefix={<DocumentTextIcon className="w-4 h-4" />}
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
              placeholder="İzin türü ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4" />}
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
          dataSource={filteredLeaveTypes}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} izin türü`,
          }}
        />
      </Card>
    </div>
  );
}

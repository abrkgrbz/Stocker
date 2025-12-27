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
  EllipsisHorizontalIcon,
  EyeIcon,
  GlobeAltIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  StopCircleIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { ColumnsType } from 'antd/es/table';
import { useWorkLocations, useDeleteWorkLocation, useActivateWorkLocation, useDeactivateWorkLocation } from '@/lib/api/hooks/useHR';
import type { WorkLocationDto } from '@/lib/api/services/hr.types';

const { Title } = Typography;

export default function WorkLocationsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: locations = [], isLoading } = useWorkLocations();
  const deleteLocation = useDeleteWorkLocation();
  const activateLocation = useActivateWorkLocation();
  const deactivateLocation = useDeactivateWorkLocation();

  // Filter locations by search text
  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchText.toLowerCase()) ||
      l.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      l.city?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Stats
  const totalLocations = locations.length;
  const activeLocations = locations.filter((l) => l.isActive).length;
  const headquarters = locations.filter((l) => l.isHeadquarters).length;
  const remoteLocations = locations.filter((l) => l.isRemote).length;
  const totalEmployees = locations.reduce((sum, l) => sum + (l.employeeCount || 0), 0);

  const handleDelete = (location: WorkLocationDto) => {
    Modal.confirm({
      title: 'Lokasyonu Sil',
      content: `"${location.name}" lokasyonunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteLocation.mutateAsync(location.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async (location: WorkLocationDto) => {
    try {
      if (location.isActive) {
        await deactivateLocation.mutateAsync(location.id);
      } else {
        await activateLocation.mutateAsync(location.id);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  const columns: ColumnsType<WorkLocationDto> = [
    {
      title: 'Lokasyon Adı',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record: WorkLocationDto) => (
        <Space>
          <MapPinIcon className="w-4 h-4" style={{ color: '#1890ff' }} />
          <a onClick={() => router.push(`/hr/work-locations/${record.id}`)}>{name}</a>
          {record.isHeadquarters && <Tag color="gold">Merkez</Tag>}
          {record.isRemote && <Tag color="purple">Uzaktan</Tag>}
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
      title: 'Şehir',
      dataIndex: 'city',
      key: 'city',
      width: 120,
      render: (city: string) => city || '-',
    },
    {
      title: 'Ülke',
      dataIndex: 'country',
      key: 'country',
      width: 100,
      render: (country: string) => country || '-',
    },
    {
      title: 'Çalışan Sayısı',
      dataIndex: 'employeeCount',
      key: 'employeeCount',
      width: 120,
      sorter: (a, b) => (a.employeeCount || 0) - (b.employeeCount || 0),
      render: (count: number) => count || 0,
    },
    {
      title: 'Kapasite',
      dataIndex: 'capacity',
      key: 'capacity',
      width: 100,
      render: (capacity: number) => capacity || '-',
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
      render: (_, record: WorkLocationDto) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/hr/work-locations/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/hr/work-locations/${record.id}/edit`),
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
          <MapPinIcon className="w-4 h-4" className="mr-2" />
          Çalışma Lokasyonları
        </Title>
        <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={() => router.push('/hr/work-locations/new')}>
          Yeni Lokasyon
        </Button>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Toplam Lokasyon"
              value={totalLocations}
              prefix={<MapPinIcon className="w-4 h-4" />}
              valueStyle={{ color: '#7c3aed' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Aktif Lokasyon"
              value={activeLocations}
              prefix={<CheckCircleIcon className="w-4 h-4" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Merkez Ofis"
              value={headquarters}
              prefix={<HomeIcon className="w-4 h-4" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Uzaktan"
              value={remoteLocations}
              prefix={<GlobeAltIcon className="w-4 h-4" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small">
            <Statistic
              title="Toplam Çalışan"
              value={totalEmployees}
              prefix={<UserGroupIcon className="w-4 h-4" />}
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
              placeholder="Lokasyon ara..."
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
          dataSource={filteredLocations}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} lokasyon`,
          }}
        />
      </Card>
    </div>
  );
}

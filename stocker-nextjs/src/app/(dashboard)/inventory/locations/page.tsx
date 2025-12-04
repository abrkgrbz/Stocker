'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  Button,
  Table,
  Space,
  Tag,
  Input,
  Typography,
  Popconfirm,
  message,
  Dropdown,
  Select,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { useLocations, useDeleteLocation, useWarehouses } from '@/lib/api/hooks/useInventory';
import type { LocationDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;

export default function LocationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWarehouseId = searchParams.get('warehouseId');

  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(
    initialWarehouseId ? Number(initialWarehouseId) : undefined
  );

  const { data: warehouses = [] } = useWarehouses();
  const { data: locations = [], isLoading, refetch } = useLocations(selectedWarehouse);
  const deleteLocation = useDeleteLocation();

  const handleDelete = async (id: number) => {
    try {
      await deleteLocation.mutateAsync(id);
      message.success('Lokasyon silindi');
    } catch (error) {
      message.error('Silme işlemi başarısız');
    }
  };

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchText.toLowerCase()) ||
    location.code?.toLowerCase().includes(searchText.toLowerCase()) ||
    location.aisle?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return '#ff4d4f';
    if (percent >= 70) return '#faad14';
    return '#52c41a';
  };

  const getActionMenuItems = (record: LocationDto): MenuProps['items'] => [
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      onClick: () => router.push(`/inventory/locations/${record.id}/edit`),
    },
    { type: 'divider' },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDelete(record.id),
    },
  ];

  const columns: ColumnsType<LocationDto> = [
    {
      title: 'Lokasyon',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#6366f115' }}
          >
            <EnvironmentOutlined style={{ fontSize: 18, color: '#6366f1' }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-xs text-gray-400">
              Kod: {record.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Depo',
      dataIndex: 'warehouseName',
      key: 'warehouseName',
      render: (name: string) => (
        <div className="flex items-center gap-1 text-gray-600">
          <HomeOutlined className="text-gray-400" />
          {name || '-'}
        </div>
      ),
    },
    {
      title: 'Konum',
      key: 'position',
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          {record.aisle && <span>Koridor: {record.aisle}</span>}
          {record.shelf && <span className="ml-2">Raf: {record.shelf}</span>}
          {record.bin && <span className="ml-2">Bölme: {record.bin}</span>}
          {!record.aisle && !record.shelf && !record.bin && '-'}
        </div>
      ),
    },
    {
      title: 'Kapasite Kullanımı',
      key: 'capacity',
      align: 'center',
      sorter: (a, b) => {
        const aPercent = a.capacity > 0 ? (a.usedCapacity / a.capacity) * 100 : 0;
        const bPercent = b.capacity > 0 ? (b.usedCapacity / b.capacity) * 100 : 0;
        return aPercent - bPercent;
      },
      render: (_, record) => {
        const percent = record.capacity > 0
          ? Math.round((record.usedCapacity / record.capacity) * 100)
          : 0;
        return (
          <div style={{ width: 120 }}>
            <Progress
              percent={percent}
              size="small"
              strokeColor={getCapacityColor(percent)}
              format={() => `${record.usedCapacity}/${record.capacity}`}
            />
          </div>
        );
      },
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'productCount',
      key: 'productCount',
      align: 'center',
      sorter: (a, b) => (a.productCount || 0) - (b.productCount || 0),
      render: (count: number) => (
        <Tag color="purple">{count || 0}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 50,
      render: (_, record) => (
        <Dropdown
          menu={{ items: getActionMenuItems(record) }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Lokasyonlar</Title>
          <Text type="secondary">Depo içi lokasyonları yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push(`/inventory/locations/new${selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : ''}`)}
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
          >
            Yeni Lokasyon
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Space wrap>
          <Select
            placeholder="Depo seçin"
            allowClear
            style={{ width: 200 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            options={warehouses.map((w) => ({
              value: w.id,
              label: w.name,
            }))}
          />
          <Input
            placeholder="Lokasyon ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            allowClear
          />
        </Space>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredLocations}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} lokasyon`,
          }}
        />
      </Card>
    </div>
  );
}

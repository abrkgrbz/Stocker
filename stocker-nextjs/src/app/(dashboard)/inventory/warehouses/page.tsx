'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Dropdown,
  Progress,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  CheckCircleOutlined,
  StopOutlined,
  StarOutlined,
} from '@ant-design/icons';
import {
  useWarehouses,
  useDeleteWarehouse,
  useSetDefaultWarehouse,
} from '@/lib/api/hooks/useInventory';
import type { WarehouseDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function WarehousesPage() {
  const router = useRouter();
  const [includeInactive, setIncludeInactive] = useState(false);

  // API Hooks
  const { data: warehouses = [], isLoading, refetch } = useWarehouses(includeInactive);
  const deleteWarehouse = useDeleteWarehouse();
  const setDefaultWarehouse = useSetDefaultWarehouse();

  // Calculate stats
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w) => w.isActive).length;
  const totalLocations = warehouses.reduce((sum, w) => sum + (w.locationCount || 0), 0);
  const totalProducts = warehouses.reduce((sum, w) => sum + (w.productCount || 0), 0);

  // Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/warehouses/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/inventory/warehouses/${id}/edit`);
  };

  const handleDelete = (warehouse: WarehouseDto) => {
    if (warehouse.isDefault) {
      Modal.warning({
        title: 'Varsayılan Depo',
        content: 'Varsayılan depo silinemez. Önce başka bir depoyu varsayılan olarak ayarlayın.',
      });
      return;
    }

    Modal.confirm({
      title: 'Depoyu Sil',
      content: `"${warehouse.name}" deposunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteWarehouse.mutateAsync(warehouse.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleSetDefault = async (warehouse: WarehouseDto) => {
    if (warehouse.isDefault) return;

    Modal.confirm({
      title: 'Varsayılan Depo Ayarla',
      content: `"${warehouse.name}" deposunu varsayılan olarak ayarlamak istediğinizden emin misiniz?`,
      okText: 'Ayarla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await setDefaultWarehouse.mutateAsync(warehouse.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<WarehouseDto> = [
    {
      title: 'Depo Kodu',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code) => <span className="font-medium">{code}</span>,
    },
    {
      title: 'Depo Adı',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div className="flex items-center gap-2">
          <div
            className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
            onClick={() => handleView(record.id)}
          >
            {name}
          </div>
          {record.isDefault && (
            <Tag color="gold" icon={<StarOutlined />}>Varsayılan</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Konum',
      key: 'location',
      width: 200,
      render: (_, record) => (
        record.city ? (
          <div className="flex items-center gap-1">
            <EnvironmentOutlined className="text-gray-400" />
            <span>{record.city}{record.state ? `, ${record.state}` : ''}</span>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        )
      ),
    },
    {
      title: 'Yönetici',
      dataIndex: 'manager',
      key: 'manager',
      width: 150,
      render: (manager) => manager || '-',
    },
    {
      title: 'Konum Sayısı',
      dataIndex: 'locationCount',
      key: 'locationCount',
      width: 120,
      align: 'center',
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      align: 'center',
      render: (count) => <Tag color="green">{count || 0}</Tag>,
    },
    {
      title: 'Toplam Alan (m²)',
      dataIndex: 'totalArea',
      key: 'totalArea',
      width: 120,
      align: 'right',
      render: (area) => area ? area.toLocaleString('tr-TR') : '-',
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      align: 'center',
      render: (isActive) => (
        isActive ? (
          <Tag color="success" icon={<CheckCircleOutlined />}>Aktif</Tag>
        ) : (
          <Tag color="default" icon={<StopOutlined />}>Pasif</Tag>
        )
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeOutlined />,
                label: 'Görüntüle',
                onClick: () => handleView(record.id),
              },
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Düzenle',
                onClick: () => handleEdit(record.id),
              },
              {
                key: 'setDefault',
                icon: <StarOutlined />,
                label: 'Varsayılan Yap',
                disabled: record.isDefault,
                onClick: () => handleSetDefault(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Sil',
                danger: true,
                disabled: record.isDefault,
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
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={2} style={{ margin: 0 }}>Depolar</Title>
          <Text type="secondary">Depo ve lokasyonlarınızı yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isLoading}>
            Yenile
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/inventory/warehouses/new')}>
            Yeni Depo
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Depo"
              value={totalWarehouses}
              prefix={<ShopOutlined className="text-blue-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Aktif Depo"
              value={activeWarehouses}
              prefix={<CheckCircleOutlined className="text-green-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Toplam Konum"
              value={totalLocations}
              prefix={<EnvironmentOutlined className="text-purple-500" />}
              loading={isLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="Depolardaki Ürün"
              value={totalProducts}
              suffix="çeşit"
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* Warehouses Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={warehouses}
          rowKey="id"
          loading={isLoading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} depo`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
}

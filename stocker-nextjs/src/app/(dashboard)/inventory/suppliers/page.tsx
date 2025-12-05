'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ShopOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MoreOutlined,
  StarFilled,
  EyeOutlined,
} from '@ant-design/icons';
import { useSuppliers, useDeleteSupplier } from '@/lib/api/hooks/useInventory';
import type { SupplierDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';

const { Title, Text } = Typography;

export default function SuppliersPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: suppliers = [], isLoading, refetch } = useSuppliers(true);
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = async (id: number) => {
    try {
      await deleteSupplier.mutateAsync(id);
      message.success('Tedarikçi silindi');
    } catch (error) {
      message.error('Silme işlemi başarısız');
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.code?.toLowerCase().includes(searchText.toLowerCase()) ||
    supplier.city?.toLowerCase().includes(searchText.toLowerCase())
  );

  const getActionMenuItems = (record: SupplierDto): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Detay Göster',
      icon: <EyeOutlined />,
      onClick: () => router.push(`/inventory/suppliers/${record.id}`),
    },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      onClick: () => router.push(`/inventory/suppliers/${record.id}/edit`),
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

  const columns: ColumnsType<SupplierDto> = [
    {
      title: 'Tedarikçi',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#10b98115' }}
          >
            <ShopOutlined style={{ fontSize: 18, color: '#10b981' }} />
          </div>
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {name}
              {record.isPreferred && (
                <StarFilled style={{ fontSize: 12, color: '#f59e0b' }} />
              )}
            </div>
            {record.code && (
              <div className="text-xs text-gray-400">
                Kod: {record.code}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      render: (_, record) => (
        <div className="text-sm">
          {record.phone && (
            <div className="flex items-center gap-1 text-gray-600">
              <PhoneOutlined className="text-gray-400" />
              {record.phone}
            </div>
          )}
          {record.city && (
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
              <EnvironmentOutlined className="text-gray-400" />
              {record.city}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'productCount',
      key: 'productCount',
      align: 'center',
      sorter: (a, b) => (a.productCount || 0) - (b.productCount || 0),
      render: (count: number) => (
        <Tag color="green">{count || 0}</Tag>
      ),
    },
    {
      title: 'Tercih',
      dataIndex: 'isPreferred',
      key: 'isPreferred',
      align: 'center',
      filters: [
        { text: 'Tercih Edilen', value: true },
        { text: 'Standart', value: false },
      ],
      onFilter: (value, record) => record.isPreferred === value,
      render: (isPreferred: boolean) => (
        isPreferred ? (
          <Tag color="gold" icon={<StarFilled />}>Tercih Edilen</Tag>
        ) : (
          <Tag color="default">Standart</Tag>
        )
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
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{ items: getActionMenuItems(record) }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Tedarikçiler</Title>
          <Text type="secondary">Tedarikçi ve satıcı bilgilerini yönetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/suppliers/new')}
            style={{ background: '#10b981', borderColor: '#10b981' }}
          >
            Yeni Tedarikçi
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <Input
          placeholder="Tedarikçi ara..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
          allowClear
        />
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredSuppliers}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} tedarikçi`,
          }}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/suppliers/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
}

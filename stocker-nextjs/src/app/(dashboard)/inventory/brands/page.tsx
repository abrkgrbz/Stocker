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
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TrademarkOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { useBrands, useDeleteBrand } from '@/lib/api/hooks/useInventory';
import type { BrandDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function BrandsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: brands = [], isLoading, refetch } = useBrands();
  const deleteBrand = useDeleteBrand();

  const handleDelete = async (id: number) => {
    try {
      await deleteBrand.mutateAsync(id);
      message.success('Marka silindi');
    } catch (error) {
      message.error('Silme islemi basarisiz');
    }
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchText.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<BrandDto> = [
    {
      title: 'Marka',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          {record.logoUrl ? (
            <Avatar src={record.logoUrl} size={40} shape="square" />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: '#f59e0b15' }}
            >
              <TrademarkOutlined style={{ fontSize: 18, color: '#f59e0b' }} />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900">{name}</div>
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
      title: 'Aciklama',
      dataIndex: 'description',
      key: 'description',
      render: (desc: string) => (
        <Text type="secondary" className="text-sm">
          {desc || '-'}
        </Text>
      ),
    },
    {
      title: 'Web Sitesi',
      dataIndex: 'website',
      key: 'website',
      render: (url: string) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
            {url}
          </a>
        ) : (
          '-'
        ),
    },
    {
      title: 'Urun Sayisi',
      dataIndex: 'productCount',
      key: 'productCount',
      align: 'center',
      render: (count: number) => (
        <Tag color="orange">{count || 0}</Tag>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => router.push(`/inventory/brands/${record.id}/edit`)}
          />
          <Popconfirm
            title="Markayi silmek istediginize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayir"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">Markalar</Title>
          <Text type="secondary">Urun markalarini yonetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/brands/new')}
            style={{ background: '#f59e0b', borderColor: '#f59e0b' }}
          >
            Yeni Marka
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <Input
          placeholder="Marka ara..."
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
          dataSource={filteredBrands}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} marka`,
          }}
        />
      </Card>
    </div>
  );
}

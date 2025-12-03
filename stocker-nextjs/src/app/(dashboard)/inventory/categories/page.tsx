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
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TagsOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useCategories, useDeleteCategory } from '@/lib/api/hooks/useInventory';
import type { CategoryDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

export default function CategoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: categories = [], isLoading, refetch } = useCategories();
  const deleteCategory = useDeleteCategory();

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      message.success('Kategori silindi');
    } catch (error) {
      message.error('Silme islemi basarisiz');
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns: ColumnsType<CategoryDto> = [
    {
      title: 'Kategori',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: '#10b98115' }}
          >
            {record.parentCategoryId ? (
              <FolderOutlined style={{ fontSize: 18, color: '#10b981' }} />
            ) : (
              <TagsOutlined style={{ fontSize: 18, color: '#10b981' }} />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            {record.parentCategoryName && (
              <div className="text-xs text-gray-400">
                {record.parentCategoryName}
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
      title: 'Urun Sayisi',
      dataIndex: 'productCount',
      key: 'productCount',
      align: 'center',
      render: (count: number) => (
        <Tag color="blue">{count || 0}</Tag>
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
            onClick={() => router.push(`/inventory/categories/${record.id}/edit`)}
          />
          <Popconfirm
            title="Kategoriyi silmek istediginize emin misiniz?"
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
          <Title level={3} className="!mb-1">Kategoriler</Title>
          <Text type="secondary">Urun kategorilerini yonetin</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/inventory/categories/new')}
            style={{ background: '#10b981', borderColor: '#10b981' }}
          >
            Yeni Kategori
          </Button>
        </Space>
      </div>

      {/* Search */}
      <Card className="mb-4">
        <Input
          placeholder="Kategori ara..."
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
          dataSource={filteredCategories}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Toplam ${total} kategori`,
          }}
        />
      </Card>
    </div>
  );
}

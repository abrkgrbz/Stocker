'use client';

import React, { useState, useMemo } from 'react';
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
  Segmented,
  Badge,
  Tooltip,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  TagsOutlined,
  FolderOutlined,
  ApartmentOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useCategories, useCategoryTree, useDeleteCategory } from '@/lib/api/hooks/useInventory';
import type { CategoryDto, CategoryTreeDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;

// Tree table item interface with optional children for antd Table
interface TreeTableItem {
  id: number;
  code: string;
  name: string;
  level: number;
  hasChildren: boolean;
  children?: TreeTableItem[];
}

function convertToTreeTable(categories: CategoryTreeDto[]): TreeTableItem[] {
  return categories.map((cat) => ({
    id: cat.id,
    code: cat.code,
    name: cat.name,
    level: cat.level,
    hasChildren: cat.hasChildren,
    children: cat.children && cat.children.length > 0
      ? convertToTreeTable(cat.children)
      : undefined,
  }));
}

// Count total subcategories recursively
function countSubCategories(category: TreeTableItem): number {
  if (!category.children || category.children.length === 0) return 0;
  return category.children.length + category.children.reduce((sum, child) => sum + countSubCategories(child), 0);
}

export default function CategoriesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');

  const { data: categories = [], isLoading: flatLoading, refetch: refetchFlat } = useCategories();
  const { data: categoryTree = [], isLoading: treeLoading, refetch: refetchTree } = useCategoryTree();
  const deleteCategory = useDeleteCategory();

  const isLoading = viewMode === 'tree' ? treeLoading : flatLoading;

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory.mutateAsync(id);
      message.success('Kategori silindi');
    } catch (error) {
      message.error('Silme islemi basarisiz');
    }
  };

  const handleRefresh = () => {
    refetchFlat();
    refetchTree();
  };

  // Filter flat categories
  const filteredCategories = useMemo(() => {
    if (!searchText) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categories, searchText]);

  // Filter tree categories (search in all levels)
  const filteredTreeData = useMemo(() => {
    if (!searchText) return convertToTreeTable(categoryTree);

    const filterTree = (items: CategoryTreeDto[]): TreeTableItem[] => {
      return items.reduce<TreeTableItem[]>((acc, item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchText.toLowerCase()) ||
          item.code.toLowerCase().includes(searchText.toLowerCase());

        const filteredChildren = item.children ? filterTree(item.children) : [];

        if (matchesSearch || filteredChildren.length > 0) {
          acc.push({
            id: item.id,
            code: item.code,
            name: item.name,
            level: item.level,
            hasChildren: item.hasChildren,
            children: filteredChildren.length > 0 ? filteredChildren : undefined,
          });
        }

        return acc;
      }, []);
    };

    return filterTree(categoryTree);
  }, [categoryTree, searchText]);

  // Flat view columns
  const flatColumns: ColumnsType<CategoryDto> = [
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
                Ust Kategori: {record.parentCategoryName}
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

  // Tree view columns
  const treeColumns: ColumnsType<TreeTableItem> = [
    {
      title: 'Kategori',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => {
        const subCount = countSubCategories(record);
        return (
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: record.level === 0 ? '#10b98115' : '#f3f4f6' }}
            >
              {record.level === 0 ? (
                <TagsOutlined style={{ fontSize: 18, color: '#10b981' }} />
              ) : (
                <FolderOutlined style={{ fontSize: 18, color: '#6b7280' }} />
              )}
            </div>
            <div>
              <div className="font-medium text-gray-900 flex items-center gap-2">
                {name}
                {subCount > 0 && (
                  <Tooltip title={`${subCount} alt kategori`}>
                    <Badge
                      count={subCount}
                      style={{
                        backgroundColor: '#10b981',
                        fontSize: 10,
                        height: 16,
                        minWidth: 16,
                        lineHeight: '16px'
                      }}
                    />
                  </Tooltip>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <Tag>{code}</Tag>
      ),
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      align: 'center',
      render: (level: number) => (
        <Tag color={level === 0 ? 'green' : level === 1 ? 'blue' : 'purple'}>
          Seviye {level + 1}
        </Tag>
      ),
    },
    {
      title: 'Alt Kategori',
      key: 'hasChildren',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Tag color={record.hasChildren ? 'blue' : 'default'}>
          {record.hasChildren ? 'Var' : 'Yok'}
        </Tag>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      align: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Duzenle">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/categories/${record.id}/edit`)}
            />
          </Tooltip>
          <Popconfirm
            title="Kategoriyi silmek istediginize emin misiniz?"
            description={record.children ? 'Alt kategoriler de silinecektir!' : undefined}
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayir"
          >
            <Tooltip title="Sil">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
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
          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
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

      {/* Search and View Toggle */}
      <Card className="mb-4">
        <div className="flex justify-between items-center gap-4">
          <Input
            placeholder="Kategori ara..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
          />
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'tree' | 'flat')}
            options={[
              {
                value: 'tree',
                icon: <ApartmentOutlined />,
                label: 'Agac Gorunumu',
              },
              {
                value: 'flat',
                icon: <UnorderedListOutlined />,
                label: 'Liste Gorunumu',
              },
            ]}
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {viewMode === 'tree' ? (
          <Table
            columns={treeColumns}
            dataSource={filteredTreeData}
            rowKey="id"
            loading={isLoading}
            expandable={{
              defaultExpandAllRows: true,
              indentSize: 24,
            }}
            pagination={false}
          />
        ) : (
          <Table
            columns={flatColumns}
            dataSource={filteredCategories}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kategori`,
            }}
          />
        )}
      </Card>
    </div>
  );
}

'use client';

/**
 * Categories List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Popconfirm,
  message,
  Segmented,
  Badge,
  Tooltip,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
  TagIcon,
  FolderIcon,
  Squares2X2Icon,
  ListBulletIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useCategories, useCategoryTree, useDeleteCategory } from '@/lib/api/hooks/useInventory';
import type { CategoryDto, CategoryTreeDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

// Tree table item interface
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
      message.error('Silme işlemi başarısız');
    }
  };

  const handleRefresh = () => {
    refetchFlat();
    refetchTree();
  };

  // Calculate stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter((c) => c.isActive).length;
  const rootCategories = categories.filter((c) => !c.parentCategoryId).length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.productCount || 0), 0);

  // Filter flat categories
  const filteredCategories = useMemo(() => {
    if (!searchText) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [categories, searchText]);

  // Filter tree categories
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
            style={{ backgroundColor: '#10b98115' }}
          >
            {record.parentCategoryId ? (
              <FolderIcon className="w-5 h-5" style={{ color: '#10b981' }} />
            ) : (
              <TagIcon className="w-5 h-5" style={{ color: '#10b981' }} />
            )}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            {record.parentCategoryName && (
              <div className="text-xs text-slate-500">
                Üst: {record.parentCategoryName}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <span className="text-sm text-slate-600">{desc || <span className="text-slate-400">-</span>}</span>
      ),
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
          {count || 0}
        </span>
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
      title: '',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => router.push(`/inventory/categories/${record.id}/edit`)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Kategoriyi silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
          </Popconfirm>
        </div>
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
              style={{ backgroundColor: record.level === 0 ? '#10b98115' : '#f1f5f9' }}
            >
              {record.level === 0 ? (
                <TagIcon className="w-5 h-5" style={{ color: '#10b981' }} />
              ) : (
                <FolderIcon className="w-5 h-5" style={{ color: '#64748b' }} />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{name}</span>
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
        );
      },
    },
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (code: string) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
          {code}
        </span>
      ),
    },
    {
      title: 'Seviye',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      align: 'center',
      render: (level: number) => {
        const colors = ['green', 'blue', 'purple'];
        return (
          <Tag color={colors[level] || 'default'}>
            Seviye {level + 1}
          </Tag>
        );
      },
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
      title: '',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Düzenle">
            <button
              onClick={() => router.push(`/inventory/categories/${record.id}/edit`)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Popconfirm
            title="Kategoriyi silmek istediğinize emin misiniz?"
            description={record.children ? 'Alt kategoriler de silinecektir!' : undefined}
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Kategori</span>
              <div className="text-2xl font-semibold text-slate-900">{totalCategories}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <TagIcon className="w-6 h-6" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Kategori</span>
              <div className="text-2xl font-semibold text-slate-900">{activeCategories}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <CheckCircleIcon className="w-6 h-6" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Ana Kategori</span>
              <div className="text-2xl font-semibold text-slate-900">{rootCategories}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <Squares2X2Icon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Ürün</span>
              <div className="text-2xl font-semibold text-slate-900">{totalProducts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <FolderIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<TagIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Kategoriler"
        description="Ürün kategorilerini yönetin"
        itemCount={viewMode === 'tree' ? filteredTreeData.length : filteredCategories.length}
        primaryAction={{
          label: 'Yeni Kategori',
          onClick: () => router.push('/inventory/categories/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Search and View Toggle */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Input
            placeholder="Kategori ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
            className="h-10"
          />
          <Segmented
            value={viewMode}
            onChange={(value) => setViewMode(value as 'tree' | 'flat')}
            options={[
              {
                value: 'tree',
                icon: <Squares2X2Icon className="w-4 h-4" />,
                label: 'Ağaç Görünümü',
              },
              {
                value: 'flat',
                icon: <ListBulletIcon className="w-4 h-4" />,
                label: 'Liste Görünümü',
              },
            ]}
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
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
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kategori`,
              }}
            />
          )}
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

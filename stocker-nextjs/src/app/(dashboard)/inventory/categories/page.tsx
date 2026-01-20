'use client';

/**
 * Categories List Page
 * Monochrome design system following lot-batches design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Popconfirm,
  message,
  Segmented,
  Badge,
  Tooltip,
  Button,
  Spin,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  FolderIcon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  Squares2X2Icon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { TableEmptyState } from '@/components/primitives';
import { useCategories, useCategoryTree, useDeleteCategory } from '@/lib/api/hooks/useInventory';
import type { CategoryDto, CategoryTreeDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

const { Search } = Input;

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
  const [includeInactive, setIncludeInactive] = useState(false);

  const { data: categories = [], isLoading: flatLoading, refetch: refetchFlat } = useCategories(includeInactive);
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
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            {record.parentCategoryId ? (
              <FolderIcon className="w-5 h-5 text-slate-600" />
            ) : (
              <TagIcon className="w-5 h-5 text-slate-600" />
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
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
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
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
          isActive
            ? 'bg-slate-900 text-white'
            : 'bg-slate-200 text-slate-600'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
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
            aria-label="Düzenle"
          >
            <PencilSquareIcon className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Kategoriyi silmek istediğinize emin misiniz?"
            onConfirm={() => handleDelete(record.id)}
            okText="Evet"
            cancelText="Hayır"
            okButtonProps={{ className: '!bg-red-600 hover:!bg-red-700 !border-red-600' }}
            cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
          >
            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" aria-label="Sil">
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
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              record.level === 0 ? 'bg-slate-900' : 'bg-slate-100'
            }`}>
              {record.level === 0 ? (
                <TagIcon className="w-5 h-5 text-white" />
              ) : (
                <FolderIcon className="w-5 h-5 text-slate-600" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{name}</span>
              {subCount > 0 && (
                <Tooltip title={`${subCount} alt kategori`}>
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-medium bg-slate-600 text-white rounded-full">
                    {subCount}
                  </span>
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
        const bgColors = ['bg-slate-900 text-white', 'bg-slate-600 text-white', 'bg-slate-400 text-white'];
        return (
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${bgColors[level] || 'bg-slate-200 text-slate-600'}`}>
            Seviye {level + 1}
          </span>
        );
      },
    },
    {
      title: 'Alt Kategori',
      key: 'hasChildren',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
          record.hasChildren
            ? 'bg-slate-700 text-white'
            : 'bg-slate-200 text-slate-600'
        }`}>
          {record.hasChildren ? 'Var' : 'Yok'}
        </span>
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
              aria-label="Düzenle"
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
            okButtonProps={{ className: '!bg-red-600 hover:!bg-red-700 !border-red-600' }}
            cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
          >
            <Tooltip title="Sil">
              <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" aria-label="Sil">
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <TagIcon className="w-7 h-7" />
              Kategoriler
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ürün kategorilerini yönetin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip title="Yenile">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={handleRefresh}
                loading={isLoading}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => router.push('/inventory/categories/new')}
            >
              Yeni Kategori
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Kategori</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalCategories}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Aktif Kategori</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{activeCategories}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Ana Kategori</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{rootCategories}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Squares2X2Icon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Ürün</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalProducts}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <FolderIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Search
                placeholder="Kategori ara..."
                prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ maxWidth: 300 }}
                allowClear
              />
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={includeInactive}
                  onChange={(e) => setIncludeInactive(e.target.checked)}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                />
                Pasif kategorileri göster
              </label>
            </div>
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
        <div className="bg-white border border-slate-200 rounded-xl p-6">
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
              locale={{
                emptyText: <TableEmptyState
                  icon={Squares2X2Icon}
                  title="Kategori bulunamadi"
                  description="Henuz kategori eklenmemis veya filtrelere uygun kayit yok."
                />
              }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
            />
          ) : (
            <Table
              columns={flatColumns}
              dataSource={filteredCategories}
              rowKey="id"
              loading={isLoading}
              locale={{
                emptyText: <TableEmptyState
                  icon={Squares2X2Icon}
                  title="Kategori bulunamadi"
                  description="Henuz kategori eklenmemis veya filtrelere uygun kayit yok."
                />
              }}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-200"
              pagination={{
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
                pageSizeOptions: ['10', '20', '50'],
                defaultPageSize: 20,
              }}
            />
          )}
        </div>
      </Spin>
    </div>
  );
}

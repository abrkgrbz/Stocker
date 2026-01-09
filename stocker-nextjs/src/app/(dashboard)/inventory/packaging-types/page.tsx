'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Tag, Select, Input, Button, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  usePackagingTypes,
  useDeletePackagingType,
} from '@/lib/api/hooks/useInventory';
import type { PackagingTypeDto, PackagingCategory } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { PageContainer, ListPageHeader, Card } from '@/components/patterns';
import { confirmAction } from '@/lib/utils/sweetalert';

const categoryConfig: Record<number, { label: string; color: string }> = {
  1: { label: 'Kutu', color: 'blue' },
  2: { label: 'Karton', color: 'orange' },
  3: { label: 'Palet', color: 'purple' },
  4: { label: 'Kasa', color: 'cyan' },
  5: { label: 'Torba', color: 'green' },
  6: { label: 'Varil', color: 'volcano' },
  7: { label: 'Konteyner', color: 'geekblue' },
  8: { label: 'Şişe', color: 'lime' },
  9: { label: 'Kavanoz', color: 'gold' },
  10: { label: 'Tüp', color: 'magenta' },
  11: { label: 'Poşet', color: 'cyan' },
  12: { label: 'Rulo', color: 'purple' },
  99: { label: 'Diğer', color: 'default' },
};

export default function PackagingTypesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [searchText, setSearchText] = useState('');

  // API Hooks
  const { data: packagingTypes = [], isLoading, refetch } = usePackagingTypes();
  const deleteType = useDeletePackagingType();

  // Filter data
  const filteredData = useMemo(() => {
    let result = packagingTypes;

    if (selectedCategory) {
      result = result.filter(item => item.category === selectedCategory);
    }

    if (searchText) {
      const search = searchText.toLowerCase();
      result = result.filter(
        (item) =>
          item.code.toLowerCase().includes(search) ||
          item.name.toLowerCase().includes(search)
      );
    }

    return result;
  }, [packagingTypes, selectedCategory, searchText]);

  // Stats
  const stats = useMemo(() => {
    const total = packagingTypes.length;
    const active = packagingTypes.filter(p => p.isActive).length;
    const recyclable = packagingTypes.filter(p => p.isRecyclable).length;
    const returnable = packagingTypes.filter(p => p.isReturnable).length;
    return { total, active, recyclable, returnable };
  }, [packagingTypes]);

  // Handlers
  const handleDelete = async (type: PackagingTypeDto) => {
    const confirmed = await confirmAction(
      'Ambalaj Tipini Sil',
      `"${type.name}" ambalaj tipini silmek istediğinizden emin misiniz?`,
      'Sil'
    );

    if (confirmed) {
      try {
        await deleteType.mutateAsync(type.id);
      } catch (error) {
        // Error handled by hook
      }
    }
  };

  // Table columns
  const columns: ColumnsType<PackagingTypeDto> = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text: string, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/packaging-types/${record.id}`);
          }}
          className="font-mono font-semibold text-slate-900 hover:text-blue-600 transition-colors"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Ad',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string, record) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/inventory/packaging-types/${record.id}`);
          }}
          className="font-medium text-slate-900 hover:text-blue-600 transition-colors text-left"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'Kategori',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: PackagingCategory) => {
        const config = categoryConfig[category] || { label: 'Bilinmiyor', color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Boyutlar (cm)',
      key: 'dimensions',
      width: 150,
      render: (_, record) => {
        if (!record.length && !record.width && !record.height) return '-';
        return (
          <span className="text-slate-600">
            {record.length || '-'} x {record.width || '-'} x {record.height || '-'}
          </span>
        );
      },
    },
    {
      title: 'Ağırlık (kg)',
      key: 'weight',
      width: 120,
      render: (_, record) => (
        <div>
          {record.emptyWeight !== undefined && (
            <div className="text-xs text-slate-500">Boş: {record.emptyWeight}</div>
          )}
          {record.maxWeightCapacity !== undefined && (
            <div className="text-xs text-slate-600">Max: {record.maxWeightCapacity}</div>
          )}
          {record.emptyWeight === undefined && record.maxWeightCapacity === undefined && '-'}
        </div>
      ),
    },
    {
      title: 'Kapasite',
      key: 'capacity',
      width: 100,
      render: (_, record) => (
        <div>
          {record.defaultQuantity && (
            <div className="text-slate-900">{record.defaultQuantity} adet</div>
          )}
          {record.maxQuantity && (
            <div className="text-xs text-slate-500">Max: {record.maxQuantity}</div>
          )}
          {!record.defaultQuantity && !record.maxQuantity && '-'}
        </div>
      ),
    },
    {
      title: 'Özellikler',
      key: 'features',
      width: 150,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.isStackable && <Tag color="blue">İstiflenebilir</Tag>}
          {record.isRecyclable && <Tag color="green">Geri Dönüşüm</Tag>}
          {record.isReturnable && <Tag color="orange">İade Edilebilir</Tag>}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: 'İşlemler',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Görüntüle',
                onClick: () => router.push(`/inventory/packaging-types/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
                onClick: () => router.push(`/inventory/packaging-types/${record.id}/edit`),
              },
              {
                type: 'divider',
              },
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
          <Button
            type="text"
            icon={<EllipsisHorizontalIcon className="w-4 h-4" />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer>
      <ListPageHeader
        icon={<CubeIcon className="w-5 h-5" />}
        iconColor="#10b981"
        title="Ambalaj Tipleri"
        description="Ürün ambalaj tiplerini tanımlayın ve yönetin"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Ambalaj Tipi',
          onClick: () => router.push('/inventory/packaging-types/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-500">Toplam Ambalaj Tipi</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          <div className="text-xs text-slate-500">Aktif</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{stats.recyclable}</div>
          <div className="text-xs text-slate-500">Geri Dönüştürülebilir</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{stats.returnable}</div>
          <div className="text-xs text-slate-500">İade Edilebilir</div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 p-4">
          <Input
            placeholder="Kod veya ad ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64"
          />
          <Select
            placeholder="Kategoriye göre filtrele"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {Object.entries(categoryConfig).map(([key, config]) => (
              <Select.Option key={key} value={parseInt(key)}>
                {config.label}
              </Select.Option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: filteredData.length,
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
          }}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/packaging-types/${record.id}`),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
        />
      </Card>
    </PageContainer>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Select, Input, Button, Dropdown } from 'antd';
import {
  ArrowPathIcon,
  CubeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  ArrowsPointingOutIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import {
  usePackagingTypes,
  useDeletePackagingType,
} from '@/lib/api/hooks/useInventory';
import type { PackagingTypeDto, PackagingCategory } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { TableEmptyState } from '@/components/primitives';
import { confirmAction } from '@/lib/utils/sweetalert';

const categoryConfig: Record<string, { label: string }> = {
  Box: { label: 'Kutu' },
  Carton: { label: 'Karton' },
  Pallet: { label: 'Palet' },
  Crate: { label: 'Kasa' },
  Bag: { label: 'Torba' },
  Drum: { label: 'Varil' },
  Container: { label: 'Konteyner' },
  Bottle: { label: 'Şişe' },
  Jar: { label: 'Kavanoz' },
  Tube: { label: 'Tüp' },
  Pouch: { label: 'Poşet' },
  Roll: { label: 'Rulo' },
  Other: { label: 'Diğer' },
};

export default function PackagingTypesPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
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
      `"${type.name}" ambalaj tipini silmek istediginizden emin misiniz?`,
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
          className="font-mono font-semibold text-slate-900 hover:text-slate-600 transition-colors"
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
          className="font-medium text-slate-900 hover:text-slate-600 transition-colors text-left"
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
        const config = categoryConfig[category] || { label: 'Bilinmiyor' };
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
            {config.label}
          </span>
        );
      },
    },
    {
      title: 'Boyutlar (cm)',
      key: 'dimensions',
      width: 150,
      render: (_, record) => {
        if (!record.length && !record.width && !record.height) {
          return <span className="text-slate-400">-</span>;
        }
        return (
          <span className="text-slate-600">
            {record.length || '-'} x {record.width || '-'} x {record.height || '-'}
          </span>
        );
      },
    },
    {
      title: 'Agirlik (kg)',
      key: 'weight',
      width: 120,
      render: (_, record) => (
        <div>
          {record.emptyWeight !== undefined && (
            <div className="text-xs text-slate-500">Bos: {record.emptyWeight}</div>
          )}
          {record.maxWeightCapacity !== undefined && (
            <div className="text-xs text-slate-600">Max: {record.maxWeightCapacity}</div>
          )}
          {record.emptyWeight === undefined && record.maxWeightCapacity === undefined && (
            <span className="text-slate-400">-</span>
          )}
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
          {!record.defaultQuantity && !record.maxQuantity && (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Özellikler',
      key: 'features',
      width: 180,
      render: (_, record) => (
        <div className="flex flex-wrap gap-1">
          {record.isStackable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              <ArrowsPointingOutIcon className="w-3 h-3" />
              Istiflenebilir
            </span>
          )}
          {record.isRecyclable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
              Geri Donusum
            </span>
          )}
          {record.isReturnable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-300 text-slate-800">
              <ArrowUturnLeftIcon className="w-3 h-3" />
              Iade
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isActive
              ? 'bg-slate-900 text-white'
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
      ),
    },
    {
      title: 'Islemler',
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
            className="text-slate-600 hover:text-slate-900"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <CubeIcon className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Ambalaj Tipleri</h1>
              <p className="text-slate-500 mt-1">Ürün ambalaj tiplerini tanımlayın ve yönetin</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/packaging-types/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Ambalaj Tipi
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CubeIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Ambalaj Tipi
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-300 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-800" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.active}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Aktif
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-800">{stats.recyclable}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Geri Donusturuleb.
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArrowUturnLeftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-700">{stats.returnable}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Iade Edilebilir
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Input
            placeholder="Kod veya ad ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="w-64 [&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Kategoriye gore filtrele"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          >
            {Object.entries(categoryConfig).map(([key, config]) => (
              <Select.Option key={key} value={key}>
                {config.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Table */}
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
            onClick: (e) => {
              const target = e.target as HTMLElement;
              if (target.closest('.ant-dropdown-trigger') || target.closest('.ant-dropdown')) {
                return;
              }
              router.push(`/inventory/packaging-types/${record.id}`);
            },
            className: 'cursor-pointer hover:bg-slate-50',
          })}
          locale={{
            emptyText: <TableEmptyState
              icon={CubeIcon}
              title="Ambalaj tipi bulunamadi"
              description="Henuz ambalaj tipi eklenmemis veya filtrelere uygun kayit yok."
            />
          }}
          className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
        />
      </div>
    </div>
  );
}

'use client';

/**
 * Locations List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Select,
  Dropdown,
  Progress,
  Spin,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useLocations, useDeleteLocation, useWarehouses } from '@/lib/api/hooks/useInventory';
import type { LocationDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

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

  const handleDelete = async (location: LocationDto) => {
    const confirmed = await confirmDelete('Lokasyon', location.name);
    if (confirmed) {
      try {
        await deleteLocation.mutateAsync(location.id);
        showDeleteSuccess('lokasyon');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const filteredLocations = useMemo(() => {
    if (!searchText) return locations;
    return locations.filter((location) =>
      location.name.toLowerCase().includes(searchText.toLowerCase()) ||
      location.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      location.aisle?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [locations, searchText]);

  // Calculate stats
  const totalLocations = locations.length;
  const activeLocations = locations.filter((l) => l.isActive).length;
  const totalCapacity = locations.reduce((sum, l) => sum + (l.capacity || 0), 0);
  const usedCapacity = locations.reduce((sum, l) => sum + (l.usedCapacity || 0), 0);
  const overCapacityLocations = locations.filter((l) => l.capacity > 0 && (l.usedCapacity / l.capacity) >= 0.9).length;

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return '#ef4444';
    if (percent >= 70) return '#f59e0b';
    return '#10b981';
  };

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
            style={{ backgroundColor: '#6366f115' }}
          >
            <MapPinIcon className="w-4 h-4" style={{ color: '#6366f1' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            <div className="text-xs text-slate-500">
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
      width: 150,
      render: (name: string) => (
        <div className="flex items-center gap-1 text-sm text-slate-600">
          <HomeIcon className="w-4 h-4" className="text-slate-400" />
          {name || '-'}
        </div>
      ),
    },
    {
      title: 'Konum',
      key: 'position',
      width: 200,
      render: (_, record) => {
        const parts = [];
        if (record.aisle) parts.push(`Koridor: ${record.aisle}`);
        if (record.shelf) parts.push(`Raf: ${record.shelf}`);
        if (record.bin) parts.push(`Bölme: ${record.bin}`);

        return parts.length > 0 ? (
          <div className="text-sm text-slate-600">{parts.join(' • ')}</div>
        ) : (
          <span className="text-slate-400">-</span>
        );
      },
    },
    {
      title: 'Kapasite Kullanımı',
      key: 'capacity',
      width: 160,
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
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.productCount || 0) - (b.productCount || 0),
      render: (count: number) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>
          {isActive ? 'Aktif' : 'Pasif'}
        </Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => router.push(`/inventory/locations/${record.id}/edit`),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
              <EllipsisHorizontalIcon className="w-4 h-4" className="text-sm" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Lokasyon</span>
              <div className="text-2xl font-semibold text-slate-900">{totalLocations}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f115' }}>
              <MapPinIcon className="w-4 h-4" style={{ color: '#6366f1' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Lokasyon</span>
              <div className="text-2xl font-semibold text-slate-900">{activeLocations}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Kapasite</span>
              <div className="text-2xl font-semibold text-slate-900">
                {usedCapacity}/{totalCapacity}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <InboxIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Yüksek Doluluk</span>
              <div className="text-2xl font-semibold text-slate-900">{overCapacityLocations}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: overCapacityLocations > 0 ? '#ef444415' : '#f59e0b15' }}>
              <ExclamationTriangleIcon className="w-4 h-4" style={{ color: overCapacityLocations > 0 ? '#ef4444' : '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<MapPinIcon className="w-4 h-4" />}
        iconColor="#6366f1"
        title="Lokasyonlar"
        description="Depo içi lokasyonları yönetin"
        itemCount={filteredLocations.length}
        primaryAction={{
          label: 'Yeni Lokasyon',
          onClick: () => router.push(`/inventory/locations/new${selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : ''}`),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4" className={isLoading ? 'animate-spin' : ''} />
          </button>
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
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
            placeholder="Lokasyon ara... (ad, kod, koridor)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4" className="text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
            className="h-10"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredLocations}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1100 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} lokasyon`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

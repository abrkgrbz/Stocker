'use client';

/**
 * Locations List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Dropdown,
  Progress,
  Spin,
  Button,
  Space,
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
        showError('Silme islemi basarisiz');
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

  const totalLocations = locations.length;
  const activeLocations = locations.filter((l) => l.isActive).length;
  const totalCapacity = locations.reduce((sum, l) => sum + (l.capacity || 0), 0);
  const usedCapacity = locations.reduce((sum, l) => sum + (l.usedCapacity || 0), 0);
  const overCapacityLocations = locations.filter((l) => l.capacity > 0 && (l.usedCapacity / l.capacity) >= 0.9).length;

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return '#475569';
    if (percent >= 70) return '#64748b';
    return '#94a3b8';
  };

  const columns: ColumnsType<LocationDto> = [
    {
      title: 'Lokasyon',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <MapPinIcon className="w-5 h-5 text-slate-600" />
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
          <HomeIcon className="w-4 h-4 text-slate-400" />
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
        if (record.bin) parts.push(`Bolme: ${record.bin}`);

        return parts.length > 0 ? (
          <div className="text-sm text-slate-600">{parts.join(' - ')}</div>
        ) : (
          <span className="text-slate-400">-</span>
        );
      },
    },
    {
      title: 'Kapasite Kullanimi',
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
      title: 'Urun Sayisi',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.productCount || 0) - (b.productCount || 0),
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
      filters: [
        { text: 'Aktif', value: true },
        { text: 'Pasif', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive: boolean) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
            isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
          }`}
        >
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
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
            label: 'Duzenle',
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
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Lokasyonlar</h1>
          <p className="text-slate-500 mt-1">Depo ici lokasyonlari yonetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 !text-slate-700 hover:!border-slate-400"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push(`/inventory/locations/new${selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : ''}`)}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Lokasyon
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalLocations}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Lokasyon</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeLocations}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Lokasyon</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InboxIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{usedCapacity}/{totalCapacity}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Kapasite</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{overCapacityLocations}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Yuksek Doluluk</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Select
            placeholder="Depo secin"
            allowClear
            style={{ width: 200 }}
            value={selectedWarehouse}
            onChange={setSelectedWarehouse}
            options={warehouses.map((w) => ({
              value: w.id,
              label: w.name,
            }))}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Input
            placeholder="Lokasyon ara... (ad, kod, koridor)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 400 }}
            allowClear
            className="!rounded-lg !border-slate-300"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
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
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}

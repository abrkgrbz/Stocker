'use client';

/**
 * Warehouse Zones List Page
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
  Spin,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  BeakerIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouseZones,
  useDeleteWarehouseZone,
  useWarehouses,
} from '@/lib/api/hooks/useInventory';
import type { WarehouseZoneDto } from '@/lib/api/services/inventory.types';
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

const zoneTypeLabels: Record<string, string> = {
  'General': 'Genel',
  'ColdStorage': 'Soğuk Depo',
  'Freezer': 'Dondurucu',
  'DryStorage': 'Kuru Depo',
  'Hazardous': 'Tehlikeli Madde',
  'Quarantine': 'Karantina',
  'Returns': 'İade',
  'Picking': 'Toplama',
  'Shipping': 'Sevkiyat',
  'Receiving': 'Kabul',
  'CrossDocking': 'Cross-Docking',
  'HighValue': 'Yüksek Değerli',
  'Bulk': 'Toplu Depolama',
  'Other': 'Diğer',
};

const zoneTypeColors: Record<string, string> = {
  'General': 'default',
  'ColdStorage': 'blue',
  'Freezer': 'cyan',
  'DryStorage': 'orange',
  'Hazardous': 'red',
  'Quarantine': 'purple',
  'Returns': 'magenta',
  'Picking': 'green',
  'Shipping': 'geekblue',
  'Receiving': 'lime',
  'CrossDocking': 'gold',
  'HighValue': 'volcano',
  'Bulk': 'default',
  'Other': 'default',
};

export default function WarehouseZonesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialWarehouseId = searchParams.get('warehouseId');

  const [searchText, setSearchText] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | undefined>(
    initialWarehouseId ? Number(initialWarehouseId) : undefined
  );

  const { data: warehouses = [] } = useWarehouses();
  const { data: zones = [], isLoading, refetch } = useWarehouseZones(selectedWarehouse);
  const deleteZone = useDeleteWarehouseZone();

  const handleDelete = async (zone: WarehouseZoneDto) => {
    const confirmed = await confirmDelete('Depo Bölgesi', zone.name);
    if (confirmed) {
      try {
        await deleteZone.mutateAsync(zone.id);
        showDeleteSuccess('depo bölgesi');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const filteredZones = useMemo(() => {
    if (!searchText) return zones;
    return zones.filter((zone) =>
      zone.name.toLowerCase().includes(searchText.toLowerCase()) ||
      zone.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      zone.warehouseName?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [zones, searchText]);

  // Calculate stats
  const totalZones = zones.length;
  const activeZones = zones.filter((z) => z.isActive).length;
  const temperatureControlledZones = zones.filter((z) => z.isTemperatureControlled).length;
  const hazardousZones = zones.filter((z) => z.isHazardous).length;

  const columns: ColumnsType<WarehouseZoneDto> = [
    {
      title: 'Bölge',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#10b98115' }}
          >
            <MapPinIcon className="w-4 h-4" style={{ color: '#10b981' }} />
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
      title: 'Bölge Tipi',
      dataIndex: 'zoneType',
      key: 'zoneType',
      width: 140,
      render: (zoneType: string) => (
        <Tag color={zoneTypeColors[zoneType] || 'default'}>
          {zoneTypeLabels[zoneType] || 'Bilinmeyen'}
        </Tag>
      ),
    },
    {
      title: 'Alan (m²)',
      key: 'area',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <span className="text-sm text-slate-600">
          {record.totalArea ? record.totalArea.toLocaleString('tr-TR') : '-'}
        </span>
      ),
    },
    {
      title: 'Sıcaklık',
      key: 'temperature',
      width: 130,
      render: (_, record) => {
        if (!record.isTemperatureControlled) {
          return <span className="text-slate-400">-</span>;
        }
        const min = record.minTemperature;
        const max = record.maxTemperature;
        if (min !== undefined && max !== undefined) {
          return (
            <span className="text-sm text-blue-600 font-medium">
              {min}°C - {max}°C
            </span>
          );
        }
        return <span className="text-slate-400">-</span>;
      },
    },
    {
      title: 'Nem',
      key: 'humidity',
      width: 110,
      render: (_, record) => {
        if (!record.isHumidityControlled) {
          return <span className="text-slate-400">-</span>;
        }
        const min = record.minHumidity;
        const max = record.maxHumidity;
        if (min !== undefined && max !== undefined) {
          return (
            <span className="text-sm text-cyan-600 font-medium">
              %{min} - %{max}
            </span>
          );
        }
        return <span className="text-slate-400">-</span>;
      },
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
            onClick: () => router.push(`/inventory/warehouse-zones/${record.id}/edit`),
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
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Bölge</span>
              <div className="text-2xl font-semibold text-slate-900">{totalZones}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <MapPinIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Bölge</span>
              <div className="text-2xl font-semibold text-slate-900">{activeZones}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#22c55e15' }}>
              <CheckCircleIcon className="w-4 h-4" style={{ color: '#22c55e' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Sıcaklık Kontrollü</span>
              <div className="text-2xl font-semibold text-slate-900">{temperatureControlledZones}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <BeakerIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Tehlikeli Madde</span>
              <div className="text-2xl font-semibold text-slate-900">{hazardousZones}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: hazardousZones > 0 ? '#ef444415' : '#f59e0b15' }}>
              <ExclamationTriangleIcon className="w-4 h-4" style={{ color: hazardousZones > 0 ? '#ef4444' : '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<MapPinIcon className="w-4 h-4" />}
        iconColor="#10b981"
        title="Depo Bölgeleri"
        description="Depolarınızdaki bölgeleri tanımlayın ve yönetin"
        itemCount={filteredZones.length}
        primaryAction={{
          label: 'Yeni Bölge',
          onClick: () => router.push(`/inventory/warehouse-zones/new${selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : ''}`),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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
            placeholder="Bölge ara... (ad, kod, depo)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
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
            dataSource={filteredZones}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1100 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bölge`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

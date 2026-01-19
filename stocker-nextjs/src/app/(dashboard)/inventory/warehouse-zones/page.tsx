'use client';

/**
 * Warehouse Zones List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  Input,
  Select,
  Dropdown,
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
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  RectangleGroupIcon,
  TrashIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { TableEmptyState } from '@/components/primitives';
import {
  useWarehouseZones,
  useDeleteWarehouseZone,
  useWarehouses,
} from '@/lib/api/hooks/useInventory';
import type { WarehouseZoneDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

const zoneTypeLabels: Record<string, string> = {
  'General': 'Genel',
  'ColdStorage': 'Soguk Depo',
  'Freezer': 'Dondurucu',
  'DryStorage': 'Kuru Depo',
  'Hazardous': 'Tehlikeli Madde',
  'Quarantine': 'Karantina',
  'Returns': 'Iade',
  'Picking': 'Toplama',
  'Shipping': 'Sevkiyat',
  'Receiving': 'Kabul',
  'CrossDocking': 'Cross-Docking',
  'HighValue': 'Yuksek Degerli',
  'Bulk': 'Toplu Depolama',
  'Other': 'Diger',
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
      title: 'Bölge Tipi',
      dataIndex: 'zoneType',
      key: 'zoneType',
      width: 140,
      render: (zoneType: string) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-200 text-slate-700">
          {zoneTypeLabels[zoneType] || 'Bilinmeyen'}
        </span>
      ),
    },
    {
      title: 'Alan (m2)',
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
      title: 'Sicaklik',
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
            <span className="text-sm text-slate-700 font-medium">
              {min}C - {max}C
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
            <span className="text-sm text-slate-700 font-medium">
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Depo Bölgeleri</h1>
          <p className="text-slate-500 mt-1">Depolarınızdaki bölgeleri tanımlayın ve yönetin</p>
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
            onClick={() => router.push(`/inventory/warehouse-zones/new${selectedWarehouse ? `?warehouseId=${selectedWarehouse}` : ''}`)}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Bölge
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
            <div className="text-2xl font-bold text-slate-900">{totalZones}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Bölge</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeZones}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Bölge</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BeakerIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{temperatureControlledZones}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Sıcaklık Kontrollü</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{hazardousZones}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Tehlikeli Madde</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
          />
          <Input
            placeholder="Bölge ara... (ad, kod, depo)"
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
            dataSource={filteredZones}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1100 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
            locale={{
              emptyText: <TableEmptyState
                icon={RectangleGroupIcon}
                title="Depo bolgesi bulunamadi"
                description="Henuz depo bolgesi eklenmemis veya filtrelere uygun kayit yok."
              />
            }}
            onRow={(record) => ({
              onClick: (e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.ant-dropdown-trigger') || target.closest('.ant-dropdown')) {
                  return;
                }
                router.push(`/inventory/warehouse-zones/${record.id}`);
              },
              className: 'cursor-pointer hover:bg-slate-50',
            })}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}

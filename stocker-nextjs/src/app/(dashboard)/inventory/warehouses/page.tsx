'use client';

/**
 * Warehouses List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Modal,
  Dropdown,
  Spin,
} from 'antd';
import {
  ArrowPathIcon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  InboxIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  useWarehouses,
  useDeleteWarehouse,
  useSetDefaultWarehouse,
} from '@/lib/api/hooks/useInventory';
import type { WarehouseDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';

export default function WarehousesPage() {
  const router = useRouter();
  const [includeInactive, setIncludeInactive] = useState(false);

  // API Hooks
  const { data: warehouses = [], isLoading, refetch } = useWarehouses(includeInactive);
  const deleteWarehouse = useDeleteWarehouse();
  const setDefaultWarehouse = useSetDefaultWarehouse();

  // Calculate stats
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w) => w.isActive).length;
  const totalLocations = warehouses.reduce((sum, w) => sum + (w.locationCount || 0), 0);
  const totalProducts = warehouses.reduce((sum, w) => sum + (w.productCount || 0), 0);

  // Handlers
  const handleView = (id: number) => {
    router.push(`/inventory/warehouses/${id}`);
  };

  const handleEdit = (id: number) => {
    router.push(`/inventory/warehouses/${id}/edit`);
  };

  const handleDelete = (warehouse: WarehouseDto) => {
    if (warehouse.isDefault) {
      Modal.warning({
        title: 'Varsayılan Depo',
        content: 'Varsayılan depo silinemez. Önce başka bir depoyu varsayılan olarak ayarlayın.',
      });
      return;
    }

    Modal.confirm({
      title: 'Depoyu Sil',
      content: `"${warehouse.name}" deposunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteWarehouse.mutateAsync(warehouse.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleSetDefault = async (warehouse: WarehouseDto) => {
    if (warehouse.isDefault) return;

    Modal.confirm({
      title: 'Varsayılan Depo Ayarla',
      content: `"${warehouse.name}" deposunu varsayılan olarak ayarlamak istediğinizden emin misiniz?`,
      okText: 'Ayarla',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await setDefaultWarehouse.mutateAsync(warehouse.id);
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<WarehouseDto> = [
    {
      title: 'Depo',
      key: 'warehouse',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: record.isDefault ? '#f59e0b15' : '#3b82f615' }}>
            <BuildingStorefrontIcon className="w-4 h-4" style={{ color: record.isDefault ? '#f59e0b' : '#3b82f6' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{record.name}</span>
              {record.isDefault && (
                <Tag color="gold" icon={<StarIcon className="w-4 h-4" />} style={{ margin: 0 }}>Varsayılan</Tag>
              )}
            </div>
            <div className="text-xs text-slate-500">{record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Konum',
      key: 'location',
      width: 200,
      render: (_, record) => (
        record.city ? (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <MapPinIcon className="w-4 h-4" className="text-slate-400" />
            <span>{record.city}{record.state ? `, ${record.state}` : ''}</span>
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        )
      ),
    },
    {
      title: 'Yönetici',
      dataIndex: 'manager',
      key: 'manager',
      width: 150,
      render: (manager) => <span className="text-sm text-slate-600">{manager || <span className="text-slate-400">-</span>}</span>,
    },
    {
      title: 'Konumlar',
      dataIndex: 'locationCount',
      key: 'locationCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-50 text-purple-700 rounded">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Ürünler',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 100,
      align: 'center',
      render: (count) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Alan (m²)',
      dataIndex: 'totalArea',
      key: 'totalArea',
      width: 100,
      align: 'right',
      render: (area) => <span className="text-sm text-slate-600">{area ? area.toLocaleString('tr-TR') : '-'}</span>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
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
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => handleView(record.id),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => handleEdit(record.id),
          },
          {
            key: 'setDefault',
            icon: <StarOutlined />,
            label: 'Varsayılan Yap',
            disabled: record.isDefault,
            onClick: () => handleSetDefault(record),
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            disabled: record.isDefault,
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
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Depo</span>
              <div className="text-2xl font-semibold text-slate-900">{totalWarehouses}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <BuildingStorefrontIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Depo</span>
              <div className="text-2xl font-semibold text-slate-900">{activeWarehouses}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Konum</span>
              <div className="text-2xl font-semibold text-slate-900">{totalLocations}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <MapPinIcon className="w-4 h-4" style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Depolardaki Ürün</span>
              <div className="text-2xl font-semibold text-slate-900">{totalProducts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <InboxIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BuildingStorefrontIcon className="w-4 h-4" />}
        iconColor="#3b82f6"
        title="Depolar"
        description="Depo ve lokasyonlarınızı yönetin"
        itemCount={totalWarehouses}
        primaryAction={{
          label: 'Yeni Depo',
          onClick: () => router.push('/inventory/warehouses/new'),
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
            dataSource={warehouses}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1200 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} depo`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

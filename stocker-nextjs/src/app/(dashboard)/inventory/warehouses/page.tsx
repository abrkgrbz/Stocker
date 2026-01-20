'use client';

/**
 * Warehouses List Page
 * Monochrome design system following lot-batches design principles
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Modal,
  Dropdown,
  Spin,
  Button,
  Input,
  Tooltip,
} from 'antd';
import {
  ArrowPathIcon,
  BuildingOffice2Icon,
  BuildingStorefrontIcon,
  CheckCircleIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { TableEmptyState } from '@/components/primitives';
import {
  useWarehouses,
  useDeleteWarehouse,
  useSetDefaultWarehouse,
} from '@/lib/api/hooks/useInventory';
import type { WarehouseDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { showError, showSuccess } from '@/lib/utils/sweetalert';

const { Search } = Input;

export default function WarehousesPage() {
  const router = useRouter();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [defaultModalOpen, setDefaultModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseDto | null>(null);

  // API Hooks
  const { data: warehouses = [], isLoading, refetch } = useWarehouses(includeInactive);
  const deleteWarehouse = useDeleteWarehouse();
  const setDefaultWarehouse = useSetDefaultWarehouse();

  // Calculate stats
  const totalWarehouses = warehouses.length;
  const activeWarehouses = warehouses.filter((w) => w.isActive).length;
  const totalLocations = warehouses.reduce((sum, w) => sum + (w.locationCount || 0), 0);
  const totalProducts = warehouses.reduce((sum, w) => sum + (w.productCount || 0), 0);

  // Filtered data
  const filteredWarehouses = warehouses.filter((w) => {
    if (!searchText) return true;
    const lowerSearch = searchText.toLowerCase();
    return (
      w.name.toLowerCase().includes(lowerSearch) ||
      w.code?.toLowerCase().includes(lowerSearch) ||
      w.city?.toLowerCase().includes(lowerSearch)
    );
  });

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
    setSelectedWarehouse(warehouse);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedWarehouse) return;
    try {
      await deleteWarehouse.mutateAsync(selectedWarehouse.id);
      showSuccess('Başarılı', 'Depo başarıyla silindi');
      setDeleteModalOpen(false);
      setSelectedWarehouse(null);
    } catch {
      showError('Silme işlemi başarısız oldu');
    }
  };

  const handleSetDefault = (warehouse: WarehouseDto) => {
    if (warehouse.isDefault) {
      return;
    }
    setSelectedWarehouse(warehouse);
    setDefaultModalOpen(true);
  };

  const confirmSetDefault = async () => {
    if (!selectedWarehouse) return;
    try {
      await setDefaultWarehouse.mutateAsync(selectedWarehouse.id);
      showSuccess('Başarılı', 'Varsayılan depo ayarlandı');
      setDefaultModalOpen(false);
      setSelectedWarehouse(null);
    } catch {
      showError('Varsayılan ayarlama işlemi başarısız oldu');
    }
  };

  // Table columns
  const columns: ColumnsType<WarehouseDto> = [
    {
      title: 'Depo',
      key: 'warehouse',
      width: 280,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <BuildingStorefrontIcon className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{record.name}</span>
              {record.isDefault && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-900 text-white rounded">
                  <StarIcon className="w-3 h-3" />
                  Varsayılan
                </span>
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
            <MapPinIcon className="w-4 h-4 text-slate-400" />
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
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
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
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
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
      width: 60,
      fixed: 'right',
      render: (_, record) => {
        const menuItems = [
          {
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
          },
          {
            key: 'setDefault',
            icon: <StarIcon className="w-4 h-4" />,
            label: 'Varsayılan Yap',
            disabled: record.isDefault,
          },
          { type: 'divider' as const },
          {
            key: 'delete',
            icon: <TrashIcon className="w-4 h-4" />,
            label: 'Sil',
            danger: true,
            disabled: record.isDefault,
          },
        ];

        const handleMenuClick = (key: string) => {
          switch (key) {
            case 'view':
              handleView(record.id);
              break;
            case 'edit':
              handleEdit(record.id);
              break;
            case 'setDefault':
              handleSetDefault(record);
              break;
            case 'delete':
              handleDelete(record);
              break;
          }
        };

        return (
          <Dropdown menu={{ items: menuItems, onClick: ({ key }) => handleMenuClick(key) }} trigger={['click']}>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors" aria-label="Satır işlemleri">
              <EllipsisHorizontalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <BuildingStorefrontIcon className="w-7 h-7" />
              Depolar
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Depo ve lokasyonlarınızı yönetin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Tooltip title="Yenile">
              <Button
                icon={<ArrowPathIcon className="w-4 h-4" />}
                className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
                onClick={() => refetch()}
                loading={isLoading}
              />
            </Tooltip>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
              onClick={() => router.push('/inventory/warehouses/new')}
            >
              Yeni Depo
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Depo</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalWarehouses}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <BuildingStorefrontIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Aktif Depo</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{activeWarehouses}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Toplam Konum</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalLocations}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <MapPinIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Depolardaki Ürün</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalProducts}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InboxIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Search
              placeholder="Depo adı, kodu veya şehir ara..."
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              style={{ width: 300 }}
            />
            <div className="flex-1" />
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              Pasif depoları göster
            </label>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={filteredWarehouses}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 1200 }}
            locale={{
              emptyText: <TableEmptyState
                icon={BuildingOffice2Icon}
                title="Depo bulunamadi"
                description="Henuz depo eklenmemis veya filtrelere uygun kayit yok."
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
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Depoyu Sil"
          open={deleteModalOpen}
          onOk={confirmDelete}
          onCancel={() => {
            setDeleteModalOpen(false);
            setSelectedWarehouse(null);
          }}
          okText="Sil"
          cancelText="İptal"
          okButtonProps={{
            danger: true,
            loading: deleteWarehouse.isPending,
            className: '!bg-red-600 hover:!bg-red-700 !border-red-600',
          }}
          cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
        >
          <p>
            &quot;{selectedWarehouse?.name}&quot; deposunu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
        </Modal>

        {/* Set Default Confirmation Modal */}
        <Modal
          title="Varsayılan Depo Ayarla"
          open={defaultModalOpen}
          onOk={confirmSetDefault}
          onCancel={() => {
            setDefaultModalOpen(false);
            setSelectedWarehouse(null);
          }}
          okText="Ayarla"
          cancelText="İptal"
          okButtonProps={{
            loading: setDefaultWarehouse.isPending,
            className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900',
          }}
          cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
        >
          <p>
            &quot;{selectedWarehouse?.name}&quot; deposunu varsayılan olarak ayarlamak istediğinizden emin misiniz?
          </p>
        </Modal>
      </Spin>
    </div>
  );
}

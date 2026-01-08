'use client';

/**
 * Suppliers List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
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
  MagnifyingGlassIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useSuppliers, useDeleteSupplier } from '@/lib/api/hooks/useInventory';
import type { SupplierDto } from '@/lib/api/services/inventory.types';
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

export default function SuppliersPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: suppliers = [], isLoading, refetch } = useSuppliers();
  const deleteSupplier = useDeleteSupplier();

  const handleDelete = async (supplier: SupplierDto) => {
    const confirmed = await confirmDelete('Tedarikçi', supplier.name);
    if (confirmed) {
      try {
        await deleteSupplier.mutateAsync(supplier.id);
        showDeleteSuccess('tedarikçi');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const filteredSuppliers = useMemo(() => {
    if (!searchText) return suppliers;
    return suppliers.filter((supplier) =>
      supplier.name.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.code?.toLowerCase().includes(searchText.toLowerCase()) ||
      supplier.city?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [suppliers, searchText]);

  // Calculate stats
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.isActive).length;
  const preferredSuppliers = suppliers.filter((s) => s.isActive).length;
  const totalProducts = suppliers.reduce((sum, s) => sum + (s.productCount || 0), 0);

  const columns: ColumnsType<SupplierDto> = [
    {
      title: 'Tedarikçi',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: record.isActive ? '#f59e0b15' : '#10b98115' }}
          >
            <BuildingStorefrontIcon className="w-4 h-4" style={{ color: record.isActive ? '#f59e0b' : '#10b981' }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900">{name}</span>
              {record.isActive && (
                <StarIcon className="w-3 h-3 text-amber-500" />
              )}
            </div>
            {record.code && (
              <div className="text-xs text-slate-500">
                {record.code}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'İletişim',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="text-sm">
          {record.phone && (
            <div className="flex items-center gap-1 text-slate-600">
              <PhoneIcon className="w-4 h-4 text-slate-400" />
              {record.phone}
            </div>
          )}
          {record.city && (
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
              <MapPinIcon className="w-4 h-4 text-slate-400" />
              {record.city}
            </div>
          )}
          {!record.phone && !record.city && <span className="text-slate-400">-</span>}
        </div>
      ),
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      align: 'center',
      sorter: (a, b) => (a.productCount || 0) - (b.productCount || 0),
      render: (count: number) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded">
          {count || 0}
        </span>
      ),
    },
    {
      title: 'Tercih',
      dataIndex: 'isPreferred',
      key: 'isPreferred',
      width: 130,
      align: 'center',
      filters: [
        { text: 'Tercih Edilen', value: true },
        { text: 'Standart', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isPreferred: boolean) => (
        isPreferred ? (
          <Tag color="gold" icon={<StarIcon className="w-4 h-4" />}>Tercih Edilen</Tag>
        ) : (
          <Tag color="default">Standart</Tag>
        )
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
            key: 'view',
            icon: <EyeIcon className="w-4 h-4" />,
            label: 'Görüntüle',
            onClick: () => router.push(`/inventory/suppliers/${record.id}`),
          },
          {
            key: 'edit',
            icon: <PencilIcon className="w-4 h-4" />,
            label: 'Düzenle',
            onClick: () => router.push(`/inventory/suppliers/${record.id}/edit`),
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
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Tedarikçi</span>
              <div className="text-2xl font-semibold text-slate-900">{totalSuppliers}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <BuildingStorefrontIcon className="w-4 h-4" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Tedarikçi</span>
              <div className="text-2xl font-semibold text-slate-900">{activeSuppliers}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <CheckCircleIcon className="w-4 h-4 text-blue-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Tercih Edilen</span>
              <div className="text-2xl font-semibold text-slate-900">{preferredSuppliers}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <StarIcon className="w-4 h-4" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Ürün</span>
              <div className="text-2xl font-semibold text-slate-900">{totalProducts}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <InboxIcon className="w-4 h-4 text-violet-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<BuildingStorefrontIcon className="w-4 h-4" />}
        iconColor="#10b981"
        title="Tedarikçiler"
        description="Tedarikçi ve satıcı bilgilerini yönetin"
        itemCount={filteredSuppliers.length}
        primaryAction={{
          label: 'Yeni Tedarikçi',
          onClick: () => router.push('/inventory/suppliers/new'),
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

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Tedarikçi ara... (ad, kod, şehir)"
          prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 400 }}
          allowClear
          className="h-10"
        />
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
            dataSource={filteredSuppliers}
            rowKey="id"
            loading={isLoading}
            scroll={{ x: 900 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} tedarikçi`,
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/inventory/suppliers/${record.id}`),
              style: { cursor: 'pointer' },
            })}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

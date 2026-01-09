'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Space,
  Select,
  Avatar,
  Modal,
  Dropdown,
  Checkbox,
  Button,
  Spin,
  Tabs,
} from 'antd';
import {
  ArchiveBoxIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  QrCodeIcon,
  Squares2X2Icon,
  TrashIcon,
  XCircleIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { useProducts, useProductVariants, useDeleteProductVariant } from '@/lib/api/hooks/useInventory';
import type { ProductVariantDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

export default function ProductVariantsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [activeTab, setActiveTab] = useState('all');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariantDto | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const includeInactive = activeTab === 'all';
  const { data: products = [] } = useProducts();
  const { data: variants = [], isLoading, refetch } = useProductVariants(selectedProduct, includeInactive);
  const deleteVariant = useDeleteProductVariant();

  const filteredVariants = useMemo(() => {
    return variants.filter((v) => {
      const matchesSearch =
        !searchText ||
        v.variantName?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.sku?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.barcode?.toLowerCase().includes(searchText.toLowerCase()) ||
        v.productName?.toLowerCase().includes(searchText.toLowerCase());

      return matchesSearch;
    });
  }, [variants, searchText]);

  // Stats calculations
  const stats = useMemo(() => {
    const activeVariants = filteredVariants.filter((v) => v.isActive);
    const defaultVariants = filteredVariants.filter((v) => v.isDefault);
    const totalValue = filteredVariants.reduce((sum, v) => sum + (v.price || 0), 0);
    const totalStock = filteredVariants.reduce((sum, v) => sum + (v.totalStock || 0), 0);

    return {
      total: filteredVariants.length,
      active: activeVariants.length,
      defaults: defaultVariants.length,
      totalValue,
      totalStock,
    };
  }, [filteredVariants]);

  const handleDelete = async () => {
    if (!variantToDelete) return;
    try {
      await deleteVariant.mutateAsync(variantToDelete.id);
      setDeleteModalOpen(false);
      setVariantToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const columns: ColumnsType<ProductVariantDto> = [
    {
      title: 'Varyant',
      key: 'variant',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            shape="square"
            size={40}
            src={record.imageUrl}
            icon={<Squares2X2Icon className="w-5 h-5" />}
            style={{ backgroundColor: '#f1f5f9' }}
          />
          <div>
            <div className="font-medium text-slate-900">{record.variantName}</div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <QrCodeIcon className="w-3 h-3" />
              <span>{record.sku}</span>
              {record.barcode && (
                <>
                  <span className="mx-1">-</span>
                  <span>{record.barcode}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Urun',
      key: 'product',
      width: 180,
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-700 truncate max-w-[160px]">{record.productName}</div>
        </div>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 140,
      render: (_, record) => (
        <div>
          {record.price ? (
            <>
              <div className="font-medium text-slate-900">
                {record.price.toLocaleString('tr-TR', {
                  style: 'currency',
                  currency: record.priceCurrency || 'TRY',
                })}
              </div>
              {record.costPrice && (
                <div className="text-xs text-slate-500">
                  Maliyet:{' '}
                  {record.costPrice.toLocaleString('tr-TR', {
                    style: 'currency',
                    currency: record.costPriceCurrency || 'TRY',
                  })}
                </div>
              )}
            </>
          ) : (
            <span className="text-slate-400">-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Stok',
      dataIndex: 'totalStock',
      key: 'totalStock',
      width: 100,
      render: (stock) => (
        <span className={stock > 0 ? 'text-slate-900 font-medium' : 'text-slate-400'}>
          {stock ?? 0}
        </span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 140,
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
            record.isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
          }`}>
            {record.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
            {record.isActive ? 'Aktif' : 'Pasif'}
          </span>
          {record.isDefault && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
              Varsayilan
            </span>
          )}
        </div>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 48,
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                icon: <EyeIcon className="w-4 h-4" />,
                label: 'Goruntule',
                onClick: () => router.push(`/inventory/product-variants/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Duzenle',
                onClick: () => router.push(`/inventory/product-variants/${record.id}/edit`),
              },
              { type: 'divider' },
              {
                key: 'delete',
                icon: <TrashIcon className="w-4 h-4" />,
                label: 'Sil',
                danger: true,
                onClick: () => {
                  setVariantToDelete(record);
                  setDeleteModalOpen(true);
                },
              },
            ],
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <button className="p-1.5 rounded-md hover:bg-slate-100 transition-colors">
            <EllipsisHorizontalIcon className="w-5 h-5 text-slate-400" />
          </button>
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const tabItems = [
    {
      key: 'active',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Aktif
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.active}
          </span>
        </span>
      ),
    },
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-2">
          <InboxIcon className="w-4 h-4" />
          Tumu
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.total}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
              <Squares2X2Icon className="w-5 h-5 text-white" />
            </div>
            Urun Varyantlari
          </h1>
          <p className="text-slate-500 mt-1">SKU ve barkod bazli urun cesitleri</p>
        </div>
        <Space>
          <Button
            icon={<QrCodeIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/product-variants/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Varyant
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Squares2X2Icon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Varyant
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-white" />
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
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ArchiveBoxIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.totalStock.toLocaleString('tr-TR')}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Stok
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {stats.totalValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Deger
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          className="mb-6 [&_.ant-tabs-tab]:!text-slate-600 [&_.ant-tabs-tab-active_.ant-tabs-tab-btn]:!text-slate-900 [&_.ant-tabs-ink-bar]:!bg-slate-900"
        />

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <Input
            placeholder="Varyant, SKU veya barkod ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 280 }}
            allowClear
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
          <Select
            placeholder="Urun filtrele"
            style={{ width: 220 }}
            allowClear
            showSearch
            optionFilterProp="label"
            value={selectedProduct}
            onChange={setSelectedProduct}
            className="[&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
            options={products.map((p) => ({
              value: p.id,
              label: `${p.code} - ${p.name}`,
            }))}
          />
        </div>

        {/* Bulk Actions Bar */}
        {selectedRowKeys.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedRowKeys.length} varyant secildi
            </span>
            <button
              onClick={() => setSelectedRowKeys([])}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Secimi temizle
            </button>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredVariants}
            rowKey="id"
            loading={isLoading}
            rowSelection={rowSelection}
            onRow={(record) => ({
              onClick: () => router.push(`/inventory/product-variants/${record.id}`),
              className: 'cursor-pointer',
            })}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} varyant`,
            }}
            locale={{ emptyText: 'Varyant bulunamadi' }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        title={<span className="text-slate-900 font-semibold">Varyanti Sil</span>}
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setVariantToDelete(null);
        }}
        onOk={handleDelete}
        okText="Sil"
        cancelText="Iptal"
        okButtonProps={{ danger: true, loading: deleteVariant.isPending }}
        cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
      >
        <p className="text-slate-600">
          <strong className="text-slate-900">{variantToDelete?.variantName}</strong> varyantini silmek istediginize emin misiniz?
        </p>
        <p className="text-slate-500 text-sm mt-2">
          SKU: {variantToDelete?.sku}
        </p>
      </Modal>
    </div>
  );
}

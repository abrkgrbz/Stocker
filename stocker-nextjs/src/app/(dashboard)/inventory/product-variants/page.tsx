'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Space,
  Tag,
  Select,
  Switch,
  Avatar,
  Modal,
  Dropdown,
  Checkbox,
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
} from '@heroicons/react/24/outline';
import {
  PageContainer,
  ListPageHeader,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import { useProducts, useProductVariants, useDeleteProductVariant } from '@/lib/api/hooks/useInventory';
import type { ProductVariantDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';

export default function ProductVariantsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<number | undefined>();
  const [includeInactive, setIncludeInactive] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [variantToDelete, setVariantToDelete] = useState<ProductVariantDto | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const { data: products = [] } = useProducts();
  const { data: variants = [], isLoading } = useProductVariants(selectedProduct, includeInactive);
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
                  <span className="mx-1">•</span>
                  <span>{record.barcode}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Ürün',
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
        <Space direction="vertical" size={4}>
          <Tag
            icon={record.isActive ? <CheckCircleIcon className="w-3 h-3" /> : <XCircleIcon className="w-3 h-3" />}
            color={record.isActive ? 'success' : 'default'}
            className="m-0"
          >
            {record.isActive ? 'Aktif' : 'Pasif'}
          </Tag>
          {record.isDefault && (
            <Tag color="blue" className="m-0">Varsayılan</Tag>
          )}
        </Space>
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
                label: 'Görüntüle',
                onClick: () => router.push(`/inventory/product-variants/${record.id}`),
              },
              {
                key: 'edit',
                icon: <PencilIcon className="w-4 h-4" />,
                label: 'Düzenle',
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

  return (
    <PageContainer maxWidth="6xl">
      {/* Header */}
      <ListPageHeader
        icon={<Squares2X2Icon className="w-5 h-5" />}
        iconColor="#8b5cf6"
        title="Ürün Varyantları"
        description="SKU ve barkod bazlı ürün çeşitleri"
        itemCount={stats.total}
        primaryAction={{
          label: 'Yeni Varyant',
          icon: <PlusIcon className="w-4 h-4" />,
          onClick: () => router.push('/inventory/product-variants/new'),
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Varyant</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#8b5cf615' }}
            >
              <Squares2X2Icon className="w-5 h-5" style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif</span>
              <div className="text-2xl font-semibold text-emerald-600">{stats.active}</div>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#10b98115' }}
            >
              <CheckCircleIcon className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Stok</span>
              <div className="text-2xl font-semibold text-blue-600">{stats.totalStock.toLocaleString('tr-TR')}</div>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#3b82f615' }}
            >
              <ArchiveBoxIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Değer</span>
              <div className="text-2xl font-semibold text-amber-600">
                {stats.totalValue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
              </div>
            </div>
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#f59e0b15' }}
            >
              <CurrencyDollarIcon className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <DataTableWrapper>
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Varyant, SKU veya barkod ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="Ürün filtrele"
              className="w-56"
              allowClear
              showSearch
              optionFilterProp="label"
              value={selectedProduct}
              onChange={setSelectedProduct}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.code} - ${p.name}`,
              }))}
            />
            <div className="flex items-center gap-2 ml-auto">
              <Checkbox
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
              >
                <span className="text-sm text-slate-600">Pasifleri göster</span>
              </Checkbox>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectedRowKeys.length > 0 && (
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-600">
              {selectedRowKeys.length} varyant seçildi
            </span>
            <Space size="small">
              <button
                onClick={() => setSelectedRowKeys([])}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                Seçimi temizle
              </button>
            </Space>
          </div>
        )}

        {/* Table */}
        <Table
          columns={columns}
          dataSource={filteredVariants}
          rowKey="id"
          loading={isLoading}
          rowSelection={rowSelection}
          onRow={(record) => ({
            onClick: () => router.push(`/inventory/product-variants/${record.id}`),
            className: 'cursor-pointer hover:bg-slate-50',
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => (
              <span className="text-sm text-slate-500">Toplam {total} varyant</span>
            ),
          }}
          locale={{ emptyText: 'Varyant bulunamadı' }}
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:font-medium [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:uppercase [&_.ant-table-thead>tr>th]:tracking-wide"
        />
      </DataTableWrapper>

      {/* Delete Modal */}
      <Modal
        title="Varyantı Sil"
        open={deleteModalOpen}
        onCancel={() => {
          setDeleteModalOpen(false);
          setVariantToDelete(null);
        }}
        onOk={handleDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: deleteVariant.isPending }}
      >
        <p className="text-slate-600">
          <strong className="text-slate-900">{variantToDelete?.variantName}</strong> varyantını silmek istediğinize emin misiniz?
        </p>
        <p className="text-slate-500 text-sm mt-2">
          SKU: {variantToDelete?.sku}
        </p>
      </Modal>
    </PageContainer>
  );
}

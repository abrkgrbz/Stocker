'use client';

/**
 * Product Bundles List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Popconfirm,
  message,
  Tooltip,
  Badge,
} from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useProductBundles, useDeleteProductBundle } from '@/lib/api/hooks/useInventory';
import type { ProductBundleDto, BundleType, BundlePricingType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
} from '@/components/ui/enterprise-page';
import dayjs from 'dayjs';

const bundleTypeConfig: Record<BundleType, { color: string; label: string }> = {
  Fixed: { color: 'blue', label: 'Sabit' },
  Configurable: { color: 'purple', label: 'Yapılandırılabilir' },
  Kit: { color: 'cyan', label: 'Kit' },
  Package: { color: 'green', label: 'Paket' },
  Combo: { color: 'orange', label: 'Kombo' },
};

const pricingTypeConfig: Record<BundlePricingType, { label: string }> = {
  FixedPrice: { label: 'Sabit Fiyat' },
  DynamicSum: { label: 'Dinamik Toplam' },
  DiscountedSum: { label: 'İndirimli Toplam' },
  PercentageDiscount: { label: 'Yüzde İndirim' },
};

export default function ProductBundlesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: bundles = [], isLoading, refetch } = useProductBundles(true, false);
  const deleteBundle = useDeleteProductBundle();

  const handleDelete = async (id: number) => {
    try {
      await deleteBundle.mutateAsync(id);
      message.success('Paket silindi');
    } catch {
      message.error('Silme işlemi başarısız');
    }
  };

  // Calculate stats
  const totalBundles = bundles.length;
  const activeBundles = bundles.filter((b) => b.isActive).length;
  const validBundles = bundles.filter((b) => b.isValid).length;
  const totalValue = bundles.reduce((sum, b) => sum + (b.calculatedPrice || 0), 0);

  // Filter bundles
  const filteredBundles = useMemo(() => {
    if (!searchText) return bundles;
    return bundles.filter((bundle) =>
      bundle.name.toLowerCase().includes(searchText.toLowerCase()) ||
      bundle.code.toLowerCase().includes(searchText.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [bundles, searchText]);

  const columns: ColumnsType<ProductBundleDto> = [
    {
      title: 'Paket',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#f59e0b15' }}
          >
            <GiftIcon className="w-5 h-5" style={{ color: '#f59e0b' }} />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            <div className="text-xs text-slate-500">Kod: {record.code}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Tip',
      dataIndex: 'bundleType',
      key: 'bundleType',
      width: 140,
      render: (type: BundleType) => (
        <Tag color={bundleTypeConfig[type]?.color || 'default'}>
          {bundleTypeConfig[type]?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Fiyatlandırma',
      dataIndex: 'pricingType',
      key: 'pricingType',
      width: 140,
      render: (type: BundlePricingType) => (
        <span className="text-sm text-slate-600">{pricingTypeConfig[type]?.label || type}</span>
      ),
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'items',
      key: 'items',
      width: 100,
      align: 'center',
      render: (items: ProductBundleDto['items']) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-indigo-50 text-indigo-700 rounded">
          {items?.length || 0}
        </span>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 130,
      align: 'right',
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium text-slate-900">
            {record.calculatedPrice?.toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
            })} ₺
          </div>
          {record.discountPercentage && record.discountPercentage > 0 && (
            <span className="text-xs text-red-600">%{record.discountPercentage} indirim</span>
          )}
        </div>
      ),
    },
    {
      title: 'Geçerlilik',
      key: 'validity',
      width: 130,
      render: (_, record) => {
        if (!record.validFrom && !record.validTo) {
          return <span className="text-sm text-slate-400">Süresiz</span>;
        }
        const now = dayjs();
        const validFrom = record.validFrom ? dayjs(record.validFrom) : null;
        const validTo = record.validTo ? dayjs(record.validTo) : null;

        let status: 'success' | 'warning' | 'error' = 'success';
        if (validFrom && now.isBefore(validFrom)) status = 'warning';
        if (validTo && now.isAfter(validTo)) status = 'error';

        return (
          <Tag color={status === 'success' ? 'green' : status === 'warning' ? 'orange' : 'red'}>
            {status === 'success' ? 'Aktif' : status === 'warning' ? 'Başlamadı' : 'Süresi Doldu'}
          </Tag>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'green' : 'default'}>{isActive ? 'Aktif' : 'Pasif'}</Tag>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Düzenle">
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/inventory/product-bundles/${record.id}/edit`);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
          </Tooltip>
          <Popconfirm
            title="Paketi silmek istediğinize emin misiniz?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record.id);
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Evet"
            cancelText="Hayır"
          >
            <Tooltip title="Sil">
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Paket</span>
              <div className="text-2xl font-semibold text-slate-900">{totalBundles}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <GiftIcon className="w-6 h-6" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Paket</span>
              <div className="text-2xl font-semibold text-slate-900">{activeBundles}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-6 h-6" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Geçerli Paket</span>
              <div className="text-2xl font-semibold text-slate-900">{validBundles}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#8b5cf615' }}>
              <CheckCircleIcon className="w-6 h-6" style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Değer</span>
              <div className="text-2xl font-semibold text-slate-900">
                {totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <CurrencyDollarIcon className="w-6 h-6" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<GiftIcon className="w-5 h-5" />}
        iconColor="#f59e0b"
        title="Ürün Paketleri"
        description="Ürün paketlerini ve komboları yönetin"
        itemCount={filteredBundles.length}
        primaryAction={{
          label: 'Yeni Paket',
          onClick: () => router.push('/inventory/product-bundles/new'),
          icon: <PlusIcon className="w-4 h-4" />,
        }}
        secondaryActions={
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <Input
            placeholder="Paket ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
            className="h-10"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <DataTableWrapper>
          <Table
            columns={columns}
            dataSource={filteredBundles}
            rowKey="id"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} paket`,
            }}
            onRow={(record) => ({
              onClick: () => router.push(`/inventory/product-bundles/${record.id}`),
              style: { cursor: 'pointer' },
            })}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

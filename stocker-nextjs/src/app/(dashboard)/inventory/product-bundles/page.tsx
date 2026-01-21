'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Popconfirm,
  Tooltip,
  Button,
  Space,
  Spin,
  Tabs,
  Modal,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  GiftIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
  InboxIcon,
  ClockIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useProductBundles, useDeleteProductBundle } from '@/lib/api/hooks/useInventory';
import type { ProductBundleDto, BundleType, BundlePricingType } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import { TableEmptyState } from '@/components/primitives';
import dayjs from 'dayjs';

const bundleTypeConfig: Record<BundleType, { label: string }> = {
  FixedBundle: { label: 'Sabit' },
  ConfigurableBundle: { label: 'Yapılandırılabilir' },
  Kit: { label: 'Kit' },
  Pack: { label: 'Paket' },
  Combo: { label: 'Kombo' },
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
  const [activeTab, setActiveTab] = useState('all');

  const { data: bundles = [], isLoading, refetch } = useProductBundles(true, false);
  const deleteBundle = useDeleteProductBundle();

  const handleDelete = async (id: number, name: string) => {
    Modal.confirm({
      title: 'Paketi Sil',
      content: `"${name}" paketini silmek istediğinize emin misiniz?`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteBundle.mutateAsync(id);
        } catch {
          // Error handled by hook
        }
      },
    });
  };

  // Calculate stats
  const stats = {
    total: bundles.length,
    active: bundles.filter((b) => b.isActive).length,
    valid: bundles.filter((b) => b.isValid).length,
    totalValue: bundles.reduce((sum, b) => sum + (b.calculatedPrice || 0), 0),
  };

  // Filter bundles
  const filteredBundles = useMemo(() => {
    let result = bundles;

    if (activeTab === 'active') {
      result = result.filter((b) => b.isActive);
    } else if (activeTab === 'valid') {
      result = result.filter((b) => b.isValid);
    }

    if (!searchText) return result;
    return result.filter((bundle) =>
      bundle.name.toLowerCase().includes(searchText.toLowerCase()) ||
      bundle.code.toLowerCase().includes(searchText.toLowerCase()) ||
      bundle.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [bundles, searchText, activeTab]);

  const columns: ColumnsType<ProductBundleDto> = [
    {
      title: 'Paket',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <GiftIcon className="w-5 h-5 text-slate-600" />
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
          {bundleTypeConfig[type]?.label || type}
        </span>
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
        <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-slate-200 text-slate-700 rounded-md">
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
            })} TL
          </div>
          {record.discountPercentage && record.discountPercentage > 0 && (
            <span className="text-xs text-slate-500">%{record.discountPercentage} indirim</span>
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

        let status: 'active' | 'pending' | 'expired' = 'active';
        let label = 'Aktif';
        if (validFrom && now.isBefore(validFrom)) {
          status = 'pending';
          label = 'Başlamadı';
        }
        if (validTo && now.isAfter(validTo)) {
          status = 'expired';
          label = 'Süresi Doldu';
        }

        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
            status === 'active' ? 'bg-slate-900 text-white' :
            status === 'pending' ? 'bg-slate-300 text-slate-700' :
            'bg-slate-200 text-slate-600'
          }`}>
            {status === 'active' && <CheckCircleIcon className="w-3 h-3" />}
            {status === 'pending' && <ClockIcon className="w-3 h-3" />}
            {status === 'expired' && <XCircleIcon className="w-3 h-3" />}
            {label}
          </span>
        );
      },
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
          isActive ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600'
        }`}>
          {isActive ? 'Aktif' : 'Pasif'}
        </span>
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
          <Tooltip title="Sil">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id, record.name);
              }}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: (
        <span className="flex items-center gap-2">
          <InboxIcon className="w-4 h-4" />
          Tümü
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.total}
          </span>
        </span>
      ),
    },
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
      key: 'valid',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleIcon className="w-4 h-4" />
          Geçerli
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
            {stats.valid}
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
              <GiftIcon className="w-5 h-5 text-white" />
            </div>
            Ürün Paketleri
          </h1>
          <p className="text-slate-500 mt-1">Ürün paketlerini ve komboları yönetin</p>
        </div>
        <Space>
          <Button
            icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
            className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
          >
            Yenile
          </Button>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => router.push('/inventory/product-bundles/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Paket
          </Button>
        </Space>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <GiftIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Paket
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
              Aktif Paket
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.valid}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Geçerli Paket
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
              {stats.totalValue.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TL
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
              Toplam Değer
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

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Paket ara..."
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
            className="[&_.ant-input]:!border-slate-300 [&_.ant-input]:!rounded-lg"
          />
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredBundles}
            rowKey="id"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
            onRow={(record) => ({
              onClick: (e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.ant-dropdown-trigger') || target.closest('.ant-dropdown')) {
                  return;
                }
                router.push(`/inventory/product-bundles/${record.id}`);
              },
              style: { cursor: 'pointer' },
            })}
            locale={{
              emptyText: <TableEmptyState
                icon={GiftIcon}
                title="Paket bulunamadi"
                description="Henuz paket eklenmemis veya filtrelere uygun kayit yok."
              />
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}

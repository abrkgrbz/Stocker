'use client';

/**
 * Brands List Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Tag,
  Input,
  Avatar,
  Popconfirm,
  Spin,
} from 'antd';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useBrands, useDeleteBrand } from '@/lib/api/hooks/useInventory';
import type { BrandDto } from '@/lib/api/services/inventory.types';
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

export default function BrandsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const { data: brands = [], isLoading, refetch } = useBrands();
  const deleteBrand = useDeleteBrand();

  const handleDelete = async (brand: BrandDto) => {
    const confirmed = await confirmDelete('Marka', brand.name);
    if (confirmed) {
      try {
        await deleteBrand.mutateAsync(brand.id);
        showDeleteSuccess('marka');
      } catch (error) {
        showError('Silme işlemi başarısız');
      }
    }
  };

  const filteredBrands = useMemo(() => {
    if (!searchText) return brands;
    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchText.toLowerCase()) ||
      brand.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [brands, searchText]);

  // Calculate stats
  const totalBrands = brands.length;
  const activeBrands = brands.filter((b) => b.isActive).length;
  const brandsWithWebsite = brands.filter((b) => b.website).length;
  const totalProducts = brands.reduce((sum, b) => sum + (b.productCount || 0), 0);

  const columns: ColumnsType<BrandDto> = [
    {
      title: 'Marka',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div className="flex items-center gap-3">
          {record.logoUrl ? (
            <Avatar src={record.logoUrl} size={40} shape="square" />
          ) : (
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#f59e0b15' }}
            >
              <TagIcon className="w-5 h-5 text-amber-500" />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
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
      title: 'Açıklama',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <span className="text-sm text-slate-600">{desc || <span className="text-slate-400">-</span>}</span>
      ),
    },
    {
      title: 'Web Sitesi',
      dataIndex: 'website',
      key: 'website',
      width: 200,
      render: (url: string) =>
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <GlobeAltIcon className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{url.replace(/^https?:\/\//, '')}</span>
          </a>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      title: 'Ürün Sayısı',
      dataIndex: 'productCount',
      key: 'productCount',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded">
          {count || 0}
        </span>
      ),
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/inventory/brands/${record.id}/edit`);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <Popconfirm
            title="Markayı silmek istediğinize emin misiniz?"
            onConfirm={(e) => {
              e?.stopPropagation();
              handleDelete(record);
            }}
            onCancel={(e) => e?.stopPropagation()}
            okText="Evet"
            cancelText="Hayır"
          >
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
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
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Marka</span>
              <div className="text-2xl font-semibold text-slate-900">{totalBrands}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <TagIcon className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif Marka</span>
              <div className="text-2xl font-semibold text-slate-900">{activeBrands}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Web Siteli</span>
              <div className="text-2xl font-semibold text-slate-900">{brandsWithWebsite}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <GlobeAltIcon className="w-4 h-4 text-blue-500" />
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
        icon={<TagIcon className="w-5 h-5" />}
        iconColor="#f59e0b"
        title="Markalar"
        description="Ürün markalarını yönetin"
        itemCount={filteredBrands.length}
        primaryAction={{
          label: 'Yeni Marka',
          onClick: () => router.push('/inventory/brands/new'),
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
          placeholder="Marka ara... (ad, açıklama)"
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
            dataSource={filteredBrands}
            rowKey="id"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} marka`,
            }}
          />
        </DataTableWrapper>
      )}
    </PageContainer>
  );
}

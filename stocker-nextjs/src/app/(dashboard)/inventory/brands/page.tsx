'use client';

/**
 * Brands List Page
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  Input,
  Avatar,
  Popconfirm,
  Spin,
  Button,
  Space,
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
import { TableEmptyState } from '@/components/primitives';
import { useBrands, useDeleteBrand } from '@/lib/api/hooks/useInventory';
import type { BrandDto } from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';

export default function BrandsPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [includeInactive, setIncludeInactive] = useState(false);

  const { data: brands = [], isLoading, refetch } = useBrands(includeInactive);
  const deleteBrand = useDeleteBrand();

  const handleDelete = async (brand: BrandDto) => {
    const confirmed = await confirmDelete('Marka', brand.name);
    if (confirmed) {
      try {
        await deleteBrand.mutateAsync(brand.id);
        showDeleteSuccess('marka');
      } catch (error) {
        showError('Silme islemi basarisiz');
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
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <TagIcon className="w-5 h-5 text-slate-600" />
            </div>
          )}
          <div>
            <div className="text-sm font-medium text-slate-900">{name}</div>
            {record.code && (
              <div className="text-xs text-slate-500">{record.code}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Aciklama',
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
            className="text-sm text-slate-700 hover:text-slate-900 flex items-center gap-1"
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
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
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
            okButtonProps={{ className: '!bg-slate-900 hover:!bg-slate-800 !border-slate-900' }}
            cancelButtonProps={{ className: '!border-slate-300 !text-slate-600' }}
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Markalar</h1>
          <p className="text-slate-500 mt-1">Ürün markalarını yönetin</p>
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
            onClick={() => router.push('/inventory/brands/new')}
            className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
          >
            Yeni Marka
          </Button>
        </Space>
      </div>

      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <TagIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalBrands}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Marka</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeBrands}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Aktif Marka</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <GlobeAltIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{brandsWithWebsite}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Web Siteli</div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <InboxIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalProducts}</div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Toplam Ürün</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <Input
              placeholder="Marka ara... (ad, aciklama)"
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ maxWidth: 400 }}
              allowClear
              className="!rounded-lg !border-slate-300"
            />
            <div className="flex-1" />
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includeInactive}
                onChange={(e) => setIncludeInactive(e.target.checked)}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-500"
              />
              Pasif markaları göster
            </label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredBrands}
            rowKey="id"
            loading={isLoading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} kayıt`,
            }}
            locale={{
              emptyText: <TableEmptyState
                icon={TagIcon}
                title="Marka bulunamadi"
                description="Henuz marka eklenmemis veya filtrelere uygun kayit yok."
              />
            }}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
          />
        )}
      </div>
    </div>
  );
}

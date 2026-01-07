'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Modal, Empty } from 'antd';
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  ClockIcon,
  Cog6ToothIcon,
  CubeIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  QrCodeIcon,
  ScaleIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  StarIcon,
  StopIcon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import {
  useProductVariant,
  useDeleteProductVariant,
} from '@/lib/api/hooks/useInventory';
import dayjs from 'dayjs';

export default function ProductVariantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const variantId = Number(params.id);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: variant, isLoading } = useProductVariant(variantId);
  const deleteVariant = useDeleteProductVariant();

  const handleDelete = async () => {
    try {
      await deleteVariant.mutateAsync(variantId);
      router.push('/inventory/product-variants');
    } catch {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Varyant bulunamadı" />
      </div>
    );
  }

  const margin =
    variant.price && variant.costPrice
      ? ((variant.price - variant.costPrice) / variant.price) * 100
      : null;

  const profit = variant.price && variant.costPrice ? variant.price - variant.costPrice : null;

  const formatCurrency = (value: number | undefined, currency?: string) => {
    if (!value) return '₺0,00';
    return value.toLocaleString('tr-TR', {
      style: 'currency',
      currency: currency || 'TRY',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Glass Effect Sticky Header */}
      <div
        className="sticky top-0 z-50 px-8 py-4"
        style={{
          background: 'rgba(248, 250, 252, 0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              type="text"
              className="!text-slate-500 hover:!text-slate-800"
            />
            <div className="flex items-center gap-3">
              {variant.imageUrl ? (
                <img
                  src={variant.imageUrl}
                  alt={variant.variantName}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Squares2X2Icon className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{variant.variantName}</h1>
                  {variant.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                      <CheckCircleIcon className="w-3 h-3" /> Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                      <StopIcon className="w-3 h-3" /> Pasif
                    </span>
                  )}
                  {variant.isDefault && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-700">
                      <StarIcon className="w-3 h-3" /> Varsayılan
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-400 m-0">SKU: {variant.sku}</p>
              </div>
            </div>
          </div>
          <Space size="small">
            <Button
              icon={<PencilSquareIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/product-variants/${variantId}/edit`)}
              className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<TrashIcon className="w-4 h-4" />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-8">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* ─────────────── KPI CARDS (Top Row) ─────────────── */}
          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Satış Fiyatı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {formatCurrency(variant.price, variant.priceCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Maliyet
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {formatCurrency(variant.costPrice, variant.costPriceCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Kar Marjı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  %{margin?.toFixed(1) || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  <ArchiveBoxIcon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Toplam Stok
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {variant.totalStock || 0}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          {/* ─────────────── MAIN CONTENT AREA ─────────────── */}

          {/* Variant Info Section - Left Side */}
          <div className="col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                Varyant Bilgileri
              </p>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Varyant Adı</label>
                  <p className="text-sm font-medium text-slate-900 m-0">{variant.variantName}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">SKU</label>
                  <p className="text-sm font-medium text-slate-900 m-0 flex items-center gap-2">
                    <QrCodeIcon className="w-4 h-4 text-slate-400" />
                    <code className="bg-slate-50 px-2 py-0.5 rounded">{variant.sku}</code>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Barkod</label>
                  {variant.barcode ? (
                    <p className="text-sm font-medium text-slate-900 m-0 flex items-center gap-2">
                      <QrCodeIcon className="w-4 h-4 text-slate-400" />
                      <code className="bg-slate-50 px-2 py-0.5 rounded">{variant.barcode}</code>
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 m-0">-</p>
                  )}
                </div>
              </div>

              {/* Physical Properties */}
              {(variant.weight || variant.dimensions) && (
                <>
                  <div className="border-t border-slate-100 my-6" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ScaleIcon className="w-4 h-4" /> Fiziksel Özellikler
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {variant.weight && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <label className="text-xs text-slate-400 block mb-1">Ağırlık</label>
                        <p className="text-lg font-semibold text-slate-900 m-0">
                          {variant.weight} <span className="text-sm font-normal text-slate-500">{variant.weightUnit || 'kg'}</span>
                        </p>
                      </div>
                    )}
                    {variant.dimensions && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <label className="text-xs text-slate-400 block mb-1">Boyutlar</label>
                        <p className="text-lg font-semibold text-slate-900 m-0">{variant.dimensions}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Inventory Settings */}
              <div className="border-t border-slate-100 my-6" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Cog6ToothIcon className="w-4 h-4" /> Envanter Ayarları
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${variant.trackInventory ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <CubeIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Stok Takibi</span>
                  {variant.trackInventory && <CheckCircleIcon className="w-3 h-3" />}
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${variant.allowBackorder ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <ArrowPathIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Ön Sipariş</span>
                  {variant.allowBackorder && <CheckCircleIcon className="w-3 h-3" />}
                </div>
                {variant.lowStockThreshold !== undefined && variant.lowStockThreshold > 0 && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-xs font-medium">Düşük Stok Eşiği: {variant.lowStockThreshold}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="col-span-4 space-y-6">
            {/* Parent Product Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Ana Ürün
              </p>
              <div
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => router.push(`/inventory/products/${variant.productId}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                  <ShoppingBagIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 m-0 truncate">{variant.productName}</p>
                  <p className="text-xs text-slate-500 m-0">Ana ürün detaylarını görüntüle</p>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>
            </div>

            {/* Status & Settings Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Durum Ayarları
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Aktif</span>
                  {variant.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                      <CheckCircleIcon className="w-3 h-3" /> Evet
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      <XCircleIcon className="w-3 h-3" /> Hayır
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Varsayılan Varyant</span>
                  {variant.isDefault ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                      <StarIcon className="w-3 h-3" /> Evet
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      <XCircleIcon className="w-3 h-3" /> Hayır
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Görüntüleme Sırası</span>
                  <span className="text-sm font-medium text-slate-900">{variant.displayOrder || 0}</span>
                </div>
              </div>
            </div>

            {/* Timestamps Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Tarihler
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {variant.createdAt
                      ? dayjs(variant.createdAt).format('DD/MM/YYYY')
                      : '-'}
                  </span>
                </div>
                {variant.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(variant.updatedAt).format('DD/MM/YYYY')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ─────────────── BOTTOM ROW ─────────────── */}

          {/* Pricing Details Section */}
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                Fiyatlandırma Detayları
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Satış Fiyatı</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {formatCurrency(variant.price, variant.priceCurrency)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Maliyet</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {formatCurrency(variant.costPrice, variant.costPriceCurrency)}
                  </span>
                </div>
                {variant.compareAtPrice && (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Karşılaştırma Fiyatı</span>
                    <span className="text-lg font-semibold text-slate-400 line-through">
                      {formatCurrency(variant.compareAtPrice, variant.compareAtPriceCurrency)}
                    </span>
                  </div>
                )}
                {profit !== null && (
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-sm text-slate-300">Kar</span>
                    <span className="text-lg font-semibold text-white">
                      {formatCurrency(profit, variant.priceCurrency)} (%{margin?.toFixed(1)})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Variant Options Section */}
          <div className="col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">
                Özellik Değerleri {variant.options && variant.options.length > 0 && `(${variant.options.length})`}
              </p>
              {variant.options && variant.options.length > 0 ? (
                <div className="space-y-3">
                  {variant.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-600">{option.attributeName}</span>
                      <span className="inline-flex px-3 py-1 rounded-md text-sm font-medium bg-slate-200 text-slate-700">
                        {option.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-400">Özellik değeri tanımlanmamış</p>
                </div>
              )}
            </div>
          </div>

          {/* Image Section */}
          {variant.imageUrl && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Görsel
                </p>
                <div className="relative h-64 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden">
                  <img
                    src={variant.imageUrl}
                    alt={variant.variantName}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        title={
          <span className="text-slate-900 font-semibold">Varyantı Sil</span>
        }
        open={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={handleDelete}
        okText="Sil"
        cancelText="İptal"
        okButtonProps={{ danger: true, loading: deleteVariant.isPending }}
      >
        <p className="text-slate-700">
          <strong>{variant.variantName}</strong> varyantını silmek istediğinize emin misiniz?
        </p>
        <p className="text-slate-500 text-sm">SKU: {variant.sku}</p>
        <p className="text-slate-500 text-sm">Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  );
}

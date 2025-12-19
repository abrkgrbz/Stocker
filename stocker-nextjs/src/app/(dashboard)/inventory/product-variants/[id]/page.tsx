'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Space, Tag, Spin, Modal, Empty } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  BarcodeOutlined,
  DollarOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CalendarOutlined,
  StarOutlined,
  ScaleOutlined,
  RightOutlined,
} from '@ant-design/icons';
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
        <Spin size="large" />
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

  const getCurrencySymbol = (currency?: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      default:
        return '₺';
    }
  };

  const formatCurrency = (value: number | undefined, currency?: string) => {
    if (!value) return `${getCurrencySymbol(currency)}0,00`;
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
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              {variant.imageUrl ? (
                <img
                  src={variant.imageUrl}
                  alt={variant.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-slate-200"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                  <AppstoreOutlined className="text-white text-lg" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{variant.name}</h1>
                  <Tag
                    icon={variant.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      variant.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {variant.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  {variant.isDefault && (
                    <Tag icon={<StarOutlined />} className="border-0 bg-amber-50 text-amber-700">
                      Varsayılan
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">SKU: {variant.sku}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/product-variants/${variantId}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => setDeleteModalOpen(true)}
            >
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Cards Row */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <DollarOutlined className="text-blue-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Satış Fiyatı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-blue-600">
                  {formatCurrency(variant.price, variant.priceCurrency)}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DollarOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
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

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <DollarOutlined className="text-emerald-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kar Marjı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span
                  className={`text-3xl font-bold ${
                    margin && margin > 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  %{margin?.toFixed(1) || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <ScaleOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ağırlık
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {variant.weight || 0}
                </span>
                <span className="text-sm text-slate-400">kg</span>
              </div>
            </div>
          </div>

          {/* Variant Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Varyant Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Varyant Adı</p>
                  <p className="text-sm font-medium text-slate-900">{variant.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">SKU</p>
                  <div className="flex items-center gap-2">
                    <BarcodeOutlined className="text-slate-400 text-xs" />
                    <code className="text-sm font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded">
                      {variant.sku}
                    </code>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Barkod</p>
                  {variant.barcode ? (
                    <div className="flex items-center gap-2">
                      <BarcodeOutlined className="text-slate-400 text-xs" />
                      <code className="text-sm font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded">
                        {variant.barcode}
                      </code>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">-</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag
                    icon={variant.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      variant.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {variant.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Settings Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Durum Ayarları
              </p>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Aktif</span>
                  <Tag
                    icon={variant.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      variant.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {variant.isActive ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Varsayılan Varyant</span>
                  <Tag
                    icon={variant.isDefault ? <StarOutlined /> : <CloseCircleOutlined />}
                    className={`border-0 ${
                      variant.isDefault
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {variant.isDefault ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
              </div>
            </div>
          </div>

          {/* Parent Product Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Ana Ürün
              </p>
              <div
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                onClick={() => router.push(`/inventory/products/${variant.productId}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <ShoppingOutlined className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 m-0">{variant.productName}</p>
                  <p className="text-xs text-slate-500 m-0">{variant.productCode}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-sm">Ürüne Git</span>
                  <RightOutlined className="text-xs" />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Details Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Fiyatlandırma Detayları
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <DollarOutlined className="text-blue-600 text-xl mb-2" />
                  <p className="text-xl font-bold text-blue-600 m-0">
                    {formatCurrency(variant.price, variant.priceCurrency)}
                  </p>
                  <p className="text-xs text-slate-500 m-0 mt-1">Satış Fiyatı</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <DollarOutlined className="text-slate-600 text-xl mb-2" />
                  <p className="text-xl font-bold text-slate-700 m-0">
                    {formatCurrency(variant.costPrice, variant.costPriceCurrency)}
                  </p>
                  <p className="text-xs text-slate-500 m-0 mt-1">Maliyet</p>
                </div>
              </div>
              {profit !== null && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg text-center">
                  <p className="text-xs text-slate-500 m-0">Kar</p>
                  <p
                    className={`text-xl font-bold m-0 ${
                      profit > 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {formatCurrency(profit, variant.priceCurrency)} (%{margin?.toFixed(1)})
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Variant Options Section */}
          {variant.options && variant.options.length > 0 && (
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Özellik Değerleri ({variant.options.length})
                </p>
                <div className="space-y-2">
                  {variant.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm text-slate-600">{option.attributeName}</span>
                      <Tag className="border-0 bg-blue-50 text-blue-700">{option.value}</Tag>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timestamps Section */}
          <div className={`col-span-12 ${variant.options && variant.options.length > 0 ? 'md:col-span-6' : 'md:col-span-6'}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {variant.createdAt
                      ? dayjs(variant.createdAt).format('DD/MM/YYYY HH:mm')
                      : '-'}
                  </span>
                </div>
                {variant.updatedAt && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CalendarOutlined className="text-slate-400" />
                      <span className="text-sm text-slate-500">Güncelleme</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(variant.updatedAt).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Section */}
          {variant.imageUrl && (
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Görsel
                </p>
                <img
                  src={variant.imageUrl}
                  alt={variant.name}
                  className="w-full rounded-lg"
                  style={{ maxHeight: 300, objectFit: 'cover' }}
                />
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
          <strong>{variant.name}</strong> varyantını silmek istediğinize emin misiniz?
        </p>
        <p className="text-slate-500 text-sm">SKU: {variant.sku}</p>
        <p className="text-slate-500 text-sm">Bu işlem geri alınamaz.</p>
      </Modal>
    </div>
  );
}

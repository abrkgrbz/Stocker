'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Spin,
  Modal,
  Upload,
  Image,
  Empty,
  Tooltip,
  Progress,
} from 'antd';
import type { RcFile } from 'antd/es/upload';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  StopOutlined,
  WarningOutlined,
  BarcodeOutlined,
  PlusOutlined,
  PictureOutlined,
  StarOutlined,
  StarFilled,
  BoxPlotOutlined,
  DollarOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  TagOutlined,
  AppstoreOutlined,
  ScissorOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import {
  useProduct,
  useDeleteProduct,
  useActivateProduct,
  useDeactivateProduct,
  useProductImages,
  useUploadProductImage,
  useDeleteProductImage,
  useSetProductImageAsPrimary,
} from '@/lib/api/hooks/useInventory';
import type { ProductType } from '@/lib/api/services/inventory.types';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import dayjs from 'dayjs';

const productTypeConfig: Record<ProductType, { color: string; label: string; bgColor: string }> = {
  Raw: { color: '#475569', label: 'Hammadde', bgColor: '#f1f5f9' },
  SemiFinished: { color: '#475569', label: 'Yarı Mamul', bgColor: '#f1f5f9' },
  Finished: { color: '#1e293b', label: 'Mamul', bgColor: '#e2e8f0' },
  Service: { color: '#64748b', label: 'Hizmet', bgColor: '#f8fafc' },
  Consumable: { color: '#475569', label: 'Sarf Malzeme', bgColor: '#f1f5f9' },
  FixedAsset: { color: '#334155', label: 'Duran Varlık', bgColor: '#e2e8f0' },
};

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = Number(params.id);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { data: product, isLoading, error } = useProduct(productId);
  const { data: images = [], isLoading: imagesLoading } = useProductImages(productId);
  const deleteProduct = useDeleteProduct();
  const activateProduct = useActivateProduct();
  const deactivateProduct = useDeactivateProduct();
  const uploadImage = useUploadProductImage();
  const deleteImage = useDeleteProductImage();
  const setPrimaryImage = useSetProductImageAsPrimary();

  const handleUpload = async (file: RcFile) => {
    try {
      await uploadImage.mutateAsync({
        productId,
        file,
        options: { setAsPrimary: images.length === 0 },
      });
    } catch (error) {
      // Error handled by hook
    }
    return false;
  };

  const handleDeleteImage = async (imageId: number) => {
    Modal.confirm({
      title: 'Resmi Sil',
      content: 'Bu resmi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteImage.mutateAsync({ productId, imageId });
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await setPrimaryImage.mutateAsync({ productId, imageId });
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleDelete = () => {
    if (!product) return;
    Modal.confirm({
      title: 'Ürünü Sil',
      content: `"${product.name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteProduct.mutateAsync(productId);
          router.push('/inventory/products');
        } catch (error) {
          // Error handled by hook
        }
      },
    });
  };

  const handleToggleActive = async () => {
    if (!product) return;
    try {
      if (product.isActive) {
        await deactivateProduct.mutateAsync(productId);
      } else {
        await activateProduct.mutateAsync(productId);
      }
    } catch (error) {
      // Error handled by hook
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto mt-20">
          <WarningOutlined className="text-5xl text-slate-300 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Ürün Bulunamadı</h2>
          <p className="text-slate-500 mb-6">İstenen ürün bulunamadı veya bir hata oluştu.</p>
          <Button onClick={() => router.push('/inventory/products')} className="!border-slate-300">
            Ürünlere Dön
          </Button>
        </div>
      </div>
    );
  }

  const typeConfig = productTypeConfig[product.productType] || { color: '#64748b', label: product.productType, bgColor: '#f1f5f9' };
  const isLowStock = product.totalStockQuantity < product.minStockLevel;
  const stockPercentage = product.maxStockLevel > 0
    ? Math.min((product.totalStockQuantity / product.maxStockLevel) * 100, 100)
    : product.totalStockQuantity > 0 ? 50 : 0;
  const stockValue = (product.unitPrice || 0) * product.totalStockQuantity;
  const primaryImage = images.find(img => img.isPrimary) || images[0];

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
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              type="text"
              className="!text-slate-500 hover:!text-slate-800"
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-slate-900 m-0">{product.name}</h1>
                {product.isActive ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                    <CheckCircleOutlined className="text-[10px]" /> Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                    <StopOutlined className="text-[10px]" /> Pasif
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 m-0">{product.code}</p>
            </div>
          </div>
          <Space size="small">
            <Button
              icon={product.isActive ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={handleToggleActive}
              loading={activateProduct.isPending || deactivateProduct.isPending}
              className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
            >
              {product.isActive ? 'Pasifleştir' : 'Aktifleştir'}
            </Button>
            <Button
              icon={<EditOutlined />}
              onClick={() => router.push(`/inventory/products/${productId}/edit`)}
              className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
            >
              Düzenle
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              loading={deleteProduct.isPending}
            >
              Sil
            </Button>
          </Space>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-8 max-w-7xl mx-auto">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">

          {/* ─────────────── KPI CARDS (Top Row) ─────────────── */}
          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BoxPlotOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Toplam Stok</p>
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-3xl font-bold ${isLowStock ? 'text-amber-600' : 'text-slate-900'}`}>
                  {formatNumber(product.totalStockQuantity)}
                </span>
                <span className="text-sm text-slate-400">{product.unitName || 'adet'}</span>
              </div>
              {isLowStock && (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 font-medium">
                  <WarningOutlined /> Düşük stok seviyesi
                </div>
              )}
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckCircleOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kullanılabilir</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {formatNumber(product.availableStockQuantity)}
                </span>
                <span className="text-sm text-slate-400">{product.unitName || 'adet'}</span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <DollarOutlined className="text-slate-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Birim Fiyat</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {formatCurrency(product.unitPrice || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                  <DollarOutlined className="text-white text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stok Değeri</p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">
                  {formatCurrency(stockValue)}
                </span>
              </div>
            </div>
          </div>

          {/* ─────────────── MAIN CONTENT AREA ─────────────── */}

          {/* Product Images - Left Side */}
          <div className="col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <PictureOutlined className="text-slate-400" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">Ürün Görselleri</p>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-xs text-slate-600">
                    {images.length}
                  </span>
                </div>
              </div>

              {/* Main Image Display */}
              <div className="relative aspect-square rounded-xl bg-slate-50 border border-slate-100 overflow-hidden mb-4">
                {primaryImage ? (
                  <Image
                    src={primaryImage.imageUrl}
                    alt={primaryImage.altText || product.name}
                    className="w-full h-full object-contain"
                    style={{ width: '100%', height: '100%' }}
                    preview={{
                      mask: (
                        <div className="flex items-center gap-2 text-white">
                          <ExpandOutlined /> Büyüt
                        </div>
                      ),
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                    <PictureOutlined className="text-6xl mb-3" />
                    <span className="text-sm">Görsel yok</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              {imagesLoading ? (
                <div className="flex justify-center py-4">
                  <Spin size="small" />
                </div>
              ) : images.length > 0 ? (
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all hover:shadow-md ${
                        img.isPrimary ? 'border-slate-900' : 'border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <Image
                        src={img.imageUrl}
                        alt={img.altText || product.name}
                        className="w-full h-full object-cover"
                        style={{ width: '100%', height: '100%' }}
                        preview={{
                          mask: (
                            <div className="flex items-center gap-1">
                              {!img.isPrimary && (
                                <Tooltip title="Ana görsel yap">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<StarOutlined />}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetPrimary(img.id);
                                    }}
                                    className="!text-white !p-1"
                                  />
                                </Tooltip>
                              )}
                              <Tooltip title="Sil">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteOutlined />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteImage(img.id);
                                  }}
                                  className="!text-white !p-1"
                                />
                              </Tooltip>
                            </div>
                          ),
                        }}
                      />
                      {img.isPrimary && (
                        <div className="absolute top-1 left-1">
                          <StarFilled className="text-amber-400 text-sm drop-shadow" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Upload Button */}
              <Upload
                accept="image/*"
                showUploadList={false}
                beforeUpload={handleUpload}
                disabled={uploadImage.isPending}
              >
                <Button
                  icon={<PlusOutlined />}
                  loading={uploadImage.isPending}
                  block
                  className="!border-slate-300 !text-slate-600 hover:!text-slate-900 hover:!border-slate-400"
                >
                  Görsel Ekle
                </Button>
              </Upload>
            </div>
          </div>

          {/* Product Info - Right Side */}
          <div className="col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Ürün Bilgileri</p>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ürün Kodu</label>
                  <p className="text-sm font-medium text-slate-900 m-0">{product.code}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Ürün Türü</label>
                  <span
                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium"
                    style={{ backgroundColor: typeConfig.bgColor, color: typeConfig.color }}
                  >
                    {typeConfig.label}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">SKU</label>
                  <p className="text-sm font-medium text-slate-900 m-0">{product.sku || '-'}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Barkod</label>
                  <p className="text-sm font-medium text-slate-900 m-0 flex items-center gap-2">
                    {product.barcode ? (
                      <>
                        <BarcodeOutlined className="text-slate-400" />
                        {product.barcode}
                      </>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Kategori</label>
                  <p className="text-sm font-medium text-slate-900 m-0 flex items-center gap-2">
                    {product.categoryName ? (
                      <>
                        <AppstoreOutlined className="text-slate-400" />
                        {product.categoryName}
                      </>
                    ) : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Marka</label>
                  <p className="text-sm font-medium text-slate-900 m-0 flex items-center gap-2">
                    {product.brandName ? (
                      <>
                        <TagOutlined className="text-slate-400" />
                        {product.brandName}
                      </>
                    ) : '-'}
                  </p>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <label className="text-xs text-slate-400 block mb-1">Açıklama</label>
                  <p className="text-sm text-slate-600 m-0">{product.description}</p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100 my-6" />

              {/* Stock Settings */}
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <SettingOutlined /> Stok Ayarları
              </p>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="text-xs text-slate-400 block mb-1">Min. Stok</label>
                  <p className="text-lg font-semibold text-slate-900 m-0">{product.minStockLevel}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="text-xs text-slate-400 block mb-1">Maks. Stok</label>
                  <p className="text-lg font-semibold text-slate-900 m-0">{product.maxStockLevel}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="text-xs text-slate-400 block mb-1">Yeniden Sipariş</label>
                  <p className="text-lg font-semibold text-slate-900 m-0">{product.reorderLevel}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <label className="text-xs text-slate-400 block mb-1">Sipariş Miktarı</label>
                  <p className="text-lg font-semibold text-slate-900 m-0">{product.reorderQuantity}</p>
                </div>
              </div>

              {/* Stock Level Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">Stok Doluluk Oranı</span>
                  <span className="text-xs font-medium text-slate-700">{stockPercentage.toFixed(0)}%</span>
                </div>
                <Progress
                  percent={stockPercentage}
                  showInfo={false}
                  strokeColor={isLowStock ? '#f59e0b' : '#1e293b'}
                  trailColor="#e2e8f0"
                  size="small"
                />
              </div>

              {/* Tracking Options */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${product.trackSerialNumbers ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <ScissorOutlined />
                  <span className="text-xs font-medium">Seri No Takibi</span>
                  {product.trackSerialNumbers && <CheckCircleOutlined className="text-xs" />}
                </div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${product.trackLotNumbers ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  <BoxPlotOutlined />
                  <span className="text-xs font-medium">Lot Takibi</span>
                  {product.trackLotNumbers && <CheckCircleOutlined className="text-xs" />}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-600">
                  <ClockCircleOutlined />
                  <span className="text-xs font-medium">Tedarik: {product.leadTimeDays} gün</span>
                </div>
              </div>
            </div>
          </div>

          {/* ─────────────── BOTTOM ROW ─────────────── */}

          {/* Physical Properties */}
          {(product.weight || product.length || product.width || product.height) && (
            <div className="col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Fiziksel Özellikler</p>
                <div className="grid grid-cols-4 gap-4">
                  {product.weight && (
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Ağırlık</div>
                      <div className="text-xl font-bold text-slate-900">
                        {product.weight} <span className="text-sm font-normal text-slate-500">{product.weightUnit || 'kg'}</span>
                      </div>
                    </div>
                  )}
                  {product.length && (
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Uzunluk</div>
                      <div className="text-xl font-bold text-slate-900">
                        {product.length} <span className="text-sm font-normal text-slate-500">{product.dimensionUnit || 'cm'}</span>
                      </div>
                    </div>
                  )}
                  {product.width && (
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Genişlik</div>
                      <div className="text-xl font-bold text-slate-900">
                        {product.width} <span className="text-sm font-normal text-slate-500">{product.dimensionUnit || 'cm'}</span>
                      </div>
                    </div>
                  )}
                  {product.height && (
                    <div className="text-center p-4 bg-slate-50 rounded-xl">
                      <div className="text-xs text-slate-400 mb-1">Yükseklik</div>
                      <div className="text-xl font-bold text-slate-900">
                        {product.height} <span className="text-sm font-normal text-slate-500">{product.dimensionUnit || 'cm'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className={`${(product.weight || product.length || product.width || product.height) ? 'col-span-3' : 'col-span-6'}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Fiyatlandırma</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Birim Fiyat</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {product.unitPrice ? `${formatCurrency(product.unitPrice)} ${product.unitPriceCurrency || ''}` : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-500">Maliyet</span>
                  <span className="text-lg font-semibold text-slate-900">
                    {product.costPrice ? `${formatCurrency(product.costPrice)} ${product.costPriceCurrency || ''}` : '-'}
                  </span>
                </div>
                {product.unitPrice && product.costPrice && (
                  <div className="flex items-center justify-between p-3 bg-slate-900 rounded-lg">
                    <span className="text-sm text-slate-300">Kar Marjı</span>
                    <span className="text-lg font-semibold text-white">
                      {(((product.unitPrice - product.costPrice) / product.costPrice) * 100).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className={`${(product.weight || product.length || product.width || product.height) ? 'col-span-3' : 'col-span-6'}`}>
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-5">Tarihler</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Oluşturulma</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(product.createdAt).format('DD MMMM YYYY, HH:mm')}
                  </span>
                </div>
                {product.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Son Güncelleme</span>
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(product.updatedAt).format('DD MMMM YYYY, HH:mm')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

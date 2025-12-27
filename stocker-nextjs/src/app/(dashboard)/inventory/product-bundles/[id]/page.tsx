'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Button,
  Space,
  Tag,
  Spin,
  Empty,
  Table,
  Modal,
  message,
} from 'antd';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  EyeIcon,
  GiftIcon,
  PencilIcon,
  PlusIcon,
  Squares2X2Icon,
  TrashIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useProductBundle,
  useDeleteProductBundle,
  useRemoveProductBundleItem,
} from '@/lib/api/hooks/useInventory';
import type {
  ProductBundleItemDto,
  BundleType,
  BundlePricingType,
} from '@/lib/api/services/inventory.types';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const bundleTypeConfig: Record<BundleType, { label: string; bgColor: string; textColor: string }> = {
  Fixed: { label: 'Sabit', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
  Configurable: { label: 'Yapılandırılabilir', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  Kit: { label: 'Kit', bgColor: 'bg-cyan-50', textColor: 'text-cyan-700' },
  Package: { label: 'Paket', bgColor: 'bg-green-50', textColor: 'text-green-700' },
  Combo: { label: 'Kombo', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
};

const pricingTypeConfig: Record<BundlePricingType, { label: string }> = {
  FixedPrice: { label: 'Sabit Fiyat' },
  DynamicSum: { label: 'Dinamik Toplam' },
  DiscountedSum: { label: 'İndirimli Toplam' },
  PercentageDiscount: { label: 'Yüzde İndirim' },
};

export default function ProductBundleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const { data: bundle, isLoading, error, refetch } = useProductBundle(id);
  const deleteBundle = useDeleteProductBundle();
  const removeItem = useRemoveProductBundleItem();

  const handleDelete = () => {
    Modal.confirm({
      title: 'Paketi Sil',
      content: 'Bu paketi silmek istediğinizden emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        try {
          await deleteBundle.mutateAsync(id);
          message.success('Paket silindi');
          router.push('/inventory/product-bundles');
        } catch {
          message.error('Silme işlemi başarısız');
        }
      },
    });
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeItem.mutateAsync({ bundleId: id, itemId });
      message.success('Ürün paketten çıkarıldı');
      refetch();
    } catch {
      message.error('İşlem başarısız');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !bundle) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Paket bilgileri yüklenemedi" />
      </div>
    );
  }

  const itemColumns: ColumnsType<ProductBundleItemDto> = [
    {
      title: 'Ürün',
      key: 'product',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">{record.productName}</div>
          <span className="text-xs text-slate-500">{record.productCode}</span>
        </div>
      ),
    },
    {
      title: 'Miktar',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
      render: (quantity, record) => (
        <div>
          <div className="font-medium text-slate-900">{quantity}</div>
          {(record.minQuantity || record.maxQuantity) && (
            <span className="text-xs text-slate-500">
              ({record.minQuantity || 1}-{record.maxQuantity || '∞'})
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Fiyat',
      key: 'price',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">
            {(record.overridePrice || record.productPrice || 0).toLocaleString('tr-TR', {
              minimumFractionDigits: 2,
            })} ₺
          </div>
          {record.discountPercentage && record.discountPercentage > 0 && (
            <Tag className="border-0 bg-red-50 text-red-700 text-xs">%{record.discountPercentage}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Toplam',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const price = record.overridePrice || record.productPrice || 0;
        const discount = record.discountPercentage || 0;
        const total = price * record.quantity * (1 - discount / 100);
        return (
          <div className="font-medium text-amber-600">
            {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
          </div>
        );
      },
    },
    {
      title: 'Zorunlu',
      dataIndex: 'isRequired',
      key: 'isRequired',
      width: 80,
      align: 'center',
      render: (isRequired) =>
        isRequired ? (
          <CheckCircleIcon className="w-4 h-4" className="text-emerald-500" />
        ) : (
          <XCircleIcon className="w-4 h-4" className="text-slate-300" />
        ),
    },
    {
      title: 'Varsayılan',
      dataIndex: 'isDefault',
      key: 'isDefault',
      width: 80,
      align: 'center',
      render: (isDefault) =>
        isDefault ? (
          <CheckCircleIcon className="w-4 h-4" className="text-emerald-500" />
        ) : (
          <XCircleIcon className="w-4 h-4" className="text-slate-300" />
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            size="small"
            icon={<EyeIcon className="w-4 h-4" />}
            onClick={() => router.push(`/inventory/products/${record.productId}`)}
            className="text-slate-500 hover:text-blue-600"
            title="Ürün Detayı"
          />
          <Button
            type="text"
            danger
            icon={<TrashIcon className="w-4 h-4" />}
            onClick={() => handleRemoveItem(record.id)}
            size="small"
          />
        </Space>
      ),
    },
  ];

  // Calculate validity status
  const now = dayjs();
  const validFrom = bundle.validFrom ? dayjs(bundle.validFrom) : null;
  const validTo = bundle.validTo ? dayjs(bundle.validTo) : null;
  let validityStatus: 'active' | 'pending' | 'expired' = 'active';
  if (validFrom && now.isBefore(validFrom)) validityStatus = 'pending';
  if (validTo && now.isAfter(validTo)) validityStatus = 'expired';

  // Calculate totals
  const itemsTotal = bundle.items?.reduce((sum, item) => {
    const price = item.overridePrice || item.productPrice || 0;
    const discount = item.discountPercentage || 0;
    return sum + price * item.quantity * (1 - discount / 100);
  }, 0) || 0;

  const savings = itemsTotal - (bundle.calculatedPrice || 0);
  const savingsPercent = itemsTotal > 0 ? (savings / itemsTotal) * 100 : 0;

  const bundleTypeStyle = bundleTypeConfig[bundle.bundleType] || bundleTypeConfig.Fixed;

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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center">
                <GiftIcon className="w-4 h-4" className="text-white text-lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{bundle.name}</h1>
                  <Tag className={`border-0 ${bundleTypeStyle.bgColor} ${bundleTypeStyle.textColor}`}>
                    {bundleTypeStyle.label}
                  </Tag>
                  <Tag
                    icon={bundle.isActive ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      bundle.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {bundle.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">Kod: {bundle.code}</p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => router.push(`/inventory/product-bundles/${id}/edit`)}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Düzenle
            </Button>
            <Button danger icon={<TrashIcon className="w-4 h-4" />} onClick={handleDelete}>
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
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-4 h-4" className="text-amber-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Paket Fiyatı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-amber-600">
                  {(bundle.calculatedPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm text-slate-400">₺</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Squares2X2Icon className="w-4 h-4" className="text-purple-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Ürün Sayısı
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-slate-900">{bundle.items?.length || 0}</span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <ShoppingCartOutlined className="text-emerald-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tasarruf
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-emerald-600">
                  {savings.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-sm text-slate-400">₺</span>
              </div>
              {savingsPercent > 0 && (
                <Tag className="border-0 bg-emerald-50 text-emerald-700 mt-2">
                  %{savingsPercent.toFixed(1)} indirim
                </Tag>
              )}
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4" className="text-blue-600 text-lg" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Geçerlilik
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-lg font-bold text-slate-900">
                  {validityStatus === 'active' ? 'Aktif' : validityStatus === 'pending' ? 'Bekliyor' : 'Süresi Doldu'}
                </span>
              </div>
              <Tag
                className={`border-0 mt-2 ${
                  validityStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : validityStatus === 'pending'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {validityStatus === 'active' ? 'Kullanılabilir' : validityStatus === 'pending' ? 'Henüz Başlamadı' : 'Süresi Dolmuş'}
              </Tag>
            </div>
          </div>

          {/* Bundle Info Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Paket Bilgileri
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Paket Kodu</p>
                    <p className="text-sm font-medium text-slate-900">{bundle.code}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Paket Adı</p>
                    <p className="text-sm font-medium text-slate-900">{bundle.name}</p>
                  </div>
                </div>
                {bundle.description && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Açıklama</p>
                    <p className="text-sm text-slate-600">{bundle.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Tip</p>
                    <Tag className={`border-0 ${bundleTypeStyle.bgColor} ${bundleTypeStyle.textColor}`}>
                      {bundleTypeStyle.label}
                    </Tag>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Fiyatlandırma</p>
                    <p className="text-sm font-medium text-slate-900">
                      {pricingTypeConfig[bundle.pricingType]?.label}
                    </p>
                  </div>
                </div>
                {bundle.fixedPrice && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sabit Fiyat</p>
                    <p className="text-sm font-medium text-slate-900">
                      {bundle.fixedPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </p>
                  </div>
                )}
                {bundle.discountPercentage && bundle.discountPercentage > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">İndirim Oranı</p>
                    <Tag className="border-0 bg-red-50 text-red-700">%{bundle.discountPercentage}</Tag>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="col-span-12 md:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Seçenekler
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-600">Tüm Ürünler Zorunlu</span>
                  <Tag
                    icon={bundle.requireAllItems ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    className={`border-0 ${
                      bundle.requireAllItems
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {bundle.requireAllItems ? 'Evet' : 'Hayır'}
                  </Tag>
                </div>
                {bundle.minSelectableItems && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Min Seçilebilir</span>
                    <span className="text-sm font-medium text-slate-900">{bundle.minSelectableItems}</span>
                  </div>
                )}
                {bundle.maxSelectableItems && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-sm text-slate-600">Max Seçilebilir</span>
                    <span className="text-sm font-medium text-slate-900">{bundle.maxSelectableItems}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-slate-600">Görüntüleme Sırası</span>
                  <span className="text-sm font-medium text-slate-900">{bundle.displayOrder}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Validity Dates Section */}
          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Tarihler
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Başlangıç</span>
                  <span className="text-sm font-medium text-slate-900">
                    {bundle.validFrom ? dayjs(bundle.validFrom).format('DD/MM/YYYY') : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Bitiş</span>
                  <span className="text-sm font-medium text-slate-900">
                    {bundle.validTo ? dayjs(bundle.validTo).format('DD/MM/YYYY') : '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Oluşturulma</span>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(bundle.createdAt).format('DD/MM/YYYY')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Paket Ürünleri ({bundle.items?.length || 0})
                </p>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusIcon className="w-4 h-4" />}
                  onClick={() => router.push(`/inventory/product-bundles/${id}/edit`)}
                  style={{ background: '#1e293b', borderColor: '#1e293b' }}
                >
                  Ürün Ekle
                </Button>
              </div>
              {bundle.items && bundle.items.length > 0 ? (
                <>
                  <Table
                    columns={itemColumns}
                    dataSource={bundle.items}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    className="[&_.ant-table]:border-slate-200 [&_.ant-table-thead_.ant-table-cell]:bg-slate-50 [&_.ant-table-thead_.ant-table-cell]:text-slate-600 [&_.ant-table-thead_.ant-table-cell]:font-medium"
                  />
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Ürün Toplamı</p>
                      <p className="text-lg font-medium text-slate-900">
                        {itemsTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400 mb-1">Paket Fiyatı</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {(bundle.calculatedPrice || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </p>
                      {savings > 0 && (
                        <Tag className="border-0 bg-emerald-50 text-emerald-700 mt-1">
                          %{savingsPercent.toFixed(1)} tasarruf
                        </Tag>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <GiftIcon className="w-4 h-4" className="text-slate-400 text-2xl" />
                  </div>
                  <p className="text-slate-500 mb-4">Bu pakette henüz ürün yok</p>
                  <Button
                    type="primary"
                    icon={<PlusIcon className="w-4 h-4" />}
                    onClick={() => router.push(`/inventory/product-bundles/${id}/edit`)}
                    style={{ background: '#1e293b', borderColor: '#1e293b' }}
                  >
                    Ürün Ekle
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

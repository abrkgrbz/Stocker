'use client';

import React from 'react';
import { Table, Spin, Dropdown, Modal, Switch } from 'antd';
import {
  ArrowLeftIcon,
  BuildingStorefrontIcon,
  CalendarIcon,
  CheckIcon,
  CurrencyDollarIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useParams } from 'next/navigation';
import {
  usePriceList,
  useDeletePriceList,
  useActivatePriceList,
  useDeactivatePriceList,
} from '@/lib/api/hooks/usePurchase';
import type { PriceListStatus, PriceListItemDto } from '@/lib/api/services/purchase.types';

const statusConfig: Record<PriceListStatus, { bg: string; text: string; label: string }> = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Taslak' },
  PendingApproval: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Onay Bekliyor' },
  Approved: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Onaylandı' },
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aktif' },
  Inactive: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Pasif' },
  Expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Süresi Doldu' },
  Superseded: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Yenilendi' },
  Rejected: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Reddedildi' },
};

export default function PriceListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: priceList, isLoading } = usePriceList(id);
  const deleteMutation = useDeletePriceList();
  const activateMutation = useActivatePriceList();
  const deactivateMutation = useDeactivatePriceList();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!priceList) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <CurrencyDollarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Fiyat Listesi Bulunamadı</h3>
          <p className="text-sm text-slate-500 mb-4">Aradığınız fiyat listesi mevcut değil.</p>
          <button
            onClick={() => router.push('/purchase/price-lists')}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Fiyat Listelerine Dön
          </button>
        </div>
      </div>
    );
  }

  const status = statusConfig[priceList.status as PriceListStatus] || statusConfig.Draft;

  const handleDelete = () => {
    Modal.confirm({
      title: 'Fiyat Listesi Silinecek',
      content: 'Bu fiyat listesini silmek istediğinize emin misiniz?',
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteMutation.mutateAsync(id);
        router.push('/purchase/price-lists');
      },
    });
  };

  const handleToggleStatus = () => {
    if (priceList.status === 'Active') {
      deactivateMutation.mutate(id);
    } else {
      activateMutation.mutate(id);
    }
  };

  const canEdit = priceList.status === 'Draft' || priceList.status === 'Inactive';

  const itemColumns = [
    {
      title: 'Ürün',
      dataIndex: 'productName',
      key: 'productName',
      render: (text: string, record: PriceListItemDto) => (
        <div>
          <div className="text-sm font-medium text-slate-900">{text}</div>
          <div className="text-xs text-slate-500">{record.productSku}</div>
        </div>
      ),
    },
    {
      title: 'Birim Fiyat',
      dataIndex: 'basePrice',
      key: 'basePrice',
      width: 140,
      align: 'right' as const,
      render: (price: number) => (
        <span className="text-sm font-medium text-slate-900">
          {price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceList.currency}
        </span>
      ),
    },
    {
      title: 'Min. Miktar',
      dataIndex: 'minQuantity',
      key: 'minQuantity',
      width: 100,
      align: 'center' as const,
      render: (qty: number) => <span className="text-sm text-slate-600">{qty}</span>,
    },
    {
      title: 'Birim',
      dataIndex: 'unit',
      key: 'unit',
      width: 80,
      align: 'center' as const,
      render: (text: string) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'İndirim',
      dataIndex: 'discountPercentage',
      key: 'discountPercentage',
      width: 100,
      align: 'center' as const,
      render: (discount: number | null) =>
        discount ? (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700">
            %{discount}
          </span>
        ) : (
          <span className="text-sm text-slate-400">-</span>
        ),
    },
    {
      title: 'Net Fiyat',
      key: 'netPrice',
      width: 140,
      align: 'right' as const,
      render: (_: any, record: PriceListItemDto) => {
        const discount = record.discountPercentage || 0;
        const netPrice = record.basePrice * (1 - discount / 100);
        return (
          <span className="text-sm font-semibold text-emerald-600">
            {netPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {priceList.currency}
          </span>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/purchase/price-lists')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-slate-900">{priceList.code}</h1>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    {priceList.isDefault && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{priceList.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {canEdit && (
                <button
                  onClick={() => router.push(`/purchase/price-lists/${id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  Düzenle
                </button>
              )}
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'delete',
                      label: 'Sil',
                      icon: <TrashIcon className="w-4 h-4" />,
                      danger: true,
                      onClick: handleDelete,
                    },
                  ],
                }}
              >
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <EllipsisHorizontalIcon className="w-5 h-5 text-slate-600" />
                </button>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Info */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* List Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Liste Bilgileri</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Kod</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{priceList.code}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Ad</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{priceList.name}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Tedarikçi</span>
                  <div className="mt-1">
                    {priceList.supplierName ? (
                      <div className="flex items-center gap-2">
                        <BuildingStorefrontIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900">{priceList.supplierName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Para Birimi</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">{priceList.currency}</p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Başlangıç</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {priceList.effectiveFrom
                      ? new Date(priceList.effectiveFrom).toLocaleDateString('tr-TR')
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bitiş</span>
                  <p className="text-sm font-medium text-slate-900 mt-1">
                    {priceList.effectiveTo
                      ? new Date(priceList.effectiveTo).toLocaleDateString('tr-TR')
                      : 'Süresiz'}
                  </p>
                </div>
              </div>
              {priceList.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Açıklama</span>
                  <p className="text-sm text-slate-600 mt-1">{priceList.description}</p>
                </div>
              )}
            </div>

            {/* Price Items Card */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-slate-900">Fiyat Kalemleri</h3>
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                    {priceList.items?.length || 0} ürün
                  </span>
                </div>
              </div>
              <Table
                columns={itemColumns}
                dataSource={priceList.items || []}
                rowKey="id"
                pagination={false}
                size="small"
                className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-600 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wide"
              />
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Visual Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl p-6 text-white">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mb-4">
                  <CurrencyDollarIcon className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium mb-1">{priceList.code}</h3>
                <p className="text-sm text-white/70">{priceList.name}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full bg-white/20`}>
                    {status.label}
                  </span>
                  {priceList.isDefault && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-white/20">
                      Varsayılan
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Toggle Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-slate-900">Durum</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {priceList.status === 'Active' ? 'Liste aktif ve kullanılabilir' : 'Liste pasif durumda'}
                  </p>
                </div>
                <Switch
                  checked={priceList.status === 'Active'}
                  onChange={handleToggleStatus}
                  loading={activateMutation.isPending || deactivateMutation.isPending}
                  disabled={priceList.status === 'Expired'}
                />
              </div>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-900 mb-4">Özet Bilgiler</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Ürün Sayısı</span>
                  <span className="text-sm font-medium text-slate-900">{priceList.items?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Oluşturulma</span>
                  <span className="text-sm font-medium text-slate-900">
                    {priceList.createdAt ? new Date(priceList.createdAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Son Güncelleme</span>
                  <span className="text-sm font-medium text-slate-900">
                    {priceList.updatedAt ? new Date(priceList.updatedAt).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            {priceList.notes && (
              <div className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="text-sm font-medium text-slate-900 mb-3">Notlar</h3>
                <p className="text-sm text-slate-600">{priceList.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

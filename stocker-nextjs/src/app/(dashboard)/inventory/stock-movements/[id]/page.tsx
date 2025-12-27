'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button, Space, Tag, Spin, Empty } from 'antd';
import {
  ArrowLeftIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowUturnLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MinusCircleIcon,
  PlusCircleIcon,
  PrinterIcon,
  QuestionMarkCircleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  WrenchIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useStockMovement } from '@/lib/api/hooks/useInventory';
import { StockMovementType } from '@/lib/api/services/inventory.types';
import dayjs from 'dayjs';

// Movement type labels and colors
const movementTypeConfig: Record<
  StockMovementType,
  { label: string; bgColor: string; textColor: string; icon: React.ReactNode; direction: 'in' | 'out' | 'neutral' }
> = {
  [StockMovementType.Purchase]: {
    label: 'Satın Alma',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <ShoppingCartIcon className="w-4 h-4" />,
    direction: 'in',
  },
  [StockMovementType.Sales]: {
    label: 'Satış',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: <ShoppingBagIcon className="w-4 h-4" />,
    direction: 'out',
  },
  [StockMovementType.PurchaseReturn]: {
    label: 'Satın Alma İade',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <ArrowUturnLeftIcon className="w-4 h-4" />,
    direction: 'out',
  },
  [StockMovementType.SalesReturn]: {
    label: 'Satış İade',
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    icon: <ArrowPathIcon className="w-4 h-4" />,
    direction: 'in',
  },
  [StockMovementType.Transfer]: {
    label: 'Transfer',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: <ArrowsRightLeftIcon className="w-4 h-4" />,
    direction: 'neutral',
  },
  [StockMovementType.Production]: {
    label: 'Üretim',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: <WrenchIcon className="w-4 h-4" />,
    direction: 'in',
  },
  [StockMovementType.Consumption]: {
    label: 'Tüketim',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: <MinusCircleIcon className="w-4 h-4" />,
    direction: 'out',
  },
  [StockMovementType.AdjustmentIncrease]: {
    label: 'Düzeltme (+)',
    bgColor: 'bg-lime-50',
    textColor: 'text-lime-700',
    icon: <PlusCircleIcon className="w-4 h-4" />,
    direction: 'in',
  },
  [StockMovementType.AdjustmentDecrease]: {
    label: 'Düzeltme (-)',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <MinusCircleIcon className="w-4 h-4" />,
    direction: 'out',
  },
  [StockMovementType.Opening]: {
    label: 'Açılış',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: <InboxIcon className="w-4 h-4" />,
    direction: 'in',
  },
  [StockMovementType.Counting]: {
    label: 'Sayım',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    icon: <ArrowPathIcon className="w-4 h-4" />,
    direction: 'neutral',
  },
  [StockMovementType.Damage]: {
    label: 'Hasar',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <ExclamationTriangleIcon className="w-4 h-4" />,
    direction: 'out',
  },
  [StockMovementType.Loss]: {
    label: 'Kayıp',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: <XCircleIcon className="w-4 h-4" />,
    direction: 'out',
  },
  [StockMovementType.Found]: {
    label: 'Bulunan',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: <MagnifyingGlassIcon className="w-4 h-4" />,
    direction: 'in',
  },
};

export default function StockMovementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const movementId = Number(params.id);

  const { data: movement, isLoading } = useStockMovement(movementId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Stok hareketi bulunamadı" />
      </div>
    );
  }

  const config = movementTypeConfig[movement.movementType] || {
    label: movement.movementType,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    icon: <QuestionMarkCircleIcon className="w-4 h-4" />,
    direction: 'neutral' as const,
  };

  const getDirectionIcon = () => {
    switch (config.direction) {
      case 'in':
        return <PlusCircleIcon className="w-4 h-4 text-emerald-600" />;
      case 'out':
        return <MinusCircleIcon className="w-4 h-4 text-red-600" />;
      default:
        return <ArrowsRightLeftIcon className="w-4 h-4 text-purple-600" />;
    }
  };

  const getDirectionColor = () => {
    switch (config.direction) {
      case 'in':
        return 'text-emerald-600';
      case 'out':
        return 'text-red-600';
      default:
        return 'text-purple-600';
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
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
              icon={<ArrowLeftIcon className="w-4 h-4" />}
              onClick={() => router.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              Geri
            </Button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center">
                <ArrowsRightLeftIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{movement.documentNumber}</h1>
                  <Tag
                    icon={config.icon}
                    className={`border-0 ${config.bgColor} ${config.textColor}`}
                  >
                    {config.label}
                  </Tag>
                  {movement.isReversed && (
                    <Tag icon={<ArrowUturnLeftIcon className="w-4 h-4" />} className="border-0 bg-red-50 text-red-700">
                      İptal Edildi
                    </Tag>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {dayjs(movement.movementDate).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>
            </div>
          </div>
          <Space>
            <Button
              icon={<PrinterIcon className="w-4 h-4" />}
              className="border-slate-200 text-slate-700 hover:border-slate-300"
            >
              Yazdır
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
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    config.direction === 'in'
                      ? 'bg-emerald-100'
                      : config.direction === 'out'
                      ? 'bg-red-100'
                      : 'bg-purple-100'
                  }`}
                >
                  {getDirectionIcon()}
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Miktar
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className={`text-3xl font-bold ${getDirectionColor()}`}>
                  {config.direction === 'in' ? '+' : config.direction === 'out' ? '-' : ''}
                  {movement.quantity}
                </span>
                <span className="text-sm text-slate-400">adet</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Birim Maliyet
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-blue-600">
                  {formatCurrency(movement.unitCost)}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Toplam Maliyet
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-emerald-600">
                  {formatCurrency(movement.totalCost)}
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5 h-full">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  İşlem Tarihi
                </p>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-bold text-slate-900">
                  {dayjs(movement.movementDate).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </div>

          {/* Movement Info Section */}
          <div className="col-span-12 md:col-span-7">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Hareket Bilgileri
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Belge Numarası</p>
                  <p className="text-sm font-medium text-slate-900">{movement.documentNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Hareket Türü</p>
                  <Tag
                    icon={config.icon}
                    className={`border-0 ${config.bgColor} ${config.textColor}`}
                  >
                    {config.label}
                  </Tag>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Hareket Tarihi</p>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(movement.movementDate).format('DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  {movement.isReversed ? (
                    <Tag icon={<ArrowUturnLeftIcon className="w-4 h-4" />} className="border-0 bg-red-50 text-red-700">
                      İptal Edildi
                    </Tag>
                  ) : (
                    <Tag icon={<CheckCircleIcon className="w-4 h-4" />} className="border-0 bg-emerald-50 text-emerald-700">
                      Aktif
                    </Tag>
                  )}
                </div>
                {movement.reversedMovementId && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-400 mb-1">İptal Referansı</p>
                    <button
                      onClick={() => router.push(`/inventory/stock-movements/${movement.reversedMovementId}`)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      #{movement.reversedMovementId}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Timestamps Section */}
          <div className="col-span-12 md:col-span-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kayıt Bilgileri
              </p>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Oluşturulma</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {dayjs(movement.createdAt).format('DD/MM/YYYY HH:mm')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-500">Kullanıcı ID</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {movement.userId}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Ürün Bilgileri
              </p>
              <div
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors mb-4"
                onClick={() => router.push(`/inventory/products/${movement.productId}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                  <ShoppingBagIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 m-0">{movement.productName}</p>
                  <p className="text-xs text-slate-500 m-0">{movement.productCode}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-sm">Ürüne Git</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Miktar</p>
                  <span
                    className={`text-lg font-bold ${getDirectionColor()}`}
                  >
                    {config.direction === 'in' ? '+' : config.direction === 'out' ? '-' : ''}
                    {movement.quantity}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Birim Maliyet</p>
                  <span className="text-lg font-bold text-slate-900">{formatCurrency(movement.unitCost)}</span>
                </div>
                {movement.serialNumber && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Seri Numarası</p>
                    <code className="text-sm font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded">
                      {movement.serialNumber}
                    </code>
                  </div>
                )}
                {movement.lotNumber && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Lot Numarası</p>
                    <code className="text-sm font-medium text-slate-900 bg-slate-50 px-2 py-0.5 rounded">
                      {movement.lotNumber}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Location Info Section */}
          <div className="col-span-12 md:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Lokasyon Bilgileri
              </p>
              <div
                className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors mb-4"
                onClick={() => router.push(`/inventory/warehouses/${movement.warehouseId}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <MapPinIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 m-0">{movement.warehouseName}</p>
                  <p className="text-xs text-slate-500 m-0">Depo</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-sm">Depoya Git</span>
                  <ChevronRightIcon className="w-4 h-4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {movement.fromLocationName && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Kaynak Lokasyon</p>
                    <span className="text-sm font-medium text-slate-900">{movement.fromLocationName}</span>
                  </div>
                )}
                {movement.toLocationName && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Hedef Lokasyon</p>
                    <span className="text-sm font-medium text-slate-900">{movement.toLocationName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reference Document Section */}
          {(movement.referenceDocumentType || movement.referenceDocumentNumber) && (
            <div className="col-span-12 md:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Referans Belge
                </p>
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    {movement.referenceDocumentType && (
                      <p className="text-sm font-medium text-slate-900 m-0">{movement.referenceDocumentType}</p>
                    )}
                    {movement.referenceDocumentNumber && (
                      <p className="text-xs text-slate-500 m-0">{movement.referenceDocumentNumber}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description Section */}
          {movement.description && (
            <div className={`col-span-12 ${movement.referenceDocumentType || movement.referenceDocumentNumber ? 'md:col-span-6' : 'md:col-span-12'}`}>
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Açıklama
                </p>
                <p className="text-sm text-slate-600">{movement.description}</p>
              </div>
            </div>
          )}

          {/* Cost Summary Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Maliyet Özeti
              </p>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Miktar</p>
                  <p className={`text-2xl font-bold m-0 ${getDirectionColor()}`}>
                    {config.direction === 'in' ? '+' : config.direction === 'out' ? '-' : ''}
                    {movement.quantity}
                  </p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Birim Maliyet</p>
                  <p className="text-2xl font-bold text-slate-900 m-0">{formatCurrency(movement.unitCost)}</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Toplam Maliyet</p>
                  <p className="text-2xl font-bold text-emerald-600 m-0">{formatCurrency(movement.totalCost)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

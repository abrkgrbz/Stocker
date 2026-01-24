'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spin, message } from 'antd';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  SparklesIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';
import {
  useSegment,
  useActivateSegment,
  useDeactivateSegment,
} from '@/features/sales';
import Link from 'next/link';

const priorityConfig: Record<string, { label: string; color: string }> = {
  VeryHigh: { label: 'Platinum', color: 'bg-slate-900 text-white' },
  High: { label: 'Gold', color: 'bg-amber-100 text-amber-800' },
  Medium: { label: 'Silver', color: 'bg-slate-300 text-slate-800' },
  Low: { label: 'Bronze', color: 'bg-orange-100 text-orange-800' },
  VeryLow: { label: 'Standard', color: 'bg-slate-100 text-slate-600' },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SegmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: segment, isLoading } = useSegment(id);
  const activateMutation = useActivateSegment();
  const deactivateMutation = useDeactivateSegment();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!segment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 text-lg">Segment bulunamadi</p>
          <Link href="/sales/segments" className="text-slate-900 hover:underline mt-2 inline-block">
            Listeye don
          </Link>
        </div>
      </div>
    );
  }

  const handleToggleActive = async () => {
    try {
      if (segment.isActive) {
        await deactivateMutation.mutateAsync(id);
        message.success('Segment deaktif edildi');
      } else {
        await activateMutation.mutateAsync(id);
        message.success('Segment aktif edildi');
      }
    } catch {
      // Error handled by hook
    }
  };

  const priorityInfo = priorityConfig[segment.priority] || { label: segment.priority, color: 'bg-slate-100 text-slate-600' };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{segment.name}</h1>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityInfo.color}`}>
                  {priorityInfo.label}
                </span>
              </div>
              <p className="text-sm text-slate-500">{segment.code}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleActive}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                segment.isActive
                  ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                  : 'text-white bg-slate-900 hover:bg-slate-800'
              }`}
            >
              {segment.isActive ? 'Deaktif Et' : 'Aktif Et'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* General Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Genel Bilgiler</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Kod</p>
                  <p className="text-sm font-medium text-slate-900">{segment.code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Musteri Sayisi</p>
                  <p className="text-sm font-medium text-slate-900">{segment.customerCount}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Toplam Gelir</p>
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(segment.totalRevenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Ortalama Siparis Degeri</p>
                  <p className="text-sm font-medium text-slate-900">{formatCurrency(segment.averageOrderValue)}</p>
                </div>
              </div>
              {segment.description && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Aciklama</p>
                  <p className="text-sm text-slate-700">{segment.description}</p>
                </div>
              )}
            </div>

            {/* Pricing Rules */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CurrencyDollarIcon className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Fiyatlandirma Kurallari</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Indirim Orani</p>
                  <p className="text-lg font-semibold text-slate-900">{segment.discountPercentage}%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Min. Siparis</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(segment.minimumOrderAmount)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Maks. Siparis</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(segment.maximumOrderAmount)}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                {segment.allowSpecialPricing ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                    <CheckCircleIcon className="w-3.5 h-3.5" /> Ozel fiyatlandirma aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500">
                    <XCircleIcon className="w-3.5 h-3.5" /> Ozel fiyatlandirma pasif
                  </span>
                )}
              </div>
            </div>

            {/* Credit Terms */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Kredi Kosullari</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Kredi Limiti</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(segment.defaultCreditLimit)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-500">Odeme Vadesi</p>
                  <p className="text-lg font-semibold text-slate-900">{segment.defaultPaymentTermDays} gun</p>
                </div>
              </div>
              {segment.requiresAdvancePayment && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-sm text-amber-800">
                    Avans odeme zorunlu: <span className="font-medium">{segment.advancePaymentPercentage}%</span>
                  </p>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Avantajlar</h2>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2">
                  <TruckIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">Ucretsiz Kargo:</span>
                  {segment.freeShipping ? (
                    <span className="text-sm font-medium text-emerald-600">
                      Aktif (Min. {formatCurrency(segment.freeShippingThreshold)})
                    </span>
                  ) : (
                    <span className="text-sm text-slate-400">Pasif</span>
                  )}
                </div>
                <div className="flex items-center gap-3 p-2">
                  <SparklesIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">Erken Erisim:</span>
                  <span className={`text-sm font-medium ${segment.earlyAccessToProducts ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {segment.earlyAccessToProducts ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <StarIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-700">Ozel Promosyonlar:</span>
                  <span className={`text-sm font-medium ${segment.exclusivePromotions ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {segment.exclusivePromotions ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
              {segment.benefitsDescription && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-sm text-slate-600">{segment.benefitsDescription}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Durum</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Aktiflik</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    segment.isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {segment.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Varsayilan</span>
                  <span className="text-sm font-medium text-slate-900">{segment.isDefault ? 'Evet' : 'Hayir'}</span>
                </div>
              </div>
            </div>

            {/* Priority Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Oncelik</h3>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${priorityInfo.color}`}>
                  {priorityInfo.label}
                </span>
              </div>
            </div>

            {/* Service Level Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Servis Seviyesi</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Seviye</span>
                  <span className="text-sm font-medium text-slate-900">{segment.serviceLevel || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Maks. Yanit Suresi</span>
                  <span className="text-sm font-medium text-slate-900">{segment.maxResponseTimeHours} saat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Ozel Destek</span>
                  <span className="text-sm font-medium text-slate-900">{segment.hasDedicatedSupport ? 'Evet' : 'Hayir'}</span>
                </div>
              </div>
            </div>

            {/* Visual Settings Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <SwatchIcon className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-semibold text-slate-900">Gorsel Ayarlar</h3>
              </div>
              <div className="space-y-2">
                {segment.color && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded border border-slate-200" style={{ backgroundColor: segment.color }} />
                    <span className="text-sm text-slate-600">{segment.color}</span>
                  </div>
                )}
                {segment.badgeIcon && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">Rozet:</span>
                    <span className="text-sm font-medium text-slate-900">{segment.badgeIcon}</span>
                  </div>
                )}
                {!segment.color && !segment.badgeIcon && (
                  <p className="text-sm text-slate-400">Gorsel ayar yapilmamis</p>
                )}
              </div>
            </div>

            {/* Eligibility Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-slate-900 mb-3">Yeterlilik Kriterleri</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Min. Yillik Gelir</span>
                  <span className="text-sm font-medium text-slate-900">{formatCurrency(segment.minimumAnnualRevenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Min. Siparis Sayisi</span>
                  <span className="text-sm font-medium text-slate-900">{segment.minimumOrderCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Min. Musterlik Suresi</span>
                  <span className="text-sm font-medium text-slate-900">{segment.minimumMonthsAsCustomer} ay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

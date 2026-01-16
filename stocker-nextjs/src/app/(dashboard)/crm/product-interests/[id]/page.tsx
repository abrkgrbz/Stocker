'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Spin } from 'antd';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { useProductInterest, useDeleteProductInterest } from '@/lib/api/hooks/useCRM';
import { InterestLevel, InterestStatus, InterestSource } from '@/lib/api/services/crm.types';
import { confirmDelete, showDeleteSuccess, showError } from '@/lib/utils/sweetalert';

const interestLevelLabels: Record<InterestLevel, { label: string; color: string }> = {
  [InterestLevel.Low]: { label: 'Dusuk', color: 'bg-slate-100 text-slate-600' },
  [InterestLevel.Medium]: { label: 'Orta', color: 'bg-blue-100 text-blue-600' },
  [InterestLevel.High]: { label: 'Yuksek', color: 'bg-amber-100 text-amber-600' },
  [InterestLevel.VeryHigh]: { label: 'Cok Yuksek', color: 'bg-emerald-100 text-emerald-600' },
};

const interestStatusLabels: Record<InterestStatus, { label: string; color: string }> = {
  [InterestStatus.New]: { label: 'Yeni', color: 'bg-blue-100 text-blue-600' },
  [InterestStatus.Active]: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-600' },
  [InterestStatus.Followed]: { label: 'Takip', color: 'bg-amber-100 text-amber-600' },
  [InterestStatus.Purchased]: { label: 'Satin Alindi', color: 'bg-slate-900 text-white' },
  [InterestStatus.Lost]: { label: 'Kaybedildi', color: 'bg-red-100 text-red-600' },
};

const interestSourceLabels: Record<InterestSource, string> = {
  [InterestSource.Website]: 'Web Sitesi',
  [InterestSource.Store]: 'Magaza',
  [InterestSource.Campaign]: 'Kampanya',
  [InterestSource.Referral]: 'Referans',
  [InterestSource.SocialMedia]: 'Sosyal Medya',
  [InterestSource.Email]: 'E-posta',
  [InterestSource.Phone]: 'Telefon',
  [InterestSource.Other]: 'Diger',
};

export default function ProductInterestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: interest, isLoading, error } = useProductInterest(id);
  const deleteInterest = useDeleteProductInterest();

  const handleDelete = async () => {
    if (!interest) return;

    const confirmed = await confirmDelete(
      'Urun Ilgisi',
      interest.productName
    );

    if (confirmed) {
      try {
        await deleteInterest.mutateAsync(id);
        showDeleteSuccess('urun ilgisi');
        router.push('/crm/product-interests');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (value?: number): string => {
    if (!value && value !== 0) return '-';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(value);
  };

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (error || !interest) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Urun ilgisi bulunamadi</p>
          <Link href="/crm/product-interests" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Don
          </Link>
        </div>
      </PageContainer>
    );
  }

  const levelInfo = interestLevelLabels[interest.interestLevel];
  const statusInfo = interestStatusLabels[interest.status];

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/crm/product-interests"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Don
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
              <ShoppingBagIcon className="w-7 h-7 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{interest.productName}</h1>
              <p className="text-sm text-slate-500 mt-1">Urun ID: {interest.productId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/crm/product-interests/${id}/edit`}>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                <PencilIcon className="w-4 h-4" />
                Duzenle
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-slate-300 rounded-md hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Sil
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Urun Bilgileri</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Urun Adi</dt>
                  <dd className="text-sm text-slate-900 font-medium">{interest.productName}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Urun ID</dt>
                  <dd className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 inline-block">
                    {interest.productId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Miktar</dt>
                  <dd className="text-sm text-slate-900">
                    {interest.quantity ? `${interest.quantity} ${interest.unit || ''}` : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Butce</dt>
                  <dd className="text-sm text-slate-900 font-medium">{formatCurrency(interest.budget)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Kaynak</dt>
                  <dd className="text-sm text-slate-900">
                    {interest.source ? interestSourceLabels[interest.source] : '-'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Customer/Lead Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Musteri / Lead Bilgileri</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {interest.customerName || interest.leadName || 'Belirtilmemis'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {interest.customerName ? 'Musteri' : interest.leadName ? 'Lead' : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {interest.notes && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Notlar</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{interest.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Meta Info (1/3) */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Durum</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-500 mb-1">Ilgi Seviyesi</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${levelInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                  {levelInfo?.label || interest.interestLevel}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Durum</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                  {statusInfo?.label || interest.status}
                </span>
              </div>
            </div>
          </div>

          {/* Date Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Tarihler</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Olusturulma</p>
                  <p className="text-sm text-slate-900">{formatDate(interest.createdAt)}</p>
                </div>
              </div>
              {interest.lastInteractionDate && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Son Etkilesim</p>
                    <p className="text-sm text-slate-900">{formatDate(interest.lastInteractionDate)}</p>
                  </div>
                </div>
              )}
              {interest.updatedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Guncelleme</p>
                    <p className="text-sm text-slate-900">{formatDate(interest.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

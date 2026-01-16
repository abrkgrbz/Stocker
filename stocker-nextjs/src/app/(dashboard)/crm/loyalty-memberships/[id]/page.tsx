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
  UserGroupIcon,
  StarIcon,
  GiftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { useLoyaltyMembership, useDeleteLoyaltyMembership } from '@/lib/api/hooks/useCRM';
import { confirmDelete, showDeleteSuccess, showError } from '@/lib/utils/sweetalert';

export default function LoyaltyMembershipDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: membership, isLoading, error } = useLoyaltyMembership(id);
  const deleteMembership = useDeleteLoyaltyMembership();

  const handleDelete = async () => {
    if (!membership) return;

    const confirmed = await confirmDelete(
      'Sadakat Uyeligi',
      membership.membershipNumber
    );

    if (confirmed) {
      try {
        await deleteMembership.mutateAsync(id);
        showDeleteSuccess('sadakat uyeligi');
        router.push('/crm/loyalty-memberships');
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

  if (isLoading) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="flex items-center justify-center py-12">
          <Spin size="large" />
        </div>
      </PageContainer>
    );
  }

  if (error || !membership) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Uyelik bulunamadi</p>
          <Link href="/crm/loyalty-memberships" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Don
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/crm/loyalty-memberships"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Don
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
              <UserGroupIcon className="w-7 h-7 text-slate-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{membership.membershipNumber}</h1>
              <p className="text-sm text-slate-500 mt-1">{membership.customerName} - {membership.loyaltyProgramName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/crm/loyalty-memberships/${id}/edit`}>
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
              <h2 className="text-sm font-medium text-slate-900">Uyelik Bilgileri</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Uyelik Numarasi</dt>
                  <dd className="text-sm font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 inline-block">
                    {membership.membershipNumber}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Musteri</dt>
                  <dd className="text-sm text-slate-900">{membership.customerName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Program</dt>
                  <dd className="text-sm text-slate-900">{membership.loyaltyProgramName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Kademe</dt>
                  <dd className="text-sm text-slate-900">{membership.currentTierName || 'Baslangic'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Points Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Puan Bilgileri</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center mx-auto mb-2">
                    <StarIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">
                    {(membership.currentPoints || 0).toLocaleString('tr-TR')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Mevcut Puan</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center mx-auto mb-2">
                    <StarIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="text-2xl font-semibold text-slate-900">
                    {(membership.lifetimePoints || 0).toLocaleString('tr-TR')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Omur Boyu</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mx-auto mb-2">
                    <GiftIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-semibold text-emerald-600">
                    {(membership.totalPointsEarned || 0).toLocaleString('tr-TR')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Toplam Kazanilan</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mx-auto mb-2">
                    <GiftIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-semibold text-amber-600">
                    {(membership.totalPointsRedeemed || 0).toLocaleString('tr-TR')}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Toplam Kullanilan</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Meta Info (1/3) */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Durum</h3>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
              membership.isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {membership.isActive ? (
                <CheckCircleIcon className="w-4 h-4" />
              ) : (
                <XCircleIcon className="w-4 h-4" />
              )}
              {membership.isActive ? 'Aktif Uyelik' : 'Pasif Uyelik'}
            </span>
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
                  <p className="text-xs text-slate-500">Kayit Tarihi</p>
                  <p className="text-sm text-slate-900">{formatDate(membership.enrollmentDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Son Aktivite</p>
                  <p className="text-sm text-slate-900">{formatDate(membership.lastActivityDate)}</p>
                </div>
              </div>
              {membership.pointsExpiryDate && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Puan Son Kullanim</p>
                    <p className="text-sm text-amber-600 font-medium">{formatDate(membership.pointsExpiryDate)}</p>
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

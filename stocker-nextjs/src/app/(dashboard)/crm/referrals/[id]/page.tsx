'use client';

/**
 * Referral Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Empty, Tag } from 'antd';
import { Spinner } from '@/components/primitives';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  GiftIcon,
  PencilIcon,
  PhoneIcon,
  ShareIcon,
  UserIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useReferral } from '@/lib/api/hooks/useCRM';
import { ReferralStatus, ReferralType, ReferralRewardType } from '@/lib/api/services/crm.types';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

const statusLabels: Record<ReferralStatus, { label: string; color: string }> = {
  [ReferralStatus.New]: { label: 'Yeni', color: 'blue' },
  [ReferralStatus.Contacted]: { label: 'İletişime Geçildi', color: 'cyan' },
  [ReferralStatus.Qualified]: { label: 'Nitelikli', color: 'green' },
  [ReferralStatus.Converted]: { label: 'Dönüştürüldü', color: 'success' },
  [ReferralStatus.Rejected]: { label: 'Reddedildi', color: 'error' },
  [ReferralStatus.Expired]: { label: 'Süresi Doldu', color: 'default' },
};

const typeLabels: Record<ReferralType, { label: string; color: string }> = {
  [ReferralType.Customer]: { label: 'Müşteri', color: 'blue' },
  [ReferralType.Partner]: { label: 'Partner', color: 'purple' },
  [ReferralType.Employee]: { label: 'Çalışan', color: 'green' },
  [ReferralType.Influencer]: { label: 'Influencer', color: 'magenta' },
  [ReferralType.Affiliate]: { label: 'Affiliate', color: 'orange' },
  [ReferralType.Other]: { label: 'Diğer', color: 'default' },
};

const rewardTypeLabels: Record<ReferralRewardType, string> = {
  [ReferralRewardType.Cash]: 'Nakit',
  [ReferralRewardType.Discount]: 'İndirim',
  [ReferralRewardType.Points]: 'Puan',
  [ReferralRewardType.Credit]: 'Kredi',
  [ReferralRewardType.Gift]: 'Hediye',
  [ReferralRewardType.FreeProduct]: 'Ücretsiz Ürün',
  [ReferralRewardType.FreeService]: 'Ücretsiz Hizmet',
};

export default function ReferralDetailPage() {
  const router = useRouter();
  const params = useParams();
  const referralId = params.id as string;

  const { data: referral, isLoading, error } = useReferral(referralId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !referral) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Referans bulunamadı" />
      </div>
    );
  }

  const statusInfo = statusLabels[referral.status] || { label: referral.status, color: 'default' };
  const typeInfo = typeLabels[referral.referralType] || { label: referral.referralType, color: 'default' };

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
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/crm/referrals')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  referral.status === ReferralStatus.Converted ? 'bg-emerald-100' : 'bg-orange-100'
                }`}
              >
                <ShareIcon
                  className={`w-5 h-5 ${
                    referral.status === ReferralStatus.Converted ? 'text-emerald-600' : 'text-orange-600'
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {referral.referralCode || 'Referans'}
                  </h1>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                <p className="text-sm text-slate-500 m-0">{typeInfo.label}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/crm/referrals/${referral.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
            Düzenle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Referrer Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-4 h-4 text-blue-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Referans Veren
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{referral.referrerName}</p>
                    <Tag color={typeInfo.color} className="mt-1">{typeInfo.label}</Tag>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {referral.referrerEmail && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">E-posta</p>
                      <a
                        href={`mailto:${referral.referrerEmail}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <EnvelopeIcon className="w-3 h-3" />
                        {referral.referrerEmail}
                      </a>
                    </div>
                  )}
                  {referral.referrerPhone && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Telefon</p>
                      <a
                        href={`tel:${referral.referrerPhone}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <PhoneIcon className="w-3 h-3" />
                        {referral.referrerPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Referred Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4">
                <UserIcon className="w-4 h-4 text-emerald-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Referans Edilen
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{referral.referredName}</p>
                    {referral.referredCompany && (
                      <p className="text-xs text-slate-500">{referral.referredCompany}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {referral.referredEmail && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">E-posta</p>
                      <a
                        href={`mailto:${referral.referredEmail}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <EnvelopeIcon className="w-3 h-3" />
                        {referral.referredEmail}
                      </a>
                    </div>
                  )}
                  {referral.referredPhone && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Telefon</p>
                      <a
                        href={`tel:${referral.referredPhone}`}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <PhoneIcon className="w-3 h-3" />
                        {referral.referredPhone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Dates & Status Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Tarihler & Durum
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Referans Tarihi</p>
                  <p className="text-sm font-medium text-slate-900">
                    {referral.referralDate ? dayjs(referral.referralDate).format('DD/MM/YYYY') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Durum</p>
                  <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
                </div>
                {referral.contactedDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">İletişim Tarihi</p>
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(referral.contactedDate).format('DD/MM/YYYY')}
                    </p>
                  </div>
                )}
                {referral.conversionDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Dönüşüm Tarihi</p>
                    <p className="text-sm font-medium text-emerald-600">
                      {dayjs(referral.conversionDate).format('DD/MM/YYYY')}
                    </p>
                  </div>
                )}
                {referral.expiryDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Son Geçerlilik</p>
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(referral.expiryDate).format('DD/MM/YYYY')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Takip Sayısı</p>
                  <p className="text-sm font-medium text-slate-900">{referral.followUpCount || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rewards Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <GiftIcon className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Ödüller
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {referral.rewardType && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ödül Tipi</p>
                    <Tag color="gold">
                      {rewardTypeLabels[referral.rewardType] || referral.rewardType}
                    </Tag>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Ödül Durumu</p>
                  <Tag
                    color={referral.rewardPaid ? 'success' : 'warning'}
                    icon={referral.rewardPaid ? <CheckCircleIcon className="w-3 h-3" /> : <ClockIcon className="w-3 h-3" />}
                  >
                    {referral.rewardPaid ? 'Ödendi' : 'Bekliyor'}
                  </Tag>
                </div>
                {referral.referrerReward !== undefined && referral.referrerReward > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Referans Veren Ödülü</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {referral.referrerReward} {referral.currency || 'TRY'}
                    </p>
                  </div>
                )}
                {referral.referredReward !== undefined && referral.referredReward > 0 && (
                  <div className="p-3 bg-emerald-50 rounded-lg">
                    <p className="text-xs text-slate-400 mb-1">Referans Edilen Ödülü</p>
                    <p className="text-lg font-semibold text-emerald-600">
                      {referral.referredReward} {referral.currency || 'TRY'}
                    </p>
                  </div>
                )}
                {referral.rewardPaidDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Ödeme Tarihi</p>
                    <p className="text-sm font-medium text-slate-900">
                      {dayjs(referral.rewardPaidDate).format('DD/MM/YYYY')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Conversion Results Card */}
          {(referral.conversionValue || referral.totalSalesAmount) && (
            <div className="col-span-12 lg:col-span-6">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CurrencyDollarIcon className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                    Dönüşüm Sonuçları
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {referral.conversionValue !== undefined && (
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Dönüşüm Değeri</p>
                      <p className="text-xl font-semibold text-emerald-600">
                        ₺{referral.conversionValue.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  )}
                  {referral.totalSalesAmount !== undefined && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Toplam Satış</p>
                      <p className="text-xl font-semibold text-blue-600">
                        ₺{referral.totalSalesAmount.toLocaleString('tr-TR')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes Card */}
          {(referral.referralMessage || referral.internalNotes || referral.rejectionReason) && (
            <div className="col-span-12">
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                  Notlar
                </p>
                <div className="space-y-4">
                  {referral.referralMessage && (
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Referans Mesajı</p>
                      <p className="text-sm text-slate-700">{referral.referralMessage}</p>
                    </div>
                  )}
                  {referral.internalNotes && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Dahili Notlar</p>
                      <p className="text-sm text-slate-700">{referral.internalNotes}</p>
                    </div>
                  )}
                  {referral.rejectionReason && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">Red Sebebi</p>
                      <p className="text-sm text-red-600">{referral.rejectionReason}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Related Entities Card */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                İlişkili Kayıtlar
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {referral.referrerCustomerId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/customers/${referral.referrerCustomerId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Referans Veren Müşteri</p>
                    <p className="text-sm font-medium text-blue-600">
                      {referral.referrerCustomerName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {referral.referredCustomerId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/customers/${referral.referredCustomerId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Referans Edilen Müşteri</p>
                    <p className="text-sm font-medium text-blue-600">
                      {referral.referredCustomerName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {referral.referredLeadId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/leads/${referral.referredLeadId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Referans Edilen Lead</p>
                    <p className="text-sm font-medium text-blue-600">
                      {referral.referredLeadName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {referral.campaignId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/campaigns/${referral.campaignId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Kampanya</p>
                    <p className="text-sm font-medium text-blue-600">
                      {referral.campaignName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {referral.opportunityId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/opportunities/${referral.opportunityId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Fırsat</p>
                    <p className="text-sm font-medium text-blue-600">
                      {referral.opportunityName || 'Görüntüle'}
                    </p>
                  </div>
                )}
                {referral.dealId && (
                  <div
                    className="p-4 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => router.push(`/crm/deals/${referral.dealId}`)}
                  >
                    <p className="text-xs text-slate-400 mb-1">Deal</p>
                    <p className="text-sm font-medium text-blue-600">
                      {referral.dealTitle || 'Görüntüle'}
                    </p>
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

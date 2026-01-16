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
  GlobeAltIcon,
  UserGroupIcon,
  HeartIcon,
  UserIcon,
  LinkIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { PageContainer } from '@/components/patterns';
import { useSocialMediaProfile, useDeleteSocialMediaProfile } from '@/lib/api/hooks/useCRM';
import { SocialMediaPlatform } from '@/lib/api/services/crm.types';
import { confirmDelete, showDeleteSuccess, showError } from '@/lib/utils/sweetalert';

const platformLabels: Record<SocialMediaPlatform, { label: string; icon: string; color: string }> = {
  [SocialMediaPlatform.Facebook]: { label: 'Facebook', icon: '📘', color: 'bg-blue-100 text-blue-700' },
  [SocialMediaPlatform.Instagram]: { label: 'Instagram', icon: '📸', color: 'bg-pink-100 text-pink-700' },
  [SocialMediaPlatform.Twitter]: { label: 'Twitter/X', icon: '🐦', color: 'bg-sky-100 text-sky-700' },
  [SocialMediaPlatform.LinkedIn]: { label: 'LinkedIn', icon: '💼', color: 'bg-blue-100 text-blue-800' },
  [SocialMediaPlatform.YouTube]: { label: 'YouTube', icon: '🎬', color: 'bg-red-100 text-red-700' },
  [SocialMediaPlatform.TikTok]: { label: 'TikTok', icon: '🎵', color: 'bg-slate-900 text-white' },
  [SocialMediaPlatform.Pinterest]: { label: 'Pinterest', icon: '📌', color: 'bg-red-100 text-red-600' },
  [SocialMediaPlatform.Snapchat]: { label: 'Snapchat', icon: '👻', color: 'bg-yellow-100 text-yellow-700' },
  [SocialMediaPlatform.WhatsApp]: { label: 'WhatsApp', icon: '💬', color: 'bg-green-100 text-green-700' },
  [SocialMediaPlatform.Telegram]: { label: 'Telegram', icon: '✈️', color: 'bg-sky-100 text-sky-600' },
  [SocialMediaPlatform.Discord]: { label: 'Discord', icon: '🎮', color: 'bg-indigo-100 text-indigo-700' },
  [SocialMediaPlatform.Reddit]: { label: 'Reddit', icon: '🔴', color: 'bg-orange-100 text-orange-700' },
  [SocialMediaPlatform.Other]: { label: 'Diger', icon: '🌐', color: 'bg-slate-100 text-slate-600' },
};

export default function SocialMediaProfileDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: profile, isLoading, error } = useSocialMediaProfile(id);
  const deleteProfile = useDeleteSocialMediaProfile();

  const handleDelete = async () => {
    if (!profile) return;

    const confirmed = await confirmDelete(
      'Sosyal Medya Profili',
      `@${profile.username}`
    );

    if (confirmed) {
      try {
        await deleteProfile.mutateAsync(id);
        showDeleteSuccess('sosyal medya profili');
        router.push('/crm/social-profiles');
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

  const formatNumber = (value?: number): string => {
    if (!value && value !== 0) return '-';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString('tr-TR');
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

  if (error || !profile) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Sosyal medya profili bulunamadi</p>
          <Link href="/crm/social-profiles" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Don
          </Link>
        </div>
      </PageContainer>
    );
  }

  const platformInfo = platformLabels[profile.platform];

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/crm/social-profiles"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Don
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="text-2xl">{platformInfo?.icon || '🌐'}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900">@{profile.username}</h1>
                {profile.isVerified && (
                  <CheckBadgeIcon className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-slate-500 mt-1">{profile.displayName || platformInfo?.label}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/crm/social-profiles/${id}/edit`}>
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
          {/* Platform Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Platform Bilgileri</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Platform</dt>
                  <dd>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${platformInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                      <span>{platformInfo?.icon}</span>
                      {platformInfo?.label || profile.platform}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Kullanici Adi</dt>
                  <dd className="text-sm text-slate-900 font-medium">@{profile.username}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Gorunen Ad</dt>
                  <dd className="text-sm text-slate-900">{profile.displayName || '-'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500 mb-1">Dogrulama Durumu</dt>
                  <dd>
                    {profile.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-blue-600">
                        <CheckBadgeIcon className="w-4 h-4" />
                        Dogrulanmis
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">Dogrulanmamis</span>
                    )}
                  </dd>
                </div>
                {profile.profileUrl && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-slate-500 mb-1">Profil URL</dt>
                    <dd>
                      <a
                        href={profile.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                      >
                        <LinkIcon className="w-4 h-4" />
                        {profile.profileUrl}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Metrics Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Metrikler</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <UserGroupIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatNumber(profile.followersCount)}</p>
                  <p className="text-xs text-slate-500 mt-1">Takipci</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <UserGroupIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{formatNumber(profile.followingCount)}</p>
                  <p className="text-xs text-slate-500 mt-1">Takip Edilen</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <HeartIcon className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {profile.engagementRate ? `%${profile.engagementRate.toFixed(2)}` : '-'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Etkilesim</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer/Contact Card */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Musteri / Kisi Bilgileri</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {profile.customerName || profile.contactName || 'Belirtilmemis'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile.customerName ? 'Musteri' : profile.contactName ? 'Kisi' : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes Card */}
          {profile.notes && (
            <div className="bg-white border border-slate-200 rounded-xl">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-sm font-medium text-slate-900">Notlar</h2>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{profile.notes}</p>
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
                <p className="text-xs text-slate-500 mb-1">Platform</p>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${platformInfo?.color || 'bg-slate-100 text-slate-600'}`}>
                  <span>{platformInfo?.icon}</span>
                  {platformInfo?.label || profile.platform}
                </span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Dogrulama</p>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                  profile.isVerified ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {profile.isVerified ? 'Dogrulanmis' : 'Dogrulanmamis'}
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
                  <p className="text-sm text-slate-900">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
              {profile.lastSyncDate && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Son Senkronizasyon</p>
                    <p className="text-sm text-slate-900">{formatDate(profile.lastSyncDate)}</p>
                  </div>
                </div>
              )}
              {profile.updatedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <CalendarIcon className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Guncelleme</p>
                    <p className="text-sm text-slate-900">{formatDate(profile.updatedAt)}</p>
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

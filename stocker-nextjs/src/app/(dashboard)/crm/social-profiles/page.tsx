'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Table, Input, Select, Tooltip, Spin, Empty } from 'antd';
import {
  ArrowPathIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  GlobeAltIcon,
  UserGroupIcon,
  HeartIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import {
  showDeleteSuccess,
  showError,
  confirmDelete,
} from '@/lib/utils/sweetalert';
import type { SocialMediaProfileDto } from '@/lib/api/services/crm.types';
import { SocialMediaPlatform } from '@/lib/api/services/crm.types';
import { useSocialMediaProfiles, useDeleteSocialMediaProfile } from '@/lib/api/hooks/useCRM';
import type { ColumnsType } from 'antd/es/table';

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

export default function SocialMediaProfilesPage() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [platformFilter, setPlatformFilter] = useState<SocialMediaPlatform | undefined>();

  // API Hooks
  const { data, isLoading, refetch } = useSocialMediaProfiles({
    platform: platformFilter,
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
  });
  const deleteProfile = useDeleteSocialMediaProfile();

  const profiles = data?.items || [];
  const totalCount = data?.totalCount || 0;

  // Stats calculations
  const totalProfiles = profiles.length;
  const verifiedProfiles = profiles.filter((p) => p.isVerified).length;
  const totalFollowers = profiles.reduce((sum, p) => sum + (p.followersCount || 0), 0);
  const avgEngagement = profiles.length > 0
    ? profiles.reduce((sum, p) => sum + (p.engagementRate || 0), 0) / profiles.length
    : 0;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const handleCreate = () => {
    router.push('/crm/social-profiles/new');
  };

  const handleView = (profile: SocialMediaProfileDto) => {
    router.push(`/crm/social-profiles/${profile.id}`);
  };

  const handleEdit = (profile: SocialMediaProfileDto) => {
    router.push(`/crm/social-profiles/${profile.id}/edit`);
  };

  const handleDelete = async (id: string, profile: SocialMediaProfileDto) => {
    const confirmed = await confirmDelete(
      'Sosyal Medya Profili',
      `@${profile.username}`
    );

    if (confirmed) {
      try {
        await deleteProfile.mutateAsync(id);
        showDeleteSuccess('sosyal medya profili');
      } catch (error) {
        showError('Silme islemi basarisiz');
      }
    }
  };

  const formatNumber = (value?: number): string => {
    if (!value && value !== 0) return '-';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toLocaleString('tr-TR');
  };

  const columns: ColumnsType<SocialMediaProfileDto> = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      width: 140,
      render: (platform: SocialMediaPlatform) => {
        const info = platformLabels[platform];
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${info?.color || 'bg-slate-100 text-slate-600'}`}>
            <span>{info?.icon}</span>
            {info?.label || platform}
          </span>
        );
      },
    },
    {
      title: 'Kullanici Adi',
      dataIndex: 'username',
      key: 'username',
      render: (text: string, record) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900">@{text}</span>
          {record.isVerified && (
            <CheckBadgeIcon className="w-4 h-4 text-blue-500" />
          )}
        </div>
      ),
    },
    {
      title: 'Musteri/Kisi',
      key: 'customerOrContact',
      render: (_: unknown, record: SocialMediaProfileDto) => (
        <span className="text-slate-700">
          {record.customerName || record.contactName || '-'}
        </span>
      ),
    },
    {
      title: 'Takipci',
      dataIndex: 'followersCount',
      key: 'followersCount',
      width: 100,
      render: (value: number) => (
        <span className="text-slate-700 font-medium">{formatNumber(value)}</span>
      ),
    },
    {
      title: 'Takip',
      dataIndex: 'followingCount',
      key: 'followingCount',
      width: 100,
      render: (value: number) => (
        <span className="text-slate-700">{formatNumber(value)}</span>
      ),
    },
    {
      title: 'Etkilesim',
      dataIndex: 'engagementRate',
      key: 'engagementRate',
      width: 100,
      render: (value: number) => (
        <span className="text-slate-700">
          {value ? `%${value.toFixed(2)}` : '-'}
        </span>
      ),
    },
    {
      title: 'Islemler',
      key: 'actions',
      width: 140,
      render: (_: unknown, record: SocialMediaProfileDto) => (
        <div className="flex items-center gap-1">
          <Tooltip title="Goruntule">
            <Button
              type="text"
              size="small"
              icon={<EyeIcon className="w-4 h-4" />}
              onClick={() => handleView(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Tooltip title="Duzenle">
            <Button
              type="text"
              size="small"
              icon={<PencilIcon className="w-4 h-4" />}
              onClick={() => handleEdit(record)}
              className="!text-slate-600 hover:!text-slate-900"
            />
          </Tooltip>
          <Button
            type="text"
            danger
            size="small"
            onClick={() => handleDelete(record.id, record)}
            className="!text-red-500 hover:!text-red-600"
          >
            Sil
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <Spin spinning={isLoading}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-slate-600" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Sosyal Medya Profilleri</h1>
            </div>
            <p className="text-sm text-slate-500 ml-13">
              Musteri ve lead sosyal medya hesaplarini yonetin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              icon={<ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              disabled={isLoading}
              className="!border-slate-300 hover:!border-slate-400 !text-slate-600"
            >
              Yenile
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon className="w-4 h-4" />}
              onClick={handleCreate}
              className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
            >
              Yeni Profil
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-12 gap-6 mb-6">
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <GlobeAltIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Profil</p>
              <p className="text-2xl font-bold text-slate-900">{totalProfiles}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CheckBadgeIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Dogrulanmis</p>
              <p className="text-2xl font-bold text-slate-900">{verifiedProfiles}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserGroupIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Toplam Takipci</p>
              <p className="text-2xl font-bold text-slate-900">{formatNumber(totalFollowers)}</p>
            </div>
          </div>
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-slate-600" />
                </div>
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Ort. Etkilesim</p>
              <p className="text-2xl font-bold text-slate-900">%{avgEngagement.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Profil ara..."
              prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
              allowClear
            />
            <Select
              placeholder="Platform"
              value={platformFilter}
              onChange={setPlatformFilter}
              className="w-48"
              allowClear
              options={Object.entries(platformLabels).map(([key, val]) => ({
                value: key,
                label: (
                  <span className="flex items-center gap-2">
                    <span>{val.icon}</span>
                    <span>{val.label}</span>
                  </span>
                ),
              }))}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <Table
            columns={columns}
            dataSource={profiles}
            rowKey="id"
            loading={deleteProfile.isPending}
            className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            pagination={{
              current: currentPage,
              pageSize,
              total: totalCount,
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
              showSizeChanger: true,
              showTotal: (total) => `Toplam ${total} kayit`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
                      <GlobeAltIcon className="w-10 h-10 text-slate-400" />
                    </div>
                  }
                  imageStyle={{ height: 100 }}
                  description={
                    <div className="py-8">
                      <div className="text-lg font-semibold text-slate-800 mb-2">
                        Henuz sosyal medya profili bulunmuyor
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Musteri ve lead sosyal medya hesaplarini ekleyin
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusIcon className="w-4 h-4" />}
                        onClick={handleCreate}
                        className="!bg-slate-900 hover:!bg-slate-800 !border-slate-900"
                      >
                        Ilk Profili Olustur
                      </Button>
                    </div>
                  }
                />
              ),
            }}
          />
        </div>
      </Spin>
    </div>
  );
}

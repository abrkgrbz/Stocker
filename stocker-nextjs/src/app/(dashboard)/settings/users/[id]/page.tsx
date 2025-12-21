'use client';

/**
 * User Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Bento grid layout for user information
 * - Clean white cards with subtle borders
 * - Grouped sections for different user data
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Spin, Empty, Tag, Timeline } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  SafetyOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  LockOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  HistoryOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { getUserById, formatDate, getRoleLabel, type User } from '@/lib/api/users';
import { Badge } from '@/components/ui/enterprise-page';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserById(userId),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Kullanici bulunamadi" />
      </div>
    );
  }

  const getUserInitials = () => {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  const getStatusColor = () => {
    return user.isActive ? '#10b981' : '#ef4444';
  };

  const getStatusBadge = () => {
    if (!user.isActive) {
      return <Badge variant="error">Pasif</Badge>;
    }
    return <Badge variant="success">Aktif</Badge>;
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
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/settings/users')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftOutlined />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-semibold text-white"
                style={{ backgroundColor: getStatusColor() }}
              >
                {getUserInitials()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">
                    {user.firstName} {user.lastName}
                  </h1>
                  {getStatusBadge()}
                </div>
                <p className="text-sm text-slate-500 m-0">@{user.username}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push(`/settings/users/${user.id}/edit`)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <EditOutlined />
            Duzenle
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* User Info - Main Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Kullanici Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kullanici Adi</p>
                  <p className="text-sm font-medium text-slate-900">@{user.username}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">E-posta</p>
                  <div className="flex items-center gap-1">
                    <MailOutlined className="text-slate-400 text-xs" />
                    <span className="text-sm font-medium text-slate-900">{user.email}</span>
                    {user.emailConfirmed && (
                      <CheckCircleOutlined className="text-green-500 text-xs" />
                    )}
                  </div>
                </div>
                {user.phoneNumber && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Telefon</p>
                    <div className="flex items-center gap-1">
                      <PhoneOutlined className="text-slate-400 text-xs" />
                      <span className="text-sm font-medium text-slate-900">{user.phoneNumber}</span>
                    </div>
                  </div>
                )}
                {user.title && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Unvan</p>
                    <p className="text-sm font-medium text-slate-900">{user.title}</p>
                  </div>
                )}
                {user.department && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Departman</p>
                    <div className="flex items-center gap-1">
                      <TeamOutlined className="text-slate-400 text-xs" />
                      <span className="text-sm font-medium text-slate-900">{user.department.name}</span>
                    </div>
                  </div>
                )}
                {user.branch && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Sube</p>
                    <p className="text-sm font-medium text-slate-900">{user.branch.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-400 mb-1">Olusturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined className="text-slate-400 text-xs" />
                    <span className="text-sm font-medium text-slate-900">
                      {formatDate(user.createdDate)}
                    </span>
                  </div>
                </div>
                {user.lastLoginDate && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Son Giris</p>
                    <div className="flex items-center gap-1">
                      <ClockCircleOutlined className="text-slate-400 text-xs" />
                      <span className="text-sm font-medium text-slate-900">
                        {formatDate(user.lastLoginDate)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Biyografi</p>
                  <p className="text-sm text-slate-700">{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Ozet
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-semibold text-white"
                  style={{ backgroundColor: getStatusColor() }}
                >
                  {getUserInitials()}
                </div>
                <p className="text-lg font-semibold text-slate-900 mt-3">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-slate-400 mt-1">@{user.username}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Durum</span>
                  {getStatusBadge()}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Rol Sayisi</span>
                  <span className="font-medium text-slate-900">{user.roles.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Yetki Sayisi</span>
                  <span className="font-medium text-slate-900">{user.permissions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">2FA</span>
                  {user.twoFactorEnabled ? (
                    <Tag color="success" className="m-0">Aktif</Tag>
                  ) : (
                    <Tag className="m-0">Pasif</Tag>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Status Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <SafetyOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Hesap Durumu
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Hesap Durumu</p>
                  {user.isActive ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Aktif</Tag>
                  ) : (
                    <Tag color="error" icon={<CloseCircleOutlined />}>Pasif</Tag>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Iki Faktorlu Dogrulama</p>
                  {user.twoFactorEnabled ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>Aktif</Tag>
                  ) : (
                    <Tag icon={<CloseCircleOutlined />}>Pasif</Tag>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">E-posta Onayi</p>
                  {user.emailConfirmed ? (
                    <Tag color="success">Onayli</Tag>
                  ) : (
                    <Tag color="warning">Onay Bekliyor</Tag>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Basarisiz Giris</p>
                  <span className="text-sm font-medium text-slate-900">{user.accessFailedCount}</span>
                </div>
                {user.lockoutEnabled && user.lockoutEnd && (
                  <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                    <p className="text-xs text-slate-400 mb-1">Kilit Durumu</p>
                    <Tag color="error" icon={<LockOutlined />}>
                      {new Date(user.lockoutEnd) > new Date()
                        ? `Kilitli - ${formatDate(user.lockoutEnd)}`
                        : 'Kilidi Acik'}
                    </Tag>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* User Settings Card */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <SettingOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Kullanici Tercihleri
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Tema</p>
                  <Tag color={user.settings.theme === 'dark' ? 'default' : 'blue'}>
                    {user.settings.theme === 'dark' ? 'Karanlik' : 'Aydinlik'}
                  </Tag>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Dil</p>
                  <Tag>{user.settings.language === 'tr' ? 'Turkce' : user.settings.language}</Tag>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Bildirimler</p>
                  {user.settings.notificationsEnabled ? (
                    <Tag color="success">Acik</Tag>
                  ) : (
                    <Tag>Kapali</Tag>
                  )}
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">E-posta Bildirimleri</p>
                  {user.settings.emailNotifications ? (
                    <Tag color="success">Acik</Tag>
                  ) : (
                    <Tag>Kapali</Tag>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Roles Section */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <SafetyOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Roller ({user.roles.length})
                </p>
              </div>
              {user.roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((role) => (
                    <Tag key={role.id} color="blue" className="m-0">
                      {getRoleLabel(role.name)}
                    </Tag>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <SafetyOutlined className="text-xl text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Henuz rol atanmamis</p>
                </div>
              )}
            </div>
          </div>

          {/* Permissions Section */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <LockOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Yetkiler ({user.permissions.length})
                </p>
              </div>
              {user.permissions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {user.permissions.slice(0, 10).map((permission, index) => (
                    <Tag key={index} color="green" className="m-0">
                      {permission}
                    </Tag>
                  ))}
                  {user.permissions.length > 10 && (
                    <Tag className="m-0">+{user.permissions.length - 10} daha</Tag>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <LockOutlined className="text-xl text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Henuz yetki atanmamis</p>
                </div>
              )}
            </div>
          </div>

          {/* Login History Section */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <HistoryOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Son Giris Aktiviteleri
                </p>
              </div>
              {user.loginHistory && user.loginHistory.length > 0 ? (
                <Timeline
                  items={user.loginHistory.slice(0, 5).map((login, index) => ({
                    key: index,
                    color: login.status === 'Success' ? 'green' : 'red',
                    children: (
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-slate-900">
                            {formatDate(login.date)}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            {login.ipAddress && `IP: ${login.ipAddress}`}
                            {login.device && ` - ${login.device}`}
                          </span>
                        </div>
                        <Tag
                          color={login.status === 'Success' ? 'success' : 'error'}
                          className="m-0"
                        >
                          {login.status === 'Success' ? 'Basarili' : 'Basarisiz'}
                        </Tag>
                      </div>
                    ),
                  }))}
                />
              ) : (
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                    <HistoryOutlined className="text-xl text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Giris gecmisi bulunamadi</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

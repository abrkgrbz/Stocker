'use client';

/**
 * Role Detail Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Bento grid layout for role information
 * - Clean white cards with subtle borders
 * - Grouped permissions display
 */

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Spin, Empty, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  SafetyOutlined,
  TeamOutlined,
  LockOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useRole } from '@/hooks/useRoles';
import {
  parsePermission,
  PERMISSION_TYPE_LABELS,
  AVAILABLE_RESOURCES,
  type Permission,
} from '@/lib/api/roles';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

export default function RoleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roleId = params.id as string;

  const { data: role, isLoading, error } = useRole(roleId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex justify-center items-center">
        <Empty description="Rol bulunamadı" />
      </div>
    );
  }

  const permissions = role.permissions.map(parsePermission);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getRoleIcon = () => {
    if (role.isSystemRole) return '🔐';
    if (role.permissions.length > 50) return '👑';
    if (role.permissions.length > 20) return '⚡';
    return '👤';
  };

  const getResourceLabel = (resource: string) => {
    const found = AVAILABLE_RESOURCES.find((r) => r.value === resource);
    return found?.label || resource;
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
              onClick={() => router.push('/settings/roles')}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftOutlined />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: '#6366f115' }}
              >
                {getRoleIcon()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900 m-0">{role.name}</h1>
                  {role.isSystemRole && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-md">
                      <LockOutlined className="text-xs" />
                      Sistem Rolü
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 m-0">
                  {role.description || 'Açıklama bulunmuyor'}
                </p>
              </div>
            </div>
          </div>
          {!role.isSystemRole && (
            <button
              onClick={() => router.push(`/settings/roles/${role.id}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <EditOutlined />
              Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-8 py-6">
        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Role Info - Main Card */}
          <div className="col-span-12 lg:col-span-8">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Rol Bilgileri
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rol Adı</p>
                  <p className="text-sm font-medium text-slate-900">{role.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Rol Tipi</p>
                  {role.isSystemRole ? (
                    <Tag color="purple" className="m-0">
                      <LockOutlined className="mr-1" />
                      Sistem Rolü
                    </Tag>
                  ) : (
                    <Tag color="blue" className="m-0">Özel Rol</Tag>
                  )}
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Kullanıcı Sayısı</p>
                  <div className="flex items-center gap-1">
                    <TeamOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{role.userCount}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Yetki Sayısı</p>
                  <div className="flex items-center gap-1">
                    <SafetyOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{role.permissions.length}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Oluşturma Tarihi</p>
                  <div className="flex items-center gap-1">
                    <CalendarOutlined className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">
                      {dayjs(role.createdDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {role.description && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Açıklama</p>
                  <p className="text-sm text-slate-700">{role.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white border border-slate-200 rounded-xl p-6 h-full">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                Özet
              </p>
              <div className="flex flex-col items-center justify-center py-4">
                <div
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl"
                  style={{ backgroundColor: '#6366f115' }}
                >
                  {getRoleIcon()}
                </div>
                <p className="text-lg font-semibold text-slate-900 mt-3">{role.name}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {role.isSystemRole ? 'Sistem Rolü' : 'Özel Rol'}
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Atanan Kullanıcı</span>
                  <span className="font-medium text-slate-900">{role.userCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Toplam Yetki</span>
                  <span className="font-medium text-slate-900">{role.permissions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Kaynak Sayısı</span>
                  <span className="font-medium text-slate-900">{Object.keys(groupedPermissions).length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Permissions Section - Full Width */}
          <div className="col-span-12">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <SafetyOutlined className="text-slate-400" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider m-0">
                  Yetkiler ({role.permissions.length})
                </p>
              </div>

              {Object.keys(groupedPermissions).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupedPermissions).map(([resource, perms]) => (
                    <div
                      key={resource}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-slate-900 m-0">
                          {getResourceLabel(resource)}
                        </p>
                        <span className="text-xs text-slate-400">
                          {perms.length} yetki
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {perms.map((perm, index) => (
                          <Tag
                            key={index}
                            icon={<CheckCircleOutlined />}
                            color="blue"
                            className="m-0"
                          >
                            {(PERMISSION_TYPE_LABELS as any)[perm.permissionType]}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <SafetyOutlined className="text-2xl text-slate-400" />
                  </div>
                  <p className="text-slate-500">Bu rolde henüz yetki bulunmuyor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

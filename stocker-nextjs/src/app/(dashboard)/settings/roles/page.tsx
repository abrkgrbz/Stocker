'use client';

/**
 * Role Management Page
 * Monochrome Design System - Slate-based color palette
 * - Page wrapper: min-h-screen bg-slate-50 p-8
 * - Header icon: w-12 h-12 rounded-xl bg-slate-900 with white icon
 * - Stat cards: bg-white border border-slate-200 rounded-xl p-5
 * - Status badges: slate color variations
 * - Primary button: bg-slate-900 hover:bg-slate-800
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Tooltip, Dropdown } from 'antd';
import {
  EllipsisVerticalIcon,
  EyeIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { type Role } from '@/lib/api/roles';
import { confirmDelete } from '@/lib/utils/sweetalert';

export default function RolesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: roles, isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    if (!searchQuery.trim()) return roles;

    const query = searchQuery.toLowerCase();
    return roles.filter(
      (role) =>
        role.name.toLowerCase().includes(query) ||
        role.description?.toLowerCase().includes(query) ||
        (role.isSystemRole && 'sistem'.includes(query))
    );
  }, [roles, searchQuery]);

  const handleViewDetails = (role: Role) => {
    router.push(`/settings/roles/${role.id}`);
  };

  const handleCreate = () => {
    router.push('/settings/roles/new');
  };

  const handleEdit = (role: Role) => {
    router.push(`/settings/roles/${role.id}/edit`);
  };

  const handleDelete = async (role: Role) => {
    const additionalWarning = role.userCount > 0
      ? `Bu role ${role.userCount} kullanıcı atanmış. Rolü silebilmek için önce kullanıcıları başka bir role atamanız gerekiyor.`
      : undefined;

    const confirmed = await confirmDelete('Rol', role.name, additionalWarning);

    if (confirmed && role.userCount === 0) {
      await deleteRoleMutation.mutateAsync(role.id);
    }
  };

  const getRoleIcon = (role: Role) => {
    if (role.isSystemRole) return <LockClosedIcon className="w-5 h-5 text-slate-600" />;
    if (role.permissions.length > 50) return <ShieldCheckIcon className="w-5 h-5 text-slate-600" />;
    if (role.permissions.length > 20) return <ShieldCheckIcon className="w-5 h-5 text-slate-500" />;
    return <ShieldCheckIcon className="w-5 h-5 text-slate-400" />;
  };

  const getMenuItems = (role: Role) => [
    {
      key: 'view',
      label: 'Detayları Görüntüle',
      icon: <EyeIcon className="w-4 h-4" />,
      onClick: () => handleViewDetails(role),
    },
    { type: 'divider' as const },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <PencilIcon className="w-4 h-4" />,
      disabled: role.isSystemRole,
      onClick: () => handleEdit(role),
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: <TrashIcon className="w-4 h-4" />,
      danger: true,
      disabled: role.isSystemRole,
      onClick: () => handleDelete(role),
    },
  ];

  const stats = {
    total: roles?.length || 0,
    users: roles?.reduce((sum, r) => sum + r.userCount, 0) || 0,
    system: roles?.filter((r) => r.isSystemRole).length || 0,
    custom: roles?.filter((r) => !r.isSystemRole).length || 0,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Monochrome Icon */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Roller</h1>
              <p className="text-sm text-slate-500">Sistemdeki rolleri yönetin ve yetkileri düzenleyin</p>
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Yeni Rol
          </button>
        </div>

        {/* Stats Cards - Monochrome */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam Rol</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Kullanıcı</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <UsersIcon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{stats.users}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sistem Rolü</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <LockClosedIcon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{stats.system}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Özel Rol</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShieldCheckIcon className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{stats.custom}</div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <Input
            placeholder="Rolleri ara... (rol adı, açıklama)"
            prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
            className="h-10"
          />
        </div>

        {/* Roles List */}
        {filteredRoles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">
              {searchQuery ? 'Sonuç bulunamadı' : 'Henüz rol oluşturulmamış'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {searchQuery
                ? `"${searchQuery}" için eşleşen rol bulunamadı`
                : 'Sisteme erişim yetkileri tanımlamak için ilk rolünüzü oluşturun.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleCreate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                Rol Oluştur
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => handleViewDetails(role)}
                className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                    {getRoleIcon(role)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-900">{role.name}</span>
                      {role.isSystemRole && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-slate-200 text-slate-700">
                          <LockClosedIcon className="w-3 h-3" />
                          Sistem
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">
                      {role.description || 'Açıklama bulunmuyor'}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <UsersIcon className="w-3 h-3" />
                      <span>{role.userCount} kullanıcı</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ShieldCheckIcon className="w-3 h-3" />
                      <span>{role.permissions.length} yetki</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 ml-4">
                  <Tooltip title="Düzenle">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(role);
                      }}
                      disabled={role.isSystemRole}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Tooltip title="Sil">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(role);
                      }}
                      disabled={role.isSystemRole}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </Tooltip>
                  <Dropdown menu={{ items: getMenuItems(role) as any }} trigger={['click']}>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <EllipsisVerticalIcon className="w-4 h-4" />
                    </button>
                  </Dropdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

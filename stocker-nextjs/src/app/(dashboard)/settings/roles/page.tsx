'use client';

/**
 * Role Management Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Stacked list layout for data
 * - Action buttons only in designated areas
 */

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Tooltip, Dropdown, Spin } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  TeamOutlined,
  SafetyOutlined,
  MoreOutlined,
  SearchOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { type Role } from '@/lib/api/roles';
import { confirmDelete } from '@/lib/utils/sweetalert';
import {
  PageContainer,
  ListPageHeader,
  Card,
  ListContainer,
  EmptyState,
  Badge,
} from '@/components/ui/enterprise-page';

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
    if (role.isSystemRole) return '🔐';
    if (role.permissions.length > 50) return '👑';
    if (role.permissions.length > 20) return '⚡';
    return '👤';
  };

  const getMenuItems = (role: Role) => [
    {
      key: 'view',
      label: 'Detayları Görüntüle',
      icon: <EyeOutlined />,
      onClick: () => handleViewDetails(role),
    },
    { type: 'divider' as const },
    {
      key: 'edit',
      label: 'Düzenle',
      icon: <EditOutlined />,
      disabled: role.isSystemRole,
      onClick: () => handleEdit(role),
    },
    {
      key: 'delete',
      label: 'Sil',
      icon: <DeleteOutlined />,
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

  return (
    <PageContainer maxWidth="5xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam Rol</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6366f115' }}>
              <SafetyOutlined style={{ color: '#6366f1' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Kullanıcı</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.users}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <TeamOutlined style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Sistem Rolü</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.system}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <LockOutlined style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Özel Rol</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.custom}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#ec489915' }}>
              <span style={{ color: '#ec4899' }}>✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<SafetyOutlined />}
        iconColor="#6366f1"
        title="Roller"
        description="Sistemdeki rolleri yönetin ve yetkileri düzenleyin"
        itemCount={filteredRoles.length}
        primaryAction={{
          label: 'Yeni Rol',
          onClick: handleCreate,
          icon: <PlusOutlined />,
        }}
      />

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Rolleri ara... (rol adı, açıklama)"
          prefix={<SearchOutlined className="text-slate-400" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="h-10"
        />
      </div>

      {/* Roles List */}
      {isLoading ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        </Card>
      ) : filteredRoles.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SafetyOutlined className="text-xl" />}
            title={searchQuery ? 'Sonuç bulunamadı' : 'Henüz rol oluşturulmamış'}
            description={
              searchQuery
                ? `"${searchQuery}" için eşleşen rol bulunamadı`
                : 'Sisteme erişim yetkileri tanımlamak için ilk rolünüzü oluşturun.'
            }
            action={
              !searchQuery
                ? {
                    label: 'Rol Oluştur',
                    onClick: handleCreate,
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <ListContainer>
          {filteredRoles.map((role) => (
            <div
              key={role.id}
              onClick={() => handleViewDetails(role)}
              className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                  style={{ backgroundColor: '#6366f115' }}
                >
                  {getRoleIcon(role)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-slate-900">{role.name}</span>
                    {role.isSystemRole && (
                      <Badge variant="warning">
                        <LockOutlined className="mr-1" />
                        Sistem
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">
                    {role.description || 'Açıklama bulunmuyor'}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <TeamOutlined />
                    <span>{role.userCount} kullanıcı</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <SafetyOutlined />
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
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <EditOutlined className="text-sm" />
                  </button>
                </Tooltip>
                <Tooltip title="Sil">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(role);
                    }}
                    disabled={role.isSystemRole}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <DeleteOutlined className="text-sm" />
                  </button>
                </Tooltip>
                <Dropdown menu={{ items: getMenuItems(role) as any }} trigger={['click']}>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <MoreOutlined className="text-sm" />
                  </button>
                </Dropdown>
              </div>
            </div>
          ))}
        </ListContainer>
      )}

    </PageContainer>
  );
}

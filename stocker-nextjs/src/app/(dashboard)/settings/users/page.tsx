'use client';

/**
 * User Management Page
 * Monochrome Design System - Professional Slate Palette
 * - Clean white cards with slate borders
 * - Consistent spacing and typography
 * - Action buttons with slate-900 primary
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  showCreateSuccess,
  showUpdateSuccess,
  showDeleteSuccess,
  showError,
  confirmDelete,
  confirmAction,
} from '@/lib/utils/sweetalert';
import { Table, Input, Select, Tooltip, Dropdown } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  EnvelopeIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  PencilIcon,
  PlusIcon,
  ShieldCheckIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { CrownIcon } from 'lucide-react';
import { Spinner } from '@/components/primitives';
import { AdminOnly } from '@/components/auth/PermissionGate';
import { UserModal } from '@/features/users/components/UserModal';
import { useAuth } from '@/lib/auth';
import { useRole } from '@/hooks/useRole';
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  resendInvitation,
  getRoleLabel,
  type UserListItem,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '@/lib/api/users';
import { getSubscriptionInfo } from '@/lib/api/subscription';

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);

  const { user } = useAuth();
  const { role, isAdmin } = useRole();

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', searchText],
    queryFn: () => getUsers(1, 100, searchText || undefined),
  });

  const { data: subscriptionInfo } = useQuery({
    queryKey: ['subscription-info'],
    queryFn: getSubscriptionInfo,
    staleTime: 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      showDeleteSuccess('kullanıcı');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
    },
    onError: (error: any) => {
      showError(error?.message || 'Kullanıcı silinirken bir hata oluştu');
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: () => {
      showUpdateSuccess('kullanıcı durumu');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      showError(error?.message || 'Kullanıcı durumu değiştirilirken bir hata oluştu');
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: resendInvitation,
    onSuccess: (result) => {
      showCreateSuccess('davet e-postası');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      showError(error?.message || 'Davet e-postası gönderilemedi');
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: (data) => {
      console.log('[CreateUser] Success:', data);
      showCreateSuccess('kullanıcı');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
      setModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      console.error('[CreateUser] Error:', error);
      showError(error?.message || error?.error?.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) => updateUser(userId, data),
    onSuccess: () => {
      showUpdateSuccess('kullanıcı');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      showError(error?.message || 'Kullanıcı güncellenirken bir hata oluştu');
    },
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const handleEditUser = (user: UserListItem) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleSubmitUser = async (values: any) => {
    if (editingUser) {
      const updateData: UpdateUserRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
      };
      await updateMutation.mutateAsync({ userId: editingUser.id, data: updateData });
    } else {
      // No password needed - user will set their own password via invitation email
      const createData: CreateUserRequest = {
        username: values.username,
        email: values.email,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        roleIds: values.roleIds,
        department: values.department,
      };
      await createMutation.mutateAsync(createData);
    }
  };

  const handleResendInvitation = async (user: UserListItem) => {
    const confirmed = await confirmAction(
      'Daveti Tekrar Gönder',
      `${user.firstName} ${user.lastName} kullanıcısına davet e-postasını tekrar göndermek istediğinizden emin misiniz?`,
      'Gönder'
    );
    if (confirmed) {
      resendInvitationMutation.mutate(user.id);
    }
  };

  const handleViewDetails = (userId: string) => {
    router.push(`/settings/users/${userId}`);
  };

  const handleToggleStatus = async (user: UserListItem) => {
    const confirmed = await confirmAction(
      user.isActive ? 'Kullanıcıyı Devre Dışı Bırak' : 'Kullanıcıyı Aktif Et',
      `${user.firstName} ${user.lastName} kullanıcısını ${
        user.isActive ? 'devre dışı bırakmak' : 'aktif etmek'
      } istediğinizden emin misiniz?`,
      user.isActive ? 'Devre Dışı Bırak' : 'Aktif Et'
    );
    if (confirmed) {
      toggleStatusMutation.mutate(user.id);
    }
  };

  const handleDeleteUser = async (user: UserListItem) => {
    const confirmed = await confirmDelete(
      'Kullanıcı',
      `${user.firstName} ${user.lastName}`,
      'Bu işlem geri alınamaz.'
    );
    if (confirmed) {
      deleteMutation.mutate(user.id);
    }
  };

  const getUserMenu = (user: UserListItem) => {
    const isPendingActivation = user.status === 'PendingActivation';

    return {
      items: [
        {
          key: 'view',
          label: 'Detayları Görüntüle',
          icon: <EyeIcon className="w-4 h-4" />,
          onClick: () => handleViewDetails(user.id),
        },
        {
          key: 'edit',
          label: 'Düzenle',
          icon: <PencilIcon className="w-4 h-4" />,
          onClick: () => handleEditUser(user),
        },
        // Show "Resend Invitation" for pending users
        ...(isPendingActivation
          ? [
              {
                key: 'resend',
                label: 'Daveti Tekrar Gönder',
                icon: <PaperAirplaneIcon className="w-4 h-4" />,
                onClick: () => handleResendInvitation(user),
              },
            ]
          : []),
        // Only show toggle status for non-pending users
        ...(!isPendingActivation
          ? [
              {
                key: 'toggle',
                label: user.isActive ? 'Devre Dışı Bırak' : 'Aktif Et',
                icon: user.isActive ? <LockClosedIcon className="w-4 h-4" /> : <LockOpenIcon className="w-4 h-4" />,
                onClick: () => handleToggleStatus(user),
              },
            ]
          : []),
        { type: 'divider' as const },
        {
          key: 'delete',
          label: 'Sil',
          icon: <TrashIcon className="w-4 h-4" />,
          danger: true,
          disabled: user.roles.includes('FirmaYöneticisi') || user.roles.includes('Admin'),
          onClick: () => handleDeleteUser(user),
        },
      ],
    };
  };

  // Show all users except soft-deleted ones (Terminated status)
  // PendingActivation users have isActive=false but should still be shown
  const users = (usersData?.items || []).filter((u) => u.status !== 'Terminated');

  const filteredUsers = users.filter((user) => {
    const matchesRole =
      filterRole === 'all' ||
      user.roles.some((r) => r === filterRole || getRoleLabel(r).toLowerCase() === filterRole.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.status !== 'PendingActivation') ||
      (filterStatus === 'pending' && user.status === 'PendingActivation');
    return matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status !== 'PendingActivation').length,
    pending: users.filter((u) => u.status === 'PendingActivation').length,
    admins: users.filter((u) => u.roles.some((r) => r === 'FirmaYöneticisi' || r === 'Admin')).length,
  };

  const columns: ColumnsType<UserListItem> = [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium ${
              record.isActive ? 'bg-slate-100 text-slate-700' : 'bg-slate-50 text-slate-400'
            }`}
          >
            {record.firstName[0]}{record.lastName[0]}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-900">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-xs text-slate-400">@{record.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'E-posta',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <div className="flex items-center gap-2">
          <EnvelopeIcon className="w-3 h-3 text-slate-400" />
          <span className="text-sm text-slate-600">{email}</span>
        </div>
      ),
    },
    {
      title: 'Roller',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: string[]) => (
        <div className="flex items-center gap-1 flex-wrap">
          {roles.length === 0 ? (
            <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">Rol Yok</span>
          ) : (
            <>
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                roles[0] === 'FirmaYöneticisi' || roles[0] === 'Admin'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {getRoleLabel(roles[0])}
              </span>
              {roles.length > 1 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500 rounded">+{roles.length - 1}</span>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      title: 'Departman',
      dataIndex: 'department',
      key: 'department',
      render: (department?: string) => (
        <span className="text-sm text-slate-500">
          {department || <span className="text-slate-300">—</span>}
        </span>
      ),
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_, record: UserListItem) => {
        if (record.status === 'PendingActivation') {
          return (
            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700 rounded">
              <ClockIcon className="w-3 h-3 mr-1" />
              Davet Bekleniyor
            </span>
          );
        }
        return (
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${
            record.isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {record.isActive ? 'Aktif' : 'Pasif'}
          </span>
        );
      },
    },
    {
      title: '',
      key: 'actions',
      align: 'right',
      width: 60,
      render: (_, record) => (
        <AdminOnly>
          <Dropdown menu={getUserMenu(record)} trigger={['click']}>
            <button
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
          </Dropdown>
        </AdminOnly>
      ),
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Hata oluştu</h3>
            <p className="text-sm text-slate-500">Kullanıcılar yüklenirken bir hata oluştu</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Kullanıcılar</h1>
              <p className="text-sm text-slate-500">Sistem kullanıcılarını yönetin</p>
            </div>
          </div>
          {isAdmin && (
            <Tooltip
              title={subscriptionInfo && !subscriptionInfo.canAddUser && subscriptionInfo.maxUsers < 999999
                ? 'Kullanıcı limitine ulaşıldı. Paketinizi yükseltin.'
                : undefined}
            >
              <button
                onClick={handleCreateUser}
                disabled={subscriptionInfo ? !subscriptionInfo.canAddUser && subscriptionInfo.maxUsers < 999999 : false}
                className="flex items-center gap-2 px-4 py-2 !bg-slate-900 hover:!bg-slate-800 !border-slate-900 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="w-4 h-4" />
                Kullanıcı Davet Et
              </button>
            </Tooltip>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam</span>
                  {subscriptionInfo && subscriptionInfo.maxUsers < 999999 && (
                    <Tooltip title={`Paket: ${subscriptionInfo.packageName}`}>
                      <CrownIcon className="w-3 h-3 text-slate-400" />
                    </Tooltip>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-slate-900">
                    {subscriptionInfo?.currentUserCount ?? stats.total}
                  </span>
                  {subscriptionInfo && subscriptionInfo.maxUsers < 999999 && (
                    <span className="text-sm text-slate-400">/ {subscriptionInfo.maxUsers}</span>
                  )}
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif</span>
                <div className="text-2xl font-semibold text-slate-900">{stats.active}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Bekleyen</span>
                <div className="text-2xl font-semibold text-slate-900">{stats.pending}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ClockIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wide">Yönetici</span>
                <div className="text-2xl font-semibold text-slate-900">{stats.admins}</div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* User Limit Warning */}
        {subscriptionInfo && !subscriptionInfo.canAddUser && subscriptionInfo.maxUsers < 999999 && (
          <div className="mb-6 bg-slate-100 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Kullanıcı Limitine Ulaşıldı</p>
                <p className="text-xs text-slate-600">
                  Mevcut paketiniz ({subscriptionInfo.packageName}) en fazla {subscriptionInfo.maxUsers} kullanıcıya izin vermektedir.
                  Daha fazla kullanıcı eklemek için paketinizi yükseltmeniz gerekmektedir.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Kullanıcı ara..."
                prefix={<MagnifyingGlassIcon className="w-4 h-4 text-slate-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="h-10"
              />
            </div>
            <Select
              value={filterRole}
              onChange={setFilterRole}
              className="w-40 h-10"
            >
              <Select.Option value="all">Tüm Roller</Select.Option>
              <Select.Option value="FirmaYöneticisi">Admin</Select.Option>
              <Select.Option value="Yönetici">Yönetici</Select.Option>
              <Select.Option value="Kullanıcı">Kullanıcı</Select.Option>
            </Select>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-48 h-10"
            >
              <Select.Option value="all">Tüm Durumlar</Select.Option>
              <Select.Option value="active">Aktif</Select.Option>
              <Select.Option value="pending">Davet Bekleniyor</Select.Option>
            </Select>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <UserIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Kullanıcı bulunamadı</h3>
            <p className="text-sm text-slate-500 mb-4">Arama kriterlerinizi değiştirmeyi deneyin</p>
            {isAdmin && (
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 !bg-slate-900 hover:!bg-slate-800 !border-slate-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Kullanıcı Oluştur
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <Table
              columns={columns}
              dataSource={filteredUsers}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => (
                  <span className="text-sm text-slate-500">Toplam {total} kullanıcı</span>
                ),
              }}
              onRow={(record) => ({
                onClick: () => handleViewDetails(record.id),
                className: 'cursor-pointer hover:bg-slate-50',
              })}
              className="[&_.ant-table-thead_th]:!bg-slate-50 [&_.ant-table-thead_th]:!text-slate-500 [&_.ant-table-thead_th]:!font-medium [&_.ant-table-thead_th]:!text-xs [&_.ant-table-thead_th]:!uppercase [&_.ant-table-thead_th]:!tracking-wider [&_.ant-table-thead_th]:!border-slate-200 [&_.ant-table-tbody_td]:!border-slate-100 [&_.ant-table-row:hover_td]:!bg-slate-50"
            />
          </div>
        )}

        {/* Modals */}
        <UserModal
          open={modalOpen}
          user={editingUser as any}
          onClose={() => {
            setModalOpen(false);
            setEditingUser(null);
          }}
          onSubmit={handleSubmitUser}
        />
      </div>
    </div>
  );
}

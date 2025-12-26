'use client';

/**
 * User Management Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Stacked list layout for data
 * - Action buttons only in designated areas
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
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  EnvelopeIcon,
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  EyeIcon,
  PaperAirplaneIcon,
  ClockIcon,
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
import {
  PageContainer,
  ListPageHeader,
  Card,
  DataTableWrapper,
  EmptyState,
  Badge,
} from '@/components/ui/enterprise-page';

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
    onSuccess: () => {
      showCreateSuccess('kullanıcı');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-info'] });
      setModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      showError(error?.message || 'Kullanıcı oluşturulurken bir hata oluştu');
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

  // Only show active users (soft-deleted users are filtered out)
  const users = (usersData?.items || []).filter((u) => u.isActive);

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
              record.isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'
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
            <Badge variant="default">Rol Yok</Badge>
          ) : (
            <>
              <Badge variant={roles[0] === 'FirmaYöneticisi' || roles[0] === 'Admin' ? 'error' : 'info'}>
                {getRoleLabel(roles[0])}
              </Badge>
              {roles.length > 1 && (
                <Badge variant="default">+{roles.length - 1}</Badge>
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
            <Badge variant="warning">
              <ClockIcon className="w-3 h-3 mr-1" />
              Davet Bekleniyor
            </Badge>
          );
        }
        return (
          <Badge variant={record.isActive ? 'success' : 'default'}>
            {record.isActive ? 'Aktif' : 'Pasif'}
          </Badge>
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
      <PageContainer maxWidth="5xl">
        <Card>
          <EmptyState
            icon={<UserIcon className="w-6 h-6" />}
            title="Hata oluştu"
            description="Kullanıcılar yüklenirken bir hata oluştu"
          />
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="7xl">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam</span>
                {subscriptionInfo && (
                  <Tooltip title={`Paket: ${subscriptionInfo.packageName}`}>
                    <CrownIcon className="w-3 h-3 text-amber-500" />
                  </Tooltip>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-slate-900">{stats.total}</span>
                {subscriptionInfo && (
                  <span className="text-sm text-slate-400">/ {subscriptionInfo.maxUsers}</span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <UsersIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.active}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleIcon className="w-5 h-5" style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Bekleyen</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.pending}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <ClockIcon className="w-5 h-5" style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Yönetici</span>
              <div className="text-2xl font-semibold text-slate-900">{stats.admins}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#0284c715' }}>
              <ShieldCheckIcon className="w-5 h-5" style={{ color: '#0284c7' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <ListPageHeader
        icon={<UserIcon className="w-5 h-5" />}
        iconColor="#3b82f6"
        title="Kullanıcılar"
        description="Sistem kullanıcılarını yönetin"
        itemCount={filteredUsers.length}
        primaryAction={
          isAdmin
            ? {
                label: 'Kullanıcı Davet Et',
                onClick: handleCreateUser,
                icon: <PaperAirplaneIcon className="w-4 h-4" />,
              }
            : undefined
        }
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
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
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : filteredUsers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<UserIcon className="w-6 h-6" />}
            title="Kullanıcı bulunamadı"
            description="Arama kriterlerinizi değiştirmeyi deneyin"
            action={
              isAdmin
                ? {
                    label: 'Kullanıcı Oluştur',
                    onClick: handleCreateUser,
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <DataTableWrapper>
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
            className="enterprise-table"
          />
        </DataTableWrapper>
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
    </PageContainer>
  );
}

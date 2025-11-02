'use client';

/**
 * User Management Page - API Integrated
 * Real-time user management with comprehensive features
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  Row,
  Col,
  Button,
  Input,
  Avatar,
  Tag,
  Dropdown,
  Space,
  Typography,
  Badge,
  message,
  Select,
  Modal,
  Segmented,
  List,
  Divider,
  Spin,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  AppstoreOutlined,
  BarsOutlined,
  SafetyOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { AdminOnly } from '@/components/auth/PermissionGate';
import { UserModal } from '@/features/users/components/UserModal';
import { UserDetailsDrawer } from '@/features/users/components/UserDetailsDrawer';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getRoleLabel,
  type UserListItem,
  type User,
  type CreateUserRequest,
  type UpdateUserRequest,
} from '@/lib/api/users';

const { Text, Title } = Typography;
const { confirm } = Modal;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // DEBUG: Check auth and role
  const { user } = useAuth();
  const { role, isAdmin } = useRole();

  useEffect(() => {
    console.log('🔍 UsersPage - Auth Debug:', {
      user,
      role,
      isAdmin,
      userRole: user?.role
    });
  }, [user, role, isAdmin]);

  // Fetch users list
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['users', searchText],
    queryFn: () => getUsers(1, 100, searchText || undefined),
  });

  // Fetch selected user details
  const { data: selectedUserDetails } = useQuery({
    queryKey: ['user', selectedUserId],
    queryFn: () => getUserById(selectedUserId!),
    enabled: !!selectedUserId && detailsDrawerOpen,
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      message.success('Kullanıcı başarıyla silindi');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Kullanıcı silinirken bir hata oluştu');
    },
  });

  // Toggle user status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: toggleUserStatus,
    onSuccess: (result) => {
      message.success(result.message);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Kullanıcı durumu değiştirilirken bir hata oluştu');
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      message.success('Kullanıcı başarıyla oluşturuldu');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      message.error(error?.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) => updateUser(userId, data),
    onSuccess: () => {
      message.success('Kullanıcı başarıyla güncellendi');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalOpen(false);
      setEditingUser(null);
    },
    onError: (error: any) => {
      message.error(error?.message || 'Kullanıcı güncellenirken bir hata oluştu');
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
      // Update existing user
      const updateData: UpdateUserRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phoneNumber: values.phoneNumber,
      };
      await updateMutation.mutateAsync({ userId: editingUser.id, data: updateData });
    } else {
      // Create new user
      const createData: CreateUserRequest = {
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
        role: values.role,
        department: values.department,
      };
      await createMutation.mutateAsync(createData);
    }
  };

  const handleViewDetails = (userId: string) => {
    setSelectedUserId(userId);
    setDetailsDrawerOpen(true);
  };

  const handleToggleStatus = (user: UserListItem) => {
    confirm({
      title: user.isActive ? 'Kullanıcıyı Devre Dışı Bırak' : 'Kullanıcıyı Aktif Et',
      content: `${user.firstName} ${user.lastName} kullanıcısını ${
        user.isActive ? 'devre dışı bırakmak' : 'aktif etmek'
      } istediğinizden emin misiniz?`,
      onOk: () => {
        toggleStatusMutation.mutate(user.id);
      },
    });
  };

  const handleDeleteUser = (user: UserListItem) => {
    confirm({
      title: 'Kullanıcıyı Sil',
      content: `${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      onOk: () => {
        deleteMutation.mutate(user.id);
      },
    });
  };

  const getUserMenu = (user: UserListItem) => ({
    items: [
      {
        key: 'view',
        label: 'Detayları Görüntüle',
        icon: <EyeOutlined />,
        onClick: () => handleViewDetails(user.id),
      },
      {
        key: 'edit',
        label: 'Düzenle',
        icon: <EditOutlined />,
        onClick: () => handleEditUser(user),
      },
      {
        key: 'toggle',
        label: user.isActive ? 'Devre Dışı Bırak' : 'Aktif Et',
        icon: user.isActive ? <LockOutlined /> : <UnlockOutlined />,
        onClick: () => handleToggleStatus(user),
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'delete',
        label: 'Sil',
        icon: <DeleteOutlined />,
        danger: true,
        disabled: user.roles.includes('FirmaYöneticisi') || user.roles.includes('Admin'),
        onClick: () => handleDeleteUser(user),
      },
    ],
  });

  const getRoleBadge = (roles: string[]) => {
    if (roles.length === 0) return <Tag>Rol Yok</Tag>;

    const primaryRole = roles[0];
    const config: Record<string, { color: string; label: string }> = {
      FirmaYöneticisi: { color: 'red', label: 'Admin' },
      Admin: { color: 'red', label: 'Admin' },
      Yönetici: { color: 'blue', label: 'Yönetici' },
      Manager: { color: 'blue', label: 'Yönetici' },
      Kullanıcı: { color: 'default', label: 'Kullanıcı' },
      User: { color: 'default', label: 'Kullanıcı' },
    };

    const { color, label } = config[primaryRole] || { color: 'default', label: getRoleLabel(primaryRole) };
    return (
      <>
        <Tag color={color}>{label}</Tag>
        {roles.length > 1 && <Tag>+{roles.length - 1}</Tag>}
      </>
    );
  };

  // Get users array safely
  const users = usersData?.users || [];

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesRole =
      filterRole === 'all' ||
      user.roles.some(
        (r) => r === filterRole || getRoleLabel(r).toLowerCase() === filterRole.toLowerCase()
      );
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    return matchesRole && matchesStatus;
  });

  // Calculate stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    inactive: users.filter((u) => !u.isActive).length,
    admins: users.filter((u) => u.roles.some((r) => r === 'FirmaYöneticisi' || r === 'Admin')).length,
  };

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Text type="danger">Kullanıcılar yüklenirken bir hata oluştu</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Stats Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: '#8c8c8c', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  TOPLAM KULLANICI
                </Text>
                <Title level={2} style={{ color: '#262626', margin: 0, fontSize: 32, fontWeight: 600 }}>
                  {stats.total}
                </Title>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#f0f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TeamOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: '#8c8c8c', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  AKTİF
                </Text>
                <Title level={2} style={{ color: '#262626', margin: 0, fontSize: 32, fontWeight: 600 }}>
                  {stats.active}
                </Title>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#f6ffed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: '#8c8c8c', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  PASİF
                </Text>
                <Title level={2} style={{ color: '#262626', margin: 0, fontSize: 32, fontWeight: 600 }}>
                  {stats.inactive}
                </Title>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#fff1f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CloseCircleOutlined style={{ fontSize: 24, color: '#ff4d4f' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            hoverable
            style={{
              background: 'white',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease',
            }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: '#8c8c8c', fontSize: 13, display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  YÖNETİCİ
                </Text>
                <Title level={2} style={{ color: '#262626', margin: 0, fontSize: 32, fontWeight: 600 }}>
                  {stats.admins}
                </Title>
              </div>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#fff7e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SafetyOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        style={{
          borderRadius: 8,
          border: '1px solid #f0f0f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Title level={4} style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#262626' }}>
              Kullanıcı Yönetimi
            </Title>
            <Badge
              count={filteredUsers.length}
              style={{ backgroundColor: '#f0f0f0', color: '#595959', boxShadow: 'none' }}
            />
          </div>
        }
        extra={
          <AdminOnly>
            <Button type="primary" icon={<PlusOutlined />} size="large" onClick={handleCreateUser}>
              Yeni Kullanıcı
            </Button>
          </AdminOnly>
        }
      >
        {/* Filters */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={10}>
              <Input
                size="large"
                placeholder="Kullanıcı ara..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="Rol"
                value={filterRole}
                onChange={setFilterRole}
              >
                <Select.Option value="all">Tüm Roller</Select.Option>
                <Select.Option value="FirmaYöneticisi">Admin</Select.Option>
                <Select.Option value="Yönetici">Yönetici</Select.Option>
                <Select.Option value="Kullanıcı">Kullanıcı</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="Durum"
                value={filterStatus}
                onChange={setFilterStatus}
              >
                <Select.Option value="all">Tüm Durumlar</Select.Option>
                <Select.Option value="active">Aktif</Select.Option>
                <Select.Option value="inactive">Pasif</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Segmented
                size="large"
                block
                value={viewMode}
                onChange={(value) => setViewMode(value as 'grid' | 'list')}
                options={[
                  { value: 'grid', icon: <AppstoreOutlined /> },
                  { value: 'list', icon: <BarsOutlined /> },
                ]}
              />
            </Col>
          </Row>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text type="secondary">Kullanıcılar yükleniyor...</Text>
            </div>
          </div>
        )}

        {/* User Cards - Grid View */}
        {!isLoading && viewMode === 'grid' && (
          <Row gutter={[16, 16]}>
            {filteredUsers.map((user) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
                <Card
                  hoverable
                  onClick={() => handleViewDetails(user.id)}
                  style={{
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Avatar
                      size={56}
                      style={{
                        backgroundColor: user.isActive ? '#1890ff' : '#d9d9d9',
                        fontWeight: 600,
                        fontSize: 20,
                      }}
                    >
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                    <AdminOnly>
                      <Dropdown menu={getUserMenu(user)} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                      </Dropdown>
                    </AdminOnly>
                  </div>

                  {/* User Info */}
                  <Title level={5} style={{ marginBottom: 4, fontSize: 16, fontWeight: 600 }}>
                    {user.firstName} {user.lastName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
                    @{user.username}
                  </Text>

                  {/* Role and Status */}
                  <div style={{ marginBottom: 16 }}>
                    {getRoleBadge(user.roles)}
                    <Badge
                      status={user.isActive ? 'success' : 'default'}
                      text={user.isActive ? 'Aktif' : 'Pasif'}
                      style={{ marginLeft: 8 }}
                    />
                  </div>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Contact Info */}
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MailOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                      <Text style={{ fontSize: 13 }} ellipsis>
                        {user.email}
                      </Text>
                    </div>
                    {user.department && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                        <Text style={{ fontSize: 13 }}>{user.department}</Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* User List - List View */}
        {!isLoading && viewMode === 'list' && (
          <List
            dataSource={filteredUsers}
            renderItem={(user) => (
              <List.Item
                onClick={() => handleViewDetails(user.id)}
                style={{ cursor: 'pointer' }}
                actions={[
                  <AdminOnly key="actions">
                    <Dropdown menu={getUserMenu(user)} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                    </Dropdown>
                  </AdminOnly>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      style={{
                        backgroundColor: user.isActive ? '#1890ff' : '#999',
                      }}
                    >
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                  }
                  title={
                    <Space>
                      <span>
                        {user.firstName} {user.lastName}
                      </span>
                      {getRoleBadge(user.roles)}
                      <Badge
                        status={user.isActive ? 'success' : 'error'}
                        text={user.isActive ? 'Aktif' : 'Pasif'}
                      />
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Text type="secondary">@{user.username}</Text>
                      <Space size="large">
                        <span>
                          <MailOutlined /> {user.email}
                        </span>
                        {user.department && (
                          <span>
                            <TeamOutlined /> {user.department}
                          </span>
                        )}
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {/* Empty State */}
        {!isLoading && filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <UserOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} style={{ color: '#595959', marginBottom: 8 }}>
              Kullanıcı Bulunamadı
            </Title>
            <Text type="secondary">Arama kriterlerinizi değiştirmeyi deneyin</Text>
          </div>
        )}
      </Card>

      {/* User Modal */}
      <UserModal
        open={modalOpen}
        user={editingUser}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmitUser}
      />

      {/* User Details Drawer */}
      <UserDetailsDrawer
        user={selectedUserDetails || null}
        open={detailsDrawerOpen}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedUserId(null);
        }}
      />
    </div>
  );
}

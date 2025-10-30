'use client';

/**
 * Modern User Management Page
 * Beautiful and functional user management interface
 */

import { useState } from 'react';
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
  Statistic,
  List,
  Typography,
  Badge,
  message,
  Select,
  Modal,
  Segmented,
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
  CalendarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  AppstoreOutlined,
  BarsOutlined,
} from '@ant-design/icons';
import { AdminOnly } from '@/components/auth/PermissionGate';

const { Text, Title } = Typography;
const { confirm } = Modal;

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phone?: string;
  department?: string;
  lastLogin?: string;
  createdAt: string;
  avatar?: string;
}

// Mock data with more details
const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    role: 'FirmaYöneticisi',
    isActive: true,
    phone: '+90 555 123 4567',
    department: 'Yönetim',
    lastLogin: '2025-01-29T15:30:00Z',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    username: 'manager',
    email: 'mehmet.demir@example.com',
    firstName: 'Mehmet',
    lastName: 'Demir',
    role: 'Yönetici',
    isActive: true,
    phone: '+90 555 234 5678',
    department: 'Satış',
    lastLogin: '2025-01-29T14:20:00Z',
    createdAt: '2024-02-20T14:20:00Z',
  },
  {
    id: '3',
    username: 'ayse.kara',
    email: 'ayse.kara@example.com',
    firstName: 'Ayşe',
    lastName: 'Kara',
    role: 'Kullanıcı',
    isActive: true,
    department: 'Muhasebe',
    lastLogin: '2025-01-28T09:15:00Z',
    createdAt: '2024-03-10T11:00:00Z',
  },
  {
    id: '4',
    username: 'fatma.yildirim',
    email: 'fatma.yildirim@example.com',
    firstName: 'Fatma',
    lastName: 'Yıldırım',
    role: 'Kullanıcı',
    isActive: false,
    phone: '+90 555 345 6789',
    department: 'İnsan Kaynakları',
    lastLogin: '2025-01-20T16:45:00Z',
    createdAt: '2024-04-05T13:20:00Z',
  },
  {
    id: '5',
    username: 'can.ozturk',
    email: 'can.ozturk@example.com',
    firstName: 'Can',
    lastName: 'Öztürk',
    role: 'Kullanıcı',
    isActive: true,
    phone: '+90 555 456 7890',
    department: 'Satış',
    lastLogin: '2025-01-29T10:00:00Z',
    createdAt: '2024-05-12T09:30:00Z',
  },
];

export default function UsersPage() {
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleToggleStatus = (user: User) => {
    confirm({
      title: user.isActive ? 'Kullanıcıyı Devre Dışı Bırak' : 'Kullanıcıyı Aktif Et',
      content: `${user.firstName} ${user.lastName} kullanıcısını ${
        user.isActive ? 'devre dışı bırakmak' : 'aktif etmek'
      } istediğinizden emin misiniz?`,
      onOk: () => {
        message.success(
          `${user.firstName} ${user.lastName} ${user.isActive ? 'devre dışı bırakıldı' : 'aktif edildi'}`
        );
      },
    });
  };

  const handleDeleteUser = (user: User) => {
    confirm({
      title: 'Kullanıcıyı Sil',
      content: `${user.firstName} ${user.lastName} kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
      okText: 'Sil',
      okType: 'danger',
      onOk: () => {
        message.success(`${user.firstName} ${user.lastName} silindi`);
      },
    });
  };

  const getUserMenu = (user: User) => ({
    items: [
      {
        key: 'edit',
        label: 'Düzenle',
        icon: <EditOutlined />,
        onClick: () => message.info('Düzenleme özelliği yakında...'),
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
        disabled: user.role === 'FirmaYöneticisi',
        onClick: () => handleDeleteUser(user),
      },
    ],
  });

  const getRoleBadge = (role: string) => {
    const config = {
      FirmaYöneticisi: { color: 'red', label: 'Admin' },
      Yönetici: { color: 'blue', label: 'Yönetici' },
      Kullanıcı: { color: 'default', label: 'Kullanıcı' },
    };
    const { color, label } = config[role as keyof typeof config] || config.Kullanıcı;
    return <Tag color={color}>{label}</Tag>;
  };

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.username.toLowerCase().includes(searchText.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchText.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: mockUsers.length,
    active: mockUsers.filter((u) => u.isActive).length,
    inactive: mockUsers.filter((u) => !u.isActive).length,
    admins: mockUsers.filter((u) => u.role === 'FirmaYöneticisi').length,
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Toplam Kullanıcı"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Aktif"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pasif"
              value={stats.inactive}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Adminler"
              value={stats.admins}
              prefix={<LockOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Card */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TeamOutlined style={{ fontSize: 20 }} />
            <Title level={4} style={{ margin: 0 }}>
              Kullanıcı Yönetimi
            </Title>
          </div>
        }
        extra={
          <AdminOnly>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Yeni Kullanıcı
            </Button>
          </AdminOnly>
        }
      >
        {/* Filters */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={24} md={10}>
            <Input
              size="large"
              placeholder="Kullanıcı ara (ad, email, departman...)"
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
              placeholder="Rol Filtrele"
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
              placeholder="Durum Filtrele"
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
              style={{ width: '100%' }}
              value={viewMode}
              onChange={(value) => setViewMode(value as 'grid' | 'list')}
              options={[
                { value: 'grid', icon: <AppstoreOutlined /> },
                { value: 'list', icon: <BarsOutlined /> },
              ]}
            />
          </Col>
        </Row>

        {/* Users Display */}
        {viewMode === 'grid' ? (
          <Row gutter={[16, 16]}>
            {filteredUsers.map((user) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 8,
                    border: user.isActive ? '1px solid #d9d9d9' : '1px solid #ff4d4f',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Avatar
                      size={64}
                      style={{
                        backgroundColor: user.isActive ? '#1890ff' : '#999',
                      }}
                    >
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </Avatar>
                    <AdminOnly>
                      <Dropdown menu={getUserMenu(user)} trigger={['click']}>
                        <Button type="text" icon={<MoreOutlined />} />
                      </Dropdown>
                    </AdminOnly>
                  </div>

                  <Title level={5} style={{ marginBottom: 4 }}>
                    {user.firstName} {user.lastName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    @{user.username}
                  </Text>

                  <div style={{ marginTop: 12, marginBottom: 12 }}>
                    {getRoleBadge(user.role)}
                    <Badge
                      status={user.isActive ? 'success' : 'error'}
                      text={user.isActive ? 'Aktif' : 'Pasif'}
                      style={{ marginLeft: 8 }}
                    />
                  </div>

                  <Space direction="vertical" size={4} style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <MailOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                      <Text style={{ fontSize: 12 }} ellipsis>
                        {user.email}
                      </Text>
                    </div>
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PhoneOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                        <Text style={{ fontSize: 12 }}>{user.phone}</Text>
                      </div>
                    )}
                    {user.department && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                        <Text style={{ fontSize: 12 }}>{user.department}</Text>
                      </div>
                    )}
                    {user.lastLogin && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                        <Text style={{ fontSize: 12 }}>
                          Son giriş:{' '}
                          {new Date(user.lastLogin).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      </div>
                    )}
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <List
            dataSource={filteredUsers}
            renderItem={(user) => (
              <List.Item
                actions={[
                  <AdminOnly key="actions">
                    <Dropdown menu={getUserMenu(user)} trigger={['click']}>
                      <Button type="text" icon={<MoreOutlined />} />
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
                      {getRoleBadge(user.role)}
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
                        {user.phone && (
                          <span>
                            <PhoneOutlined /> {user.phone}
                          </span>
                        )}
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

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <UserOutlined style={{ fontSize: 48, color: '#d9d9d9' }} />
            <Title level={4} type="secondary">
              Kullanıcı bulunamadı
            </Title>
            <Text type="secondary">Arama kriterlerinizi değiştirmeyi deneyin</Text>
          </div>
        )}
      </Card>
    </div>
  );
}

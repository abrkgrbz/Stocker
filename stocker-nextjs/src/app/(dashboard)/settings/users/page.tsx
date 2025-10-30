'use client';

/**
 * Ultra-Modern User Management Page
 * Beautiful, visual, and highly interactive user management interface
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
  Progress,
  Tooltip,
  Divider,
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
  RiseOutlined,
  TrophyOutlined,
  FireOutlined,
  ThunderboltOutlined,
  StarOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
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
  activityScore?: number; // 0-100
  tasksCompleted?: number;
  performance?: number; // 0-100
  joinedDays?: number;
}

// Enhanced mock data with activity metrics
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
    activityScore: 95,
    tasksCompleted: 248,
    performance: 98,
    joinedDays: 379,
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
    activityScore: 88,
    tasksCompleted: 167,
    performance: 92,
    joinedDays: 343,
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
    activityScore: 76,
    tasksCompleted: 134,
    performance: 85,
    joinedDays: 325,
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
    activityScore: 45,
    tasksCompleted: 89,
    performance: 68,
    joinedDays: 299,
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
    activityScore: 82,
    tasksCompleted: 145,
    performance: 88,
    joinedDays: 262,
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
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Sophisticated Stats Cards */}
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

      {/* Main Card - Professional */}
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
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Yeni Kullanıcı
            </Button>
          </AdminOnly>
        }
      >
        {/* Professional Filters */}
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

        {/* Professional User Cards */}
        {viewMode === 'grid' ? (
          <Row gutter={[16, 16]}>
            {filteredUsers.map((user) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
                <Card
                  hoverable
                  style={{
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    height: '100%',
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
                        <Button type="text" icon={<MoreOutlined />} />
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
                    {getRoleBadge(user.role)}
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
                    {user.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PhoneOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                        <Text style={{ fontSize: 13 }}>{user.phone}</Text>
                      </div>
                    )}
                    {user.department && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                        <Text style={{ fontSize: 13 }}>{user.department}</Text>
                      </div>
                    )}
                  </Space>

                  {/* Performance Stats */}
                  {(user.activityScore !== undefined || user.performance !== undefined) && (
                    <>
                      <Divider style={{ margin: '16px 0' }} />
                      <Row gutter={8}>
                        {user.activityScore !== undefined && (
                          <Col span={12}>
                            <div style={{ textAlign: 'center' }}>
                              <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Aktivite</Text>
                              <Text style={{ fontSize: 20, fontWeight: 600, color: '#1890ff' }}>
                                {user.activityScore}
                              </Text>
                            </div>
                          </Col>
                        )}
                        {user.performance !== undefined && (
                          <Col span={12}>
                            <div style={{ textAlign: 'center' }}>
                              <Text style={{ fontSize: 11, color: '#8c8c8c', display: 'block' }}>Performans</Text>
                              <Text style={{ fontSize: 20, fontWeight: 600, color: '#52c41a' }}>
                                {user.performance}
                              </Text>
                            </div>
                          </Col>
                        )}
                      </Row>
                    </>
                  )}
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
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <UserOutlined style={{ fontSize: 64, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} style={{ color: '#595959', marginBottom: 8 }}>
              Kullanıcı Bulunamadı
            </Title>
            <Text type="secondary">Arama kriterlerinizi değiştirmeyi deneyin</Text>
          </div>
        )}
      </Card>
    </div>
  );
}

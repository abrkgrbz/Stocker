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
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: 'calc(100vh - 64px)' }}>
      {/* Enhanced Stats Cards with Gradients */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, display: 'block', marginBottom: 8 }}>
                  Toplam Kullanıcı
                </Text>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  {stats.total}
                </Title>
              </div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TeamOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              border: 'none',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(240, 147, 251, 0.4)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, display: 'block', marginBottom: 8 }}>
                  Aktif Kullanıcı
                </Text>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  {stats.active}
                </Title>
              </div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FireOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(79, 172, 254, 0.4)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, display: 'block', marginBottom: 8 }}>
                  Pasif Kullanıcı
                </Text>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  {stats.inactive}
                </Title>
              </div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ClockCircleOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              border: 'none',
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(250, 112, 154, 0.4)',
            }}
            bodyStyle={{ padding: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 14, display: 'block', marginBottom: 8 }}>
                  Adminler
                </Text>
                <Title level={2} style={{ color: 'white', margin: 0 }}>
                  {stats.admins}
                </Title>
              </div>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SafetyOutlined style={{ fontSize: 28, color: 'white' }} />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Main Card - Ultra Modern */}
      <Card
        style={{
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
          overflow: 'hidden',
        }}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TeamOutlined style={{ fontSize: 24, color: 'white' }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0, fontSize: 20 }}>
                Kullanıcı Yönetimi
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {filteredUsers.length} kullanıcı bulundu
              </Text>
            </div>
          </div>
        }
        extra={
          <AdminOnly>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="large"
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                fontWeight: 500,
              }}
            >
              Yeni Kullanıcı
            </Button>
          </AdminOnly>
        }
      >
        {/* Modern Filters with Background */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: 20,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={10}>
              <Input
                size="large"
                placeholder="🔍 Kullanıcı ara (ad, email, departman...)"
                prefix={<SearchOutlined style={{ color: '#667eea', fontSize: 16 }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{
                  borderRadius: 8,
                  border: '2px solid #e8e8e8',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              />
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Select
                size="large"
                style={{
                  width: '100%',
                }}
                placeholder="Rol Filtrele"
                value={filterRole}
                onChange={setFilterRole}
                suffixIcon={<FilterOutlined style={{ color: '#667eea' }} />}
              >
                <Select.Option value="all">✨ Tüm Roller</Select.Option>
                <Select.Option value="FirmaYöneticisi">👑 Admin</Select.Option>
                <Select.Option value="Yönetici">⭐ Yönetici</Select.Option>
                <Select.Option value="Kullanıcı">👤 Kullanıcı</Select.Option>
              </Select>
            </Col>
            <Col xs={12} sm={8} md={5}>
              <Select
                size="large"
                style={{ width: '100%' }}
                placeholder="Durum Filtrele"
                value={filterStatus}
                onChange={setFilterStatus}
                suffixIcon={<FilterOutlined style={{ color: '#667eea' }} />}
              >
                <Select.Option value="all">🌟 Tüm Durumlar</Select.Option>
                <Select.Option value="active">✅ Aktif</Select.Option>
                <Select.Option value="inactive">❌ Pasif</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={4}>
              <Segmented
                size="large"
                block
                value={viewMode}
                onChange={(value) => setViewMode(value as 'grid' | 'list')}
                options={[
                  {
                    value: 'grid',
                    icon: <AppstoreOutlined />,
                    label: 'Kart',
                  },
                  {
                    value: 'list',
                    icon: <BarsOutlined />,
                    label: 'Liste',
                  },
                ]}
                style={{
                  background: 'white',
                  padding: 4,
                  borderRadius: 8,
                }}
              />
            </Col>
          </Row>
        </div>

        {/* Users Display - Enhanced Visual Cards */}
        {viewMode === 'grid' ? (
          <Row gutter={[24, 24]}>
            {filteredUsers.map((user) => {
              const activityColor =
                (user.activityScore ?? 0) >= 80
                  ? '#52c41a'
                  : (user.activityScore ?? 0) >= 60
                    ? '#faad14'
                    : '#ff4d4f';

              const performanceColor =
                (user.performance ?? 0) >= 90
                  ? '#52c41a'
                  : (user.performance ?? 0) >= 70
                    ? '#1890ff'
                    : '#ff4d4f';

              return (
                <Col xs={24} sm={12} lg={8} xl={6} key={user.id}>
                  <Card
                    hoverable
                    style={{
                      borderRadius: 16,
                      border: 'none',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      overflow: 'hidden',
                      transition: 'all 0.3s ease',
                      background: 'white',
                    }}
                    bodyStyle={{ padding: 0 }}
                  >
                    {/* Card Header with Gradient */}
                    <div
                      style={{
                        background: user.isActive
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'linear-gradient(135deg, #636363 0%, #a2ab58 100%)',
                        padding: '20px 20px 60px 20px',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {getRoleBadge(user.role)}
                          {(user.activityScore ?? 0) >= 90 && (
                            <Tooltip title="Yüksek Performans">
                              <Tag color="gold" icon={<TrophyOutlined />}>
                                MVP
                              </Tag>
                            </Tooltip>
                          )}
                        </div>
                        <AdminOnly>
                          <Dropdown menu={getUserMenu(user)} trigger={['click']}>
                            <Button
                              type="text"
                              icon={<MoreOutlined style={{ color: 'white' }} />}
                              style={{ color: 'white' }}
                            />
                          </Dropdown>
                        </AdminOnly>
                      </div>

                      {/* Avatar - positioned to overlap */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: -40,
                          left: 20,
                        }}
                      >
                        <Avatar
                          size={80}
                          style={{
                            backgroundColor: 'white',
                            color: user.isActive ? '#667eea' : '#999',
                            fontSize: 32,
                            fontWeight: 'bold',
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                          }}
                        >
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </Avatar>
                        {user.isActive && (
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 5,
                              right: 5,
                              width: 16,
                              height: 16,
                              background: '#52c41a',
                              border: '3px solid white',
                              borderRadius: '50%',
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '50px 20px 20px 20px' }}>
                      <Title level={5} style={{ marginBottom: 2, fontSize: 18 }}>
                        {user.firstName} {user.lastName}
                      </Title>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
                        @{user.username}
                      </Text>

                      <Divider style={{ margin: '12px 0' }} />

                      {/* Contact Info */}
                      <Space direction="vertical" size={8} style={{ width: '100%', marginBottom: 16 }}>
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

                      {/* Activity Metrics */}
                      {user.activityScore !== undefined && (
                        <div style={{ marginTop: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 12, fontWeight: 500 }}>
                              <ThunderboltOutlined style={{ color: activityColor }} /> Aktivite Skoru
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: 600, color: activityColor }}>
                              {user.activityScore}%
                            </Text>
                          </div>
                          <Progress
                            percent={user.activityScore}
                            strokeColor={activityColor}
                            showInfo={false}
                            size="small"
                          />
                        </div>
                      )}

                      {user.performance !== undefined && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 12, fontWeight: 500 }}>
                              <StarOutlined style={{ color: performanceColor }} /> Performans
                            </Text>
                            <Text style={{ fontSize: 12, fontWeight: 600, color: performanceColor }}>
                              {user.performance}%
                            </Text>
                          </div>
                          <Progress
                            percent={user.performance}
                            strokeColor={performanceColor}
                            showInfo={false}
                            size="small"
                          />
                        </div>
                      )}

                      {/* Stats */}
                      <Row gutter={8} style={{ marginTop: 16 }}>
                        {user.tasksCompleted !== undefined && (
                          <Col span={12}>
                            <div
                              style={{
                                background: '#f0f2f5',
                                padding: '8px 12px',
                                borderRadius: 8,
                                textAlign: 'center',
                              }}
                            >
                              <Text style={{ fontSize: 18, fontWeight: 'bold', display: 'block', color: '#1890ff' }}>
                                {user.tasksCompleted}
                              </Text>
                              <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Görev</Text>
                            </div>
                          </Col>
                        )}
                        {user.joinedDays !== undefined && (
                          <Col span={12}>
                            <div
                              style={{
                                background: '#f0f2f5',
                                padding: '8px 12px',
                                borderRadius: 8,
                                textAlign: 'center',
                              }}
                            >
                              <Text style={{ fontSize: 18, fontWeight: 'bold', display: 'block', color: '#52c41a' }}>
                                {user.joinedDays}
                              </Text>
                              <Text style={{ fontSize: 11, color: '#8c8c8c' }}>Gün</Text>
                            </div>
                          </Col>
                        )}
                      </Row>

                      {user.lastLogin && (
                        <div
                          style={{
                            marginTop: 12,
                            padding: '8px 12px',
                            background: '#f6ffed',
                            borderRadius: 8,
                            border: '1px solid #b7eb8f',
                          }}
                        >
                          <Text style={{ fontSize: 11, color: '#52c41a' }}>
                            <CalendarOutlined /> Son giriş:{' '}
                            {new Date(user.lastLogin).toLocaleDateString('tr-TR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Card>
                </Col>
              );
            })}
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
          <div
            style={{
              textAlign: 'center',
              padding: '80px 20px',
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
              borderRadius: 16,
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                margin: '0 auto 24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
              }}
            >
              <UserOutlined style={{ fontSize: 60, color: 'white' }} />
            </div>
            <Title level={3} style={{ color: '#667eea', marginBottom: 8 }}>
              Kullanıcı Bulunamadı
            </Title>
            <Text style={{ fontSize: 15, color: '#8c8c8c' }}>
              🔍 Arama kriterlerinizi değiştirmeyi deneyin veya yeni kullanıcı ekleyin
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
}

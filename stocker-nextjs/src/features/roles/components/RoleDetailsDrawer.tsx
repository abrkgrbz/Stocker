'use client';

import { Drawer, Descriptions, Tag, Space, Typography, Divider, Empty, Avatar, List, Card } from 'antd';
import {
  CloseOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { parsePermission, getPermissionLabel, type Role, PERMISSION_TYPE_LABELS } from '@/lib/api/roles';

const { Title, Text } = Typography;

interface RoleDetailsDrawerProps {
  role: Role | null;
  open: boolean;
  onClose: () => void;
}

export function RoleDetailsDrawer({ role, open, onClose }: RoleDetailsDrawerProps) {
  if (!role) return null;

  // Debug: Log raw permission data
  console.log('🔍 Raw role.permissions:', role.permissions);

  const permissions = role.permissions.map(parsePermission);

  // Debug: Log parsed permissions
  console.log('📊 Parsed permissions:', permissions);
  console.log('🏷️ PERMISSION_TYPE_LABELS:', PERMISSION_TYPE_LABELS);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {} as Record<string, typeof permissions>);

  const getRoleColor = () => {
    if (role.isSystemRole) return '#722ed1';
    if (role.permissions.length > 50) return '#1890ff';
    if (role.permissions.length > 20) return '#52c41a';
    return '#8c8c8c';
  };

  const getRoleIcon = () => {
    if (role.isSystemRole) return '🔐';
    if (role.permissions.length > 50) return '👑';
    if (role.permissions.length > 20) return '⚡';
    return '👤';
  };

  // Mock users - bu gerçek API'den gelecek
  const mockUsers = role.userCount > 0 ? [
    { id: '1', name: 'Ahmet Yılmaz', email: 'ahmet@example.com', avatar: null },
    { id: '2', name: 'Ayşe Demir', email: 'ayse@example.com', avatar: null },
    { id: '3', name: 'Mehmet Kaya', email: 'mehmet@example.com', avatar: null },
  ].slice(0, role.userCount) : [];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar size={48} style={{ background: getRoleColor(), fontSize: 24 }}>
            {getRoleIcon()}
          </Avatar>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {role.name}
              {role.isSystemRole && (
                <LockOutlined style={{ marginLeft: 8, fontSize: 14, color: '#8c8c8c' }} />
              )}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {role.description || 'Açıklama bulunmuyor'}
            </Text>
          </div>
        </div>
      }
      width={640}
      open={open}
      onClose={onClose}
      closeIcon={<CloseOutlined />}
    >
      {/* Genel Bilgiler */}
      <Card
        size="small"
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            <span>Genel Bilgiler</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Rol Tipi" span={2}>
            {role.isSystemRole ? (
              <Tag color="purple">
                <LockOutlined /> Sistem Rolü
              </Tag>
            ) : (
              <Tag color="blue">Özel Rol</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Kullanıcı Sayısı">
            <Tag icon={<TeamOutlined />} color={role.userCount > 0 ? 'blue' : 'default'}>
              {role.userCount}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Yetki Sayısı">
            <Tag icon={<SafetyOutlined />} color="green">
              {role.permissions.length}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Oluşturma Tarihi" span={2}>
            {new Date(role.createdDate).toLocaleString('tr-TR')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Kullanıcılar */}
      <Card
        size="small"
        title={
          <Space>
            <TeamOutlined style={{ color: '#1890ff' }} />
            <span>Bu Role Atanan Kullanıcılar ({role.userCount})</span>
          </Space>
        }
        style={{ marginBottom: 16 }}
      >
        {mockUsers.length > 0 ? (
          <List
            dataSource={mockUsers}
            renderItem={(user) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }}>
                      {user.name.charAt(0)}
                    </Avatar>
                  }
                  title={user.name}
                  description={user.email}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Bu role henüz kullanıcı atanmamış"
          />
        )}
      </Card>

      {/* Yetkiler */}
      <Card
        size="small"
        title={
          <Space>
            <SafetyOutlined style={{ color: '#52c41a' }} />
            <span>Yetkiler ({role.permissions.length})</span>
          </Space>
        }
      >
        {Object.keys(groupedPermissions).length > 0 ? (
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            {Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                  {resource}
                </Text>
                <Space wrap>
                  {perms.map((perm, index) => {
                    const label = PERMISSION_TYPE_LABELS[perm.permissionType];
                    console.log(`🔖 Permission ${resource}:${perm.permissionType} → Label: "${label}"`);
                    return (
                      <Tag key={index} color="blue">
                        {label}
                      </Tag>
                    );
                  })}
                </Space>
                <Divider style={{ margin: '12px 0' }} />
              </div>
            ))}
          </Space>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Bu rolde henüz yetki bulunmuyor"
          />
        )}
      </Card>
    </Drawer>
  );
}

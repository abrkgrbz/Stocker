'use client';

/**
 * Role Management Page - Modern Card Layout
 * Professional role management with card-based design
 */

import { useState } from 'react';
import {
  Button,
  Card,
  Tag,
  Space,
  Modal,
  Tooltip,
  Empty,
  Spin,
  Row,
  Col,
  Typography,
  Dropdown,
  Avatar,
  Badge,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  SafetyOutlined,
  MoreOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useRoles, useDeleteRole } from '@/hooks/useRoles';
import { RoleModal } from '@/features/roles/components/RoleModal';
import { RoleDetailsDrawer } from '@/features/roles/components/RoleDetailsDrawer';
import {
  parsePermission,
  getPermissionLabel,
  type Role,
} from '@/lib/api/roles';

const { confirm } = Modal;
const { Title, Text, Paragraph } = Typography;

export default function RolesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data: roles, isLoading } = useRoles();
  const deleteRoleMutation = useDeleteRole();

  const handleViewDetails = (role: Role) => {
    setSelectedRole(role);
    setDetailsDrawerOpen(true);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setModalOpen(true);
  };

  const handleDelete = (role: Role) => {
    confirm({
      title: 'Rolü Sil',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            <strong>{role.name}</strong> rolünü silmek istediğinizden emin misiniz?
          </p>
          {role.userCount > 0 && (
            <p style={{ color: '#ff4d4f' }}>
              ⚠️ Bu role <strong>{role.userCount} kullanıcı</strong> atanmış.
              Rolü silebilmek için önce kullanıcıları başka bir role atamanız gerekiyor.
            </p>
          )}
        </div>
      ),
      okText: 'Sil',
      okType: 'danger',
      cancelText: 'İptal',
      onOk: async () => {
        await deleteRoleMutation.mutateAsync(role.id);
      },
    });
  };

  const getRoleColor = (role: Role) => {
    if (role.isSystemRole) return '#722ed1'; // Purple for system roles
    if (role.permissions.length > 50) return '#1890ff'; // Blue for admin-like
    if (role.permissions.length > 20) return '#52c41a'; // Green for managers
    return '#8c8c8c'; // Gray for basic roles
  };

  const getRoleIcon = (role: Role) => {
    if (role.isSystemRole) return '🔐';
    if (role.permissions.length > 50) return '👑';
    if (role.permissions.length > 20) return '⚡';
    return '👤';
  };

  const getMenuItems = (role: Role) => [
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

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: 8 }}>
            <SafetyOutlined style={{ marginRight: 12, color: '#1890ff' }} />
            Rol Yönetimi
          </Title>
          <Text type="secondary">
            Sistemdeki rolleri yönetin ve yetkileri düzenleyin
          </Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleCreate}>
          Yeni Rol Oluştur
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                <SafetyOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  TOPLAM ROL
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.length || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  AKTİF KULLANICI
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.reduce((sum, r) => sum + r.userCount, 0) || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                <LockOutlined style={{ fontSize: 24, color: '#fa8c16' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  SİSTEM ROLÜ
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.filter((r) => r.isSystemRole).length || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            style={{
              background: 'white',
              borderRadius: 8,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  background: '#fff0f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 24, color: '#eb2f96' }} />
              </div>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  ÖZEL ROL
                </Text>
                <Title level={3} style={{ margin: 0 }}>
                  {roles?.filter((r) => !r.isSystemRole).length || 0}
                </Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Roles Grid */}
      <Spin spinning={isLoading}>
        {roles && roles.length > 0 ? (
          <Row gutter={[16, 16]}>
            {roles.map((role) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={role.id}>
                <Card
                  hoverable
                  bordered={false}
                  onClick={() => handleViewDetails(role)}
                  style={{
                    borderRadius: 12,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    height: '100%',
                    cursor: 'pointer',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <Avatar
                      size={48}
                      style={{
                        background: getRoleColor(role),
                        fontSize: 24,
                      }}
                    >
                      {getRoleIcon(role)}
                    </Avatar>
                    <Dropdown menu={{ items: getMenuItems(role) }} trigger={['click']}>
                      <Button
                        type="text"
                        icon={<MoreOutlined />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Dropdown>
                  </div>

                  {/* Role Name */}
                  <div style={{ marginBottom: 8 }}>
                    <Space>
                      <Title level={4} style={{ margin: 0, fontSize: 18 }}>
                        {role.name}
                      </Title>
                      {role.isSystemRole && (
                        <Tooltip title="Sistem rolü - değiştirilemez">
                          <LockOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                        </Tooltip>
                      )}
                    </Space>
                  </div>

                  {/* Description */}
                  <Paragraph
                    ellipsis={{ rows: 2 }}
                    style={{ color: '#8c8c8c', marginBottom: 16, minHeight: 44 }}
                  >
                    {role.description || 'Açıklama bulunmuyor'}
                  </Paragraph>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Stats */}
                  <Row gutter={16}>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: '#f0f5ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                          }}
                        >
                          <TeamOutlined style={{ fontSize: 20, color: '#1890ff' }} />
                        </div>
                        <Text strong style={{ fontSize: 18, display: 'block' }}>
                          {role.userCount}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Kullanıcı
                        </Text>
                      </div>
                    </Col>
                    <Col span={12}>
                      <div style={{ textAlign: 'center' }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 8,
                            background: '#f6ffed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 8px',
                          }}
                        >
                          <SafetyOutlined style={{ fontSize: 20, color: '#52c41a' }} />
                        </div>
                        <Text strong style={{ fontSize: 18, display: 'block' }}>
                          {role.permissions.length}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Yetki
                        </Text>
                      </div>
                    </Col>
                  </Row>

                  <Divider style={{ margin: '16px 0' }} />

                  {/* Date and Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(role.createdDate).toLocaleDateString('tr-TR')}
                    </Text>
                    <Space size="small">
                      <Tooltip title="Düzenle">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(role);
                          }}
                          disabled={role.isSystemRole}
                        />
                      </Tooltip>
                      <Tooltip title="Sil">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(role);
                          }}
                          disabled={role.isSystemRole}
                        />
                      </Tooltip>
                    </Space>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Card>
            <Empty description="Henüz rol oluşturulmamış" />
          </Card>
        )}
      </Spin>

      <RoleModal
        open={modalOpen}
        role={editingRole}
        onClose={() => {
          setModalOpen(false);
          setEditingRole(null);
        }}
      />

      <RoleDetailsDrawer
        role={selectedRole}
        open={detailsDrawerOpen}
        onClose={() => {
          setDetailsDrawerOpen(false);
          setSelectedRole(null);
        }}
      />
    </div>
  );
}

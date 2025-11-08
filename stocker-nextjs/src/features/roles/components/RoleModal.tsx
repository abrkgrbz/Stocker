'use client';

/**
 * Role Creation/Editing Drawer
 * Modern side panel for creating/editing roles with permissions
 */

import { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  Button,
  Space,
  Tag,
  Card,
  Checkbox,
  Row,
  Col,
  Divider,
  Alert,
  Typography,
  Badge,
  Collapse,
  Select,
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DownOutlined,
  RightOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { useCreateRole, useUpdateRole, useRoles } from '@/hooks/useRoles';
import {
  AVAILABLE_RESOURCES,
  PERMISSION_TYPE_LABELS,
  PermissionType,
  parsePermission,
  formatPermission,
  type Role,
  type Permission,
} from '@/lib/api/roles';

const { Title, Text } = Typography;
const { Panel } = Collapse;

// Resource icon mapping for better visual hierarchy
const getResourceIcon = (resourceValue: string): string => {
  if (resourceValue.startsWith('CRM.')) return '💼';

  const iconMap: Record<string, string> = {
    'Users': '👥',
    'Roles': '🔐',
    'Tenants': '🏢',
    'Modules': '🧩',
    'Settings': '⚙️',
    'Reports': '📊',
    'Integrations': '🔌',
    'Billing': '💳',
    'Security': '🛡️',
    'Audit': '📋',
  };

  return iconMap[resourceValue] || '📦';
};

interface RoleModalProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
}

export function RoleModal({ open, role, onClose }: RoleModalProps) {
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);
  const [copyFromRoleId, setCopyFromRoleId] = useState<string | undefined>(undefined);

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();
  const { data: allRoles } = useRoles();

  const isEditing = !!role;

  useEffect(() => {
    if (open && role) {
      // Load existing role data
      form.setFieldsValue({
        name: role.name,
        description: role.description,
      });
      setSelectedPermissions(role.permissions.map(parsePermission));
    } else {
      // Reset form for new role
      form.resetFields();
      setSelectedPermissions([]);
      setCopyFromRoleId(undefined);
    }
  }, [open, role, form]);

  // Handle copying permissions from another role
  const handleCopyFromRole = (roleId: string | undefined) => {
    setCopyFromRoleId(roleId);
    if (roleId) {
      const selectedRole = allRoles?.find((r) => r.id === roleId);
      if (selectedRole) {
        setSelectedPermissions(selectedRole.permissions.map(parsePermission));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const data = {
        name: values.name,
        description: values.description,
        permissions: selectedPermissions,
      };

      if (isEditing && role) {
        await updateMutation.mutateAsync({ roleId: role.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }

      onClose();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleAddPermission = (resource: string, permissionType: PermissionType) => {
    const newPermission: Permission = { resource, permissionType };
    const permissionStr = formatPermission(newPermission);

    // Check if already exists
    const exists = selectedPermissions.some(
      (p) => formatPermission(p) === permissionStr
    );

    if (!exists) {
      setSelectedPermissions([...selectedPermissions, newPermission]);
    }
  };

  const handleRemovePermission = (permission: Permission) => {
    setSelectedPermissions(
      selectedPermissions.filter(
        (p) => formatPermission(p) !== formatPermission(permission)
      )
    );
  };

  const handleToggleAllPermissionsForResource = (
    resource: string,
    checked: boolean
  ) => {
    if (checked) {
      // Add all permission types for this resource
      const newPermissions = Object.values(PermissionType)
        .filter((v) => typeof v === 'number')
        .map((type) => ({
          resource,
          permissionType: type as PermissionType,
        }));

      // Filter out existing ones and add new
      const existingPermStrs = selectedPermissions.map(formatPermission);
      const toAdd = newPermissions.filter(
        (p) => !existingPermStrs.includes(formatPermission(p))
      );

      setSelectedPermissions([...selectedPermissions, ...toAdd]);
    } else {
      // Remove all permissions for this resource
      setSelectedPermissions(
        selectedPermissions.filter((p) => p.resource !== resource)
      );
    }
  };

  const getResourcePermissions = (resource: string) => {
    return selectedPermissions.filter((p) => p.resource === resource);
  };

  const hasAllPermissionsForResource = (resource: string) => {
    const resourcePerms = getResourcePermissions(resource);
    const allTypes = Object.values(PermissionType).filter(
      (v) => typeof v === 'number'
    );
    return resourcePerms.length === allTypes.length;
  };

  const groupedPermissions = AVAILABLE_RESOURCES.map((res) => ({
    ...res,
    permissions: getResourcePermissions(res.value),
    hasAll: hasAllPermissionsForResource(res.value),
  }));

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#f0f5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LockOutlined style={{ fontSize: 20, color: '#1890ff' }} />
          </div>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              {isEditing ? 'Rol Düzenle' : 'Yeni Rol Oluştur'}
            </Title>
            <Text type="secondary" style={{ fontSize: 13 }}>
              {isEditing ? 'Rol bilgilerini ve yetkilerini güncelleyin' : 'Yeni bir rol oluşturun ve yetkilerini belirleyin'}
            </Text>
          </div>
        </div>
      }
      open={open}
      onClose={onClose}
      width={720}
      footer={
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '16px 24px',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <Button size="large" icon={<CloseOutlined />} onClick={onClose}>
            İptal
          </Button>
          <Button
            size="large"
            type="primary"
            icon={<SaveOutlined />}
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            {isEditing ? 'Güncelle' : 'Kaydet'}
          </Button>
        </div>
      }
      styles={{
        body: { paddingBottom: 80 },
      }}
    >
      <Form form={form} layout="vertical">
        {/* Basic Info Section - Prominent Display */}
        <Card
          size="small"
          title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff', fontSize: 18 }} />
              <Text strong style={{ fontSize: 16 }}>Temel Bilgiler</Text>
            </Space>
          }
          style={{ marginBottom: 16, borderColor: '#1890ff' }}
        >
          <Form.Item
            label={<Text strong style={{ fontSize: 15 }}>Rol Adı</Text>}
            name="name"
            rules={[
              { required: true, message: 'Rol adı gereklidir' },
              { min: 2, message: 'Rol adı en az 2 karakter olmalıdır' },
            ]}
          >
            <Input size="large" placeholder="Örn: Satış Müdürü, Muhasebeci" />
          </Form.Item>

          <Form.Item label={<Text strong style={{ fontSize: 15 }}>Açıklama</Text>} name="description">
            <Input.TextArea
              rows={3}
              placeholder="Rolün görev ve sorumluluklarını açıklayın"
            />
          </Form.Item>
        </Card>

        {/* Permissions Section */}
        <Card
          size="small"
          title={
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <span>Yetkiler</span>
              <Badge count={selectedPermissions.length} style={{ backgroundColor: '#52c41a' }} />
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          {/* Copy from existing role option */}
          {!isEditing && allRoles && allRoles.length > 0 && (
            <Alert
              message="Bu rolü mevcut bir rolün yetkileriyle başlatmak ister misiniz?"
              description={
                <div style={{ marginTop: 8 }}>
                  <Select
                    placeholder="Mevcut bir rol seçin (isteğe bağlı)"
                    allowClear
                    style={{ width: '100%' }}
                    value={copyFromRoleId}
                    onChange={handleCopyFromRole}
                    options={allRoles
                      .filter((r) => !r.isSystemRole)
                      .map((r) => ({
                        label: `${r.name} (${r.permissions.length} yetki)`,
                        value: r.id,
                      }))}
                  />
                </div>
              }
              type="warning"
              showIcon
              icon={<WarningOutlined />}
              style={{ marginBottom: 16, backgroundColor: '#fff7e6', borderColor: '#ffc53d' }}
            />
          )}

          <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
            Her kaynak için izin vermek istediğiniz işlemleri seçin. Tümünü seç ile bir kaynağın tüm yetkilerini hızlıca atayabilirsiniz.
          </Text>

          <Collapse
            defaultActiveKey={[]}
            accordion
            ghost
            expandIcon={({ isActive }) => (
              isActive ? <DownOutlined /> : <RightOutlined />
            )}
          >
            {groupedPermissions.map((resource) => (
              <Panel
                key={resource.value}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space>
                      <span style={{ fontSize: 20, marginRight: 8 }}>
                        {getResourceIcon(resource.value)}
                      </span>
                      <Checkbox
                        checked={resource.hasAll}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleAllPermissionsForResource(resource.value, e.target.checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <strong>{resource.label}</strong>
                      </Checkbox>
                    </Space>
                    <Badge count={resource.permissions.length} style={{ backgroundColor: '#1890ff' }} />
                  </div>
                }
                style={{ marginBottom: 8 }}
              >
                <div style={{ padding: '0 24px' }}>
                  <Row gutter={[12, 12]}>
                    {Object.entries(PERMISSION_TYPE_LABELS).map(([type, label]) => {
                      const permType = parseInt(type) as PermissionType;
                      const isSelected = resource.permissions.some((p) => p.permissionType === permType);

                      return (
                        <Col span={12} key={type}>
                          <Checkbox
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleAddPermission(resource.value, permType);
                              } else {
                                handleRemovePermission({
                                  resource: resource.value,
                                  permissionType: permType,
                                });
                              }
                            }}
                            style={{ width: '100%' }}
                          >
                            <span style={{ fontSize: 14 }}>{label}</span>
                          </Checkbox>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              </Panel>
            ))}
          </Collapse>
        </Card>

        {/* Selected Permissions Summary */}
        {selectedPermissions.length > 0 ? (
          <Card
            size="small"
            title={
              <Space>
                <Tag color="blue">{selectedPermissions.length}</Tag>
                <span>Seçilen Yetkiler</span>
              </Space>
            }
          >
            <Space wrap size="small">
              {selectedPermissions.map((perm, index) => {
                const resource = AVAILABLE_RESOURCES.find((r) => r.value === perm.resource);
                return (
                  <Tag
                    key={index}
                    closable
                    onClose={() => handleRemovePermission(perm)}
                    color="blue"
                  >
                    {resource?.label} - {PERMISSION_TYPE_LABELS[perm.permissionType]}
                  </Tag>
                );
              })}
            </Space>
          </Card>
        ) : (
          <Alert
            message="Henüz yetki seçilmedi"
            description="Bu rol için en az bir yetki seçmelisiniz. Yukarıdaki kaynaklardan yetkileri seçerek başlayın."
            type="warning"
            showIcon
          />
        )}
      </Form>
    </Drawer>
  );
}

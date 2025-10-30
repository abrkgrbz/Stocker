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
} from 'antd';
import {
  SaveOutlined,
  CloseOutlined,
  LockOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useCreateRole, useUpdateRole } from '@/hooks/useRoles';
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

interface RoleModalProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
}

export function RoleModal({ open, role, onClose }: RoleModalProps) {
  const [form] = Form.useForm();
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>([]);

  const createMutation = useCreateRole();
  const updateMutation = useUpdateRole();

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
    }
  }, [open, role, form]);

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
      extra={
        <Space>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            İptal
          </Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={createMutation.isPending || updateMutation.isPending}
            onClick={handleSubmit}
          >
            {isEditing ? 'Güncelle' : 'Kaydet'}
          </Button>
        </Space>
      }
      styles={{
        body: { paddingBottom: 80 },
      }}
    >
      <Form form={form} layout="vertical">
        {/* Basic Info Section */}
        <Card
          size="small"
          title={
            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <span>Temel Bilgiler</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            label="Rol Adı"
            name="name"
            rules={[
              { required: true, message: 'Rol adı gereklidir' },
              { min: 2, message: 'Rol adı en az 2 karakter olmalıdır' },
            ]}
          >
            <Input size="large" placeholder="Örn: Satış Müdürü, Muhasebeci" />
          </Form.Item>

          <Form.Item label="Açıklama" name="description">
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
          <Alert
            message="Kaynak bazlı yetkilendirme"
            description="Her kaynak için izin vermek istediğiniz işlemleri seçin. Tümünü seç butonuyla bir kaynağın tüm yetkilerini hızlıca atayabilirsiniz."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Collapse defaultActiveKey={[]} accordion ghost>
            {groupedPermissions.map((resource) => (
              <Panel
                key={resource.value}
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <Space>
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

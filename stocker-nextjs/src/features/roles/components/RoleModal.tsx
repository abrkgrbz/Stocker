'use client';

/**
 * Role Creation/Editing Modal
 * Allows admins to create/edit roles and assign permissions
 */

import { useEffect, useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Card,
  Checkbox,
  Row,
  Col,
  Divider,
  Alert,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
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
    <Modal
      title={isEditing ? 'Rol Düzenle' : 'Yeni Rol Oluştur'}
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="cancel" onClick={onClose}>
          İptal
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={createMutation.isPending || updateMutation.isPending}
          onClick={handleSubmit}
        >
          {isEditing ? 'Güncelle' : 'Oluştur'}
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="Rol Adı"
          name="name"
          rules={[
            { required: true, message: 'Rol adı gereklidir' },
            { min: 2, message: 'Rol adı en az 2 karakter olmalıdır' },
          ]}
        >
          <Input placeholder="Örn: Satış Müdürü, Muhasebeci" />
        </Form.Item>

        <Form.Item label="Açıklama" name="description">
          <Input.TextArea
            rows={3}
            placeholder="Rolün görev ve sorumluluklarını açıklayın"
          />
        </Form.Item>

        <Divider>Yetkiler</Divider>

        <Alert
          message="Her kaynak için izin vermek istediğiniz işlemleri seçin"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {groupedPermissions.map((resource) => (
            <Card
              key={resource.value}
              size="small"
              title={
                <Checkbox
                  checked={resource.hasAll}
                  onChange={(e) =>
                    handleToggleAllPermissionsForResource(
                      resource.value,
                      e.target.checked
                    )
                  }
                >
                  <strong>{resource.label}</strong>
                </Checkbox>
              }
              style={{ marginBottom: 12 }}
            >
              <Row gutter={[8, 8]}>
                {Object.entries(PERMISSION_TYPE_LABELS).map(([type, label]) => {
                  const permType = parseInt(type) as PermissionType;
                  const isSelected = resource.permissions.some(
                    (p) => p.permissionType === permType
                  );

                  return (
                    <Col span={6} key={type}>
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
                      >
                        {label}
                      </Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Card>
          ))}
        </div>

        {selectedPermissions.length > 0 && (
          <>
            <Divider>Seçilen Yetkiler ({selectedPermissions.length})</Divider>
            <Space wrap>
              {selectedPermissions.map((perm, index) => {
                const resource = AVAILABLE_RESOURCES.find(
                  (r) => r.value === perm.resource
                );
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
          </>
        )}

        {selectedPermissions.length === 0 && (
          <Alert
            message="Henüz yetki seçilmedi"
            description="Bu rol için en az bir yetki seçmelisiniz"
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
}

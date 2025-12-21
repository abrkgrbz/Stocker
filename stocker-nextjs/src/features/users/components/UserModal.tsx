'use client';

/**
 * User Create/Edit Drawer Component
 * Professional drawer for user management
 */

import { useEffect, useState } from 'react';
import { Drawer, Form, Input, Select, Switch, Row, Col, message, Button, Space, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, SendOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getRoles, type Role } from '@/lib/api/roles';
import { getDepartments, type Department } from '@/lib/api/departments';

const { Option } = Select;

interface User {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleIds: string[]; // Changed to array for multiple roles
  isActive: boolean;
  phoneNumber?: string;
  department?: string;
}

interface UserModalProps {
  open: boolean;
  user?: User | null;
  onClose: () => void;
  onSubmit?: (values: any) => Promise<void>;
}

export function UserModal({ open, user, onClose, onSubmit }: UserModalProps) {
  const [form] = Form.useForm();
  const isEditMode = !!user;

  // Fetch available roles from backend
  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ['roles'],
    queryFn: getRoles,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Fetch available departments from backend
  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: getDepartments,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  useEffect(() => {
    if (open) {
      if (user) {
        // Edit mode - populate form with roleIds array
        form.setFieldsValue({
          ...user,
          roleIds: Array.isArray(user.roleIds) ? user.roleIds : [],
        });
      } else {
        // Create mode - reset form
        form.resetFields();
        form.setFieldsValue({ isActive: true, roleIds: [] });
      }
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      // Auto-generate username from email (before @ symbol)
      // Modern SaaS best practice: use email for login, no separate username field
      const username = values.email.split('@')[0];

      const submissionData = {
        ...values,
        username, // Add auto-generated username for backend compatibility
      };

      if (onSubmit) {
        await onSubmit(submissionData);
      } else {
        // Mock success for now
        message.success(
          isEditMode
            ? `${values.firstName} ${values.lastName} başarıyla güncellendi`
            : `${values.firstName} ${values.lastName} başarıyla oluşturuldu`
        );
      }

      onClose();
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  return (
    <Drawer
      title={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          fontSize: 18,
          fontWeight: 600,
        }}>
          <div style={{
            background: '#f1f5f9',
            borderRadius: 10,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UserOutlined style={{ fontSize: 20, color: '#0f172a' }} />
          </div>
          <span>{isEditMode ? 'Kullanıcı Düzenle' : 'Kullanıcı Davet Et'}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={650}
      destroyOnClose
      styles={{
        header: {
          borderBottom: '1px solid #f0f0f0',
          paddingBottom: 16,
          marginBottom: 24,
        },
        body: {
          paddingTop: 24,
          paddingBottom: 80, // Extra space for sticky footer
        },
      }}
      footer={
        <div style={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          padding: '16px 24px',
          background: '#fff',
          borderTop: '1px solid #f0f0f0',
          zIndex: 10,
        }}>
          <Button
            size="large"
            onClick={onClose}
            style={{ minWidth: 100 }}
          >
            İptal
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleSubmit}
            style={{
              minWidth: 120,
              background: '#0f172a',
              border: 'none',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.25)',
            }}
            className="hover:!bg-slate-800"
          >
            {isEditMode ? 'Güncelle' : 'Davet Gönder'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        {/* Personal Info Section - Natural Flow: Name → Contact */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label={<span style={{ fontWeight: 500 }}>Ad</span>}
                rules={[{ required: true, message: 'Ad gerekli' }]}
              >
                <Input size="large" placeholder="Ahmet" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label={<span style={{ fontWeight: 500 }}>Soyad</span>}
                rules={[{ required: true, message: 'Soyad gerekli' }]}
              >
                <Input size="large" placeholder="Yılmaz" style={{ borderRadius: 8 }} />
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Contact Section */}
        <div style={{ marginBottom: 24 }}>
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 500 }}>E-posta</span>}
            rules={[
              { required: true, message: 'E-posta gerekli' },
              { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined style={{ color: '#64748b' }} />}
              placeholder="ahmet.yilmaz@example.com"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>Telefon</span>
                <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
                  (Opsiyonel)
                </span>
              </div>
            }
          >
            <Input
              size="large"
              prefix={<PhoneOutlined style={{ color: '#64748b' }} />}
              placeholder="+90 555 123 4567"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </div>

        {/* Invitation Notice for New Users */}
        {!isEditMode && (
          <div
            style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: 12,
              padding: '16px 20px',
              marginBottom: 24,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <SendOutlined style={{ color: '#0284c7', fontSize: 18, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 500, color: '#0c4a6e', marginBottom: 4 }}>
                Davet E-postası Gönderilecek
              </div>
              <div style={{ fontSize: 13, color: '#0369a1' }}>
                Kullanıcı oluşturulduktan sonra, belirtilen e-posta adresine bir davet e-postası gönderilecektir.
                Kullanıcı bu e-postadaki bağlantıya tıklayarak kendi şifresini belirleyebilecek ve hesabını aktifleştirebilecektir.
              </div>
            </div>
          </div>
        )}

        {/* Role & Department Section */}
        <div style={{ marginBottom: 24 }}>
          <Form.Item
            name="roleIds"
            label={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontWeight: 500 }}>Roller</span>
                <span style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 400 }}>
                  (Birden fazla seçilebilir)
                </span>
              </div>
            }
            rules={[{ required: true, message: 'En az bir rol seçmelisiniz' }]}
          >
            <Select
              mode="multiple"
              size="large"
              placeholder={rolesLoading ? 'Roller yükleniyor...' : 'Rol seçin'}
              loading={rolesLoading}
              disabled={rolesLoading}
              style={{ borderRadius: 8 }}
              maxTagCount="responsive"
              notFoundContent={rolesLoading ? <Spin size="small" /> : 'Rol bulunamadı'}
            >
              {roles?.map((role) => (
                <Option key={role.id} value={role.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: role.isSystemRole ? '#0f172a' : '#64748b', fontSize: 16 }}>
                      {role.isSystemRole ? '★' : '●'}
                    </span>
                    <div>
                      <div>{role.name}</div>
                      {role.description && (
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{role.description}</div>
                      )}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label={<span style={{ fontWeight: 500 }}>Departman</span>}
          >
            <Select
              size="large"
              placeholder={departmentsLoading ? 'Departmanlar yükleniyor...' : 'Departman seçin'}
              loading={departmentsLoading}
              disabled={departmentsLoading}
              allowClear
              style={{ borderRadius: 8 }}
              notFoundContent={departmentsLoading ? <Spin size="small" /> : 'Departman bulunamadı'}
            >
              {departments?.map((department) => (
                <Option key={department.id} value={department.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TeamOutlined style={{ color: '#64748b' }} />
                    <div>
                      <div>{department.name}</div>
                      {department.code && (
                        <div style={{ fontSize: 12, color: '#8c8c8c' }}>{department.code}</div>
                      )}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        {/* Status Section */}
        <div
          style={{
            background: '#f8f9fa',
            borderRadius: 12,
            padding: '20px 24px',
            marginTop: 24,
          }}
        >
          <Form.Item
            name="isActive"
            label={<span style={{ fontWeight: 500, fontSize: 15 }}>Hesap Durumu</span>}
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch
              checkedChildren="Aktif"
              unCheckedChildren="Pasif"
              defaultChecked
              className="user-modal-switch"
            />
          </Form.Item>
          <div style={{ marginTop: 8, fontSize: 13, color: '#8c8c8c' }}>
            Pasif kullanıcılar sisteme giriş yapamaz
          </div>
        </div>
      </Form>
    </Drawer>
  );
}

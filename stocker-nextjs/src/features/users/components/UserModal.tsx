'use client';

/**
 * User Create/Edit Drawer Component
 * Professional drawer for user management
 */

import { useEffect, useState } from 'react';
import { Drawer, Form, Input, Select, Switch, Row, Col, message, Button, Space, Spin } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, LockOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getRoles, type Role } from '@/lib/api/roles';

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
  password?: string;
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

      if (onSubmit) {
        await onSubmit(values);
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
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 10,
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <UserOutlined style={{ fontSize: 20, color: 'white' }} />
          </div>
          <span>{isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}</span>
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
        },
      }}
      footer={
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 12,
          padding: '16px 0',
          borderTop: '1px solid #f0f0f0',
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
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            }}
          >
            {isEditMode ? 'Güncelle' : 'Oluştur'}
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark="optional"
      >
        {/* Name Section */}
        <div style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="username"
                label={<span style={{ fontWeight: 500 }}>Kullanıcı Adı</span>}
                rules={[
                  { required: true, message: 'Kullanıcı adı gerekli' },
                  { min: 3, message: 'En az 3 karakter olmalı' },
                ]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined style={{ color: '#667eea' }} />}
                  placeholder="ahmet.yilmaz"
                  disabled={isEditMode}
                  style={{ borderRadius: 8 }}
                />
              </Form.Item>
            </Col>
          </Row>

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
              prefix={<MailOutlined style={{ color: '#667eea' }} />}
              placeholder="ahmet.yilmaz@example.com"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label={<span style={{ fontWeight: 500 }}>Telefon</span>}
          >
            <Input
              size="large"
              prefix={<PhoneOutlined style={{ color: '#667eea' }} />}
              placeholder="+90 555 123 4567"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </div>

        {/* Security Section */}
        {!isEditMode && (
          <div style={{ marginBottom: 24 }}>
            <Form.Item
              name="password"
              label={<span style={{ fontWeight: 500 }}>Şifre</span>}
              rules={[
                { required: true, message: 'Şifre gerekli' },
                { min: 6, message: 'En az 6 karakter olmalı' },
              ]}
            >
              <Input.Password
                size="large"
                prefix={<LockOutlined style={{ color: '#667eea' }} />}
                placeholder="••••••••"
                style={{ borderRadius: 8 }}
              />
            </Form.Item>
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
                    <span style={{ color: role.isSystemRole ? '#667eea' : '#52c41a', fontSize: 16 }}>
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
            <Input
              size="large"
              prefix={<TeamOutlined style={{ color: '#667eea' }} />}
              placeholder="Satış"
              style={{ borderRadius: 8 }}
            />
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
              style={{
                background: '#52c41a',
              }}
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

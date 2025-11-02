'use client';

/**
 * User Create/Edit Drawer Component
 * Professional drawer for user management
 */

import { useEffect } from 'react';
import { Drawer, Form, Input, Select, Switch, Row, Col, message, Button, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, TeamOutlined, LockOutlined } from '@ant-design/icons';

const { Option } = Select;

interface User {
  id?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phone?: string;
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

  useEffect(() => {
    if (open) {
      if (user) {
        // Edit mode - populate form
        form.setFieldsValue(user);
      } else {
        // Create mode - reset form
        form.resetFields();
        form.setFieldsValue({ isActive: true, role: 'Kullanıcı' });
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
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label={<span style={{ fontWeight: 500 }}>Rol</span>}
                rules={[{ required: true, message: 'Rol gerekli' }]}
              >
                <Select size="large" placeholder="Rol seçin" style={{ borderRadius: 8 }}>
                  <Option value="FirmaYöneticisi">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#667eea', fontSize: 16 }}>★</span>
                      Admin
                    </div>
                  </Option>
                  <Option value="Yönetici">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#667eea', fontSize: 16 }}>◆</span>
                      Yönetici
                    </div>
                  </Option>
                  <Option value="Kullanıcı">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: '#667eea', fontSize: 16 }}>●</span>
                      Kullanıcı
                    </div>
                  </Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
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
            </Col>
          </Row>
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

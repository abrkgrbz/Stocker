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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UserOutlined />
          <span>{isEditMode ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Oluştur'}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={600}
      destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={onClose}>İptal</Button>
            <Button type="primary" onClick={handleSubmit}>
              {isEditMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="firstName"
              label="Ad"
              rules={[{ required: true, message: 'Ad gerekli' }]}
            >
              <Input size="large" placeholder="Ahmet" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="lastName"
              label="Soyad"
              rules={[{ required: true, message: 'Soyad gerekli' }]}
            >
              <Input size="large" placeholder="Yılmaz" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="username"
          label="Kullanıcı Adı"
          rules={[
            { required: true, message: 'Kullanıcı adı gerekli' },
            { min: 3, message: 'En az 3 karakter olmalı' },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined style={{ color: '#8c8c8c' }} />}
            placeholder="ahmet.yilmaz"
            disabled={isEditMode}
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="E-posta"
          rules={[
            { required: true, message: 'E-posta gerekli' },
            { type: 'email', message: 'Geçerli bir e-posta adresi girin' },
          ]}
        >
          <Input
            size="large"
            prefix={<MailOutlined style={{ color: '#8c8c8c' }} />}
            placeholder="ahmet.yilmaz@example.com"
          />
        </Form.Item>

        {!isEditMode && (
          <Form.Item
            name="password"
            label="Şifre"
            rules={[
              { required: true, message: 'Şifre gerekli' },
              { min: 6, message: 'En az 6 karakter olmalı' },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined style={{ color: '#8c8c8c' }} />}
              placeholder="••••••••"
            />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="phoneNumber"
              label="Telefon (Opsiyonel)"
            >
              <Input
                size="large"
                prefix={<PhoneOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="+90 555 123 4567"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="department"
              label="Departman (Opsiyonel)"
            >
              <Input
                size="large"
                prefix={<TeamOutlined style={{ color: '#8c8c8c' }} />}
                placeholder="Satış"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Rol"
              rules={[{ required: true, message: 'Rol gerekli' }]}
            >
              <Select size="large" placeholder="Rol seçin">
                <Option value="FirmaYöneticisi">Admin</Option>
                <Option value="Yönetici">Yönetici</Option>
                <Option value="Kullanıcı">Kullanıcı</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="isActive"
              label="Durum"
              valuePropName="checked"
            >
              <div style={{ display: 'flex', alignItems: 'center', height: 40 }}>
                <Switch checkedChildren="Aktif" unCheckedChildren="Pasif" defaultChecked />
              </div>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}

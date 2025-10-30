'use client';

/**
 * General Settings Page
 * Tenant-wide general configuration
 */

import { Card, Form, Input, Button, Switch, message, Spin } from 'antd';
import { SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { useTenant } from '@/lib/tenant';

export default function GeneralSettingsPage() {
  const [form] = Form.useForm();
  const { tenant, isLoading } = useTenant();

  const handleSave = async (values: any) => {
    try {
      // TODO: API call to update tenant settings
      message.success('Ayarlar başarıyla kaydedildi');
    } catch (error) {
      message.error('Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div className="flex items-center gap-2">
            <SettingOutlined />
            <span>Genel Ayarlar</span>
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            companyName: tenant?.name || '',
            timezone: 'Europe/Istanbul',
            language: 'tr-TR',
            dateFormat: 'DD/MM/YYYY',
            currency: 'TRY',
            notifications: true,
          }}
        >
          <Form.Item
            label="Şirket Adı"
            name="companyName"
            rules={[{ required: true, message: 'Şirket adı gereklidir' }]}
          >
            <Input placeholder="Şirket adınızı girin" />
          </Form.Item>

          <Form.Item label="Zaman Dilimi" name="timezone">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Dil" name="language">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Tarih Formatı" name="dateFormat">
            <Input disabled />
          </Form.Item>

          <Form.Item label="Para Birimi" name="currency">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="E-posta Bildirimleri"
            name="notifications"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              Kaydet
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

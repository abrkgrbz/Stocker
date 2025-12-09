'use client';

/**
 * General Settings Page
 * Tenant-wide general configuration
 */

import { Card, Form, Input, Button, Switch, message, Spin, Typography, Divider } from 'antd';
import { SettingOutlined, SaveOutlined, CloudOutlined } from '@ant-design/icons';
import { useTenant } from '@/lib/tenant';
import { StorageUsageCard } from '@/components/settings';

const { Title } = Typography;

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
    <div className="p-6 space-y-6">
      {/* Page Title */}
      <div className="mb-6">
        <Title level={3} className="!mb-1 !text-gray-800">
          Genel Ayarlar
        </Title>
        <p className="text-gray-500">
          Şirket bilgileri ve sistem ayarlarını yapılandırın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <Card
            title={
              <div className="flex items-center gap-2">
                <SettingOutlined />
                <span>Şirket Bilgileri</span>
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

        {/* Sidebar with Storage Card */}
        <div className="lg:col-span-1">
          <StorageUsageCard showDetails={true} />
        </div>
      </div>
    </div>
  );
}

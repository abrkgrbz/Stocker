'use client';

/**
 * General Settings Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Sticky action bar at bottom
 * - Minimal accent colors
 */

import { Form, Input, Switch, Spin } from 'antd';
import {
  ArrowLeftOutlined,
  ControlOutlined,
  GlobalOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/lib/tenant';
import { StorageUsageCard } from '@/components/settings';
import { showUpdateSuccess, showError } from '@/lib/utils/sweetalert';

export default function GeneralSettingsPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { tenant, isLoading } = useTenant();

  const handleSave = async (values: any) => {
    try {
      // TODO: API call to update tenant settings
      showUpdateSuccess('ayarlar');
    } catch (error) {
      showError('Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Minimal Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              <ArrowLeftOutlined />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Genel Ayarlar</h1>
              <p className="text-sm text-slate-500">Şirket bilgileri ve sistem ayarlarını yapılandırın</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings Form */}
          <div className="lg:col-span-2 space-y-6">
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
              {/* Company Info Section */}
              <section>
                <h2 className="text-sm font-medium text-slate-900 mb-4">Şirket Bilgileri</h2>
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <Form.Item
                    name="companyName"
                    label={<span className="text-sm text-slate-600">Şirket Adı</span>}
                    rules={[{ required: true, message: 'Şirket adı gereklidir' }]}
                    className="mb-0"
                  >
                    <Input placeholder="Şirket adınızı girin" className="h-10" />
                  </Form.Item>
                </div>
              </section>

              {/* Regional Settings Section */}
              <section>
                <h2 className="text-sm font-medium text-slate-900 mb-4">Bölgesel Ayarlar</h2>
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name="timezone"
                      label={
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <GlobalOutlined className="text-slate-400" />
                          Zaman Dilimi
                        </span>
                      }
                      className="mb-0"
                    >
                      <Input disabled className="h-10 bg-slate-50" />
                    </Form.Item>

                    <Form.Item
                      name="language"
                      label={<span className="text-sm text-slate-600">Dil</span>}
                      className="mb-0"
                    >
                      <Input disabled className="h-10 bg-slate-50" />
                    </Form.Item>

                    <Form.Item
                      name="dateFormat"
                      label={<span className="text-sm text-slate-600">Tarih Formatı</span>}
                      className="mb-0"
                    >
                      <Input disabled className="h-10 bg-slate-50" />
                    </Form.Item>

                    <Form.Item
                      name="currency"
                      label={<span className="text-sm text-slate-600">Para Birimi</span>}
                      className="mb-0"
                    >
                      <Input disabled className="h-10 bg-slate-50" />
                    </Form.Item>
                  </div>
                  <p className="text-xs text-slate-400 mt-4">
                    Bölgesel ayarlar şu an için düzenlenemiyor. Değişiklik için destek ekibiyle iletişime geçin.
                  </p>
                </div>
              </section>

              {/* Notification Settings Section */}
              <section>
                <h2 className="text-sm font-medium text-slate-900 mb-4">Bildirim Tercihleri</h2>
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <Form.Item
                    name="notifications"
                    valuePropName="checked"
                    className="mb-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: '#3b82f615' }}
                        >
                          <BellOutlined style={{ color: '#3b82f6' }} />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-slate-900 block">E-posta Bildirimleri</span>
                          <span className="text-xs text-slate-500">Önemli güncellemeler için e-posta alın</span>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </Form.Item>
                </div>
              </section>

              <Form.Item hidden>
                <button type="submit" />
              </Form.Item>
            </Form>
          </div>

          {/* Sidebar with Storage Card */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-medium text-slate-900 mb-4">Depolama Kullanımı</h2>
            <StorageUsageCard showDetails={true} />
          </div>
        </div>
      </div>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <ControlOutlined />
              <span>Genel sistem ayarları</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/settings')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => form.submit()}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

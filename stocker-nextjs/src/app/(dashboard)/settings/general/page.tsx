'use client';

/**
 * General Settings Page
 * Monochrome Design System - Slate-based color palette
 * - Page wrapper: min-h-screen bg-slate-50 p-8
 * - Header icon: w-12 h-12 rounded-xl bg-slate-900 with white icon
 * - Cards: bg-white border border-slate-200 rounded-xl
 * - Primary button: bg-slate-900 hover:bg-slate-800
 */

import { Form, Input, Switch } from 'antd';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  GlobeAltIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { Spinner } from '@/components/primitives';
import { useRouter } from 'next/navigation';
import { StorageUsageCard } from '@/components/settings';
import { showUpdateSuccess, showError } from '@/lib/utils/sweetalert';
import { useTenantSettings, useUpdateTenantSettings } from '@/lib/api/hooks/useTenantSettings';
import type { UpdateTenantSettingsRequest } from '@/lib/api/services/tenant-settings.service';
import { useEffect } from 'react';

export default function GeneralSettingsPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const { data: settings, isLoading } = useTenantSettings();
  const updateSettings = useUpdateTenantSettings();

  // Set form values when settings are loaded
  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        companyName: settings.companyName || '',
        timezone: settings.timezone || 'Europe/Istanbul',
        language: settings.language || 'tr-TR',
        dateFormat: settings.dateFormat || 'DD/MM/YYYY',
        currency: settings.currency || 'TRY',
        emailNotifications: settings.emailNotifications ?? true,
      });
    }
  }, [settings, form]);

  const handleSave = async (values: any) => {
    try {
      const updateData: UpdateTenantSettingsRequest = {
        companyName: values.companyName,
        emailNotifications: values.emailNotifications,
      };
      await updateSettings.mutateAsync(updateData);
      showUpdateSuccess('ayarlar');
    } catch (error) {
      showError('Ayarlar kaydedilirken bir hata oluştu');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8 pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Header with Monochrome Icon */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <Cog6ToothIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Genel Ayarlar</h1>
            <p className="text-sm text-slate-500">Şirket bilgileri ve sistem ayarlarını yapılandırın</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              {/* Company Info Section */}
              <section className="mb-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4">Şirket Bilgileri</h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
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
              <section className="mb-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4">Bölgesel Ayarlar</h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Form.Item
                      name="timezone"
                      label={
                        <span className="flex items-center gap-2 text-sm text-slate-600">
                          <GlobeAltIcon className="w-4 h-4 text-slate-400" />
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
              <section className="mb-6">
                <h2 className="text-sm font-medium text-slate-900 mb-4">Bildirim Tercihleri</h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <BellIcon className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-900 block">E-posta Bildirimleri</span>
                        <span className="text-xs text-slate-500">Önemli güncellemeler için e-posta alın</span>
                      </div>
                    </div>
                    <Form.Item
                      name="emailNotifications"
                      valuePropName="checked"
                      className="mb-0"
                    >
                      <Switch />
                    </Form.Item>
                  </div>
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
        <div className="max-w-5xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Cog6ToothIcon className="w-4 h-4" />
              <span>Genel sistem ayarları</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push('/settings')}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => form.submit()}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
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

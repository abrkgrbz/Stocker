'use client';

/**
 * GİB Integration Settings (GİB Entegrasyon Ayarları) Page
 * e-Fatura entegrasyon sağlayıcı ayarları
 * Monochrome design system following DESIGN_SYSTEM.md
 */

import React from 'react';
import { Button, Switch, Input, Select, Spin, Form, Alert } from 'antd';
import {
  ArrowLeftIcon,
  Cog6ToothIcon,
  BuildingOffice2Icon,
  CloudIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useGibSettings, useUpdateGibSettings, useTestGibConnection } from '@/lib/api/hooks/useFinance';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/tr';

dayjs.locale('tr');

// Integration providers
const providers = [
  { value: 'Foriba', label: 'Foriba (fit Solutions)' },
  { value: 'Logo', label: 'Logo e-Fatura' },
  { value: 'Efatura', label: 'e-Fatura.gov.tr (Doğrudan GİB)' },
  { value: 'QNB', label: 'QNB Finansbank e-Fatura' },
  { value: 'Turkcell', label: 'Turkcell e-Fatura' },
  { value: 'Vodafone', label: 'Vodafone e-Fatura' },
  { value: 'Mikro', label: 'Mikro e-Fatura' },
  { value: 'Uyumsoft', label: 'Uyumsoft' },
];

// Scenarios
const scenarios = [
  { value: 'TEMEL', label: 'Temel Fatura' },
  { value: 'TICARI', label: 'Ticari Fatura' },
];

// Profile IDs
const profileIds = [
  { value: 'TEMELFATURA', label: 'TEMELFATURA - Temel Fatura Senaryosu' },
  { value: 'TICARIFATURA', label: 'TICARIFATURA - Ticari Fatura Senaryosu' },
  { value: 'YOLCUBERABERFATURA', label: 'YOLCUBERABERFATURA - Yolcu Beraberi Fatura' },
  { value: 'IHRACAT', label: 'IHRACAT - İhracat Fatura' },
  { value: 'KAMU', label: 'KAMU - Kamu İhale Kanunu' },
];

export default function GibSettingsPage() {
  const { data: settings, isLoading, refetch } = useGibSettings();
  const updateSettings = useUpdateGibSettings();
  const testConnection = useTestGibConnection();

  const [form] = Form.useForm();

  const handleSave = async (values: Record<string, unknown>) => {
    try {
      await updateSettings.mutateAsync(values);
    } catch {
      // Error handled by hook
    }
  };

  const handleTestConnection = async () => {
    try {
      await testConnection.mutateAsync();
    } catch {
      // Error handled by hook
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
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Page Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link href="/finance/e-invoice" className="mt-1">
          <button className="p-2 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-slate-600" />
          </button>
        </Link>
        <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
          <Cog6ToothIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">GİB Entegrasyon Ayarları</h1>
              <p className="text-sm text-slate-500">e-Fatura sağlayıcı ve entegrasyon yapılandırması</p>
            </div>
            <button
              onClick={() => refetch()}
              className="p-2.5 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <ArrowPathIcon className={`w-5 h-5 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Connection Status Alert */}
      <Alert
        type={settings?.integrationEnabled ? 'success' : 'warning'}
        icon={settings?.integrationEnabled ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
        message={
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium">
                {settings?.integrationEnabled ? 'Entegrasyon Aktif' : 'Entegrasyon Pasif'}
              </span>
              <span className="ml-2 text-sm">
                - {settings?.connectionStatus || 'Bağlantı durumu bilinmiyor'}
              </span>
              {settings?.lastSyncDate && (
                <span className="ml-2 text-xs text-slate-500">
                  Son senkronizasyon: {dayjs(settings.lastSyncDate).format('DD.MM.YYYY HH:mm')}
                </span>
              )}
            </div>
            <Button
              onClick={handleTestConnection}
              loading={testConnection.isPending}
              className="!border-slate-300"
            >
              Bağlantıyı Test Et
            </Button>
          </div>
        }
        className="mb-8"
      />

      <Form
        form={form}
        layout="vertical"
        initialValues={settings || {}}
        onFinish={handleSave}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Company Info Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BuildingOffice2Icon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Firma Bilgileri</h3>
                <p className="text-xs text-slate-500">GİB mükellef bilgileri</p>
              </div>
            </div>

            <div className="space-y-4">
              <Form.Item name="companyVkn" label="Vergi/TC Kimlik No" rules={[{ required: true }]}>
                <Input
                  placeholder="VKN veya TCKN"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>

              <Form.Item name="companyTitle" label="Firma Ünvanı" rules={[{ required: true }]}>
                <Input
                  placeholder="Firma ünvanı"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>

              <Form.Item name="gbEtiketi" label="GB (Gönderici Birim) Etiketi">
                <Input
                  placeholder="urn:mail:defaultgb@..."
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>

              <Form.Item name="pkEtiketi" label="PK (Posta Kutusu) Etiketi">
                <Input
                  placeholder="urn:mail:defaultpk@..."
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>
            </div>
          </div>

          {/* Integration Provider Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CloudIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Entegrasyon Sağlayıcı</h3>
                <p className="text-xs text-slate-500">e-Fatura servis sağlayıcısı</p>
              </div>
            </div>

            <div className="space-y-4">
              <Form.Item name="provider" label="Sağlayıcı" rules={[{ required: true }]}>
                <Select
                  options={providers}
                  placeholder="Sağlayıcı seçin"
                  className="w-full [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>

              <Form.Item name="providerUsername" label="Kullanıcı Adı">
                <Input
                  placeholder="Sağlayıcı kullanıcı adı"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>

              <Form.Item name="providerPassword" label="Şifre">
                <Input.Password
                  placeholder="Sağlayıcı şifresi"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>

              <Form.Item name="isTestMode" label="Test Modu" valuePropName="checked">
                <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-amber-900">Test Modu</div>
                    <div className="text-xs text-amber-700">
                      Aktifken faturalar GİB test ortamına gönderilir
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </div>
          </div>

          {/* Default Settings Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <ShieldCheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Varsayılan Ayarlar</h3>
                <p className="text-xs text-slate-500">Fatura oluşturma varsayılanları</p>
              </div>
            </div>

            <div className="space-y-4">
              <Form.Item name="defaultScenario" label="Varsayılan Senaryo">
                <Select
                  options={scenarios}
                  placeholder="Senaryo seçin"
                  className="w-full [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>

              <Form.Item name="defaultProfileId" label="Varsayılan Profil">
                <Select
                  options={profileIds}
                  placeholder="Profil seçin"
                  className="w-full [&_.ant-select-selector]:!border-slate-300 [&_.ant-select-selector]:!rounded-lg"
                />
              </Form.Item>

              <Form.Item name="autoSendEnabled" label="Otomatik Gönderim" valuePropName="checked">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Otomatik Gönderim</div>
                    <div className="text-xs text-slate-500">
                      Fatura onaylandığında otomatik olarak GİB'e gönderilir
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="autoArchiveEnabled" label="Otomatik Arşivleme" valuePropName="checked">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-slate-900">Otomatik Arşivleme</div>
                    <div className="text-xs text-slate-500">
                      Kabul edilen faturalar otomatik olarak arşivlenir
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>
            </div>
          </div>

          {/* Notification Settings Section */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <BellIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Bildirim Ayarları</h3>
                <p className="text-xs text-slate-500">E-posta bildirimleri</p>
              </div>
            </div>

            <div className="space-y-4">
              <Form.Item name="emailNotificationsEnabled" label="E-posta Bildirimleri" valuePropName="checked">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-slate-900">E-posta Bildirimleri</div>
                    <div className="text-xs text-slate-500">
                      Fatura durum değişikliklerinde e-posta gönderilir
                    </div>
                  </div>
                  <Switch />
                </div>
              </Form.Item>

              <Form.Item name="notificationEmail" label="Bildirim E-posta Adresi">
                <Input
                  type="email"
                  placeholder="ornek@sirket.com.tr"
                  className="!border-slate-300 !rounded-lg"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Integration Status Section */}
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Form.Item name="integrationEnabled" valuePropName="checked" noStyle>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Entegrasyon Durumu</h3>
                    <p className="text-xs text-slate-500">
                      GİB entegrasyonunu aktif/pasif yapın
                    </p>
                  </div>
                </div>
                <Switch
                  checkedChildren="Aktif"
                  unCheckedChildren="Pasif"
                  className="!bg-slate-300"
                />
              </div>
            </Form.Item>
          </div>

          <div className="p-4 bg-amber-50 rounded-lg mb-6">
            <p className="text-xs text-amber-700">
              <span className="font-medium">Uyarı:</span> Entegrasyonu aktifleştirmeden önce tüm
              ayarların doğru yapılandırıldığından emin olun. Test modunda çalışarak önce
              entegrasyonu doğrulayın.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/finance/e-invoice">
              <Button className="!border-slate-300">İptal</Button>
            </Link>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateSettings.isPending}
              className="!bg-slate-900 hover:!bg-slate-800"
            >
              Kaydet
            </Button>
          </div>
        </div>
      </Form>

      {/* Info Section */}
      <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">GİB Entegrasyon Rehberi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Entegrasyon Adımları</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>1. Entegrasyon sağlayıcısı seçin ve hesap oluşturun</li>
              <li>2. Sağlayıcıdan aldığınız kullanıcı adı ve şifreyi girin</li>
              <li>3. Firma VKN/TCKN ve ünvan bilgilerini girin</li>
              <li>4. GB ve PK etiketlerini sağlayıcıdan alın</li>
              <li>5. Test modunu aktifleştirin ve bağlantıyı test edin</li>
              <li>6. Test başarılı ise test modunu kapatıp entegrasyonu aktifleştirin</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-700 mb-2">Önemli Notlar</h4>
            <ul className="text-xs text-slate-500 space-y-1">
              <li>• e-Fatura mükellefi olmak için GİB başvurusu gereklidir</li>
              <li>• Entegratör şirketler aracılığıyla da mükellef olunabilir</li>
              <li>• Test ortamı ücretsizdir, canlı ortam için ücret alınır</li>
              <li>• Fatura XML formatı UBL-TR 1.2 standardına uygundur</li>
              <li>• e-Arşiv faturalar 10 yıl saklanmalıdır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

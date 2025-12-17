'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Volume2 } from 'lucide-react';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: 'orders',
    label: 'Sipariş Bildirimleri',
    description: 'Yeni siparişler ve sipariş güncellemeleri',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'inventory',
    label: 'Stok Uyarıları',
    description: 'Düşük stok ve stok tükenmesi bildirimleri',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'payments',
    label: 'Ödeme Bildirimleri',
    description: 'Ödeme alındı ve fatura bildirimleri',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'reports',
    label: 'Rapor Bildirimleri',
    description: 'Haftalık ve aylık rapor özetleri',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'security',
    label: 'Güvenlik Bildirimleri',
    description: 'Giriş denemeleri ve güvenlik uyarıları',
    email: true,
    push: true,
    sms: true,
  },
];

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>(defaultSettings);
  const [masterEnabled, setMasterEnabled] = useState(true);

  const toggleSetting = (id: string, channel: 'email' | 'push' | 'sms') => {
    setSettings(prev =>
      prev.map(setting =>
        setting.id === id
          ? { ...setting, [channel]: !setting[channel] }
          : setting
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bildirim Ayarları</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Bildirim tercihlerinizi özelleştirin
        </p>
      </div>

      {/* Master Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Tüm Bildirimler</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Tüm bildirimleri açın veya kapatın
              </p>
            </div>
          </div>
          <button
            onClick={() => setMasterEnabled(!masterEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              masterEnabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                masterEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Channel Legend */}
      <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span>E-posta</span>
        </div>
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" />
          <span>Push</span>
        </div>
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          <span>SMS</span>
        </div>
      </div>

      {/* Notification Settings */}
      <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700 ${!masterEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {settings.map((setting) => (
          <div key={setting.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{setting.description}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Email Toggle */}
                <button
                  onClick={() => toggleSetting(setting.id, 'email')}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.email
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                  title="E-posta"
                >
                  <Mail className="w-4 h-4" />
                </button>

                {/* Push Toggle */}
                <button
                  onClick={() => toggleSetting(setting.id, 'push')}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.push
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                  title="Push Bildirimi"
                >
                  <Bell className="w-4 h-4" />
                </button>

                {/* SMS Toggle */}
                <button
                  onClick={() => toggleSetting(setting.id, 'sms')}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.sms
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
                  title="SMS"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}

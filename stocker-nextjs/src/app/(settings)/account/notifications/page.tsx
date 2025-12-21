'use client';

import React, { useState } from 'react';
import { Bell, Mail, Smartphone, Volume2 } from 'lucide-react';

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
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Bildirim Ayarları</h2>
        <p className="text-sm text-slate-500 mt-1">
          Bildirim tercihlerinizi özelleştirin
        </p>
      </div>

      {/* Master Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Volume2 className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900">Tüm Bildirimler</h3>
              <p className="text-sm text-slate-500">
                Tüm bildirimleri açın veya kapatın
              </p>
            </div>
          </div>
          <button
            onClick={() => setMasterEnabled(!masterEnabled)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              masterEnabled ? 'bg-slate-900' : 'bg-slate-200'
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
      <div className="flex items-center gap-6 text-sm text-slate-500">
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
      <div className={`bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm ${!masterEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {settings.map((setting) => (
          <div key={setting.id} className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-slate-900">{setting.label}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{setting.description}</p>
              </div>
              <div className="flex items-center gap-4">
                {/* Email Toggle */}
                <button
                  onClick={() => toggleSetting(setting.id, 'email')}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.email
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-400'
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
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-400'
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
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-400'
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
        <button className="px-6 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
          Değişiklikleri Kaydet
        </button>
      </div>
    </div>
  );
}

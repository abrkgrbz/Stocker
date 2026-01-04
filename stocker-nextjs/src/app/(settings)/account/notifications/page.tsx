'use client';

/**
 * Notifications Settings Page
 * Consistent with Profile Page Design Language
 */

import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Package,
  CreditCard,
  FileText,
  Shield,
  Check,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

const defaultCategories: NotificationCategory[] = [
  {
    id: 'orders',
    label: 'Sipariş Bildirimleri',
    description: 'Yeni siparişler ve sipariş güncellemeleri',
    icon: Package,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    email: true,
    push: true,
    sms: false,
  },
  {
    id: 'inventory',
    label: 'Stok Uyarıları',
    description: 'Düşük stok ve stok tükenmesi bildirimleri',
    icon: AlertCircle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    email: true,
    push: true,
    sms: true,
  },
  {
    id: 'payments',
    label: 'Ödeme Bildirimleri',
    description: 'Ödeme alındı ve fatura bildirimleri',
    icon: CreditCard,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'reports',
    label: 'Rapor Bildirimleri',
    description: 'Haftalık ve aylık rapor özetleri',
    icon: FileText,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    email: true,
    push: false,
    sms: false,
  },
  {
    id: 'security',
    label: 'Güvenlik Bildirimleri',
    description: 'Giriş denemeleri ve güvenlik uyarıları',
    icon: Shield,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    email: true,
    push: true,
    sms: true,
  },
];

export default function NotificationsPage() {
  const [categories, setCategories] = useState<NotificationCategory[]>(defaultCategories);
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const toggleSetting = (id: string, channel: 'email' | 'push' | 'sms') => {
    setCategories(prev =>
      prev.map(cat =>
        cat.id === id ? { ...cat, [channel]: !cat[channel] } : cat
      )
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    setSuccessMessage('Ayarlar kaydedildi');
    setHasChanges(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Stats
  const emailCount = categories.filter(c => c.email).length;
  const pushCount = categories.filter(c => c.push).length;
  const smsCount = categories.filter(c => c.sms).length;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-lg shadow-lg"
        >
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-slate-900">{successMessage}</span>
        </motion.div>
      )}

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl">
              <Bell className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Bildirim Ayarları</h1>
              <p className="text-sm text-slate-500 mt-0.5">Bildirim tercihlerinizi kanallar bazında özelleştirin</p>
            </div>
          </div>

          {/* Master Toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">Tüm Bildirimler</span>
            <button
              onClick={() => setMasterEnabled(!masterEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                masterEnabled ? 'bg-emerald-500' : 'bg-slate-200'
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

        {/* Channel Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Mail className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-lg font-semibold text-slate-900">{emailCount}</p>
              <p className="text-xs text-slate-500">E-posta Aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Bell className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-lg font-semibold text-slate-900">{pushCount}</p>
              <p className="text-xs text-slate-500">Push Aktif</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Smartphone className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-lg font-semibold text-slate-900">{smsCount}</p>
              <p className="text-xs text-slate-500">SMS Aktif</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Categories */}
      <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${!masterEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Bildirim Kategorileri</h2>
            <p className="text-xs text-slate-500 mt-0.5">Her kategori için bildirimleri özelleştirin</p>
          </div>
          {/* Channel Legend */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              <span>E-posta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              <span>Push</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>SMS</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${category.iconBg} rounded-lg`}>
                      <Icon className={`w-4 h-4 ${category.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{category.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{category.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Email Toggle */}
                    <button
                      onClick={() => toggleSetting(category.id, 'email')}
                      className={`p-2 rounded-lg transition-colors ${
                        category.email
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title="E-posta"
                    >
                      <Mail className="w-4 h-4" />
                    </button>

                    {/* Push Toggle */}
                    <button
                      onClick={() => toggleSetting(category.id, 'push')}
                      className={`p-2 rounded-lg transition-colors ${
                        category.push
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title="Push Bildirimi"
                    >
                      <Bell className="w-4 h-4" />
                    </button>

                    {/* SMS Toggle */}
                    <button
                      onClick={() => toggleSetting(category.id, 'sms')}
                      className={`p-2 rounded-lg transition-colors ${
                        category.sms
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                      title="SMS"
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Save Button */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end">
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* Email Preferences */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">E-posta Tercihleri</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Pazarlama E-postaları</p>
              <p className="text-xs text-slate-500">Yenilikler, özellikler ve kampanyalar</p>
            </div>
            <button className="relative w-11 h-6 bg-slate-200 rounded-full">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">Haftalık Özet</p>
              <p className="text-xs text-slate-500">Her Pazartesi hesap özeti</p>
            </div>
            <button className="relative w-11 h-6 bg-emerald-500 rounded-full">
              <span className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow translate-x-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

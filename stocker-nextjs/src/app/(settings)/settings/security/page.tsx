'use client';

import React from 'react';
import { Shield, Lock, Smartphone, Key, History, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Hesap Güvenliği</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Hesabınızın güvenlik ayarlarını yönetin
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
        {/* Password */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Şifre</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Son şifre değişikliği: 30 gün önce
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                Şifreyi Değiştir
              </button>
            </div>
          </div>
        </div>

        {/* 2FA */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">İki Faktörlü Doğrulama</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Hesabınıza ekstra güvenlik katmanı ekleyin
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  Kapalı
                </span>
              </div>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors">
                2FA&apos;yı Etkinleştir
              </button>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">API Anahtarları</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Entegrasyonlar için API anahtarlarınızı yönetin
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                Anahtarları Yönet
              </button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <History className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Aktif Oturumlar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Hesabınıza bağlı aktif cihazları görüntüleyin
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">
                Oturumları Görüntüle
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 bg-red-50/50 dark:bg-red-900/10">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Tehlikeli Bölge</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz.
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Hesabı Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

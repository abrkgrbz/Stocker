'use client';

import React from 'react';
import { Lock, Smartphone, Key, History, AlertTriangle } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Hesap Güvenliği</h2>
        <p className="text-sm text-slate-500 mt-1">
          Hesabınızın güvenlik ayarlarını yönetin
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-sm">
        {/* Password */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Lock className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Şifre</h3>
              <p className="text-sm text-slate-500 mt-1">
                Son şifre değişikliği: 30 gün önce
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Şifreyi Değiştir
              </button>
            </div>
          </div>
        </div>

        {/* 2FA */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Smartphone className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">İki Faktörlü Doğrulama</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    Hesabınıza ekstra güvenlik katmanı ekleyin
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                  Kapalı
                </span>
              </div>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
                2FA&apos;yı Etkinleştir
              </button>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Key className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">API Anahtarları</h3>
              <p className="text-sm text-slate-500 mt-1">
                Entegrasyonlar için API anahtarlarınızı yönetin
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Anahtarları Yönet
              </button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-slate-100 rounded-lg">
              <History className="w-5 h-5 text-slate-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-slate-900">Aktif Oturumlar</h3>
              <p className="text-sm text-slate-500 mt-1">
                Hesabınıza bağlı aktif cihazları görüntüleyin
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                Oturumları Görüntüle
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 bg-red-50/50">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-600">Tehlikeli Bölge</h3>
              <p className="text-sm text-slate-500 mt-1">
                Hesabınızı kalıcı olarak silin. Bu işlem geri alınamaz.
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Hesabı Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

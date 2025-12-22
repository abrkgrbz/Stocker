'use client';

/**
 * Security Settings Page
 * Consistent with Profile Page Design Language
 */

import React, { useState } from 'react';
import {
  Lock,
  Smartphone,
  Key,
  Shield,
  Monitor,
  Globe,
  Clock,
  ChevronRight,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Mock data for active sessions
const activeSessions = [
  {
    id: '1',
    device: 'Chrome - Windows',
    location: 'İstanbul, Türkiye',
    ip: '192.168.1.1',
    lastActive: 'Şu an aktif',
    current: true,
  },
  {
    id: '2',
    device: 'Safari - iPhone',
    location: 'İstanbul, Türkiye',
    ip: '192.168.1.2',
    lastActive: '2 saat önce',
    current: false,
  },
];

export default function SecurityPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const passwordLastChanged = '30 gün önce';
  const lastLoginDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleToggle2FA = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
    setSuccessMessage(twoFactorEnabled ? '2FA devre dışı bırakıldı' : '2FA etkinleştirildi');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

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

      {/* Header Card - Security Overview */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-2xl">
              <Shield className="w-8 h-8 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Hesap Güvenliği</h1>
              <p className="text-sm text-slate-500 mt-0.5">Güvenlik ayarlarınızı yönetin ve hesabınızı koruyun</p>
            </div>
          </div>

          {/* Security Score */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{twoFactorEnabled ? '100%' : '75%'}</p>
              <p className="text-xs text-slate-500">Güvenlik Skoru</p>
            </div>
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 -rotate-90">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={twoFactorEnabled ? '#10b981' : '#f59e0b'}
                  strokeWidth="4"
                  strokeDasharray={`${(twoFactorEnabled ? 100 : 75) * 1.508} 151`}
                  strokeLinecap="round"
                />
              </svg>
              {twoFactorEnabled && (
                <Check className="absolute inset-0 m-auto w-5 h-5 text-emerald-500" />
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="text-center">
            <p className={`text-lg font-semibold ${twoFactorEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {twoFactorEnabled ? 'Aktif' : 'Kapalı'}
            </p>
            <p className="text-xs text-slate-500">2FA Durumu</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{passwordLastChanged}</p>
            <p className="text-xs text-slate-500">Şifre Değişikliği</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{activeSessions.length}</p>
            <p className="text-xs text-slate-500">Aktif Oturum</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{lastLoginDate}</p>
            <p className="text-xs text-slate-500">Son Giriş</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Authentication */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Kimlik Doğrulama</h2>
            <p className="text-xs text-slate-500 mt-0.5">Şifre ve 2FA ayarları</p>
          </div>
          <div className="divide-y divide-slate-100">
            {/* Password */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Lock className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Şifre</p>
                    <p className="text-xs text-slate-500">Son değişiklik: {passwordLastChanged}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Değiştir
                </button>
              </div>
            </div>

            {/* 2FA */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Smartphone className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">İki Faktörlü Doğrulama</p>
                    <p className="text-xs text-slate-500">Authenticator uygulaması ile</p>
                  </div>
                </div>
                <button
                  onClick={handleToggle2FA}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    twoFactorEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {!twoFactorEnabled && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                  <p className="text-xs text-amber-700">
                    <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                    2FA etkinleştirerek hesabınızı daha güvenli hale getirin
                  </p>
                </div>
              )}
            </div>

            {/* API Keys */}
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Key className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">API Anahtarları</p>
                    <p className="text-xs text-slate-500">0 aktif anahtar</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Yönet
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sessions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Aktif Oturumlar</h2>
              <p className="text-xs text-slate-500 mt-0.5">{activeSessions.length} cihaz bağlı</p>
            </div>
            <button className="text-xs text-red-600 hover:text-red-700 font-medium">
              Tümünü Sonlandır
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {activeSessions.map((session) => (
              <div key={session.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Monitor className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-slate-900">{session.device}</p>
                      {session.current && (
                        <span className="px-1.5 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded">
                          Bu cihaz
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <Globe className="w-3 h-3" />
                      <span>{session.location}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{session.lastActive}</span>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-900">Güvenlik Etkinlikleri</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {[
            { action: 'Başarılı giriş', time: 'Bugün, 10:30', ip: '192.168.1.1', success: true },
            { action: 'Şifre değiştirildi', time: '30 gün önce', ip: '192.168.1.1', success: true },
            { action: 'Başarısız giriş denemesi', time: '45 gün önce', ip: '10.0.0.1', success: false },
          ].map((event, idx) => (
            <div key={idx} className="px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${event.success ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{event.action}</p>
                  <p className="text-xs text-slate-500">IP: {event.ip}</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">{event.time}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 border-t border-slate-100">
          <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
            Tüm etkinlikleri görüntüle →
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Profile Settings Page
 * Dense Full-Width Layout - Maximum Information Density
 * Stripe/Vercel Dashboard Inspired
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Camera,
  Check,
  AlertCircle,
  Shield,
  Key,
  Calendar,
  Smartphone,
  AlertTriangle,
  Mail,
  Phone,
  Building2,
  Globe,
  Clock,
  Activity,
  CreditCard,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useUploadProfileImage } from './hooks';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    if (profile?.data) {
      setProfileData({
        firstName: profile.data.firstName || '',
        lastName: profile.data.lastName || '',
        phone: profile.data.phone || '',
      });
    }
  }, [profile]);

  const profileInfo = profile?.data || {
    id: user?.id,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: user?.role,
    phone: '',
    profileImage: null,
    emailConfirmed: false,
    twoFactorEnabled: false,
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    passwordChangedDate: null,
    team: 'Genel',
  };

  // Profile completion
  const completionItems = useMemo(() => [
    { key: 'avatar', label: 'Profil fotoğrafı', done: !!profileInfo.profileImage },
    { key: 'phone', label: 'Telefon', done: !!profileData.phone },
    { key: 'email', label: 'E-posta doğrulama', done: profileInfo.emailConfirmed },
    { key: '2fa', label: '2FA', done: profileInfo.twoFactorEnabled },
  ], [profileInfo, profileData]);

  const completedCount = completionItems.filter(i => i.done).length;
  const completionPct = Math.round((completedCount / completionItems.length) * 100);

  const lastLogin = profileInfo.lastLoginDate
    ? new Date(profileInfo.lastLoginDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '-';
  const memberSince = profileInfo.createdDate
    ? new Date(profileInfo.createdDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : '-';

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveProfile = () => {
    updateProfile(profileData, {
      onSuccess: () => {
        setSuccessMessage('Kaydedildi');
        setHasChanges(false);
        refetchProfile();
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: Error) => {
        setErrorMessage(error?.message || 'Hata oluştu');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Sadece resim dosyaları');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Max 5MB');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    uploadImage(file, {
      onSuccess: () => {
        setSuccessMessage('Fotoğraf güncellendi');
        refetchProfile();
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: () => {
        setErrorMessage('Yükleme hatası');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {(successMessage || errorMessage) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border rounded-lg shadow-lg ${errorMessage ? 'border-red-200' : 'border-slate-200'}`}
        >
          {errorMessage ? <AlertCircle className="w-4 h-4 text-red-600" /> : <Check className="w-4 h-4 text-emerald-600" />}
          <span className="text-sm text-slate-900">{successMessage || errorMessage}</span>
        </motion.div>
      )}

      {/* Header with Profile Summary */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
                {profileInfo.profileImage ? (
                  <img src={profileInfo.profileImage} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-slate-400" />
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors shadow-lg">
                <Camera className="w-4 h-4 text-white" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
              </label>
            </div>

            {/* Info */}
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                {profileInfo.firstName} {profileInfo.lastName}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">{profileInfo.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                  {profileInfo.role || 'Kullanıcı'}
                </span>
                {profileInfo.emailConfirmed && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-600 rounded flex items-center gap-1">
                    <Check className="w-3 h-3" /> Doğrulanmış
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Completion Ring */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-slate-900">{completionPct}%</p>
              <p className="text-xs text-slate-500">Profil</p>
            </div>
            <div className="relative w-12 h-12">
              <svg className="w-12 h-12 -rotate-90">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="20" fill="none" stroke="#0f172a" strokeWidth="4"
                  strokeDasharray={`${completionPct * 1.256} 126`}
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">1</p>
            <p className="text-xs text-slate-500">Aktif Oturum</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{memberSince}</p>
            <p className="text-xs text-slate-500">Üyelik</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{profileInfo.twoFactorEnabled ? 'Aktif' : 'Kapalı'}</p>
            <p className="text-xs text-slate-500">2FA Durumu</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900 truncate">{lastLogin}</p>
            <p className="text-xs text-slate-500">Son Giriş</p>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Personal Info Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Kişisel Bilgiler</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ad, soyad ve iletişim bilgileri</p>
            </div>
            {hasChanges && (
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating}
                className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50"
              >
                {isUpdating ? '...' : 'Kaydet'}
              </button>
            )}
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Ad</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Soyad</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={profileInfo.email}
                  disabled
                  className="w-full pl-10 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Security & Account */}
        <div className="space-y-6">
          {/* Security Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Güvenlik</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <Link href="/account/security" className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Shield className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">İki Faktörlü Doğrulama</p>
                    <p className="text-xs text-slate-500">Ekstra güvenlik katmanı</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${profileInfo.twoFactorEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {profileInfo.twoFactorEnabled ? 'Aktif' : 'Kapalı'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </Link>
              <Link href="/account/security" className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Key className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Şifre</p>
                    <p className="text-xs text-slate-500">3 ay önce değiştirildi</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/account/security" className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-slate-100 rounded-lg">
                    <Smartphone className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Aktif Oturumlar</p>
                    <p className="text-xs text-slate-500">1 cihaz bağlı</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Hızlı Erişim</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <Link href="/account/notifications" className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Bildirim Ayarları</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/account/billing" className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-emerald-50 rounded-lg">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Faturalandırma</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Completion Tasks - Full Width */}
      {completionPct < 100 && (
        <div className="bg-slate-900 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Profilinizi Tamamlayın</h3>
              <p className="text-xs text-slate-400 mt-0.5">{completedCount}/{completionItems.length} adım tamamlandı</p>
            </div>
            <span className="text-2xl font-bold">{completionPct}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="grid grid-cols-4 gap-3">
            {completionItems.map((item) => (
              <div
                key={item.key}
                className={`p-3 rounded-lg text-center ${item.done ? 'bg-slate-800' : 'bg-slate-800/50 border border-dashed border-slate-600'}`}
              >
                {item.done ? (
                  <Check className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-500 mx-auto mb-1" />
                )}
                <span className={`text-xs ${item.done ? 'text-slate-400' : 'text-white'}`}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger Zone - Compact */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Hesabı Sil</p>
              <p className="text-xs text-slate-500">Tüm veriler kalıcı olarak silinir</p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Profile Settings Page
 * Polished Full-Width Layout - Final Version
 * Clean inputs, integrated completion, subtle danger zone
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
  Smartphone,
  AlertTriangle,
  Mail,
  Phone,
  CreditCard,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useUploadProfileImage } from './hooks';
import { DeleteAccountModal } from './DeleteAccountModal';
import Link from 'next/link';
import Image from 'next/image';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
    username: user?.email, // fallback to email if no username
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
  const incompleteItems = completionItems.filter(i => !i.done);

  const lastLogin = profileInfo.lastLoginDate
    ? new Date(profileInfo.lastLoginDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '-';
  const memberSince = profileInfo.createdDate
    ? new Date(profileInfo.createdDate).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })
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

      {/* Header with Profile Summary + Integrated Completion */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
                {profileInfo.profileImage ? (
                  <Image src={profileInfo.profileImage} alt="Profile" fill className="object-cover" sizes="80px" />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-900 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors shadow-lg">
                <Camera className="w-3.5 h-3.5 text-white" />
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

          {/* Completion Ring with Tooltip */}
          <div className="relative group">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{completionPct}%</p>
                <p className="text-xs text-slate-500">Tamamlandı</p>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 -rotate-90">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                  <circle
                    cx="28" cy="28" r="24" fill="none"
                    stroke={completionPct === 100 ? '#10b981' : '#3b82f6'}
                    strokeWidth="4"
                    strokeDasharray={`${completionPct * 1.508} 151`}
                    strokeLinecap="round"
                  />
                </svg>
                {completionPct === 100 && (
                  <Check className="absolute inset-0 m-auto w-5 h-5 text-emerald-500" />
                )}
              </div>
            </div>

            {/* Tooltip - Missing Items */}
            {incompleteItems.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 text-white rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                <p className="text-xs font-medium text-slate-400 mb-2">Eksik adımlar:</p>
                <div className="space-y-1.5">
                  {incompleteItems.map(item => (
                    <div key={item.key} className="flex items-center gap-2 text-sm">
                      <div className="w-4 h-4 rounded-full border-2 border-slate-500 flex-shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute -top-1.5 right-6 w-3 h-3 bg-slate-900 rotate-45" />
              </div>
            )}
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
            <p className={`text-lg font-semibold ${profileInfo.twoFactorEnabled ? 'text-emerald-600' : 'text-amber-600'}`}>
              {profileInfo.twoFactorEnabled ? 'Aktif' : 'Kapalı'}
            </p>
            <p className="text-xs text-slate-500">2FA Durumu</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">{lastLogin}</p>
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
            <button
              onClick={handleSaveProfile}
              disabled={isUpdating || !hasChanges}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
            >
              {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad</label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Adınız"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Soyad</label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="Soyadınız"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={profileInfo.email}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">E-posta adresi değiştirilemez</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Security & Quick Links */}
        <div className="space-y-6">
          {/* Security Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Güvenlik</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <Link href="/account/security" className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
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
              <Link href="/account/security" className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Key className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Şifre</p>
                    <p className="text-xs text-slate-500">3 ay önce değiştirildi</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/account/security" className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <Smartphone className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Aktif Oturumlar</p>
                    <p className="text-xs text-slate-500">1 cihaz bağlı</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {/* Danger Zone - Inside Security Card */}
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full px-6 py-3.5 flex items-center justify-between bg-red-50/50 hover:bg-red-100/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-700">Hesabı Sil</p>
                    <p className="text-xs text-red-600/70">Bu işlem geri alınamaz</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-red-600">
                  Sil →
                </span>
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Hızlı Erişim</h2>
            </div>
            <div className="divide-y divide-slate-100">
              <Link href="/account/notifications" className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Bell className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-900">Bildirim Ayarları</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/account/billing" className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
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

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        userIdentifier={profileInfo.username || profileInfo.email || ''}
      />
    </div>
  );
}

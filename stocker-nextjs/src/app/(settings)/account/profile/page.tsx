'use client';

/**
 * Profile Settings Page
 * Single Column Layout - Stripe/Linear Inspired
 * Full-width cards, no empty space, professional density
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
  ChevronRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useUploadProfileImage } from './hooks';

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

  // Profile completion calculation
  const completionItems = useMemo(() => {
    return [
      { key: 'avatar', label: 'Profil fotoğrafı ekle', completed: !!profileInfo.profileImage, href: '#' },
      { key: 'phone', label: 'Telefon numarası ekle', completed: !!profileData.phone, href: '#' },
      { key: 'email', label: 'E-posta adresini doğrula', completed: profileInfo.emailConfirmed, href: '#' },
      { key: '2fa', label: 'İki faktörlü doğrulamayı etkinleştir', completed: profileInfo.twoFactorEnabled, href: '/account/security' },
    ];
  }, [profileInfo, profileData]);

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);
  const incompleteItems = completionItems.filter(item => !item.completed);

  // Security info
  const lastLogin = profileInfo.lastLoginDate
    ? new Date(profileInfo.lastLoginDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : '-';
  const passwordAge = profileInfo.passwordChangedDate
    ? Math.floor((Date.now() - new Date(profileInfo.passwordChangedDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 3;
  const memberSince = profileInfo.createdDate
    ? new Date(profileInfo.createdDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveProfile = () => {
    updateProfile(profileData, {
      onSuccess: () => {
        setSuccessMessage('Değişiklikler kaydedildi');
        setHasChanges(false);
        refetchProfile();
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: Error) => {
        setErrorMessage(error?.message || 'Kayıt sırasında hata oluştu');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Sadece resim dosyaları yükleyebilirsiniz');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Dosya boyutu 5MB\'dan küçük olmalıdır');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    uploadImage(file, {
      onSuccess: () => {
        setSuccessMessage('Profil fotoğrafı güncellendi');
        refetchProfile();
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: Error) => {
        setErrorMessage(error?.message || 'Fotoğraf yüklenirken hata oluştu');
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
    <div className="max-w-2xl space-y-6">
      {/* Toast Messages */}
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
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-red-200 rounded-lg shadow-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-slate-900">{errorMessage}</span>
        </motion.div>
      )}

      {/* Profile Completion Banner - Only show if incomplete */}
      {incompleteItems.length > 0 && (
        <div className="bg-slate-900 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Profilinizi tamamlayın</h3>
            <span className="text-sm text-slate-400">{completionPercentage}%</span>
          </div>
          <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden mb-4">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <div className="space-y-2">
            {incompleteItems.slice(0, 2).map((item) => (
              <a
                key={item.key}
                href={item.href}
                className="flex items-center justify-between py-2 px-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              >
                <span className="text-sm">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Profil Bilgileri</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Kişisel bilgilerinizi ve profil fotoğrafınızı güncelleyin.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                {profileInfo.profileImage ? (
                  <img
                    src={profileInfo.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 shadow-sm transition-colors">
                <Camera className="w-4 h-4 text-slate-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium text-slate-900">
                {profileInfo.firstName} {profileInfo.lastName}
              </h3>
              <p className="text-sm text-slate-500">{profileInfo.email}</p>
              <div className="flex items-center gap-3 mt-2">
                {profileInfo.emailConfirmed && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <Check className="w-3 h-3" />
                    Doğrulanmış
                  </span>
                )}
                <span className="text-xs text-slate-400">{profileInfo.role || 'Kullanıcı'}</span>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Ad</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleProfileChange('firstName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Adınız"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Soyad</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleProfileChange('lastName', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                placeholder="Soyadınız"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">E-posta</label>
            <input
              type="email"
              value={profileInfo.email}
              disabled
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Telefon</label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              placeholder="+90 5XX XXX XX XX"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={isUpdating || !hasChanges}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>

      {/* Account Overview Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">Hesap Özeti</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {/* Security Status */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Shield className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">İki Faktörlü Doğrulama</p>
                <p className="text-xs text-slate-500">Hesabınızı daha güvenli hale getirin</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              profileInfo.twoFactorEnabled
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}>
              {profileInfo.twoFactorEnabled ? 'Aktif' : 'Kapalı'}
            </span>
          </div>

          {/* Password */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Key className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Şifre</p>
                <p className="text-xs text-slate-500">{passwordAge} ay önce değiştirildi</p>
              </div>
            </div>
            <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Değiştir
            </button>
          </div>

          {/* Active Sessions */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Smartphone className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Aktif Oturumlar</p>
                <p className="text-xs text-slate-500">1 cihazda oturum açık</p>
              </div>
            </div>
            <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
              Görüntüle
            </button>
          </div>

          {/* Last Login */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Clock className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Son Giriş</p>
                <p className="text-xs text-slate-500">{lastLogin}</p>
              </div>
            </div>
          </div>

          {/* Member Since */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Calendar className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Üyelik Tarihi</p>
                <p className="text-xs text-slate-500">{memberSince}'den beri üye</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">Hesabı Sil</p>
              <p className="text-xs text-slate-500">Bu işlem geri alınamaz</p>
            </div>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            Hesabı Sil
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Profile Settings Page
 * Single-Column Professional Settings Layout
 * Clean Corporate Design - Linear/Stripe Style
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Bell,
  Globe,
  Monitor,
  Camera,
  Check,
  AlertCircle,
  ChevronRight,
  Clock,
  MapPin,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useChangePassword, useActivityLog, useUploadProfileImage, useUpdatePreferences } from './hooks';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activityPage] = useState(1);
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { data: activityLog, isLoading: activityLoading } = useActivityLog(activityPage, 5);
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: updatePreferences, isPending: isUpdatingPrefs } = useUpdatePreferences();

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize form data when profile loads
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
    twoFactorEnabled: false,
    emailConfirmed: false,
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    preferences: {
      language: 'tr',
      theme: 'light',
      notifications: true,
    },
  };

  // Handle profile input changes
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Handle profile save
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

  // Handle password change
  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage('Şifreler eşleşmiyor');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }
    changePassword(passwordData, {
      onSuccess: () => {
        setSuccessMessage('Şifre başarıyla değiştirildi');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: Error) => {
        setErrorMessage(error?.message || 'Şifre değiştirilirken hata oluştu');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  // Handle avatar upload
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

  // Handle preference change
  const handlePreferenceChange = (key: string, value: string | boolean) => {
    updatePreferences({ [key]: value }, {
      onSuccess: () => {
        setSuccessMessage('Tercih güncellendi');
        refetchProfile();
        setTimeout(() => setSuccessMessage(''), 3000);
      },
      onError: (error: Error) => {
        setErrorMessage(error?.message || 'Tercih güncellenirken hata oluştu');
        setTimeout(() => setErrorMessage(''), 3000);
      },
    });
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Save Button Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Kaydedilmemiş değişiklikleriniz var
          </span>
          <button
            onClick={handleSaveProfile}
            disabled={isUpdating}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </motion.div>
      )}

      {/* Toast Messages */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg shadow-lg"
        >
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">{successMessage}</span>
        </motion.div>
      )}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-red-50 text-red-700 border border-red-200 rounded-lg shadow-lg"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-slate-200 dark:border-gray-700 divide-y divide-slate-100 dark:divide-gray-700">

        {/* Profile Header Section */}
        <div className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-gray-700 ring-2 ring-slate-100 dark:ring-gray-600 overflow-hidden flex items-center justify-center">
                {profileInfo.profileImage ? (
                  <img
                    src={profileInfo.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400 dark:text-gray-500" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-gray-600 transition-colors shadow-sm">
                <Camera className="w-4 h-4 text-slate-500 dark:text-gray-400" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {profileInfo.firstName} {profileInfo.lastName}
              </h2>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{profileInfo.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-md">
                  {profileInfo.role || 'Kullanıcı'}
                </span>
                {profileInfo.emailConfirmed && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3 h-3" />
                    Doğrulanmış
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5">Ad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Adınız"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5">Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={profileInfo.email}
                  disabled
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-500 dark:text-gray-400 text-sm cursor-not-allowed"
                />
                {profileInfo.emailConfirmed && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Güvenlik</h3>
          <div className="space-y-3">
            {/* Password Change */}
            <div>
              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg hover:bg-slate-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Şifre Değiştir</p>
                    <p className="text-xs text-slate-500 dark:text-gray-400">Hesap şifrenizi güncelleyin</p>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showPasswordSection ? 'rotate-90' : ''}`} />
              </button>

              {showPasswordSection && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 p-4 border border-slate-200 dark:border-gray-600 rounded-lg space-y-3"
                >
                  <div>
                    <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5">Mevcut Şifre</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5">Yeni Şifre</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-600 dark:text-gray-400 mb-1.5">Şifre Tekrar</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-600 rounded-lg text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
                    className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isChangingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </button>
                </motion.div>
              )}
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">İki Faktörlü Doğrulama</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Ekstra güvenlik katmanı</p>
                </div>
              </div>
              <button
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  profileInfo.twoFactorEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    profileInfo.twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Tercihler</h3>
          <div className="space-y-3">
            {/* Language */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Dil</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Arayüz dili</p>
                </div>
              </div>
              <select
                value={profileInfo.preferences?.language || 'tr'}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                disabled={isUpdatingPrefs}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Theme */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Tema</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">Görünüm tercihi</p>
                </div>
              </div>
              <select
                value={profileInfo.preferences?.theme || 'light'}
                onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                disabled={isUpdatingPrefs}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg text-sm text-slate-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="light">Açık</option>
                <option value="dark">Koyu</option>
                <option value="system">Sistem</option>
              </select>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-slate-500 dark:text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Bildirimler</p>
                  <p className="text-xs text-slate-500 dark:text-gray-400">E-posta ve anlık bildirimler</p>
                </div>
              </div>
              <button
                onClick={() => handlePreferenceChange('notifications', !profileInfo.preferences?.notifications)}
                disabled={isUpdatingPrefs}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  profileInfo.preferences?.notifications ? 'bg-blue-600' : 'bg-slate-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    profileInfo.preferences?.notifications ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Activity Log Section */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-4">Son Aktiviteler</h3>
          {activityLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
            </div>
          ) : activityLog?.data?.items && activityLog.data.items.length > 0 ? (
            <div className="space-y-2">
              {activityLog.data.items.slice(0, 5).map((item: {
                id: string;
                description: string;
                status: string;
                timestamp: string;
                ipAddress?: string;
              }) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                    item.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 dark:text-white">{item.description}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString('tr-TR')
                          : '-'}
                      </span>
                      {item.ipAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-gray-400 text-center py-8">
              Henüz aktivite kaydı yok
            </p>
          )}
        </div>

        {/* Account Info Footer */}
        <div className="p-6 bg-slate-50/50 dark:bg-gray-700/50">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 dark:text-gray-500">
            <div className="flex items-center gap-4">
              <span>Kayıt: {profileInfo.createdDate ? new Date(profileInfo.createdDate).toLocaleDateString('tr-TR') : '-'}</span>
              <span>Son Giriş: {profileInfo.lastLoginDate ? new Date(profileInfo.lastLoginDate).toLocaleDateString('tr-TR') : '-'}</span>
            </div>
            <button className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">
              Hesabı Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

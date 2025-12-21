'use client';

/**
 * Profile Settings Page
 * Unified Single-Card Layout - Stripe Dashboard Inspired
 * Clean, Professional, Cohesive Design
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Camera,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  Shield,
  Key,
  Calendar,
  Smartphone,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useActivityLog, useUploadProfileImage } from './hooks';

export default function ProfilePage() {
  const { user } = useAuth();
  const [activityPage] = useState(1);
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { data: activityLog, isLoading: activityLoading } = useActivityLog(activityPage, 5);
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
      { key: 'avatar', label: 'Profil fotoğrafı', completed: !!profileInfo.profileImage },
      { key: 'phone', label: 'Telefon numarası', completed: !!profileData.phone },
      { key: 'email', label: 'E-posta doğrulama', completed: profileInfo.emailConfirmed },
      { key: '2fa', label: 'İki faktörlü doğrulama', completed: profileInfo.twoFactorEnabled },
    ];
  }, [profileInfo, profileData]);

  const completedCount = completionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedCount / completionItems.length) * 100);

  // Security info
  const lastLogin = profileInfo.lastLoginDate
    ? new Date(profileInfo.lastLoginDate).toLocaleDateString('tr-TR')
    : '-';
  const passwordAge = profileInfo.passwordChangedDate
    ? Math.floor((Date.now() - new Date(profileInfo.passwordChangedDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 3;
  const memberSince = profileInfo.createdDate
    ? new Date(profileInfo.createdDate).getFullYear()
    : new Date().getFullYear();

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
    <div className="max-w-5xl">
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

      {/* Two Column Layout with gap-8 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT COLUMN (Span 2) - UNIFIED MAIN CARD
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Settings Card - Everything Unified */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            {/* Card Header */}
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Kişisel Bilgiler</h2>
              <p className="text-sm text-slate-500 mt-1">
                Profil fotoğrafınızı ve kişisel bilgilerinizi buradan güncelleyin.
              </p>
            </div>

            {/* Card Body */}
            <div className="px-8 py-6 space-y-6">
              {/* Avatar Row */}
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center ring-4 ring-slate-50">
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
                <div>
                  <h3 className="text-lg font-medium text-slate-900">
                    {profileInfo.firstName} {profileInfo.lastName}
                  </h3>
                  <p className="text-sm text-slate-500">{profileInfo.email}</p>
                  {profileInfo.emailConfirmed && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-emerald-600">
                      <Check className="w-3.5 h-3.5" />
                      E-posta doğrulanmış
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ad</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Soyad</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">E-posta</label>
                <input
                  type="email"
                  value={profileInfo.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                />
                <p className="text-xs text-slate-400 mt-1.5">E-posta adresi değiştirilemez</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Telefon</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-shadow"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>

            {/* Card Footer - Save Button */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={isUpdating || !hasChanges}
                className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>

          {/* Activity Log Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-8 py-5 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Son Aktiviteler</h3>
            </div>
            <div className="px-8 py-5">
              {activityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
                </div>
              ) : activityLog?.data?.items && activityLog.data.items.length > 0 ? (
                <div className="space-y-4">
                  {activityLog.data.items.slice(0, 4).map((item: {
                    id: string;
                    description: string;
                    status: string;
                    timestamp: string;
                    ipAddress?: string;
                  }) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        item.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-700">{item.description}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.timestamp ? new Date(item.timestamp).toLocaleString('tr-TR') : '-'}
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
                <p className="text-sm text-slate-400 text-center py-6">Henüz aktivite yok</p>
              )}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              DANGER ZONE - Separate Card at Bottom
          ═══════════════════════════════════════════════════════════════════ */}
          <div className="bg-red-50 rounded-xl border border-red-100">
            <div className="px-8 py-5 flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-700">Tehlikeli Bölge</h3>
                <p className="text-sm text-red-600/80 mt-1">
                  Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinir. Bu işlem geri alınamaz.
                </p>
                <button className="mt-4 px-4 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                  Hesabı Kalıcı Olarak Sil
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT COLUMN - Context Widgets (Flat/Borderless Style)
        ═══════════════════════════════════════════════════════════════════ */}
        <div className="space-y-6">
          {/* Profile Completion - Flat Style */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900">Profil Durumu</h3>
              <span className="text-sm font-medium text-slate-900">{completionPercentage}%</span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-slate-900 rounded-full"
              />
            </div>

            {/* Completion Items */}
            <div className="space-y-3">
              {completionItems.map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <span className={`text-sm ${item.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.label}
                  </span>
                  {item.completed ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Security Overview - Flat Style */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Güvenlik</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">2FA</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  profileInfo.twoFactorEnabled
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {profileInfo.twoFactorEnabled ? 'Aktif' : 'Kapalı'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Şifre</span>
                </div>
                <span className="text-xs text-slate-500">{passwordAge} ay önce</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Aktif Oturumlar</span>
                </div>
                <span className="text-xs text-slate-500">1 cihaz</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Son Giriş</span>
                </div>
                <span className="text-xs text-slate-500">{lastLogin}</span>
              </div>
            </div>
          </div>

          {/* Account Info - Flat Style */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Hesap Bilgileri</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Üyelik</span>
                </div>
                <span className="text-xs text-slate-500">{memberSince}'den beri</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Rol</span>
                </div>
                <span className="text-xs text-slate-500">{profileInfo.role || 'Kullanıcı'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

/**
 * Profile Settings Page
 * Minimalist Design inspired by Linear, Vercel, Apple
 * Clean & Seamless - No Visual Clutter
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Camera,
  Check,
  AlertCircle,
  Clock,
  MapPin,
  Shield,
  Key,
  Calendar,
  Users,
  Smartphone,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useActivityLog, useUploadProfileImage } from './hooks';

// Minimal Profile Completion Widget
function ProfileCompletionWidget({
  profileInfo,
  profileData
}: {
  profileInfo: any;
  profileData: { firstName: string; lastName: string; phone: string }
}) {
  const completionItems = useMemo(() => {
    return [
      { key: 'avatar', label: 'Profil fotoğrafı', completed: !!profileInfo.profileImage },
      { key: 'phone', label: 'Telefon numarası', completed: !!profileData.phone },
      { key: 'email', label: 'E-posta doğrulama', completed: profileInfo.emailConfirmed },
      { key: '2fa', label: 'İki faktörlü doğrulama', completed: profileInfo.twoFactorEnabled },
    ];
  }, [profileInfo, profileData]);

  const completedCount = completionItems.filter(item => item.completed).length;
  const percentage = Math.round((completedCount / completionItems.length) * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Profil Durumu</h3>
        <span className="text-xs text-gray-500">{percentage}%</span>
      </div>

      {/* Thin Progress Bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gray-900 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Simple Text List */}
      <div className="space-y-2">
        {completionItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <span className={`text-sm ${item.completed ? 'text-gray-400 line-through' : 'text-gray-600'}`}>
              {item.label}
            </span>
            {item.completed ? (
              <Check className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Minimal Security Widget
function SecurityWidget({ profileInfo }: { profileInfo: any }) {
  const lastLogin = profileInfo.lastLoginDate
    ? new Date(profileInfo.lastLoginDate).toLocaleDateString('tr-TR')
    : '-';

  const passwordAge = profileInfo.passwordChangedDate
    ? Math.floor((Date.now() - new Date(profileInfo.passwordChangedDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 3;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Güvenlik</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">2FA</span>
          </div>
          <span className={`text-xs ${profileInfo.twoFactorEnabled ? 'text-green-600' : 'text-gray-400'}`}>
            {profileInfo.twoFactorEnabled ? 'Aktif' : 'Kapalı'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Şifre</span>
          </div>
          <span className="text-xs text-gray-400">{passwordAge} ay önce</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Oturumlar</span>
          </div>
          <span className="text-xs text-gray-400">1 cihaz</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Son giriş</span>
          </div>
          <span className="text-xs text-gray-400">{lastLogin}</span>
        </div>
      </div>
    </div>
  );
}

// Minimal Account Info Widget
function AccountInfoWidget({ profileInfo }: { profileInfo: any }) {
  const memberSince = profileInfo.createdDate
    ? new Date(profileInfo.createdDate).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Hesap</h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Üyelik</span>
          </div>
          <span className="text-xs text-gray-400">{memberSince}'den beri</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Rol</span>
          </div>
          <span className="text-xs text-gray-400">{profileInfo.role || 'Kullanıcı'}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600">Ekip</span>
          </div>
          <span className="text-xs text-gray-400">{profileInfo.team || 'Genel'}</span>
        </div>
      </div>
    </div>
  );
}

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
    team: 'Genel',
  };

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
        <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
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
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <Check className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-900">{successMessage}</span>
        </motion.div>
      )}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-20 right-4 z-50 flex items-center gap-2 px-4 py-3 bg-white border border-red-200 rounded-lg shadow-lg"
        >
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span className="text-sm text-gray-900">{errorMessage}</span>
        </motion.div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Profilim</h1>
        <p className="text-sm text-gray-500 mt-1">Hesap bilgilerinizi yönetin</p>
      </div>

      {/* Save Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
        >
          <span className="text-sm text-gray-600">Kaydedilmemiş değişiklikler</span>
          <button
            onClick={handleSaveProfile}
            disabled={isUpdating}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            {isUpdating ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </motion.div>
      )}

      {/* Main Grid - Aligned Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Main Profile Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            {/* Profile Header - Inside Card */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                    {profileInfo.profileImage ? (
                      <img
                        src={profileInfo.profileImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <Camera className="w-3 h-3 text-gray-500" />
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
                  <h2 className="text-base font-medium text-gray-900">
                    {profileInfo.firstName} {profileInfo.lastName}
                  </h2>
                  <p className="text-sm text-gray-500">{profileInfo.email}</p>
                  {profileInfo.emailConfirmed && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                      <Check className="w-3 h-3" />
                      Doğrulanmış
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Ad</label>
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Adınız"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Soyad</label>
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">E-posta</label>
                <input
                  type="email"
                  value={profileInfo.email}
                  disabled
                  className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>

            {/* Danger Zone - Inside Card, Subtle */}
            <div className="px-5 py-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hesabı sil</p>
                  <p className="text-xs text-gray-400 mt-0.5">Bu işlem geri alınamaz</p>
                </div>
                <button className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors">
                  Hesabı Sil
                </button>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Son Aktiviteler</h3>
            </div>
            <div className="p-5">
              {activityLoading ? (
                <div className="flex items-center justify-center py-6">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
                </div>
              ) : activityLog?.data?.items && activityLog.data.items.length > 0 ? (
                <div className="space-y-3">
                  {activityLog.data.items.slice(0, 4).map((item: {
                    id: string;
                    description: string;
                    status: string;
                    timestamp: string;
                    ipAddress?: string;
                  }) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 ${
                        item.status === 'Success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700">{item.description}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
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
                <p className="text-sm text-gray-400 text-center py-4">Henüz aktivite yok</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="space-y-5">
          <ProfileCompletionWidget profileInfo={profileInfo} profileData={profileData} />
          <SecurityWidget profileInfo={profileInfo} />
          <AccountInfoWidget profileInfo={profileInfo} />
        </div>
      </div>
    </div>
  );
}

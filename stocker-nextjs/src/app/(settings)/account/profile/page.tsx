'use client';

/**
 * Profile Settings Page
 * Focused on personal information only
 * Clean Corporate Design - Light Mode
 */

import React, { useState } from 'react';
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
  Building,
  Briefcase,
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

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
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
    emailConfirmed: false,
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
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
    <div className="max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Profilim</h2>
        <p className="text-sm text-slate-500 mt-1">
          Kişisel bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </div>

      {/* Save Button Bar */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <span className="text-sm text-blue-700">
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
      <div className="space-y-6">
        {/* Profile Header Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-slate-100 ring-2 ring-slate-100 overflow-hidden flex items-center justify-center">
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
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                <Camera className="w-4 h-4 text-slate-500" />
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
              <h3 className="text-lg font-semibold text-slate-900">
                {profileInfo.firstName} {profileInfo.lastName}
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">{profileInfo.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                  <Briefcase className="w-3 h-3" />
                  {profileInfo.role || 'Kullanıcı'}
                </span>
                {profileInfo.emailConfirmed && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                    <Check className="w-3 h-3" />
                    Doğrulanmış
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information Form */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-medium text-slate-900 mb-4">Kişisel Bilgiler</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Ad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Adınız"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1.5">Soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Soyadınız"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">E-posta</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={profileInfo.email}
                  disabled
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-sm cursor-not-allowed"
                />
                {profileInfo.emailConfirmed && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">E-posta adresi değiştirilemez</p>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1.5">Telefon</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Activity Log Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-sm font-medium text-slate-900">Son Aktiviteler</h3>
            <p className="text-xs text-slate-500 mt-0.5">Hesabınızdaki son işlemler</p>
          </div>
          <div className="p-6">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-900 rounded-full animate-spin" />
              </div>
            ) : activityLog?.data?.items && activityLog.data.items.length > 0 ? (
              <div className="space-y-3">
                {activityLog.data.items.slice(0, 5).map((item: {
                  id: string;
                  description: string;
                  status: string;
                  timestamp: string;
                  ipAddress?: string;
                }) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      item.status === 'Success' ? 'bg-emerald-500' : 'bg-red-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">{item.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
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
              <p className="text-sm text-slate-500 text-center py-8">
                Henüz aktivite kaydı yok
              </p>
            )}
          </div>
        </div>

        {/* Account Info Footer */}
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Kayıt: {profileInfo.createdDate ? new Date(profileInfo.createdDate).toLocaleDateString('tr-TR') : '-'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-3.5 h-3.5" />
              <span>Son Giriş: {profileInfo.lastLoginDate ? new Date(profileInfo.lastLoginDate).toLocaleDateString('tr-TR') : '-'}</span>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-red-700">Tehlikeli Bölge</h3>
              <p className="text-sm text-slate-600 mt-1">
                Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
              <button className="mt-3 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                Hesabı Sil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

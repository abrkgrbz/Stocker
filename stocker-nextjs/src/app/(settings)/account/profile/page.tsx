'use client';

/**
 * Profile Settings Page
 * Asymmetric Split-Layout with Context Widgets
 * Professional Desktop Dashboard Design
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
  Briefcase,
  AlertTriangle,
  Shield,
  ShieldCheck,
  ShieldX,
  Key,
  Calendar,
  Users,
  Award,
  ChevronRight,
  Sparkles,
  Globe,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useActivityLog, useUploadProfileImage } from './hooks';

// Profile Completion Widget Component
function ProfileCompletionWidget({
  profileInfo,
  profileData
}: {
  profileInfo: any;
  profileData: { firstName: string; lastName: string; phone: string }
}) {
  const completionItems = useMemo(() => {
    const items = [
      { key: 'avatar', label: 'Profil fotoğrafı ekle', completed: !!profileInfo.profileImage, icon: Camera },
      { key: 'phone', label: 'Telefon numarası ekle', completed: !!profileData.phone, icon: Phone },
      { key: 'email', label: 'E-posta doğrula', completed: profileInfo.emailConfirmed, icon: Mail },
      { key: '2fa', label: '2FA\'yı etkinleştir', completed: profileInfo.twoFactorEnabled, icon: Shield },
    ];
    return items;
  }, [profileInfo, profileData]);

  const completedCount = completionItems.filter(item => item.completed).length;
  const percentage = Math.round((completedCount / completionItems.length) * 100);
  const incompleteItems = completionItems.filter(item => !item.completed);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Profil Tamamlama</h3>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-slate-900">{percentage}%</span>
          <span className="text-xs text-slate-500">{completedCount}/{completionItems.length} tamamlandı</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
          />
        </div>
      </div>

      {/* Incomplete Items */}
      {incompleteItems.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Eksik adımlar</p>
          {incompleteItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group text-left"
              >
                <div className="p-1.5 bg-white rounded-md border border-slate-200 group-hover:border-violet-300 transition-colors">
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-500 transition-colors" />
                </div>
                <span className="text-sm text-slate-600 flex-1">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
              </button>
            );
          })}
        </div>
      )}

      {percentage === 100 && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg">
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-sm text-emerald-700 font-medium">Profiliniz tamamlandı!</span>
        </div>
      )}
    </div>
  );
}

// Security Snapshot Widget Component
function SecuritySnapshotWidget({ profileInfo }: { profileInfo: any }) {
  const lastLogin = profileInfo.lastLoginDate
    ? new Date(profileInfo.lastLoginDate)
    : null;

  const passwordAge = profileInfo.passwordChangedDate
    ? Math.floor((Date.now() - new Date(profileInfo.passwordChangedDate).getTime()) / (1000 * 60 * 60 * 24 * 30))
    : 3; // Default 3 months

  const getPasswordAgeColor = (months: number) => {
    if (months < 2) return 'text-emerald-600';
    if (months < 6) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Güvenlik Özeti</h3>
      </div>

      <div className="space-y-3">
        {/* 2FA Status */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2.5">
            {profileInfo.twoFactorEnabled ? (
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ) : (
              <ShieldX className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-sm text-slate-700">2FA Durumu</span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            profileInfo.twoFactorEnabled
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {profileInfo.twoFactorEnabled ? 'Aktif' : 'Kapalı'}
          </span>
        </div>

        {/* Last Login */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2.5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700">Son Giriş</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-600">
              {lastLogin ? lastLogin.toLocaleDateString('tr-TR') : '-'}
            </span>
          </div>
        </div>

        {/* Password Age */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700">Şifre Yaşı</span>
          </div>
          <span className={`text-xs font-medium ${getPasswordAgeColor(passwordAge)}`}>
            {passwordAge} ay önce
          </span>
        </div>

        {/* Active Sessions */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-700">Aktif Oturum</span>
          </div>
          <span className="text-xs font-medium text-blue-600">1 cihaz</span>
        </div>
      </div>
    </div>
  );
}

// Quick Stats Widget Component
function QuickStatsWidget({ profileInfo }: { profileInfo: any }) {
  const memberSince = profileInfo.createdDate
    ? new Date(profileInfo.createdDate).getFullYear()
    : new Date().getFullYear();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
          <Award className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Hesap Bilgileri</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Üyelik</span>
          </div>
          <span className="text-sm font-medium text-slate-900">{memberSince}'den beri</span>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Rol</span>
          </div>
          <span className="text-sm font-medium text-slate-900">{profileInfo.role || 'Kullanıcı'}</span>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">Ekip</span>
          </div>
          <span className="text-sm font-medium text-slate-900">{profileInfo.team || 'Genel'}</span>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-600">E-posta</span>
          </div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            profileInfo.emailConfirmed
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-amber-100 text-amber-700'
          }`}>
            {profileInfo.emailConfirmed ? 'Doğrulandı' : 'Bekliyor'}
          </span>
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
    twoFactorEnabled: false,
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    team: 'Genel',
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
    <div className="max-w-6xl">
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

      {/* Profile Header with Cover Area */}
      <div className="relative mb-6 rounded-xl overflow-hidden">
        {/* Cover Background */}
        <div className="h-32 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-4">
          <div className="flex items-end gap-5">
            {/* Avatar */}
            <div className="relative -mb-8">
              <div className="w-24 h-24 rounded-xl bg-white ring-4 ring-white overflow-hidden flex items-center justify-center shadow-lg">
                {profileInfo.profileImage ? (
                  <img
                    src={profileInfo.profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <User className="w-10 h-10 text-slate-400" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 w-8 h-8 bg-white border-2 border-white rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-md">
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

            {/* User Info */}
            <div className="flex-1 min-w-0 pb-2">
              <h2 className="text-xl font-bold text-white">
                {profileInfo.firstName} {profileInfo.lastName}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-slate-300">{profileInfo.email}</span>
                {profileInfo.emailConfirmed && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <Check className="w-3 h-3" />
                    Doğrulanmış
                  </span>
                )}
              </div>
            </div>

            {/* Role Badge */}
            <div className="pb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white/10 backdrop-blur-sm text-white rounded-lg border border-white/20">
                <Briefcase className="w-3.5 h-3.5" />
                {profileInfo.role || 'Kullanıcı'}
              </span>
            </div>
          </div>
        </div>
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

      {/* Asymmetric Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-12">
        {/* Left Column - Main Forms (Span 2) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Personal Information Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Kişisel Bilgiler</h3>
              <p className="text-xs text-slate-500 mt-0.5">Temel profil bilgilerinizi güncelleyin</p>
            </div>
            <div className="p-5 space-y-4">
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
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Son Aktiviteler</h3>
              <p className="text-xs text-slate-500 mt-0.5">Hesabınızdaki son işlemler</p>
            </div>
            <div className="p-5">
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
                <p className="text-sm text-slate-500 text-center py-6">
                  Henüz aktivite kaydı yok
                </p>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl border border-red-200 p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-700">Tehlikeli Bölge</h3>
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

        {/* Right Column - Context Widgets (Span 1) */}
        <div className="space-y-5">
          <ProfileCompletionWidget profileInfo={profileInfo} profileData={profileData} />
          <SecuritySnapshotWidget profileInfo={profileInfo} />
          <QuickStatsWidget profileInfo={profileInfo} />
        </div>
      </div>
    </div>
  );
}

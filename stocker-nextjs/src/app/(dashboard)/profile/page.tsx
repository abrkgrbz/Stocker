'use client';

/**
 * Profile Page
 * Modern card-based layout for user profile management
 */

import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Typography,
  Switch,
  List,
  Tag,
  message,
  Skeleton,
  Progress,
  Tooltip,
  Badge,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  SafetyOutlined,
  HistoryOutlined,
  CameraOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GlobalOutlined,
  BellOutlined,
  SaveOutlined,
  SettingOutlined,
  KeyOutlined,
  CalendarOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  MobileOutlined,
  DesktopOutlined,
  CloudOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useChangePassword, useActivityLog, useUploadProfileImage, useUpdatePreferences } from './hooks';
import type { RcFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// Profile completeness calculator
const calculateProfileCompleteness = (profile: any): number => {
  if (!profile) return 0;
  let score = 0;
  const checks = [
    { condition: profile.firstName, weight: 15 },
    { condition: profile.lastName, weight: 15 },
    { condition: profile.email, weight: 15 },
    { condition: profile.emailConfirmed, weight: 15 },
    { condition: profile.phone, weight: 10 },
    { condition: profile.profileImage, weight: 10 },
    { condition: profile.twoFactorEnabled, weight: 20 },
  ];
  checks.forEach(({ condition, weight }) => {
    if (condition) score += weight;
  });
  return Math.min(score, 100);
};

const getCompletenessColor = (score: number): string => {
  if (score >= 80) return '#52c41a';
  if (score >= 50) return '#faad14';
  return '#ff4d4f';
};

const getCompletenessLabel = (score: number): string => {
  if (score >= 80) return 'Tamamlandı';
  if (score >= 50) return 'Orta';
  return 'Eksik';
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [activityPage, setActivityPage] = useState(1);
  const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();
  const { data: activityLog, isLoading: activityLoading } = useActivityLog(activityPage, 10);
  const { mutate: uploadImage, isPending: isUploading } = useUploadProfileImage();
  const { mutate: updatePreferences, isPending: isUpdatingPrefs } = useUpdatePreferences();

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Handle profile update
  const handleProfileUpdate = (values: any) => {
    updateProfile(values, {
      onSuccess: () => {
        message.success('Profil bilgileri güncellendi');
        refetchProfile();
      },
      onError: (error: any) => {
        message.error(error?.message || 'Profil güncellenirken hata oluştu');
      },
    });
  };

  // Handle password change
  const handlePasswordChange = (values: any) => {
    changePassword(values, {
      onSuccess: () => {
        message.success('Şifre başarıyla değiştirildi');
        passwordForm.resetFields();
      },
      onError: (error: any) => {
        message.error(error?.message || 'Şifre değiştirilirken hata oluştu');
      },
    });
  };

  // Handle avatar upload
  const handleAvatarUpload = (file: RcFile) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Sadece resim dosyaları yükleyebilirsiniz!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Dosya boyutu 5MB\'dan küçük olmalıdır!');
      return false;
    }

    uploadImage(file, {
      onSuccess: (response) => {
        if (response.success) {
          message.success('Profil fotoğrafı güncellendi');
          refetchProfile();
        } else {
          message.error(response.message || 'Fotoğraf yüklenirken hata oluştu');
        }
      },
      onError: (error: any) => {
        message.error(error?.message || 'Fotoğraf yüklenirken hata oluştu');
      },
    });

    return false;
  };

  // Handle preference change
  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferences({ [key]: value }, {
      onSuccess: () => {
        message.success('Tercih güncellendi');
        refetchProfile();
      },
      onError: (error: any) => {
        message.error(error?.message || 'Tercih güncellenirken hata oluştu');
      },
    });
  };

  if (profileLoading) {
    return (
      <div className="p-6">
        <Skeleton active avatar paragraph={{ rows: 6 }} />
      </div>
    );
  }

  const profileData = profile?.data || {
    id: user?.id,
    email: user?.email,
    firstName: user?.firstName,
    lastName: user?.lastName,
    role: user?.role,
    phone: '',
    profileImage: null,
    twoFactorEnabled: false,
    emailConfirmed: false,
    phoneConfirmed: false,
    createdDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
    department: '',
    branch: '',
    preferences: {
      language: 'tr',
      theme: 'light',
      notifications: true,
    },
  };

  const completenessScore = calculateProfileCompleteness(profileData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section with Profile Card */}
        <motion.div variants={cardVariants} className="mb-8">
          <Card className="shadow-xl border-0 overflow-hidden">
            {/* Gradient Header */}
            <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 -mx-6 -mt-6 mb-0 relative">
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-6 -mt-16 relative z-10 px-2">
              {/* Avatar Section */}
              <div className="relative">
                <div className="p-1 bg-white rounded-full shadow-lg">
                  <Avatar
                    size={140}
                    src={profileData.profileImage}
                    icon={<UserOutlined />}
                    className="bg-gradient-to-br from-blue-500 to-indigo-600"
                  />
                </div>
                <Upload
                  name="file"
                  showUploadList={false}
                  beforeUpload={handleAvatarUpload}
                  disabled={isUploading}
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    size="large"
                    loading={isUploading}
                    className="absolute bottom-2 right-2 shadow-lg"
                  />
                </Upload>
              </div>

              {/* Profile Info */}
              <div className="flex-1 pb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <Title level={2} className="!mb-1 !text-gray-800">
                      {profileData.firstName} {profileData.lastName}
                    </Title>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <Tag color="blue" className="text-sm px-3 py-1">
                        <TeamOutlined className="mr-1" />
                        {profileData.role || 'Kullanıcı'}
                      </Tag>
                      {profileData.department && (
                        <Tag color="cyan" className="text-sm px-3 py-1">
                          <EnvironmentOutlined className="mr-1" />
                          {profileData.department}
                        </Tag>
                      )}
                      {profileData.twoFactorEnabled && (
                        <Tag color="green" className="text-sm px-3 py-1">
                          <SafetyOutlined className="mr-1" />
                          2FA Aktif
                        </Tag>
                      )}
                    </div>
                    <Text className="text-gray-500">
                      <MailOutlined className="mr-2" />
                      {profileData.email}
                    </Text>
                  </div>

                  {/* Completeness Score */}
                  <div className="bg-gray-50 rounded-2xl p-4 text-center min-w-[160px]">
                    <Tooltip title="Profil tamamlanma oranı">
                      <Progress
                        type="circle"
                        percent={completenessScore}
                        size={80}
                        strokeColor={getCompletenessColor(completenessScore)}
                        format={(percent) => (
                          <span className="text-lg font-bold">{percent}%</span>
                        )}
                      />
                    </Tooltip>
                    <div className="mt-2">
                      <Badge
                        color={getCompletenessColor(completenessScore)}
                        text={
                          <Text className="text-sm font-medium">
                            {getCompletenessLabel(completenessScore)}
                          </Text>
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center p-3 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors">
                <MailOutlined className="text-2xl text-blue-500 mb-2" />
                <div className="text-sm text-gray-500">E-posta</div>
                <Badge
                  status={profileData.emailConfirmed ? 'success' : 'warning'}
                  text={
                    <Text className="font-medium text-sm">
                      {profileData.emailConfirmed ? 'Doğrulandı' : 'Bekliyor'}
                    </Text>
                  }
                />
              </div>
              <div className="text-center p-3 rounded-xl bg-green-50/50 hover:bg-green-50 transition-colors">
                <SafetyOutlined className="text-2xl text-green-500 mb-2" />
                <div className="text-sm text-gray-500">2FA Durumu</div>
                <Badge
                  status={profileData.twoFactorEnabled ? 'success' : 'default'}
                  text={
                    <Text className="font-medium text-sm">
                      {profileData.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                    </Text>
                  }
                />
              </div>
              <div className="text-center p-3 rounded-xl bg-purple-50/50 hover:bg-purple-50 transition-colors">
                <CalendarOutlined className="text-2xl text-purple-500 mb-2" />
                <div className="text-sm text-gray-500">Kayıt Tarihi</div>
                <Text className="font-medium text-sm">
                  {profileData.createdDate
                    ? new Date(profileData.createdDate).toLocaleDateString('tr-TR')
                    : '-'}
                </Text>
              </div>
              <div className="text-center p-3 rounded-xl bg-orange-50/50 hover:bg-orange-50 transition-colors">
                <HistoryOutlined className="text-2xl text-orange-500 mb-2" />
                <div className="text-sm text-gray-500">Son Giriş</div>
                <Text className="font-medium text-sm">
                  {profileData.lastLoginDate
                    ? new Date(profileData.lastLoginDate).toLocaleDateString('tr-TR')
                    : '-'}
                </Text>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg border-0 h-full hover:shadow-xl transition-shadow"
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <UserOutlined className="text-xl text-blue-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-gray-800 block">Kişisel Bilgiler</Text>
                    <Text className="text-xs text-gray-400">Temel profil bilgileriniz</Text>
                  </div>
                </div>
              }
            >
              <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileUpdate}
                initialValues={{
                  firstName: profileData.firstName,
                  lastName: profileData.lastName,
                  email: profileData.email,
                  phone: profileData.phone,
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="firstName"
                    label={<Text className="font-medium">Ad</Text>}
                    rules={[{ required: true, message: 'Ad zorunludur' }]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Adınız"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                  <Form.Item
                    name="lastName"
                    label={<Text className="font-medium">Soyad</Text>}
                    rules={[{ required: true, message: 'Soyad zorunludur' }]}
                  >
                    <Input
                      prefix={<UserOutlined className="text-gray-400" />}
                      placeholder="Soyadınız"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="email"
                  label={<Text className="font-medium">E-posta</Text>}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="E-posta adresiniz"
                    size="large"
                    className="rounded-lg"
                    disabled
                    suffix={
                      profileData.emailConfirmed ? (
                        <Tooltip title="E-posta doğrulandı">
                          <CheckCircleOutlined className="text-green-500" />
                        </Tooltip>
                      ) : (
                        <Tooltip title="E-posta doğrulanmadı">
                          <CloseCircleOutlined className="text-orange-500" />
                        </Tooltip>
                      )
                    }
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label={<Text className="font-medium">Telefon</Text>}
                >
                  <Input
                    prefix={<PhoneOutlined className="text-gray-400" />}
                    placeholder="Telefon numaranız"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isUpdating}
                  size="large"
                  className="w-full rounded-lg h-12"
                >
                  Değişiklikleri Kaydet
                </Button>
              </Form>
            </Card>
          </motion.div>

          {/* Security Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg border-0 h-full hover:shadow-xl transition-shadow"
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <LockOutlined className="text-xl text-red-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-gray-800 block">Güvenlik</Text>
                    <Text className="text-xs text-gray-400">Şifre ve 2FA ayarları</Text>
                  </div>
                </div>
              }
            >
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  name="currentPassword"
                  label={<Text className="font-medium">Mevcut Şifre</Text>}
                  rules={[{ required: true, message: 'Mevcut şifre zorunludur' }]}
                >
                  <Input.Password
                    prefix={<KeyOutlined className="text-gray-400" />}
                    placeholder="Mevcut şifreniz"
                    size="large"
                    className="rounded-lg"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="newPassword"
                    label={<Text className="font-medium">Yeni Şifre</Text>}
                    rules={[
                      { required: true, message: 'Yeni şifre zorunludur' },
                      { min: 8, message: 'En az 8 karakter' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined className="text-gray-400" />}
                      placeholder="Yeni şifre"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                  <Form.Item
                    name="confirmPassword"
                    label={<Text className="font-medium">Şifre Tekrar</Text>}
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Şifre tekrarı zorunludur' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Şifreler eşleşmiyor'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<EyeInvisibleOutlined className="text-gray-400" />}
                      placeholder="Şifre tekrar"
                      size="large"
                      className="rounded-lg"
                    />
                  </Form.Item>
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LockOutlined />}
                  loading={isChangingPassword}
                  size="large"
                  className="w-full rounded-lg h-12 mb-6"
                  danger
                >
                  Şifreyi Değiştir
                </Button>
              </Form>

              {/* 2FA Toggle */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <MobileOutlined className="text-green-600" />
                    </div>
                    <div>
                      <Text className="font-medium block">İki Faktörlü Doğrulama</Text>
                      <Text className="text-xs text-gray-500">
                        Hesabınızı daha güvenli hale getirin
                      </Text>
                    </div>
                  </div>
                  <Switch
                    checked={profileData.twoFactorEnabled}
                    checkedChildren="Aktif"
                    unCheckedChildren="Pasif"
                    className="bg-gray-300"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Preferences Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg border-0 h-full hover:shadow-xl transition-shadow"
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <SettingOutlined className="text-xl text-purple-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-gray-800 block">Tercihler</Text>
                    <Text className="text-xs text-gray-400">Uygulama ayarlarınız</Text>
                  </div>
                </div>
              }
            >
              <div className="space-y-4">
                {/* Language */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <GlobalOutlined className="text-blue-600" />
                      </div>
                      <div>
                        <Text className="font-medium block">Dil</Text>
                        <Text className="text-xs text-gray-500">Arayüz dili seçimi</Text>
                      </div>
                    </div>
                    <select
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                      value={profileData.preferences?.language || 'tr'}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      disabled={isUpdatingPrefs}
                    >
                      <option value="tr">🇹🇷 Türkçe</option>
                      <option value="en">🇬🇧 English</option>
                    </select>
                  </div>
                </div>

                {/* Theme */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <DesktopOutlined className="text-purple-600" />
                      </div>
                      <div>
                        <Text className="font-medium block">Tema</Text>
                        <Text className="text-xs text-gray-500">Arayüz renk şeması</Text>
                      </div>
                    </div>
                    <select
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                      value={profileData.preferences?.theme || 'light'}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                      disabled={isUpdatingPrefs}
                    >
                      <option value="light">☀️ Açık</option>
                      <option value="dark">🌙 Koyu</option>
                      <option value="system">💻 Sistem</option>
                    </select>
                  </div>
                </div>

                {/* Notifications */}
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                        <BellOutlined className="text-orange-600" />
                      </div>
                      <div>
                        <Text className="font-medium block">Bildirimler</Text>
                        <Text className="text-xs text-gray-500">E-posta ve anlık bildirimler</Text>
                      </div>
                    </div>
                    <Switch
                      checked={profileData.preferences?.notifications}
                      checkedChildren="Açık"
                      unCheckedChildren="Kapalı"
                      loading={isUpdatingPrefs}
                      onChange={(checked) => handlePreferenceChange('notifications', checked)}
                      className="bg-gray-300"
                    />
                  </div>
                </div>

                {/* Cloud Sync */}
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border border-cyan-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                        <CloudOutlined className="text-cyan-600" />
                      </div>
                      <div>
                        <Text className="font-medium block">Bulut Senkronizasyon</Text>
                        <Text className="text-xs text-gray-500">Ayarları cihazlar arası senkronize et</Text>
                      </div>
                    </div>
                    <Switch
                      checked={true}
                      checkedChildren="Açık"
                      unCheckedChildren="Kapalı"
                      className="bg-gray-300"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Activity Log Card */}
          <motion.div variants={cardVariants}>
            <Card
              className="shadow-lg border-0 h-full hover:shadow-xl transition-shadow"
              title={
                <div className="flex items-center gap-3 py-2">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <HistoryOutlined className="text-xl text-orange-600" />
                  </div>
                  <div>
                    <Text className="font-semibold text-gray-800 block">Aktivite Geçmişi</Text>
                    <Text className="text-xs text-gray-400">Son hesap aktiviteleriniz</Text>
                  </div>
                </div>
              }
            >
              <List
                loading={activityLoading}
                dataSource={activityLog?.data?.items || []}
                locale={{ emptyText: 'Henüz aktivite kaydı yok' }}
                pagination={{
                  current: activityPage,
                  total: activityLog?.data?.totalItems || 0,
                  pageSize: 10,
                  onChange: (page) => setActivityPage(page),
                  showSizeChanger: false,
                  size: 'small',
                }}
                renderItem={(item: any) => (
                  <List.Item className="!px-0">
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          item.status === 'Success'
                            ? 'bg-green-100'
                            : 'bg-red-100'
                        }`}
                      >
                        <HistoryOutlined
                          className={
                            item.status === 'Success'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Text className="font-medium truncate">{item.description}</Text>
                          <Tag
                            color={item.status === 'Success' ? 'success' : 'error'}
                            className="flex-shrink-0"
                          >
                            {item.status === 'Success' ? 'Başarılı' : 'Başarısız'}
                          </Tag>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          <span>
                            <CalendarOutlined className="mr-1" />
                            {item.timestamp
                              ? new Date(item.timestamp).toLocaleString('tr-TR')
                              : '-'}
                          </span>
                          {item.ipAddress && (
                            <span>
                              <GlobalOutlined className="mr-1" />
                              {item.ipAddress}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

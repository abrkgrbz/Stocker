'use client';

import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  Typography,
  Divider,
  Switch,
  List,
  Tag,
  Space,
  message,
  Skeleton,
  Row,
  Col,
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
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  GlobalOutlined,
  BellOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useProfile, useUpdateProfile, useChangePassword, useActivityLog, useUploadProfileImage, useUpdatePreferences } from './hooks';
import type { RcFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

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
  const [activeTab, setActiveTab] = useState('profile');

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

  // Handle avatar upload using mutation
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

    return false; // Prevent default upload behavior
  };

  // Handle preference update
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
    preferences: {
      language: 'tr',
      theme: 'light',
      notifications: true,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Title level={2} className="!mb-2 !text-gray-800">
          Profil Ayarları
        </Title>
        <Text className="text-gray-500">
          Hesap bilgilerinizi ve güvenlik ayarlarınızı yönetin
        </Text>
      </motion.div>

      <Row gutter={24}>
        {/* Left Column - Profile Card */}
        <Col xs={24} lg={8}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="shadow-lg text-center mb-6">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <Avatar
                  size={120}
                  src={profileData.profileImage}
                  icon={<UserOutlined />}
                  className="bg-blue-500"
                />
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
                    size="small"
                    className="absolute bottom-0 right-0"
                  />
                </Upload>
              </div>

              {/* Name & Role */}
              <Title level={4} className="!mb-1">
                {profileData.firstName} {profileData.lastName}
              </Title>
              <Tag color="blue" className="mb-4">
                {profileData.role}
              </Tag>

              {/* Quick Stats */}
              <Divider />
              <div className="text-left space-y-3">
                <div className="flex items-center justify-between">
                  <Space>
                    <MailOutlined className="text-gray-400" />
                    <Text className="text-gray-600">E-posta</Text>
                  </Space>
                  <Badge
                    status={profileData.emailConfirmed ? 'success' : 'warning'}
                    text={profileData.emailConfirmed ? 'Doğrulandı' : 'Bekliyor'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Space>
                    <SafetyOutlined className="text-gray-400" />
                    <Text className="text-gray-600">2FA</Text>
                  </Space>
                  <Badge
                    status={profileData.twoFactorEnabled ? 'success' : 'default'}
                    text={profileData.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Space>
                    <HistoryOutlined className="text-gray-400" />
                    <Text className="text-gray-600">Son Giriş</Text>
                  </Space>
                  <Text className="text-gray-500 text-sm">
                    {profileData.lastLoginDate
                      ? new Date(profileData.lastLoginDate).toLocaleDateString('tr-TR')
                      : '-'}
                  </Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </Col>

        {/* Right Column - Tabs */}
        <Col xs={24} lg={16}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                {/* Profile Tab */}
                <TabPane
                  tab={
                    <span>
                      <UserOutlined />
                      Kişisel Bilgiler
                    </span>
                  }
                  key="profile"
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
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="firstName"
                          label="Ad"
                          rules={[{ required: true, message: 'Ad zorunludur' }]}
                        >
                          <Input prefix={<UserOutlined />} placeholder="Adınız" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="lastName"
                          label="Soyad"
                          rules={[{ required: true, message: 'Soyad zorunludur' }]}
                        >
                          <Input prefix={<UserOutlined />} placeholder="Soyadınız" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="email"
                      label="E-posta"
                    >
                      <Input
                        prefix={<MailOutlined />}
                        placeholder="E-posta adresiniz"
                        disabled
                        suffix={
                          profileData.emailConfirmed ? (
                            <CheckCircleOutlined className="text-green-500" />
                          ) : (
                            <CloseCircleOutlined className="text-orange-500" />
                          )
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      name="phone"
                      label="Telefon"
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="Telefon numaranız" />
                    </Form.Item>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={isUpdating}
                      >
                        Değişiklikleri Kaydet
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>

                {/* Security Tab */}
                <TabPane
                  tab={
                    <span>
                      <LockOutlined />
                      Güvenlik
                    </span>
                  }
                  key="security"
                >
                  {/* Password Change */}
                  <Title level={5} className="!mb-4">Şifre Değiştir</Title>
                  <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={handlePasswordChange}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Mevcut Şifre"
                      rules={[{ required: true, message: 'Mevcut şifre zorunludur' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Mevcut şifreniz" />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="newPassword"
                          label="Yeni Şifre"
                          rules={[
                            { required: true, message: 'Yeni şifre zorunludur' },
                            { min: 8, message: 'Şifre en az 8 karakter olmalıdır' },
                          ]}
                        >
                          <Input.Password prefix={<LockOutlined />} placeholder="Yeni şifre" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="confirmPassword"
                          label="Şifre Tekrar"
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
                          <Input.Password prefix={<LockOutlined />} placeholder="Şifre tekrar" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        icon={<LockOutlined />}
                        loading={isChangingPassword}
                      >
                        Şifreyi Değiştir
                      </Button>
                    </Form.Item>
                  </Form>

                  <Divider />

                  {/* 2FA Settings */}
                  <Title level={5} className="!mb-4">İki Faktörlü Doğrulama (2FA)</Title>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Text strong>2FA Durumu</Text>
                      <br />
                      <Text className="text-gray-500 text-sm">
                        Hesabınızı daha güvenli hale getirmek için 2FA'yı etkinleştirin
                      </Text>
                    </div>
                    <Switch
                      checked={profileData.twoFactorEnabled}
                      checkedChildren="Aktif"
                      unCheckedChildren="Pasif"
                    />
                  </div>
                </TabPane>

                {/* Preferences Tab */}
                <TabPane
                  tab={
                    <span>
                      <SettingOutlined />
                      Tercihler
                    </span>
                  }
                  key="preferences"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Space>
                          <GlobalOutlined className="text-blue-500" />
                          <Text strong>Dil</Text>
                        </Space>
                        <br />
                        <Text className="text-gray-500 text-sm">Arayüz dili</Text>
                      </div>
                      <select
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={profileData.preferences?.language || 'tr'}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        disabled={isUpdatingPrefs}
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Space>
                          <BellOutlined className="text-orange-500" />
                          <Text strong>Bildirimler</Text>
                        </Space>
                        <br />
                        <Text className="text-gray-500 text-sm">E-posta ve uygulama bildirimleri</Text>
                      </div>
                      <Switch
                        checked={profileData.preferences?.notifications}
                        checkedChildren="Açık"
                        unCheckedChildren="Kapalı"
                        loading={isUpdatingPrefs}
                        onChange={(checked) => handlePreferenceChange('notifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <Space>
                          <SettingOutlined className="text-purple-500" />
                          <Text strong>Tema</Text>
                        </Space>
                        <br />
                        <Text className="text-gray-500 text-sm">Arayüz renk şeması</Text>
                      </div>
                      <select
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={profileData.preferences?.theme || 'light'}
                        onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                        disabled={isUpdatingPrefs}
                      >
                        <option value="light">Açık</option>
                        <option value="dark">Koyu</option>
                      </select>
                    </div>
                  </div>
                </TabPane>

                {/* Activity Tab */}
                <TabPane
                  tab={
                    <span>
                      <HistoryOutlined />
                      Aktivite
                    </span>
                  }
                  key="activity"
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
                      showTotal: (total) => `Toplam ${total} kayıt`,
                    }}
                    renderItem={(item: any) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={
                            <Avatar
                              icon={<HistoryOutlined />}
                              style={{
                                backgroundColor: item.status === 'Success' ? '#52c41a' : '#ff4d4f',
                              }}
                            />
                          }
                          title={
                            <Space>
                              <Text>{item.description}</Text>
                              <Tag color={item.status === 'Success' ? 'success' : 'error'}>
                                {item.status === 'Success' ? 'Başarılı' : 'Başarısız'}
                              </Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              <Text className="text-gray-400 text-xs">
                                {item.timestamp ? new Date(item.timestamp).toLocaleString('tr-TR') : '-'}
                              </Text>
                              {item.ipAddress && (
                                <Text className="text-gray-400 text-xs">
                                  IP: {item.ipAddress}
                                </Text>
                              )}
                              {item.device && (
                                <Text className="text-gray-400 text-xs">
                                  Cihaz: {item.device.substring(0, 50)}...
                                </Text>
                              )}
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </div>
  );
}

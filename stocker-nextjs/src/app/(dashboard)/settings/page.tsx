'use client';

import React from 'react';
import { Card, Row, Col, Typography, Tag, Button, Space } from 'antd';
import {
  SettingOutlined,
  SafetyOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ApartmentOutlined,
  BellOutlined,
  MailOutlined,
  CloudUploadOutlined,
  FileTextOutlined,
  ApiOutlined,
  GlobalOutlined,
  RightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';

const { Title, Text, Paragraph } = Typography;

// Settings categories definition
const settingsCategories = [
  {
    id: 'general',
    name: 'Genel Ayarlar',
    description: 'Şirket bilgileri, zaman dilimi, dil ve temel sistem ayarları',
    icon: <SettingOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
    color: '#1890ff',
    path: '/settings/general',
    enabled: true,
    badge: 'Aktif',
  },
  {
    id: 'security',
    name: 'Güvenlik Ayarları',
    description: 'Parola politikaları, oturum ayarları, IP kısıtlamaları ve 2FA',
    icon: <SafetyOutlined style={{ fontSize: 40, color: '#f5222d' }} />,
    color: '#f5222d',
    path: '/settings/security',
    enabled: true,
    badge: 'Aktif',
  },
  {
    id: 'users',
    name: 'Kullanıcı Yönetimi',
    description: 'Kullanıcı ekleme, düzenleme, silme ve profil yönetimi',
    icon: <TeamOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
    color: '#52c41a',
    path: '/settings/users',
    enabled: true,
    badge: 'Aktif',
  },
  {
    id: 'roles',
    name: 'Rol ve Yetki Yönetimi',
    description: 'Roller oluşturma, yetkilendirme ve erişim kontrolü',
    icon: <SafetyCertificateOutlined style={{ fontSize: 40, color: '#722ed1' }} />,
    color: '#722ed1',
    path: '/settings/roles',
    enabled: true,
    badge: 'Aktif',
  },
  {
    id: 'departments',
    name: 'Departman Yönetimi',
    description: 'Departman yapısı, hiyerarşi ve organizasyon ayarları',
    icon: <ApartmentOutlined style={{ fontSize: 40, color: '#13c2c2' }} />,
    color: '#13c2c2',
    path: '/settings/departments',
    enabled: true,
    badge: 'Aktif',
  },
  {
    id: 'notifications',
    name: 'Bildirim Ayarları',
    description: 'Email, SMS, push bildirimleri ve bildirim kuralları',
    icon: <BellOutlined style={{ fontSize: 40, color: '#faad14' }} />,
    color: '#faad14',
    path: '/settings/notifications',
    enabled: false,
    badge: 'Yakında',
  },
  {
    id: 'email',
    name: 'Email/SMTP Ayarları',
    description: 'SMTP yapılandırması, email şablonları ve gönderim ayarları',
    icon: <MailOutlined style={{ fontSize: 40, color: '#eb2f96' }} />,
    color: '#eb2f96',
    path: '/settings/email',
    enabled: false,
    badge: 'Yakında',
  },
  {
    id: 'backup',
    name: 'Yedekleme ve Geri Yükleme',
    description: 'Otomatik yedekleme, manuel yedek alma ve veri geri yükleme',
    icon: <CloudUploadOutlined style={{ fontSize: 40, color: '#2f54eb' }} />,
    color: '#2f54eb',
    path: '/settings/backup',
    enabled: false,
    badge: 'Yakında',
  },
  {
    id: 'audit-logs',
    name: 'Denetim Günlükleri',
    description: 'Kullanıcı aktiviteleri, sistem logları ve güvenlik kayıtları',
    icon: <FileTextOutlined style={{ fontSize: 40, color: '#faad14' }} />,
    color: '#faad14',
    path: '/settings/audit-logs',
    enabled: false,
    badge: 'Yakında',
  },
  {
    id: 'integrations',
    name: 'Entegrasyonlar',
    description: 'Gmail, Slack, Zapier, API ve üçüncü parti entegrasyonlar',
    icon: <ApiOutlined style={{ fontSize: 40, color: '#52c41a' }} />,
    color: '#52c41a',
    path: '/settings/integrations',
    enabled: false,
    badge: 'Yakında',
  },
  {
    id: 'regional',
    name: 'Bölgesel Ayarlar',
    description: 'Zaman dilimi, para birimi, tarih formatı ve lokalizasyon',
    icon: <GlobalOutlined style={{ fontSize: 40, color: '#1890ff' }} />,
    color: '#1890ff',
    path: '/settings/regional',
    enabled: false,
    badge: 'Yakında',
  },
];

export default function SettingsPage() {
  const activeCount = settingsCategories.filter(c => c.enabled).length;
  const totalCount = settingsCategories.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-6">
          <Title level={2} className="!mb-2 !text-gray-800">
            Sistem Ayarları
          </Title>
          <Text className="text-gray-500 text-base">
            Sisteminizi yapılandırın ve özelleştirin
          </Text>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircleOutlined className="text-2xl text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{activeCount}</div>
                <div className="text-sm text-gray-500">Aktif Ayar Kategorisi</div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-50 rounded-lg">
                <ClockCircleOutlined className="text-2xl text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalCount - activeCount}</div>
                <div className="text-sm text-gray-500">Yakında Gelecek</div>
              </div>
            </div>
          </Card>

          <Card className="shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <SettingOutlined className="text-2xl text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
                <div className="text-sm text-gray-500">Toplam Kategori</div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Settings Categories Grid */}
      <Row gutter={[24, 24]}>
        {settingsCategories.map((category, index) => (
          <Col key={category.id} xs={24} lg={12} xl={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="h-full shadow-lg hover:shadow-xl transition-all duration-300"
                style={{
                  borderTop: `4px solid ${category.color}`,
                  opacity: category.enabled ? 1 : 0.7,
                }}
                bodyStyle={{ padding: '24px' }}
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      {category.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Title level={4} className="!mb-0">
                          {category.name}
                        </Title>
                      </div>
                      <Text className="text-gray-500 text-sm">
                        {category.description}
                      </Text>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <Tag
                    color={category.enabled ? 'success' : 'warning'}
                    icon={category.enabled ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                  >
                    {category.badge}
                  </Tag>
                </div>

                {/* Action Button */}
                <div className="mt-4">
                  {category.enabled ? (
                    <Link href={category.path}>
                      <Button
                        type="primary"
                        block
                        size="large"
                        icon={<RightOutlined />}
                        iconPosition="end"
                        danger={category.id === 'security'}
                        style={
                          category.id === 'security'
                            ? undefined
                            : {
                                backgroundColor: '#1890ff',
                                borderColor: '#1890ff',
                              }
                        }
                      >
                        Ayarlara Git
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      type="dashed"
                      block
                      size="large"
                      disabled
                      icon={<ClockCircleOutlined />}
                    >
                      Yakında Gelecek
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}
      </Row>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <Title level={4} className="!mb-2">Sistem Ayarları Hakkında</Title>
              <Paragraph className="text-gray-600 mb-0">
                Sistem ayarları sayfası, uygulamanızın tüm yapılandırma seçeneklerini merkezi bir
                yerden yönetmenizi sağlar. Her kategori, ilgili ayarları içerir ve kolayca
                erişilebilir durumdadır. Güvenlik ayarlarından kullanıcı yönetimine, bildirim
                ayarlarından entegrasyonlara kadar tüm önemli yapılandırmalar burada bulunur.
              </Paragraph>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

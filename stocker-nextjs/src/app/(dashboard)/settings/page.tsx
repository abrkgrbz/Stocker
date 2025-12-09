'use client';

import React, { useState } from 'react';
import { Card, Input, Typography, Tag, Space, Divider } from 'antd';
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
  SearchOutlined,
  ControlOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { StorageUsageCard } from '@/components/settings';

const { Title, Text } = Typography;

// Settings organized by logical groups
const settingsGroups = [
  {
    id: 'organization',
    title: '🏛️ Organizasyon ve Kullanıcılar',
    items: [
      {
        id: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcıları ekleyin, düzenleyin, silin ve profil ayarlarını yönetin',
        icon: <TeamOutlined style={{ fontSize: 20 }} />,
        path: '/settings/users',
        enabled: true,
      },
      {
        id: 'roles',
        name: 'Rol ve Yetki Yönetimi',
        description: 'Farklı roller oluşturun ve bu rollerin hangi modüllere erişebileceğini belirleyin',
        icon: <SafetyCertificateOutlined style={{ fontSize: 20 }} />,
        path: '/settings/roles',
        enabled: true,
      },
      {
        id: 'departments',
        name: 'Departman Yönetimi',
        description: 'Şirketinizin departman yapısını, hiyerarşisini ve organizasyon şemasını yönetin',
        icon: <ApartmentOutlined style={{ fontSize: 20 }} />,
        path: '/settings/departments',
        enabled: true,
      },
    ],
  },
  {
    id: 'security',
    title: '🛡️ Güvenlik ve Uyumluluk',
    items: [
      {
        id: 'security',
        name: 'Güvenlik Ayarları',
        description: 'Parola politikaları, oturum süreleri, IP kısıtlamaları ve 2FA ayarları',
        icon: <SafetyOutlined style={{ fontSize: 20 }} />,
        path: '/settings/security',
        enabled: true,
      },
      {
        id: 'audit-logs',
        name: 'Denetim Günlükleri',
        description: 'Sistemde kimin, ne zaman, hangi değişikliği yaptığını takip edin',
        icon: <FileTextOutlined style={{ fontSize: 20 }} />,
        path: '/settings/audit-logs',
        enabled: false,
      },
      {
        id: 'backup',
        name: 'Yedekleme ve Geri Yükleme',
        description: 'Önemli verileri yedekleyin, market yerinden geri yükleme yapın',
        icon: <CloudUploadOutlined style={{ fontSize: 20 }} />,
        path: '/settings/backup',
        enabled: false,
      },
    ],
  },
  {
    id: 'application',
    title: '⚙️ Uygulama Ayarları',
    items: [
      {
        id: 'general',
        name: 'Genel Ayarlar',
        description: 'Şirket bilgileri, logolar, diller, varsayılan para birimi ve temel sistem ayarları',
        icon: <ControlOutlined style={{ fontSize: 20 }} />,
        path: '/settings/general',
        enabled: true,
      },
      {
        id: 'notifications',
        name: 'Bildirim Ayarları',
        description: 'E-posta, SMS ve uygulama içi bildirimlerin şablonlarını ve kurallarını yönetin',
        icon: <BellOutlined style={{ fontSize: 20 }} />,
        path: '/settings/notifications',
        enabled: false,
      },
      {
        id: 'regional',
        name: 'Bölgesel Ayarlar',
        description: 'Zaman dilimi, para birimi formatları ve tarih/saat lokalizasyonu',
        icon: <GlobalOutlined style={{ fontSize: 20 }} />,
        path: '/settings/regional',
        enabled: false,
      },
    ],
  },
  {
    id: 'integrations',
    title: '🔌 Entegrasyonlar ve Veri',
    items: [
      {
        id: 'email',
        name: 'Email / SMTP Ayarları',
        description: 'Giden ve gelen e-postalarınız için e-posta sunucu ayarları',
        icon: <MailOutlined style={{ fontSize: 20 }} />,
        path: '/settings/email',
        enabled: false,
      },
      {
        id: 'integrations',
        name: 'Entegrasyonlar',
        description: 'Gmail, Slack, Zapier, API ve diğer 3. parti uygulamalara bağlanın',
        icon: <ApiOutlined style={{ fontSize: 20 }} />,
        path: '/settings/integrations',
        enabled: false,
      },
    ],
  },
];

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate stats
  const allItems = settingsGroups.flatMap(group => group.items);
  const activeCount = allItems.filter(item => item.enabled).length;
  const totalCount = allItems.length;

  // Filter items based on search
  const filteredGroups = settingsGroups
    .map(group => ({
      ...group,
      items: group.items.filter(
        item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(group => group.items.length > 0);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

          {/* Storage Usage Mini Card */}
          <StorageUsageCard showDetails={false} />
        </div>

        {/* Search Bar */}
        <Card className="shadow-sm mb-6">
          <Input
            size="large"
            placeholder="Ayarlarda ara... (ör: 'parola', 'kullanıcı', 'e-posta')"
            prefix={<SearchOutlined className="text-gray-400" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </Card>
      </motion.div>

      {/* Grouped Settings List */}
      <Space direction="vertical" size="large" className="w-full">
        {filteredGroups.map((group, groupIndex) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <Card className="shadow-lg">
              {/* Group Header */}
              <Title level={4} className="!mb-4 !text-gray-800">
                {group.title}
              </Title>

              {/* Group Items */}
              <div className="space-y-0">
                {group.items.map((item, itemIndex) => (
                  <React.Fragment key={item.id}>
                    {itemIndex > 0 && <Divider className="!my-0" />}
                    <Link
                      href={item.enabled ? item.path : '#'}
                      className={item.enabled ? '' : 'pointer-events-none'}
                    >
                      <div
                        className={`
                          flex items-center justify-between p-4
                          ${item.enabled ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                          transition-all duration-200
                        `}
                      >
                        {/* Left: Icon + Content */}
                        <div className="flex items-start gap-4 flex-1">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600 mt-1">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <Text className="text-base font-semibold text-gray-800">
                                {item.name}
                              </Text>
                              <Tag
                                color={item.enabled ? 'success' : 'warning'}
                                icon={item.enabled ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
                              >
                                {item.enabled ? 'Aktif' : 'Yakında'}
                              </Tag>
                            </div>
                            <Text className="text-sm text-gray-500">
                              {item.description}
                            </Text>
                          </div>
                        </div>

                        {/* Right: Arrow */}
                        {item.enabled && (
                          <RightOutlined className="text-gray-400 text-sm ml-4" />
                        )}
                      </div>
                    </Link>
                  </React.Fragment>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </Space>

      {/* No Results */}
      {searchQuery && filteredGroups.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <SearchOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={4} className="!text-gray-500">
            Sonuç Bulunamadı
          </Title>
          <Text className="text-gray-400">
            "{searchQuery}" için eşleşen ayar bulunamadı
          </Text>
        </motion.div>
      )}
    </div>
  );
}

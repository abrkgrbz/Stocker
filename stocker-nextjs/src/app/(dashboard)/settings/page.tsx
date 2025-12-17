'use client';

/**
 * Settings Main Page
 * Enterprise-grade design following Linear/Stripe/Vercel design principles
 * - Clean white cards with subtle borders
 * - Stacked list layout for navigation items
 * - Minimal accent colors (only on icons)
 */

import React, { useState } from 'react';
import { Input } from 'antd';
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
import Link from 'next/link';
import { StorageUsageCard } from '@/components/settings';
import { PageContainer } from '@/components/ui/enterprise-page';

// Settings organized by logical groups
const settingsGroups = [
  {
    id: 'organization',
    title: 'Organizasyon ve Kullanıcılar',
    items: [
      {
        id: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcıları ekleyin, düzenleyin, silin ve profil ayarlarını yönetin',
        icon: <TeamOutlined />,
        iconColor: '#3b82f6',
        path: '/settings/users',
        enabled: true,
      },
      {
        id: 'roles',
        name: 'Rol ve Yetki Yönetimi',
        description: 'Farklı roller oluşturun ve bu rollerin hangi modüllere erişebileceğini belirleyin',
        icon: <SafetyCertificateOutlined />,
        iconColor: '#6366f1',
        path: '/settings/roles',
        enabled: true,
      },
      {
        id: 'departments',
        name: 'Departman Yönetimi',
        description: 'Şirketinizin departman yapısını, hiyerarşisini ve organizasyon şemasını yönetin',
        icon: <ApartmentOutlined />,
        iconColor: '#8b5cf6',
        path: '/settings/departments',
        enabled: true,
      },
    ],
  },
  {
    id: 'security',
    title: 'Güvenlik ve Uyumluluk',
    items: [
      {
        id: 'security',
        name: 'Güvenlik Ayarları',
        description: 'Parola politikaları, oturum süreleri, IP kısıtlamaları ve 2FA ayarları',
        icon: <SafetyOutlined />,
        iconColor: '#ef4444',
        path: '/settings/security',
        enabled: true,
      },
      {
        id: 'audit-logs',
        name: 'Denetim Günlükleri',
        description: 'Sistemde kimin, ne zaman, hangi değişikliği yaptığını takip edin',
        icon: <FileTextOutlined />,
        iconColor: '#64748b',
        path: '/settings/audit-logs',
        enabled: false,
      },
      {
        id: 'backup',
        name: 'Yedekleme ve Geri Yükleme',
        description: 'Önemli verileri yedekleyin, market yerinden geri yükleme yapın',
        icon: <CloudUploadOutlined />,
        iconColor: '#64748b',
        path: '/settings/backup',
        enabled: false,
      },
    ],
  },
  {
    id: 'application',
    title: 'Uygulama Ayarları',
    items: [
      {
        id: 'general',
        name: 'Genel Ayarlar',
        description: 'Şirket bilgileri, logolar, diller, varsayılan para birimi ve temel sistem ayarları',
        icon: <ControlOutlined />,
        iconColor: '#10b981',
        path: '/settings/general',
        enabled: true,
      },
      {
        id: 'notifications',
        name: 'Bildirim Ayarları',
        description: 'E-posta, SMS ve uygulama içi bildirimlerin şablonlarını ve kurallarını yönetin',
        icon: <BellOutlined />,
        iconColor: '#64748b',
        path: '/settings/notifications',
        enabled: false,
      },
      {
        id: 'regional',
        name: 'Bölgesel Ayarlar',
        description: 'Zaman dilimi, para birimi formatları ve tarih/saat lokalizasyonu',
        icon: <GlobalOutlined />,
        iconColor: '#64748b',
        path: '/settings/regional',
        enabled: false,
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Entegrasyonlar ve Veri',
    items: [
      {
        id: 'email',
        name: 'Email / SMTP Ayarları',
        description: 'Giden ve gelen e-postalarınız için e-posta sunucu ayarları',
        icon: <MailOutlined />,
        iconColor: '#64748b',
        path: '/settings/email',
        enabled: false,
      },
      {
        id: 'integrations',
        name: 'Entegrasyonlar',
        description: 'Gmail, Slack, Zapier, API ve diğer 3. parti uygulamalara bağlanın',
        icon: <ApiOutlined />,
        iconColor: '#64748b',
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
    <PageContainer maxWidth="5xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#64748b15' }}
          >
            <SettingOutlined style={{ color: '#64748b', fontSize: 18 }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Sistem Ayarları</h1>
            <p className="text-sm text-slate-500">Sisteminizi yapılandırın ve özelleştirin</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Aktif</span>
              <div className="text-2xl font-semibold text-slate-900">{activeCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98115' }}>
              <CheckCircleOutlined style={{ color: '#10b981' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Yakında</span>
              <div className="text-2xl font-semibold text-slate-900">{totalCount - activeCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b15' }}>
              <ClockCircleOutlined style={{ color: '#f59e0b' }} />
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wide">Toplam</span>
              <div className="text-2xl font-semibold text-slate-900">{totalCount}</div>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#3b82f615' }}>
              <SettingOutlined style={{ color: '#3b82f6' }} />
            </div>
          </div>
        </div>
        <StorageUsageCard showDetails={false} />
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-6">
        <Input
          placeholder="Ayarlarda ara... (ör: 'parola', 'kullanıcı', 'e-posta')"
          prefix={<SearchOutlined className="text-slate-400" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="h-10"
        />
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {filteredGroups.map((group) => (
          <div key={group.id}>
            <h2 className="text-sm font-medium text-slate-900 mb-3">{group.title}</h2>
            <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  href={item.enabled ? item.path : '#'}
                  className={item.enabled ? '' : 'pointer-events-none'}
                >
                  <div
                    className={`
                      flex items-center justify-between p-4
                      ${item.enabled ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                      transition-colors
                    `}
                  >
                    {/* Left: Icon + Content */}
                    <div className="flex items-center gap-4 flex-1">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.iconColor}15` }}
                      >
                        {React.cloneElement(item.icon, { style: { color: item.iconColor, fontSize: 18 } })}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-0.5">
                          <span className="text-sm font-medium text-slate-900">{item.name}</span>
                          {!item.enabled && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700">
                              <ClockCircleOutlined className="text-[10px]" />
                              Yakında
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{item.description}</p>
                      </div>
                    </div>

                    {/* Right: Arrow */}
                    {item.enabled && (
                      <RightOutlined className="text-slate-300 text-xs ml-4" />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {searchQuery && filteredGroups.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: '#64748b15' }}
          >
            <SearchOutlined style={{ color: '#64748b', fontSize: 20 }} />
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-1">Sonuç Bulunamadı</h3>
          <p className="text-xs text-slate-500">"{searchQuery}" için eşleşen ayar bulunamadı</p>
        </div>
      )}
    </PageContainer>
  );
}

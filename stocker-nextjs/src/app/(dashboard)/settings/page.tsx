'use client';

/**
 * Settings Main Page
 * High-Density Professional Dashboard - Linear/Stripe style
 * - Compact stat cards (h-24, grid-cols-4)
 * - Dense navigation lists with minimal padding
 * - Dark gray stroke icons without pastel backgrounds
 * - Hover effects with chevron appearing
 */

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Shield,
  Users,
  KeyRound,
  Building2,
  Bell,
  Mail,
  CloudUpload,
  FileText,
  Plug,
  Globe,
  ChevronRight,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  HardDrive,
} from 'lucide-react';
import { useTenantStats, formatStorageSize, getStorageUsagePercentage } from '@/lib/api/hooks/useTenantSettings';

// Settings organized by logical groups
const settingsGroups = [
  {
    id: 'organization',
    title: 'ORGANİZASYON VE KULLANICILAR',
    items: [
      {
        id: 'users',
        name: 'Kullanıcı Yönetimi',
        description: 'Kullanıcıları ekleyin, düzenleyin ve yönetin',
        icon: Users,
        path: '/settings/users',
        enabled: true,
      },
      {
        id: 'roles',
        name: 'Rol ve Yetki Yönetimi',
        description: 'Roller ve erişim izinlerini yapılandırın',
        icon: KeyRound,
        path: '/settings/roles',
        enabled: true,
      },
      {
        id: 'departments',
        name: 'Departman Yönetimi',
        description: 'Departman yapısını ve hiyerarşiyi yönetin',
        icon: Building2,
        path: '/settings/departments',
        enabled: true,
      },
    ],
  },
  {
    id: 'security',
    title: 'GÜVENLİK VE UYUMLULUK',
    items: [
      {
        id: 'security',
        name: 'Güvenlik Ayarları',
        description: 'Parola politikaları, 2FA ve oturum ayarları',
        icon: Shield,
        path: '/settings/security',
        enabled: true,
      },
      {
        id: 'audit-logs',
        name: 'Denetim Günlükleri',
        description: 'Sistem aktivitelerini ve değişiklikleri izleyin',
        icon: FileText,
        path: '/settings/audit-logs',
        enabled: true,
      },
      {
        id: 'backup',
        name: 'Yedekleme ve Geri Yükleme',
        description: 'Veri yedekleme ve kurtarma işlemleri',
        icon: CloudUpload,
        path: '/settings/backup',
        enabled: false,
      },
    ],
  },
  {
    id: 'application',
    title: 'UYGULAMA AYARLARI',
    items: [
      {
        id: 'general',
        name: 'Genel Ayarlar',
        description: 'Şirket bilgileri, logo ve temel yapılandırma',
        icon: Settings,
        path: '/settings/general',
        enabled: true,
      },
      {
        id: 'notifications',
        name: 'Bildirim Ayarları',
        description: 'E-posta, SMS ve uygulama bildirimleri',
        icon: Bell,
        path: '/settings/notifications',
        enabled: false,
      },
      {
        id: 'regional',
        name: 'Bölgesel Ayarlar',
        description: 'Zaman dilimi, para birimi ve dil',
        icon: Globe,
        path: '/settings/regional',
        enabled: false,
      },
    ],
  },
  {
    id: 'integrations',
    title: 'ENTEGRASYONLAR VE VERİ',
    items: [
      {
        id: 'email',
        name: 'Email / SMTP Ayarları',
        description: 'E-posta sunucu yapılandırması',
        icon: Mail,
        path: '/settings/email',
        enabled: false,
      },
      {
        id: 'integrations',
        name: 'Entegrasyonlar',
        description: 'Üçüncü parti uygulama bağlantıları',
        icon: Plug,
        path: '/settings/integrations',
        enabled: false,
      },
    ],
  },
];

export default function SettingsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: stats, isLoading: statsLoading } = useTenantStats();

  // Calculate stats
  const allItems = settingsGroups.flatMap(group => group.items);
  const activeCount = allItems.filter(item => item.enabled).length;
  const totalCount = allItems.length;
  const comingSoonCount = totalCount - activeCount;

  // Storage stats from API
  const storageUsed = stats?.storageUsedGB ?? 0;
  const storageQuota = stats?.storageQuotaGB ?? 10;
  const storagePercentage = getStorageUsagePercentage(storageUsed, storageQuota);

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
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Compact Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Sistem Ayarları</h1>
            <p className="text-sm text-slate-500">Sisteminizi yapılandırın ve özelleştirin</p>
          </div>
        </div>

        {/* Compact Stat Cards - 4 columns, h-24 */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {/* Active Settings */}
          <div className="h-24 bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Aktif</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">{activeCount}</div>
          </div>

          {/* Coming Soon */}
          <div className="h-24 bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Yakında</span>
              <Clock className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">{comingSoonCount}</div>
          </div>

          {/* Total Modules */}
          <div className="h-24 bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Toplam</span>
              <Layers className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-semibold text-slate-900">{totalCount}</div>
          </div>

          {/* Storage */}
          <div className="h-24 bg-white border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Depolama</span>
              <HardDrive className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : formatStorageSize(storageUsed)}
              </div>
              <div className="w-full h-1 bg-slate-100 rounded-full mt-1">
                <div
                  className="h-1 bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar - Compact */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Ayarlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* Settings Groups - High Density */}
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.id}>
              {/* Section Header - Bold Uppercase with border */}
              <div className="flex items-center gap-3 pb-2 mb-0 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </h2>
              </div>

              {/* Settings List - Dense rows */}
              <div className="bg-white border border-slate-200 border-t-0 rounded-b-lg divide-y divide-slate-100">
                {group.items.map((item) => {
                  const IconComponent = item.icon;

                  return (
                    <Link
                      key={item.id}
                      href={item.enabled ? item.path : '#'}
                      className={item.enabled ? '' : 'pointer-events-none'}
                    >
                      <div
                        className={`
                          group flex items-center justify-between py-3 px-4
                          ${item.enabled ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-colors
                        `}
                      >
                        {/* Left: Icon + Content */}
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Icon - No background, dark gray stroke */}
                          <IconComponent className="w-5 h-5 text-slate-600 flex-shrink-0" strokeWidth={1.5} />

                          {/* Text Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900">{item.name}</span>
                              {!item.enabled && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-500">
                                  Yakında
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{item.description}</p>
                          </div>
                        </div>

                        {/* Right: Arrow - appears on hover */}
                        {item.enabled && (
                          <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity ml-3 flex-shrink-0" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {searchQuery && filteredGroups.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-900 mb-1">Sonuç Bulunamadı</h3>
            <p className="text-xs text-slate-500">"{searchQuery}" için eşleşen ayar bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}

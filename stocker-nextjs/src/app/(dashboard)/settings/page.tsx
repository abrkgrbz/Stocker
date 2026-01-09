'use client';

/**
 * Settings Main Page
 * Monochrome Design System - Slate-based color palette
 * - Page wrapper: min-h-screen bg-slate-50 p-8
 * - Header icon: w-12 h-12 rounded-xl bg-slate-900 with white icon
 * - Stat cards: bg-white border border-slate-200 rounded-xl p-5
 * - Status badges: slate color variations
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
  DatabaseBackup,
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
        enabled: true,
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
        id: 'data-migration',
        name: 'Veri Aktarımı',
        description: 'Logo, ETA, Mikro, Excel vb. sistemlerden veri aktarın',
        icon: DatabaseBackup,
        path: '/settings/data-migration',
        enabled: true,
      },
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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Monochrome Icon */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Sistem Ayarları</h1>
            <p className="text-sm text-slate-500">Sisteminizi yapılandırın ve özelleştirin</p>
          </div>
        </div>

        {/* Stat Cards - Monochrome Design */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {/* Active Settings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Aktif</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-slate-600" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{activeCount}</div>
          </div>

          {/* Coming Soon */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Yakında</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{comingSoonCount}</div>
          </div>

          {/* Total Modules */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Toplam</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900">{totalCount}</div>
          </div>

          {/* Storage */}
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Depolama</span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div>
              <div className="text-2xl font-semibold text-slate-900">
                {statsLoading ? '...' : formatStorageSize(storageUsed)}
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2">
                <div
                  className="h-1.5 bg-slate-900 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Ayarlarda ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
        </div>

        {/* Settings Groups */}
        <div className="space-y-8">
          {filteredGroups.map((group) => (
            <div key={group.id}>
              {/* Section Header */}
              <div className="flex items-center gap-3 pb-3 mb-0 border-b border-slate-200">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {group.title}
                </h2>
              </div>

              {/* Settings List */}
              <div className="bg-white border border-slate-200 border-t-0 rounded-b-xl divide-y divide-slate-100">
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
                          group flex items-center justify-between py-4 px-5
                          ${item.enabled ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'}
                          transition-colors
                        `}
                      >
                        {/* Left: Icon + Content */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {/* Icon - Monochrome */}
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                          </div>

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
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-medium text-slate-900 mb-1">Sonuç Bulunamadı</h3>
            <p className="text-xs text-slate-500">"{searchQuery}" için eşleşen ayar bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
}

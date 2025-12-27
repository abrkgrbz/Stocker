'use client';

/**
 * Modules Page - Module Management & Marketplace
 * Clean, minimal design following project patterns
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Switch, Tag, Tooltip, message } from 'antd';
import {
  Search,
  Users,
  ShoppingCart,
  Boxes,
  Briefcase,
  Package,
  BarChart3,
  Settings,
  Check,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useActiveModules } from '@/lib/api/hooks/useUserModules';

// Module tier configuration
const TIER_CONFIG = {
  standard: {
    label: 'Standard',
    color: 'default',
  },
  premium: {
    label: 'Premium',
    color: 'gold',
  },
  enterprise: {
    label: 'Enterprise',
    color: 'purple',
  },
} as const;

// Module definitions
const MODULE_DEFINITIONS = [
  {
    id: 'crm',
    code: 'crm',
    name: 'CRM',
    description: 'Müşteri ilişkileri yönetimi ve satış fırsatları',
    longDescription: 'Müşteri verilerinizi merkezi bir sistemde yönetin, satış pipeline\'ınızı takip edin ve müşteri memnuniyetini artırın.',
    icon: Users,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    borderColor: 'border-violet-500',
    path: '/crm',
    tier: 'premium' as const,
    features: ['Müşteri Yönetimi', 'Satış Pipeline', 'Aktivite Takibi', 'Raporlama'],
  },
  {
    id: 'inventory',
    code: 'inventory',
    name: 'Stok Yönetimi',
    description: 'Envanter takibi ve depo operasyonları',
    longDescription: 'Çoklu depo yönetimi, barkod entegrasyonu ve otomatik stok uyarıları ile envanterinizi kontrol altında tutun.',
    icon: Boxes,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
    path: '/inventory',
    tier: 'standard' as const,
    features: ['Ürün Kataloğu', 'Depo Takibi', 'Barkod Sistemi', 'Stok Uyarıları'],
    recommended: true,
  },
  {
    id: 'sales',
    code: 'sales',
    name: 'Satış',
    description: 'Sipariş, fatura ve ödeme yönetimi',
    longDescription: 'Satış siparişleri, faturalama, ödeme takibi ve müşteri hesap yönetimini tek platformda yapın.',
    icon: ShoppingCart,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    borderColor: 'border-amber-500',
    path: '/sales',
    tier: 'standard' as const,
    features: ['Sipariş Yönetimi', 'Faturalama', 'Ödeme Takibi', 'Raporlar'],
  },
  {
    id: 'hr',
    code: 'hr',
    name: 'İnsan Kaynakları',
    description: 'Personel yönetimi ve bordro işlemleri',
    longDescription: 'Personel özlük dosyaları, izin takibi, bordro hesaplama ve performans değerlendirme süreçlerini yönetin.',
    icon: Briefcase,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    borderColor: 'border-sky-500',
    path: '/hr',
    tier: 'standard' as const,
    features: ['Personel Kartları', 'İzin Takibi', 'Bordro', 'Performans'],
  },
  {
    id: 'purchase',
    code: 'purchase',
    name: 'Satın Alma',
    description: 'Tedarik zinciri ve satın alma süreçleri',
    longDescription: 'Tedarikçi yönetimi, satın alma siparişleri ve mal kabul süreçlerini entegre bir şekilde yönetin.',
    icon: Package,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    borderColor: 'border-purple-500',
    path: '/purchase',
    tier: 'standard' as const,
    features: ['Tedarikçiler', 'Satın Alma Siparişleri', 'Mal Kabul', 'Ödemeler'],
  },
  {
    id: 'analytics',
    code: 'analytics',
    name: 'Raporlama',
    description: 'İş zekası ve gelişmiş analitik',
    longDescription: 'Özelleştirilebilir dashboardlar, KPI takibi ve tahmine dayalı analizlerle veriye dayalı kararlar alın.',
    icon: BarChart3,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    borderColor: 'border-rose-500',
    path: '/analytics',
    tier: 'enterprise' as const,
    features: ['Dashboard Builder', 'KPI Takibi', 'Veri Görselleştirme', 'Export'],
  },
  {
    id: 'production',
    code: 'production',
    name: 'Üretim',
    description: 'Üretim planlama ve kalite kontrol',
    longDescription: 'Üretim emirleri, reçete yönetimi, kapasite planlama ve kalite kontrol süreçlerini optimize edin.',
    icon: Settings,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
    borderColor: 'border-slate-500',
    path: '/production',
    tier: 'enterprise' as const,
    features: ['Üretim Emirleri', 'Reçeteler', 'Kapasite Planlama', 'Kalite'],
  },
];

export default function ModulesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: modulesData, isLoading } = useActiveModules();

  // Create a Set of active module codes
  const activeModuleCodes = useMemo(() => {
    const codes = new Set<string>();
    modulesData?.modules?.forEach(m => {
      if (m.isActive) {
        codes.add(m.code.toLowerCase());
      }
    });
    return codes;
  }, [modulesData]);

  // Build modules with active status
  const modules = useMemo(() => {
    return MODULE_DEFINITIONS.map(mod => ({
      ...mod,
      isActive: activeModuleCodes.has(mod.code.toLowerCase()),
    }));
  }, [activeModuleCodes]);

  // Filter modules
  const filteredModules = useMemo(() => {
    if (!searchQuery.trim()) return modules;
    const query = searchQuery.toLowerCase();
    return modules.filter(
      m => m.name.toLowerCase().includes(query) || m.description.toLowerCase().includes(query)
    );
  }, [modules, searchQuery]);

  // Stats
  const activeCount = modules.filter(m => m.isActive).length;
  const recommendedCount = modules.filter(m => m.recommended && !m.isActive).length;

  // Handlers
  const handleModuleOpen = (module: typeof modules[0]) => {
    if (module.isActive) {
      router.push(module.path);
    }
  };

  const handleModuleActivate = (moduleId: string) => {
    // TODO: Implement actual activation logic
    message.info('Modül aktivasyon özelliği yakında eklenecek');
  };

  const handleToggleModule = (moduleId: string, checked: boolean) => {
    if (checked) {
      message.info('Modül aktivasyon özelliği yakında eklenecek');
    } else {
      message.info('Modül deaktivasyonu yakında eklenecek');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900 mb-2">
          Modül Yönetimi
        </h1>
        <p className="text-slate-500">
          İşletmeniz için ihtiyaç duyduğunuz modülleri yönetin ve yapılandırın
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Aktif Modüller</p>
              <p className="text-2xl font-semibold text-slate-900">
                {activeCount} <span className="text-base font-normal text-slate-400">/ {modules.length}</span>
              </p>
            </div>
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Bu Ayki Artış</p>
              <p className="text-2xl font-semibold text-emerald-600">+12%</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Önerilen</p>
              <p className="text-2xl font-semibold text-slate-900">{recommendedCount} modül</p>
            </div>
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400" />}
          placeholder="Modül ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
          className="max-w-md"
          size="large"
        />
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredModules.map((module) => {
          const Icon = module.icon;
          const tier = TIER_CONFIG[module.tier];

          return (
            <div
              key={module.id}
              className={`
                bg-white rounded-xl border-2 p-5 transition-all duration-200
                ${module.isActive
                  ? `${module.borderColor} shadow-sm`
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${module.iconBg}`}>
                    <Icon className={`w-6 h-6 ${module.iconColor}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900">{module.name}</h3>
                      <Tag color={tier.color} className="text-xs">
                        {tier.label}
                      </Tag>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{module.description}</p>
                  </div>
                </div>
              </div>

              {/* Recommended Badge */}
              {module.recommended && !module.isActive && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                    <Sparkles className="w-3 h-3" />
                    Önerilen
                  </span>
                </div>
              )}

              {/* Features */}
              <div className="mb-4">
                <div className="grid grid-cols-2 gap-2">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="truncate">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={module.isActive}
                    onChange={(checked) => handleToggleModule(module.id, checked)}
                    size="small"
                  />
                  <span className={`text-sm ${module.isActive ? 'text-emerald-600 font-medium' : 'text-slate-500'}`}>
                    {module.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {module.isActive ? (
                  <button
                    onClick={() => handleModuleOpen(module)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Modülü Aç
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleModuleActivate(module.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Aktifleştir
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Modül bulunamadı
          </h3>
          <p className="text-slate-500">
            &ldquo;{searchQuery}&rdquo; için sonuç yok
          </p>
        </div>
      )}

      {/* CTA Banner */}
      <div className="mt-10 bg-slate-900 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-amber-400">Enterprise Plan</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-1">
              Tüm modüllere sınırsız erişim
            </h3>
            <p className="text-slate-400 text-sm">
              Enterprise plan ile tüm modülleri ve premium özellikleri kullanın
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors">
            Planları İncele
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
